import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { solarReturnReportSchema } from "@/lib/ai/solar-returns/schema";
import { getSolarReturnReportById } from "../repository";
import { applySolarReturnClientReportEdits } from "./editorial";
import {
  buildSolarReturnClientReportSnapshot,
  toSolarReturnClientReportRefreshWrite,
} from "./from-professional";
import { solarReturnClientReportSchema } from "./schema";
import type { StoredSolarReturnClientReport } from "./stored";
import type { SolarReturnClientReport } from "./types";

export type SolarReturnClientReportQueryResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_configured" }
  | { status: "unauthorized" }
  | { status: "not_found" }
  | { status: "not_ready" }
  | { status: "conflict" }
  | { status: "invalid" }
  | { status: "error" };

type ClientReportRow = {
  id: string;
  client_id: string;
  solar_return_id: string;
  professional_report_id: string;
  source_report: unknown;
  client_report: unknown;
  created_at: string;
  updated_at: string;
};

const FULL_SELECT =
  "id, client_id, solar_return_id, professional_report_id, source_report, client_report, created_at, updated_at";

export async function createSolarReturnClientReport(input: {
  clientId: string;
  solarReturnId: string;
  professionalReportId: string;
}): Promise<SolarReturnClientReportQueryResult<string>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.solarReturnId) ||
    !isUuid(input.professionalReportId)
  ) {
    return { status: "not_found" };
  }

  const professional = await getSolarReturnReportById({
    clientId: input.clientId,
    solarReturnId: input.solarReturnId,
    reportId: input.professionalReportId,
  });

  if (professional.status !== "ok") {
    if (
      professional.status === "unauthorized" ||
      professional.status === "not_found" ||
      professional.status === "not_configured" ||
      professional.status === "invalid"
    ) {
      return professional;
    }

    return { status: "error" };
  }

  if (professional.data.status !== "ready") {
    return { status: "not_ready" };
  }

  const existing = await getSolarReturnClientReportByProfessionalReportId({
    clientId: input.clientId,
    solarReturnId: input.solarReturnId,
    professionalReportId: input.professionalReportId,
  });

  if (existing.status === "ok") {
    return { status: "ok", data: existing.data.id };
  }

  if (existing.status !== "not_found") {
    if (
      existing.status === "unauthorized" ||
      existing.status === "not_configured"
    ) {
      return existing;
    }

    return { status: "error" };
  }

  const snapshot = buildSolarReturnClientReportSnapshot({
    professionalReport: professional.data.report,
    professionalStatus: professional.data.status,
  });

  if (snapshot.status !== "ok") {
    if (snapshot.status === "invalid") {
      console.error(
        "[reports.solar-returns.client] Transformer produced an invalid client report",
      );
    }

    return snapshot;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("solar_return_client_reports")
      .insert({
        client_id: input.clientId,
        solar_return_id: input.solarReturnId,
        professional_report_id: input.professionalReportId,
        source_report: snapshot.sourceReport,
        client_report: snapshot.clientReport,
      })
      .select("id")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        const raced = await getSolarReturnClientReportByProfessionalReportId({
          clientId: input.clientId,
          solarReturnId: input.solarReturnId,
          professionalReportId: input.professionalReportId,
        });

        if (raced.status === "ok") {
          return { status: "ok", data: raced.data.id };
        }

        return { status: "conflict" };
      }

      console.error(
        "[reports.solar-returns.client] Failed to create client report",
        {
          message: error.message,
          code: error.code,
        },
      );
      return { status: "error" };
    }

    if (!data || typeof data.id !== "string") {
      return { status: "error" };
    }

    return { status: "ok", data: data.id };
  } catch (error) {
    console.error(
      "[reports.solar-returns.client] Unexpected error creating client report",
      error,
    );
    return { status: "error" };
  }
}

export async function getSolarReturnClientReportByProfessionalReportId(input: {
  clientId: string;
  solarReturnId: string;
  professionalReportId: string;
}): Promise<SolarReturnClientReportQueryResult<StoredSolarReturnClientReport>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.solarReturnId) ||
    !isUuid(input.professionalReportId)
  ) {
    return { status: "not_found" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("solar_return_client_reports")
      .select(FULL_SELECT)
      .eq("client_id", input.clientId)
      .eq("solar_return_id", input.solarReturnId)
      .eq("professional_report_id", input.professionalReportId)
      .maybeSingle()
      .returns<ClientReportRow>();

    if (error) {
      console.error(
        "[reports.solar-returns.client] Failed to load client report",
        {
          message: error.message,
          code: error.code,
        },
      );
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    const mapped = mapRow(data);

    if (!mapped) {
      return { status: "invalid" };
    }

    return { status: "ok", data: mapped };
  } catch (error) {
    console.error(
      "[reports.solar-returns.client] Unexpected error loading client report",
      error,
    );
    return { status: "error" };
  }
}

export async function getSolarReturnClientReportById(input: {
  clientId: string;
  solarReturnId: string;
  professionalReportId: string;
  clientReportId: string;
}): Promise<SolarReturnClientReportQueryResult<StoredSolarReturnClientReport>> {
  const stored = await getSolarReturnClientReportByProfessionalReportId({
    clientId: input.clientId,
    solarReturnId: input.solarReturnId,
    professionalReportId: input.professionalReportId,
  });

  if (stored.status !== "ok") {
    return stored;
  }

  if (stored.data.id !== input.clientReportId) {
    return { status: "not_found" };
  }

  return stored;
}

export async function hasSolarReturnClientReport(input: {
  clientId: string;
  solarReturnId: string;
  professionalReportId: string;
}): Promise<SolarReturnClientReportQueryResult<boolean>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.solarReturnId) ||
    !isUuid(input.professionalReportId)
  ) {
    return { status: "not_found" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("solar_return_client_reports")
      .select("id")
      .eq("client_id", input.clientId)
      .eq("solar_return_id", input.solarReturnId)
      .eq("professional_report_id", input.professionalReportId)
      .maybeSingle();

    if (error) {
      console.error(
        "[reports.solar-returns.client] Failed to check client report existence",
        {
          message: error.message,
          code: error.code,
        },
      );
      return { status: "error" };
    }

    return { status: "ok", data: Boolean(data) };
  } catch (error) {
    console.error(
      "[reports.solar-returns.client] Unexpected error checking client report",
      error,
    );
    return { status: "error" };
  }
}

export async function updateSolarReturnClientReport(input: {
  clientId: string;
  solarReturnId: string;
  professionalReportId: string;
  clientReport: SolarReturnClientReport;
}): Promise<SolarReturnClientReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.solarReturnId) ||
    !isUuid(input.professionalReportId)
  ) {
    return { status: "not_found" };
  }

  const stored = await getSolarReturnClientReportByProfessionalReportId({
    clientId: input.clientId,
    solarReturnId: input.solarReturnId,
    professionalReportId: input.professionalReportId,
  });

  if (stored.status !== "ok") {
    return stored;
  }

  const merged = applySolarReturnClientReportEdits(
    stored.data.clientReport,
    input.clientReport,
  );
  const parsed = solarReturnClientReportSchema.safeParse(merged);

  if (!parsed.success) {
    return { status: "invalid" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("solar_return_client_reports")
      .update({ client_report: parsed.data })
      .eq("id", stored.data.id)
      .eq("client_id", input.clientId)
      .eq("solar_return_id", input.solarReturnId)
      .eq("professional_report_id", input.professionalReportId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(
        "[reports.solar-returns.client] Failed to update client report",
        {
          message: error.message,
          code: error.code,
        },
      );
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    return { status: "ok", data: true };
  } catch (error) {
    console.error(
      "[reports.solar-returns.client] Unexpected error updating client report",
      error,
    );
    return { status: "error" };
  }
}

export async function refreshSolarReturnClientReportFromProfessional(input: {
  clientId: string;
  solarReturnId: string;
  professionalReportId: string;
}): Promise<SolarReturnClientReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.solarReturnId) ||
    !isUuid(input.professionalReportId)
  ) {
    return { status: "not_found" };
  }

  const professional = await getSolarReturnReportById({
    clientId: input.clientId,
    solarReturnId: input.solarReturnId,
    reportId: input.professionalReportId,
  });

  if (professional.status !== "ok") {
    if (
      professional.status === "unauthorized" ||
      professional.status === "not_found" ||
      professional.status === "not_configured" ||
      professional.status === "invalid"
    ) {
      return professional;
    }

    return { status: "error" };
  }

  const stored = await getSolarReturnClientReportByProfessionalReportId({
    clientId: input.clientId,
    solarReturnId: input.solarReturnId,
    professionalReportId: input.professionalReportId,
  });

  if (stored.status !== "ok") {
    return stored;
  }

  const snapshot = buildSolarReturnClientReportSnapshot({
    professionalReport: professional.data.report,
    professionalStatus: professional.data.status,
  });

  if (snapshot.status !== "ok") {
    if (snapshot.status === "invalid") {
      console.error(
        "[reports.solar-returns.client] Transformer produced an invalid client report during refresh",
      );
    }

    return snapshot;
  }

  const write = toSolarReturnClientReportRefreshWrite(snapshot);

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase.rpc(
      "refresh_solar_return_client_report_from_professional",
      {
        p_client_id: input.clientId,
        p_solar_return_id: input.solarReturnId,
        p_professional_report_id: input.professionalReportId,
        p_source_report: write.source_report,
        p_client_report: write.client_report,
      },
    );

    if (error || typeof data !== "string") {
      const mapped = mapRefreshRpcError(error?.message);

      if (mapped === "error") {
        console.error(
          "[reports.solar-returns.client] Failed to refresh client report",
          {
            message: error?.message,
            code: error?.code,
          },
        );
      }

      return { status: mapped };
    }

    return { status: "ok", data: true };
  } catch (error) {
    console.error(
      "[reports.solar-returns.client] Unexpected error refreshing client report",
      error,
    );
    return { status: "error" };
  }
}

export async function deleteSolarReturnClientReport(input: {
  clientId: string;
  solarReturnId: string;
  professionalReportId: string;
}): Promise<SolarReturnClientReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.solarReturnId) ||
    !isUuid(input.professionalReportId)
  ) {
    return { status: "not_found" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("solar_return_client_reports")
      .delete()
      .eq("client_id", input.clientId)
      .eq("solar_return_id", input.solarReturnId)
      .eq("professional_report_id", input.professionalReportId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(
        "[reports.solar-returns.client] Failed to delete client report",
        {
          message: error.message,
          code: error.code,
        },
      );
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    return { status: "ok", data: true };
  } catch (error) {
    console.error(
      "[reports.solar-returns.client] Unexpected error deleting client report",
      error,
    );
    return { status: "error" };
  }
}

function mapRefreshRpcError(
  message: string | undefined,
): Exclude<SolarReturnClientReportQueryResult<true>["status"], "ok"> {
  if (!message) {
    return "error";
  }

  if (message.includes("not authenticated") || message.includes("not authorized")) {
    return "unauthorized";
  }

  if (message.includes("not found")) {
    return "not_found";
  }

  if (message.includes("ready")) {
    return "not_ready";
  }

  if (message.includes("invalid")) {
    return "invalid";
  }

  return "error";
}

function mapRow(row: ClientReportRow): StoredSolarReturnClientReport | null {
  const sourceReport = solarReturnReportSchema.safeParse(row.source_report);
  const clientReport = solarReturnClientReportSchema.safeParse(row.client_report);

  if (!sourceReport.success || !clientReport.success) {
    console.error(
      "[reports.solar-returns.client] Stored client report JSON could not be parsed",
    );
    return null;
  }

  return {
    id: row.id,
    clientId: row.client_id,
    solarReturnId: row.solar_return_id,
    professionalReportId: row.professional_report_id,
    sourceReport: sourceReport.data,
    clientReport: clientReport.data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
