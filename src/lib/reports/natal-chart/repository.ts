import "server-only";

import { GEMINI_NATAL_CHART_MODEL } from "@/lib/ai/gemini/config";
import { PAULA_LENS_VERSION } from "@/lib/ai/methodology";
import { natalChartReportSchema } from "@/lib/ai/natal-chart/schema";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HOME_PENDING_WORK_LIMIT } from "@/lib/home/constants";
import { NATAL_CHART_REPORT_VERSION } from "./constants";
import { applyProfessionalEdits } from "./editorial";
import {
  classifyPendingNatalChartWork,
  selectPendingNatalChartWork,
  type PendingNatalChartWorkItem,
} from "./pending-work";
import {
  NATAL_CHART_REPORT_DEFAULT_STATUS,
  parseNatalChartReportStatus,
  type NatalChartReportStatus,
} from "./status";
import type { NatalChartReport } from "./types";
import type {
  StoredNatalChartReport,
  StoredNatalChartReportSummary,
} from "./stored";

export type PendingNatalChartWorkResult = {
  items: PendingNatalChartWorkItem[];
  hasMore: boolean;
};

export type ReportQueryResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_configured" }
  | { status: "unauthorized" }
  | { status: "not_found" }
  | { status: "invalid" }
  | { status: "error" };

type ReportRow = {
  id: string;
  client_id: string;
  natal_chart_id: string;
  report: unknown;
  generated_report: unknown;
  report_version: string;
  paula_lens_version: string;
  gemini_model: string;
  status: string;
  generation_duration_ms: number | null;
  created_at: string;
  updated_at: string;
};

type ReportSummaryRow = {
  id: string;
  client_id: string;
  natal_chart_id: string;
  report_version: string;
  paula_lens_version: string;
  gemini_model: string;
  status: string;
  created_at: string;
};

const SUMMARY_SELECT =
  "id, client_id, natal_chart_id, report_version, paula_lens_version, gemini_model, status, created_at";

const FULL_SELECT = `${SUMMARY_SELECT}, report, generated_report, generation_duration_ms, updated_at`;

export async function saveNatalChartReport(input: {
  clientId: string;
  natalChartId: string;
  report: NatalChartReport;
  generationDurationMs?: number | null;
}): Promise<ReportQueryResult<string>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.natalChartId)) {
    return { status: "not_found" };
  }

  const parsed = natalChartReportSchema.safeParse(input.report);

  if (!parsed.success) {
    console.error("[reports] Refused to persist invalid natal chart report");
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

    const { data: natalChart, error: natalChartError } = await supabase
      .from("natal_charts")
      .select("id")
      .eq("id", input.natalChartId)
      .eq("client_id", input.clientId)
      .maybeSingle();

    if (natalChartError || !natalChart) {
      console.error("[reports] Natal chart not found for report persist", {
        message: natalChartError?.message,
        code: natalChartError?.code,
      });
      return { status: "not_found" };
    }

    const { data, error } = await supabase
      .from("natal_chart_reports")
      .insert({
        client_id: input.clientId,
        natal_chart_id: input.natalChartId,
        report: parsed.data,
        generated_report: parsed.data,
        report_version: NATAL_CHART_REPORT_VERSION,
        paula_lens_version: PAULA_LENS_VERSION,
        gemini_model: GEMINI_NATAL_CHART_MODEL,
        status: NATAL_CHART_REPORT_DEFAULT_STATUS,
        generation_duration_ms: input.generationDurationMs ?? null,
      })
      .select("id")
      .maybeSingle();

    if (error || !data || typeof data.id !== "string") {
      console.error("[reports] Failed to save natal chart report", {
        message: error?.message,
        code: error?.code,
      });
      return { status: "error" };
    }

    return { status: "ok", data: data.id };
  } catch (error) {
    console.error("[reports] Unexpected error saving natal chart report", error);
    return { status: "error" };
  }
}

export async function getNatalChartReports(
  clientId: string,
): Promise<ReportQueryResult<StoredNatalChartReportSummary[]>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(clientId)) {
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
      .from("natal_chart_reports")
      .select(SUMMARY_SELECT)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .returns<ReportSummaryRow[]>();

    if (error) {
      console.error("[reports] Failed to list natal chart reports", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "error" };
    }

    return {
      status: "ok",
      data: data
        .map(mapSummaryRow)
        .filter((row): row is StoredNatalChartReportSummary => row !== null),
    };
  } catch (error) {
    console.error("[reports] Unexpected error listing natal chart reports", error);
    return { status: "error" };
  }
}

export async function countNatalChartReports(
  clientId: string,
): Promise<ReportQueryResult<number>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(clientId)) {
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

    const { count, error } = await supabase
      .from("natal_chart_reports")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId);

    if (error) {
      console.error("[reports] Failed to count natal chart reports", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    return { status: "ok", data: count ?? 0 };
  } catch (error) {
    console.error("[reports] Unexpected error counting natal chart reports", error);
    return { status: "error" };
  }
}

const PENDING_WORK_SELECT =
  "id, client_id, status, updated_at, clients!inner(first_name, last_name), natal_chart_client_reports(id)";

const READY_PENDING_LOOKBACK = 50;

type PendingWorkClientEmbed = {
  first_name: string;
  last_name: string;
};

type PendingWorkRow = {
  id: string;
  client_id: string;
  status: string;
  updated_at: string;
  clients: PendingWorkClientEmbed | PendingWorkClientEmbed[] | null;
  natal_chart_client_reports: { id: string }[] | { id: string } | null;
};

export async function getPendingNatalChartWork(): Promise<
  ReportQueryResult<PendingNatalChartWorkResult>
> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const openStatuses = supabase
      .from("natal_chart_reports")
      .select(PENDING_WORK_SELECT)
      .in("status", ["draft", "reviewed"])
      .order("updated_at", { ascending: false })
      .limit(HOME_PENDING_WORK_LIMIT + 1)
      .returns<PendingWorkRow[]>();

    const readyStatuses = supabase
      .from("natal_chart_reports")
      .select(PENDING_WORK_SELECT)
      .eq("status", "ready")
      .order("updated_at", { ascending: false })
      .limit(READY_PENDING_LOOKBACK)
      .returns<PendingWorkRow[]>();

    const [openResult, readyResult] = await Promise.all([
      openStatuses,
      readyStatuses,
    ]);

    if (openResult.error) {
      console.error("[reports] Failed to load open natal chart work", {
        message: openResult.error.message,
        code: openResult.error.code,
      });
      return { status: "error" };
    }

    if (readyResult.error) {
      console.error("[reports] Failed to load ready natal chart work", {
        message: readyResult.error.message,
        code: readyResult.error.code,
      });
      return { status: "error" };
    }

    const mapped = [...(openResult.data ?? []), ...(readyResult.data ?? [])]
      .map(mapPendingWorkRow)
      .filter((row): row is PendingNatalChartWorkItem => row !== null);

    return {
      status: "ok",
      data: selectPendingNatalChartWork(mapped, HOME_PENDING_WORK_LIMIT),
    };
  } catch (error) {
    console.error("[reports] Unexpected error loading pending natal chart work", error);
    return { status: "error" };
  }
}

export async function getLatestNatalChartReport(
  clientId: string,
): Promise<ReportQueryResult<StoredNatalChartReport | null>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(clientId)) {
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
      .from("natal_chart_reports")
      .select(FULL_SELECT)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .returns<ReportRow>();

    if (error) {
      console.error("[reports] Failed to load latest natal chart report", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "ok", data: null };
    }

    const mapped = mapFullRow(data);

    if (!mapped) {
      return { status: "invalid" };
    }

    return { status: "ok", data: mapped };
  } catch (error) {
    console.error(
      "[reports] Unexpected error loading latest natal chart report",
      error,
    );
    return { status: "error" };
  }
}

export async function getNatalChartReportById(input: {
  clientId: string;
  reportId: string;
}): Promise<ReportQueryResult<StoredNatalChartReport>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.reportId)) {
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
      .from("natal_chart_reports")
      .select(FULL_SELECT)
      .eq("id", input.reportId)
      .eq("client_id", input.clientId)
      .maybeSingle()
      .returns<ReportRow>();

    if (error) {
      console.error("[reports] Failed to load natal chart report", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    const mapped = mapFullRow(data);

    if (!mapped) {
      return { status: "invalid" };
    }

    return { status: "ok", data: mapped };
  } catch (error) {
    console.error("[reports] Unexpected error loading natal chart report", error);
    return { status: "error" };
  }
}

export async function updateNatalChartReport(input: {
  clientId: string;
  reportId: string;
  report: NatalChartReport;
}): Promise<ReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.reportId)) {
    return { status: "not_found" };
  }

  const stored = await getNatalChartReportById({
    clientId: input.clientId,
    reportId: input.reportId,
  });

  if (stored.status !== "ok") {
    return stored;
  }

  const merged = applyProfessionalEdits(stored.data.generatedReport, input.report);
  const parsed = natalChartReportSchema.safeParse(merged);

  if (!parsed.success) {
    console.error("[reports] Refused to persist invalid professional report edit");
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
      .from("natal_chart_reports")
      .update({
        report: parsed.data,
        status: NATAL_CHART_REPORT_DEFAULT_STATUS,
      })
      .eq("id", input.reportId)
      .eq("client_id", input.clientId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[reports] Failed to update natal chart report", {
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
    console.error("[reports] Unexpected error updating natal chart report", error);
    return { status: "error" };
  }
}

export async function updateNatalChartReportStatus(input: {
  clientId: string;
  reportId: string;
  status: NatalChartReportStatus;
}): Promise<ReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.reportId)) {
    return { status: "not_found" };
  }

  if (!parseNatalChartReportStatus(input.status)) {
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
      .from("natal_chart_reports")
      .update({ status: input.status })
      .eq("id", input.reportId)
      .eq("client_id", input.clientId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[reports] Failed to update natal chart report status", {
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
      "[reports] Unexpected error updating natal chart report status",
      error,
    );
    return { status: "error" };
  }
}

function mapSummaryRow(
  row: ReportSummaryRow,
): StoredNatalChartReportSummary | null {
  const status = parseNatalChartReportStatus(row.status);

  if (!status) {
    console.error("[reports] Stored natal chart report has an invalid status");
    return null;
  }

  return {
    id: row.id,
    clientId: row.client_id,
    natalChartId: row.natal_chart_id,
    reportVersion: row.report_version,
    paulaLensVersion: row.paula_lens_version,
    geminiModel: row.gemini_model,
    status,
    createdAt: row.created_at,
  };
}

function mapFullRow(row: ReportRow): StoredNatalChartReport | null {
  const parsedReport = natalChartReportSchema.safeParse(row.report);
  const parsedGenerated = natalChartReportSchema.safeParse(row.generated_report);
  const summary = mapSummaryRow(row);

  if (!parsedReport.success || !parsedGenerated.success || !summary) {
    console.error("[reports] Stored natal chart report JSON could not be parsed");
    return null;
  }

  return {
    ...summary,
    report: parsedReport.data,
    generatedReport: parsedGenerated.data,
    generationDurationMs: row.generation_duration_ms,
    updatedAt: row.updated_at,
  };
}

function mapPendingWorkRow(row: PendingWorkRow): PendingNatalChartWorkItem | null {
  const status = parseNatalChartReportStatus(row.status);

  if (!status) {
    return null;
  }

  const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;

  if (!client?.first_name || !client.last_name) {
    return null;
  }

  const clientReports = Array.isArray(row.natal_chart_client_reports)
    ? row.natal_chart_client_reports
    : row.natal_chart_client_reports
      ? [row.natal_chart_client_reports]
      : [];
  const kind = classifyPendingNatalChartWork({
    status,
    hasClientReport: clientReports.length > 0,
  });

  if (!kind) {
    return null;
  }

  return {
    reportId: row.id,
    clientId: row.client_id,
    clientFirstName: client.first_name,
    clientLastName: client.last_name,
    status,
    kind,
    updatedAt: row.updated_at,
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
