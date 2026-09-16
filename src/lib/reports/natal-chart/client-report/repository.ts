import "server-only";

import { natalChartReportSchema } from "@/lib/ai/natal-chart/schema";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getNatalChartReportById } from "../repository";
import { applyNatalChartClientReportEdits } from "./editorial";
import {
  buildClientReportSnapshotFromProfessional,
  toClientReportRefreshWrite,
} from "./from-professional";
import { natalChartClientReportSchema } from "./schema";
import type { StoredNatalChartClientReport } from "./stored";
import type { NatalChartClientReport } from "./types";

export type ClientReportQueryResult<T> =
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
  natal_chart_report_id: string;
  source_report: unknown;
  client_report: unknown;
  created_at: string;
  updated_at: string;
};

const FULL_SELECT =
  "id, client_id, natal_chart_report_id, source_report, client_report, created_at, updated_at";

export async function createNatalChartClientReport(input: {
  clientId: string;
  natalChartReportId: string;
  clientName: string;
}): Promise<ClientReportQueryResult<string>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.natalChartReportId)) {
    return { status: "not_found" };
  }

  const professional = await getNatalChartReportById({
    clientId: input.clientId,
    reportId: input.natalChartReportId,
  });

  if (professional.status !== "ok") {
    if (professional.status === "unauthorized") {
      return { status: "unauthorized" };
    }

    if (professional.status === "not_found" || professional.status === "not_configured") {
      return professional;
    }

    if (professional.status === "invalid") {
      return { status: "invalid" };
    }

    return { status: "error" };
  }

  if (professional.data.status !== "ready") {
    return { status: "not_ready" };
  }

  const existing = await getNatalChartClientReport({
    clientId: input.clientId,
    natalChartReportId: input.natalChartReportId,
  });

  if (existing.status === "ok") {
    return { status: "ok", data: existing.data.id };
  }

  if (existing.status !== "not_found") {
    if (existing.status === "unauthorized") {
      return { status: "unauthorized" };
    }

    if (existing.status === "not_configured") {
      return existing;
    }

    return { status: "error" };
  }

  const snapshot = buildClientReportSnapshotFromProfessional({
    professionalReport: professional.data.report,
    professionalStatus: professional.data.status,
    clientName: input.clientName,
  });

  if (snapshot.status !== "ok") {
    if (snapshot.status === "invalid") {
      console.error("[client-reports] Transformer produced an invalid client report");
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
      .from("natal_chart_client_reports")
      .insert({
        client_id: input.clientId,
        natal_chart_report_id: input.natalChartReportId,
        source_report: snapshot.sourceReport,
        client_report: snapshot.clientReport,
      })
      .select("id")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        const raced = await getNatalChartClientReport({
          clientId: input.clientId,
          natalChartReportId: input.natalChartReportId,
        });

        if (raced.status === "ok") {
          return { status: "ok", data: raced.data.id };
        }

        return { status: "conflict" };
      }

      console.error("[client-reports] Failed to create client report", {
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
    console.error("[client-reports] Unexpected error creating client report", error);
    return { status: "error" };
  }
}

export async function getNatalChartClientReport(input: {
  clientId: string;
  natalChartReportId: string;
}): Promise<ClientReportQueryResult<StoredNatalChartClientReport>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.natalChartReportId)) {
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
      .from("natal_chart_client_reports")
      .select(FULL_SELECT)
      .eq("client_id", input.clientId)
      .eq("natal_chart_report_id", input.natalChartReportId)
      .maybeSingle()
      .returns<ClientReportRow>();

    if (error) {
      console.error("[client-reports] Failed to load client report", {
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
    console.error("[client-reports] Unexpected error loading client report", error);
    return { status: "error" };
  }
}

export async function updateNatalChartClientReport(input: {
  clientId: string;
  natalChartReportId: string;
  clientReport: NatalChartClientReport;
}): Promise<ClientReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.natalChartReportId)) {
    return { status: "not_found" };
  }

  const stored = await getNatalChartClientReport({
    clientId: input.clientId,
    natalChartReportId: input.natalChartReportId,
  });

  if (stored.status !== "ok") {
    return stored;
  }

  const merged = applyNatalChartClientReportEdits(
    stored.data.clientReport,
    input.clientReport,
  );

  if (!merged) {
    return { status: "invalid" };
  }

  const parsed = natalChartClientReportSchema.safeParse(merged);

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
      .from("natal_chart_client_reports")
      .update({ client_report: parsed.data })
      .eq("id", stored.data.id)
      .eq("client_id", input.clientId)
      .eq("natal_chart_report_id", input.natalChartReportId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[client-reports] Failed to update client report", {
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
    console.error("[client-reports] Unexpected error updating client report", error);
    return { status: "error" };
  }
}

export async function refreshNatalChartClientReportFromProfessional(input: {
  clientId: string;
  natalChartReportId: string;
  clientName: string;
}): Promise<ClientReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.natalChartReportId)) {
    return { status: "not_found" };
  }

  const professional = await getNatalChartReportById({
    clientId: input.clientId,
    reportId: input.natalChartReportId,
  });

  if (professional.status !== "ok") {
    if (professional.status === "unauthorized") {
      return { status: "unauthorized" };
    }

    if (
      professional.status === "not_found" ||
      professional.status === "not_configured"
    ) {
      return professional;
    }

    if (professional.status === "invalid") {
      return { status: "invalid" };
    }

    return { status: "error" };
  }

  const stored = await getNatalChartClientReport({
    clientId: input.clientId,
    natalChartReportId: input.natalChartReportId,
  });

  if (stored.status !== "ok") {
    return stored;
  }

  const snapshot = buildClientReportSnapshotFromProfessional({
    professionalReport: professional.data.report,
    professionalStatus: professional.data.status,
    clientName: input.clientName,
  });

  if (snapshot.status !== "ok") {
    if (snapshot.status === "invalid") {
      console.error(
        "[client-reports] Transformer produced an invalid client report during refresh",
      );
    }

    return snapshot;
  }

  const write = toClientReportRefreshWrite(snapshot);

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("natal_chart_client_reports")
      .update(write)
      .eq("id", stored.data.id)
      .eq("client_id", input.clientId)
      .eq("natal_chart_report_id", input.natalChartReportId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[client-reports] Failed to refresh client report", {
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
      "[client-reports] Unexpected error refreshing client report",
      error,
    );
    return { status: "error" };
  }
}

function mapRow(row: ClientReportRow): StoredNatalChartClientReport | null {
  const sourceReport = natalChartReportSchema.safeParse(row.source_report);
  const clientReport = natalChartClientReportSchema.safeParse(row.client_report);

  if (!sourceReport.success || !clientReport.success) {
    console.error("[client-reports] Stored client report JSON could not be parsed");
    return null;
  }

  return {
    id: row.id,
    clientId: row.client_id,
    natalChartReportId: row.natal_chart_report_id,
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
