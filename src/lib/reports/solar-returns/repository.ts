import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HOME_PENDING_WORK_LIMIT } from "@/lib/home/constants";
import { selectPendingWork } from "@/lib/home/pending-work";
import { formatSolarReturnPeriodYears } from "@/lib/solar-returns";
import { solarReturnReportSchema } from "@/lib/ai/solar-returns/schema";
import type { SolarReturnReport } from "./types";
import { applySolarReturnProfessionalEdits } from "./editorial";
import {
  classifyPendingSolarReturnWork,
  type PendingSolarReturnWorkItem,
} from "./pending-work";
import {
  SOLAR_RETURN_REPORT_DEFAULT_STATUS,
  parseSolarReturnReportStatus,
  type SolarReturnReportStatus,
} from "./status";
import {
  SOLAR_RETURN_REPORT_FULL_SELECT,
  SOLAR_RETURN_REPORT_SUMMARY_SELECT,
  mapSolarReturnReportRow,
  mapSolarReturnReportSummaryRow,
  type SolarReturnReportRecord,
  type SolarReturnReportRow,
  type SolarReturnReportSummary,
  type SolarReturnReportSummaryRow,
} from "./stored";

export type SolarReturnReportQueryResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_configured" }
  | { status: "unauthorized" }
  | { status: "not_found" }
  | { status: "invalid" }
  | { status: "error" };

export type PendingSolarReturnWorkResult = {
  items: PendingSolarReturnWorkItem[];
  hasMore: boolean;
};

export async function createSolarReturnReport(input: {
  clientId: string;
  solarReturnId: string;
  report: SolarReturnReport;
}): Promise<SolarReturnReportQueryResult<string>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.solarReturnId)) {
    return { status: "not_found" };
  }

  const parsed = solarReturnReportSchema.safeParse(input.report);

  if (!parsed.success) {
    console.error(
      "[reports.solar-returns] Refused to persist invalid solar return report",
    );
    return { status: "invalid" };
  }

  if (parsed.data.metadata.solarReturnId !== input.solarReturnId) {
    console.error(
      "[reports.solar-returns] Refused to persist report with mismatched solar return id",
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

    const { data: solarReturn, error: solarReturnError } = await supabase
      .from("solar_returns")
      .select("id")
      .eq("id", input.solarReturnId)
      .eq("client_id", input.clientId)
      .maybeSingle();

    if (solarReturnError || !solarReturn) {
      console.error("[reports.solar-returns] Solar return not found for persist", {
        message: solarReturnError?.message,
        code: solarReturnError?.code,
      });
      return { status: "not_found" };
    }

    const { data, error } = await supabase
      .from("solar_return_reports")
      .insert({
        client_id: input.clientId,
        solar_return_id: input.solarReturnId,
        report: parsed.data,
        generated_report: parsed.data,
        report_version: parsed.data.metadata.reportVersion,
        methodology_version: parsed.data.metadata.methodologyVersion,
        generated_at: parsed.data.metadata.generatedAt,
        status: SOLAR_RETURN_REPORT_DEFAULT_STATUS,
      })
      .select("id")
      .maybeSingle();

    if (error || !data || typeof data.id !== "string") {
      console.error("[reports.solar-returns] Failed to save solar return report", {
        message: error?.message,
        code: error?.code,
      });
      return { status: "error" };
    }

    return { status: "ok", data: data.id };
  } catch (error) {
    console.error(
      "[reports.solar-returns] Unexpected error saving solar return report",
      error,
    );
    return { status: "error" };
  }
}

export async function listSolarReturnReports(input: {
  clientId: string;
  solarReturnId: string;
}): Promise<SolarReturnReportQueryResult<SolarReturnReportSummary[]>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId) || !isUuid(input.solarReturnId)) {
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
      .from("solar_return_reports")
      .select(SOLAR_RETURN_REPORT_SUMMARY_SELECT)
      .eq("client_id", input.clientId)
      .eq("solar_return_id", input.solarReturnId)
      .order("generated_at", { ascending: false })
      .returns<SolarReturnReportSummaryRow[]>();

    if (error) {
      console.error("[reports.solar-returns] Failed to list solar return reports", {
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
        .map(mapSolarReturnReportSummaryRow)
        .filter((row): row is SolarReturnReportSummary => row !== null),
    };
  } catch (error) {
    console.error(
      "[reports.solar-returns] Unexpected error listing solar return reports",
      error,
    );
    return { status: "error" };
  }
}

export async function getSolarReturnReportById(input: {
  clientId: string;
  solarReturnId: string;
  reportId: string;
}): Promise<SolarReturnReportQueryResult<SolarReturnReportRecord>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.solarReturnId) ||
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
      .from("solar_return_reports")
      .select(SOLAR_RETURN_REPORT_FULL_SELECT)
      .eq("id", input.reportId)
      .eq("client_id", input.clientId)
      .eq("solar_return_id", input.solarReturnId)
      .maybeSingle()
      .returns<SolarReturnReportRow>();

    if (error) {
      console.error("[reports.solar-returns] Failed to load solar return report", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    const mapped = mapSolarReturnReportRow(data);

    if (!mapped) {
      return { status: "invalid" };
    }

    return { status: "ok", data: mapped };
  } catch (error) {
    console.error(
      "[reports.solar-returns] Unexpected error loading solar return report",
      error,
    );
    return { status: "error" };
  }
}

export async function updateSolarReturnProfessionalReport(input: {
  clientId: string;
  solarReturnId: string;
  reportId: string;
  report: SolarReturnReport;
}): Promise<SolarReturnReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.solarReturnId) ||
    !isUuid(input.reportId)
  ) {
    return { status: "not_found" };
  }

  const stored = await getSolarReturnReportById({
    clientId: input.clientId,
    solarReturnId: input.solarReturnId,
    reportId: input.reportId,
  });

  if (stored.status !== "ok") {
    return stored;
  }

  const merged = applySolarReturnProfessionalEdits(
    stored.data.generatedReport,
    input.report,
  );
  const parsed = solarReturnReportSchema.safeParse(merged);

  if (!parsed.success) {
    console.error(
      "[reports.solar-returns] Refused to persist invalid professional solar return report",
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
      .from("solar_return_reports")
      .update({
        report: parsed.data,
        status: SOLAR_RETURN_REPORT_DEFAULT_STATUS,
      })
      .eq("id", input.reportId)
      .eq("client_id", input.clientId)
      .eq("solar_return_id", input.solarReturnId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(
        "[reports.solar-returns] Failed to update professional solar return report",
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

    console.info("[reports.solar-returns] professional_edit_success", {
      reportId: input.reportId,
      previousStatus: stored.data.status,
      newStatus: SOLAR_RETURN_REPORT_DEFAULT_STATUS,
    });

    return { status: "ok", data: true };
  } catch (error) {
    console.error(
      "[reports.solar-returns] Unexpected error updating professional solar return report",
      error,
    );
    return { status: "error" };
  }
}

export async function updateSolarReturnReportStatus(input: {
  clientId: string;
  solarReturnId: string;
  reportId: string;
  status: SolarReturnReportStatus;
}): Promise<SolarReturnReportQueryResult<true>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (
    !isUuid(input.clientId) ||
    !isUuid(input.solarReturnId) ||
    !isUuid(input.reportId)
  ) {
    return { status: "not_found" };
  }

  if (!parseSolarReturnReportStatus(input.status)) {
    return { status: "invalid" };
  }

  const stored = await getSolarReturnReportById({
    clientId: input.clientId,
    solarReturnId: input.solarReturnId,
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
      .from("solar_return_reports")
      .update({ status: input.status })
      .eq("id", input.reportId)
      .eq("client_id", input.clientId)
      .eq("solar_return_id", input.solarReturnId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[reports.solar-returns] Failed to update solar return report status", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    console.info("[reports.solar-returns] status_change", {
      reportId: input.reportId,
      from: stored.data.status,
      to: input.status,
    });

    return { status: "ok", data: true };
  } catch (error) {
    console.error(
      "[reports.solar-returns] Unexpected error updating solar return report status",
      error,
    );
    return { status: "error" };
  }
}

const PENDING_WORK_SELECT =
  "id, client_id, solar_return_id, status, updated_at, clients!inner(first_name, last_name), solar_return_client_reports!professional_report_id(id), solar_returns!inner(period_start, period_end)";

const READY_PENDING_LOOKBACK = 50;

type PendingWorkClientEmbed = {
  first_name: string;
  last_name: string;
};

type PendingWorkSolarReturnEmbed = {
  period_start: string;
  period_end: string;
};

type PendingWorkRow = {
  id: string;
  client_id: string;
  solar_return_id: string;
  status: string;
  updated_at: string;
  clients: PendingWorkClientEmbed | PendingWorkClientEmbed[] | null;
  solar_return_client_reports: { id: string }[] | { id: string } | null;
  solar_returns: PendingWorkSolarReturnEmbed | PendingWorkSolarReturnEmbed[] | null;
};

export async function getPendingSolarReturnWork(): Promise<
  SolarReturnReportQueryResult<PendingSolarReturnWorkResult>
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
      .from("solar_return_reports")
      .select(PENDING_WORK_SELECT)
      .in("status", ["draft", "reviewed"])
      .order("updated_at", { ascending: false })
      .limit(HOME_PENDING_WORK_LIMIT + 1)
      .returns<PendingWorkRow[]>();

    const readyStatuses = supabase
      .from("solar_return_reports")
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
      console.error("[reports.solar-returns] Failed to load open solar return work", {
        message: openResult.error.message,
        code: openResult.error.code,
      });
      return { status: "error" };
    }

    if (readyResult.error) {
      console.error(
        "[reports.solar-returns] Failed to load ready solar return work",
        {
          message: readyResult.error.message,
          code: readyResult.error.code,
        },
      );
      return { status: "error" };
    }

    const mapped = [...(openResult.data ?? []), ...(readyResult.data ?? [])]
      .map(mapPendingWorkRow)
      .filter((row): row is PendingSolarReturnWorkItem => row !== null);

    return {
      status: "ok",
      data: selectPendingWork(mapped, HOME_PENDING_WORK_LIMIT),
    };
  } catch (error) {
    console.error(
      "[reports.solar-returns] Unexpected error loading pending solar return work",
      error,
    );
    return { status: "error" };
  }
}

function mapPendingWorkRow(
  row: PendingWorkRow,
): PendingSolarReturnWorkItem | null {
  const status = parseSolarReturnReportStatus(row.status);

  if (!status) {
    return null;
  }

  const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;

  if (!client?.first_name || !client.last_name) {
    return null;
  }

  const clientReports = Array.isArray(row.solar_return_client_reports)
    ? row.solar_return_client_reports
    : row.solar_return_client_reports
      ? [row.solar_return_client_reports]
      : [];
  const kind = classifyPendingSolarReturnWork({
    status,
    hasClientReport: clientReports.length > 0,
  });

  if (!kind) {
    return null;
  }

  const solarReturn = Array.isArray(row.solar_returns)
    ? row.solar_returns[0]
    : row.solar_returns;
  const contextLabel =
    solarReturn?.period_start && solarReturn.period_end
      ? formatSolarReturnPeriodYears({
          periodStart: solarReturn.period_start,
          periodEnd: solarReturn.period_end,
        })
      : null;

  return {
    reportId: row.id,
    clientId: row.client_id,
    solarReturnId: row.solar_return_id,
    clientFirstName: client.first_name,
    clientLastName: client.last_name,
    status,
    kind,
    updatedAt: row.updated_at,
    contextLabel,
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
