import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { transitAnalysisReportSchema } from "@/lib/ai/transits/schema";
import { getTransitAnalysisReportById } from "../repository";
import { applyTransitClientReportEdits } from "./editorial";
import {
  buildTransitClientReportSnapshot,
  toTransitClientReportRefreshWrite,
} from "./from-professional";
import { transitClientReportSchema } from "./schema";
import type { StoredTransitClientReport } from "./stored";
import type { TransitClientReport } from "./types";

export type TransitClientReportQueryResult<T> =
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
  transit_analysis_id: string;
  professional_report_id: string;
  source_report: unknown;
  client_report: unknown;
  created_at: string;
  updated_at: string;
};

const FULL_SELECT =
  "id, client_id, transit_analysis_id, professional_report_id, source_report, client_report, created_at, updated_at";

export async function createTransitClientReport(input: {
  clientId: string;
  transitAnalysisId: string;
  professionalReportId: string;
}): Promise<TransitClientReportQueryResult<string>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.transitAnalysisId) ||
    !isUuid(input.professionalReportId)
  ) {
    return { status: "not_found" };
  }

  const professional = await getTransitAnalysisReportById({
    clientId: input.clientId,
    transitAnalysisId: input.transitAnalysisId,
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

  const existing = await getTransitClientReportByProfessionalReportId({
    clientId: input.clientId,
    transitAnalysisId: input.transitAnalysisId,
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

  const snapshot = buildTransitClientReportSnapshot({
    professionalReport: professional.data.report,
    professionalStatus: professional.data.status,
  });

  if (snapshot.status !== "ok") {
    if (snapshot.status === "invalid") {
      console.error(
        "[reports.transits.client] Transformer produced an invalid client report",
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
      .from("transit_analysis_client_reports")
      .insert({
        client_id: input.clientId,
        transit_analysis_id: input.transitAnalysisId,
        professional_report_id: input.professionalReportId,
        source_report: snapshot.sourceReport,
        client_report: snapshot.clientReport,
      })
      .select("id")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        const raced = await getTransitClientReportByProfessionalReportId({
          clientId: input.clientId,
          transitAnalysisId: input.transitAnalysisId,
          professionalReportId: input.professionalReportId,
        });

        if (raced.status === "ok") {
          return { status: "ok", data: raced.data.id };
        }

        return { status: "conflict" };
      }

      console.error("[reports.transits.client] Failed to create client report", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data || typeof data.id !== "string") {
      return { status: "error" };
    }

    return { status: "ok", data: data.id };
  } catch (error) {
    console.error(
      "[reports.transits.client] Unexpected error creating client report",
      error,
    );
    return { status: "error" };
  }
}

export async function getTransitClientReportByProfessionalReportId(input: {
  clientId: string;
  transitAnalysisId: string;
  professionalReportId: string;
}): Promise<TransitClientReportQueryResult<StoredTransitClientReport>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.transitAnalysisId) ||
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
      .from("transit_analysis_client_reports")
      .select(FULL_SELECT)
      .eq("client_id", input.clientId)
      .eq("transit_analysis_id", input.transitAnalysisId)
      .eq("professional_report_id", input.professionalReportId)
      .maybeSingle()
      .returns<ClientReportRow>();

    if (error) {
      console.error("[reports.transits.client] Failed to load client report", {
        message: error.message,
        code: error.code,
      });
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
      "[reports.transits.client] Unexpected error loading client report",
      error,
    );
    return { status: "error" };
  }
}

export async function hasTransitClientReport(input: {
  clientId: string;
  transitAnalysisId: string;
  professionalReportId: string;
}): Promise<TransitClientReportQueryResult<boolean>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.transitAnalysisId) ||
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
      .from("transit_analysis_client_reports")
      .select("id")
      .eq("client_id", input.clientId)
      .eq("transit_analysis_id", input.transitAnalysisId)
      .eq("professional_report_id", input.professionalReportId)
      .maybeSingle();

    if (error) {
      console.error(
        "[reports.transits.client] Failed to check client report existence",
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
      "[reports.transits.client] Unexpected error checking client report",
      error,
    );
    return { status: "error" };
  }
}

export async function updateTransitClientReport(input: {
  clientId: string;
  transitAnalysisId: string;
  professionalReportId: string;
  clientReport: TransitClientReport;
}): Promise<TransitClientReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.transitAnalysisId) ||
    !isUuid(input.professionalReportId)
  ) {
    return { status: "not_found" };
  }

  const stored = await getTransitClientReportByProfessionalReportId({
    clientId: input.clientId,
    transitAnalysisId: input.transitAnalysisId,
    professionalReportId: input.professionalReportId,
  });

  if (stored.status !== "ok") {
    return stored;
  }

  const merged = applyTransitClientReportEdits(
    stored.data.clientReport,
    input.clientReport,
  );
  const parsed = transitClientReportSchema.safeParse(merged);

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
      .from("transit_analysis_client_reports")
      .update({ client_report: parsed.data })
      .eq("id", stored.data.id)
      .eq("client_id", input.clientId)
      .eq("transit_analysis_id", input.transitAnalysisId)
      .eq("professional_report_id", input.professionalReportId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[reports.transits.client] Failed to update client report", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    return { status: "ok", data: true };
  } catch (error) {
    console.error(
      "[reports.transits.client] Unexpected error updating client report",
      error,
    );
    return { status: "error" };
  }
}

export async function refreshTransitClientReportFromProfessional(input: {
  clientId: string;
  transitAnalysisId: string;
  professionalReportId: string;
}): Promise<TransitClientReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.transitAnalysisId) ||
    !isUuid(input.professionalReportId)
  ) {
    return { status: "not_found" };
  }

  const professional = await getTransitAnalysisReportById({
    clientId: input.clientId,
    transitAnalysisId: input.transitAnalysisId,
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

  const stored = await getTransitClientReportByProfessionalReportId({
    clientId: input.clientId,
    transitAnalysisId: input.transitAnalysisId,
    professionalReportId: input.professionalReportId,
  });

  if (stored.status !== "ok") {
    return stored;
  }

  const snapshot = buildTransitClientReportSnapshot({
    professionalReport: professional.data.report,
    professionalStatus: professional.data.status,
  });

  if (snapshot.status !== "ok") {
    if (snapshot.status === "invalid") {
      console.error(
        "[reports.transits.client] Transformer produced an invalid client report during refresh",
      );
    }

    return snapshot;
  }

  const write = toTransitClientReportRefreshWrite(snapshot);

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase.rpc(
      "refresh_transit_client_report_from_professional",
      {
        p_client_id: input.clientId,
        p_transit_analysis_id: input.transitAnalysisId,
        p_professional_report_id: input.professionalReportId,
        p_source_report: write.source_report,
        p_client_report: write.client_report,
      },
    );

    if (error || typeof data !== "string") {
      const mapped = mapRefreshRpcError(error?.message);

      if (mapped === "error") {
        console.error(
          "[reports.transits.client] Failed to refresh client report",
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
      "[reports.transits.client] Unexpected error refreshing client report",
      error,
    );
    return { status: "error" };
  }
}

export async function deleteTransitClientReport(input: {
  clientId: string;
  transitAnalysisId: string;
  professionalReportId: string;
}): Promise<TransitClientReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.transitAnalysisId) ||
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
      .from("transit_analysis_client_reports")
      .delete()
      .eq("client_id", input.clientId)
      .eq("transit_analysis_id", input.transitAnalysisId)
      .eq("professional_report_id", input.professionalReportId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[reports.transits.client] Failed to delete client report", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    return { status: "ok", data: true };
  } catch (error) {
    console.error(
      "[reports.transits.client] Unexpected error deleting client report",
      error,
    );
    return { status: "error" };
  }
}

function mapRefreshRpcError(
  message: string | undefined,
): Exclude<TransitClientReportQueryResult<true>["status"], "ok"> {
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

function mapRow(row: ClientReportRow): StoredTransitClientReport | null {
  const sourceReport = transitAnalysisReportSchema.safeParse(row.source_report);
  const clientReport = transitClientReportSchema.safeParse(row.client_report);

  if (!sourceReport.success || !clientReport.success) {
    console.error(
      "[reports.transits.client] Stored client report JSON could not be parsed",
    );
    return null;
  }

  return {
    id: row.id,
    clientId: row.client_id,
    transitAnalysisId: row.transit_analysis_id,
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
