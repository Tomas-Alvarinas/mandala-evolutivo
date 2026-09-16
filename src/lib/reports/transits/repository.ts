import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HOME_PENDING_WORK_LIMIT } from "@/lib/home/constants";
import { selectPendingWork } from "@/lib/home/pending-work";
import { formatIsoDateOnlyEs } from "@/lib/transits";
import { transitAnalysisReportSchema } from "@/lib/ai/transits/schema";
import type { TransitAnalysisReport } from "./types";
import { applyTransitAnalysisProfessionalEdits } from "./editorial";
import {
  classifyPendingTransitAnalysisWork,
  type PendingTransitAnalysisWorkItem,
} from "./pending-work";
import {
  TRANSIT_ANALYSIS_REPORT_DEFAULT_STATUS,
  parseTransitAnalysisReportStatus,
  type TransitAnalysisReportStatus,
} from "./status";
import {
  TRANSIT_ANALYSIS_REPORT_FULL_SELECT,
  TRANSIT_ANALYSIS_REPORT_SUMMARY_SELECT,
  mapTransitAnalysisReportRow,
  mapTransitAnalysisReportSummaryRow,
  type TransitAnalysisReportRecord,
  type TransitAnalysisReportRow,
  type TransitAnalysisReportSummary,
  type TransitAnalysisReportSummaryRow,
} from "./stored";

export type TransitReportQueryResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_configured" }
  | { status: "unauthorized" }
  | { status: "not_found" }
  | { status: "invalid" }
  | { status: "error" };

export type PendingTransitAnalysisWorkResult = {
  items: PendingTransitAnalysisWorkItem[];
  hasMore: boolean;
};

export async function saveTransitAnalysisReport(input: {
  clientId: string;
  transitAnalysisId: string;
  report: TransitAnalysisReport;
}): Promise<TransitReportQueryResult<string>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.transitAnalysisId)) {
    return { status: "not_found" };
  }

  const parsed = transitAnalysisReportSchema.safeParse(input.report);

  if (!parsed.success) {
    console.error("[reports.transits] Refused to persist invalid transit report");
    return { status: "invalid" };
  }

  if (parsed.data.metadata.transitAnalysisId !== input.transitAnalysisId) {
    console.error(
      "[reports.transits] Refused to persist report with mismatched analysis id",
    );
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

    const { data: analysis, error: analysisError } = await supabase
      .from("transit_analyses")
      .select("id")
      .eq("id", input.transitAnalysisId)
      .eq("client_id", input.clientId)
      .maybeSingle();

    if (analysisError || !analysis) {
      console.error("[reports.transits] Transit analysis not found for persist", {
        message: analysisError?.message,
        code: analysisError?.code,
      });
      return { status: "not_found" };
    }

    const { data, error } = await supabase
      .from("transit_analysis_reports")
      .insert({
        client_id: input.clientId,
        transit_analysis_id: input.transitAnalysisId,
        report: parsed.data,
        generated_report: parsed.data,
        report_version: parsed.data.metadata.reportVersion,
        methodology_version: parsed.data.metadata.methodologyVersion,
        generated_at: parsed.data.metadata.generatedAt,
        status: TRANSIT_ANALYSIS_REPORT_DEFAULT_STATUS,
      })
      .select("id")
      .maybeSingle();

    if (error || !data || typeof data.id !== "string") {
      console.error("[reports.transits] Failed to save transit analysis report", {
        message: error?.message,
        code: error?.code,
      });
      return { status: "error" };
    }

    return { status: "ok", data: data.id };
  } catch (error) {
    console.error(
      "[reports.transits] Unexpected error saving transit analysis report",
      error,
    );
    return { status: "error" };
  }
}

export async function listTransitAnalysisReports(input: {
  clientId: string;
  transitAnalysisId: string;
}): Promise<TransitReportQueryResult<TransitAnalysisReportSummary[]>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.transitAnalysisId)) {
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
      .from("transit_analysis_reports")
      .select(TRANSIT_ANALYSIS_REPORT_SUMMARY_SELECT)
      .eq("client_id", input.clientId)
      .eq("transit_analysis_id", input.transitAnalysisId)
      .order("generated_at", { ascending: false })
      .returns<TransitAnalysisReportSummaryRow[]>();

    if (error) {
      console.error("[reports.transits] Failed to list transit analysis reports", {
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
        .map(mapTransitAnalysisReportSummaryRow)
        .filter((row): row is TransitAnalysisReportSummary => row !== null),
    };
  } catch (error) {
    console.error(
      "[reports.transits] Unexpected error listing transit analysis reports",
      error,
    );
    return { status: "error" };
  }
}

export async function countTransitAnalysisReports(input: {
  clientId: string;
  transitAnalysisId: string;
}): Promise<TransitReportQueryResult<number>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.transitAnalysisId)) {
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
      .from("transit_analysis_reports")
      .select("id", { count: "exact", head: true })
      .eq("client_id", input.clientId)
      .eq("transit_analysis_id", input.transitAnalysisId);

    if (error) {
      console.error("[reports.transits] Failed to count transit analysis reports", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    return { status: "ok", data: count ?? 0 };
  } catch (error) {
    console.error(
      "[reports.transits] Unexpected error counting transit analysis reports",
      error,
    );
    return { status: "error" };
  }
}

export async function getLatestTransitAnalysisReport(input: {
  clientId: string;
  transitAnalysisId: string;
}): Promise<TransitReportQueryResult<TransitAnalysisReportRecord | null>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.transitAnalysisId)) {
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
      .from("transit_analysis_reports")
      .select(TRANSIT_ANALYSIS_REPORT_FULL_SELECT)
      .eq("client_id", input.clientId)
      .eq("transit_analysis_id", input.transitAnalysisId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .returns<TransitAnalysisReportRow>();

    if (error) {
      console.error("[reports.transits] Failed to load latest transit report", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "ok", data: null };
    }

    const mapped = mapTransitAnalysisReportRow(data);

    if (!mapped) {
      return { status: "invalid" };
    }

    return { status: "ok", data: mapped };
  } catch (error) {
    console.error(
      "[reports.transits] Unexpected error loading latest transit report",
      error,
    );
    return { status: "error" };
  }
}

export async function getTransitAnalysisReportById(input: {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
}): Promise<TransitReportQueryResult<TransitAnalysisReportRecord>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.transitAnalysisId) ||
    !isUuid(input.reportId)
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
      .from("transit_analysis_reports")
      .select(TRANSIT_ANALYSIS_REPORT_FULL_SELECT)
      .eq("id", input.reportId)
      .eq("client_id", input.clientId)
      .eq("transit_analysis_id", input.transitAnalysisId)
      .maybeSingle()
      .returns<TransitAnalysisReportRow>();

    if (error) {
      console.error("[reports.transits] Failed to load transit analysis report", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    const mapped = mapTransitAnalysisReportRow(data);

    if (!mapped) {
      return { status: "invalid" };
    }

    return { status: "ok", data: mapped };
  } catch (error) {
    console.error(
      "[reports.transits] Unexpected error loading transit analysis report",
      error,
    );
    return { status: "error" };
  }
}

export async function deleteTransitAnalysisReport(input: {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
}): Promise<TransitReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.transitAnalysisId) ||
    !isUuid(input.reportId)
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
      .from("transit_analysis_reports")
      .delete()
      .eq("id", input.reportId)
      .eq("client_id", input.clientId)
      .eq("transit_analysis_id", input.transitAnalysisId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[reports.transits] Failed to delete transit analysis report", {
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
      "[reports.transits] Unexpected error deleting transit analysis report",
      error,
    );
    return { status: "error" };
  }
}

export async function updateTransitAnalysisProfessionalReport(input: {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
  report: TransitAnalysisReport;
}): Promise<TransitReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.transitAnalysisId) ||
    !isUuid(input.reportId)
  ) {
    return { status: "not_found" };
  }

  const stored = await getTransitAnalysisReportById({
    clientId: input.clientId,
    transitAnalysisId: input.transitAnalysisId,
    reportId: input.reportId,
  });

  if (stored.status !== "ok") {
    return stored;
  }

  const merged = applyTransitAnalysisProfessionalEdits(
    stored.data.generatedReport,
    input.report,
  );
  const parsed = transitAnalysisReportSchema.safeParse(merged);

  if (!parsed.success) {
    console.error(
      "[reports.transits] Refused to persist invalid professional transit report",
    );
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
      .from("transit_analysis_reports")
      .update({
        report: parsed.data,
        status: TRANSIT_ANALYSIS_REPORT_DEFAULT_STATUS,
      })
      .eq("id", input.reportId)
      .eq("client_id", input.clientId)
      .eq("transit_analysis_id", input.transitAnalysisId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(
        "[reports.transits] Failed to update professional transit report",
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

    console.info("[reports.transits] professional_edit_success", {
      reportId: input.reportId,
      previousStatus: stored.data.status,
      newStatus: TRANSIT_ANALYSIS_REPORT_DEFAULT_STATUS,
    });

    return { status: "ok", data: true };
  } catch (error) {
    console.error(
      "[reports.transits] Unexpected error updating professional transit report",
      error,
    );
    return { status: "error" };
  }
}

export async function updateTransitAnalysisReportStatus(input: {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
  status: TransitAnalysisReportStatus;
}): Promise<TransitReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.transitAnalysisId) ||
    !isUuid(input.reportId)
  ) {
    return { status: "not_found" };
  }

  if (!parseTransitAnalysisReportStatus(input.status)) {
    return { status: "invalid" };
  }

  const stored = await getTransitAnalysisReportById({
    clientId: input.clientId,
    transitAnalysisId: input.transitAnalysisId,
    reportId: input.reportId,
  });

  if (stored.status !== "ok") {
    return stored;
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
      .from("transit_analysis_reports")
      .update({ status: input.status })
      .eq("id", input.reportId)
      .eq("client_id", input.clientId)
      .eq("transit_analysis_id", input.transitAnalysisId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[reports.transits] Failed to update transit report status", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    console.info("[reports.transits] status_change", {
      reportId: input.reportId,
      from: stored.data.status,
      to: input.status,
    });

    return { status: "ok", data: true };
  } catch (error) {
    console.error(
      "[reports.transits] Unexpected error updating transit report status",
      error,
    );
    return { status: "error" };
  }
}

const PENDING_WORK_SELECT =
  "id, client_id, transit_analysis_id, status, created_at, clients!inner(first_name, last_name), transit_analysis_client_reports!professional_report_id(id), transit_analyses!inner(analysis_date)";

const READY_PENDING_LOOKBACK = 50;

type PendingWorkClientEmbed = {
  first_name: string;
  last_name: string;
};

type PendingWorkTransitEmbed = {
  analysis_date: string;
};

type PendingWorkRow = {
  id: string;
  client_id: string;
  transit_analysis_id: string;
  status: string;
  created_at: string;
  clients: PendingWorkClientEmbed | PendingWorkClientEmbed[] | null;
  transit_analysis_client_reports: { id: string }[] | { id: string } | null;
  transit_analyses: PendingWorkTransitEmbed | PendingWorkTransitEmbed[] | null;
};

export async function getPendingTransitAnalysisWork(): Promise<
  TransitReportQueryResult<PendingTransitAnalysisWorkResult>
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
      .from("transit_analysis_reports")
      .select(PENDING_WORK_SELECT)
      .in("status", ["draft", "reviewed"])
      .order("created_at", { ascending: false })
      .limit(HOME_PENDING_WORK_LIMIT + 1)
      .returns<PendingWorkRow[]>();

    const readyStatuses = supabase
      .from("transit_analysis_reports")
      .select(PENDING_WORK_SELECT)
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(READY_PENDING_LOOKBACK)
      .returns<PendingWorkRow[]>();

    const [openResult, readyResult] = await Promise.all([
      openStatuses,
      readyStatuses,
    ]);

    if (openResult.error) {
      console.error("[reports.transits] Failed to load open transit work", {
        message: openResult.error.message,
        code: openResult.error.code,
      });
      return { status: "error" };
    }

    if (readyResult.error) {
      console.error("[reports.transits] Failed to load ready transit work", {
        message: readyResult.error.message,
        code: readyResult.error.code,
      });
      return { status: "error" };
    }

    const mapped = [...(openResult.data ?? []), ...(readyResult.data ?? [])]
      .map(mapPendingWorkRow)
      .filter((row): row is PendingTransitAnalysisWorkItem => row !== null);

    return {
      status: "ok",
      data: selectPendingWork(mapped, HOME_PENDING_WORK_LIMIT),
    };
  } catch (error) {
    console.error(
      "[reports.transits] Unexpected error loading pending transit work",
      error,
    );
    return { status: "error" };
  }
}

function mapPendingWorkRow(
  row: PendingWorkRow,
): PendingTransitAnalysisWorkItem | null {
  const status = parseTransitAnalysisReportStatus(row.status);

  if (!status) {
    return null;
  }

  const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;

  if (!client?.first_name || !client.last_name) {
    return null;
  }

  const clientReports = Array.isArray(row.transit_analysis_client_reports)
    ? row.transit_analysis_client_reports
    : row.transit_analysis_client_reports
      ? [row.transit_analysis_client_reports]
      : [];
  const kind = classifyPendingTransitAnalysisWork({
    status,
    hasClientReport: clientReports.length > 0,
  });

  if (!kind) {
    return null;
  }

  const transitAnalysis = Array.isArray(row.transit_analyses)
    ? row.transit_analyses[0]
    : row.transit_analyses;
  const contextLabel = transitAnalysis?.analysis_date
    ? formatIsoDateOnlyEs(transitAnalysis.analysis_date) ||
      transitAnalysis.analysis_date
    : null;

  return {
    reportId: row.id,
    clientId: row.client_id,
    transitAnalysisId: row.transit_analysis_id,
    clientFirstName: client.first_name,
    clientLastName: client.last_name,
    status,
    kind,
    updatedAt: row.created_at,
    contextLabel,
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
