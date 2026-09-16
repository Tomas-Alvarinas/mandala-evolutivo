import { transitAnalysisReportSchema } from "@/lib/ai/transits/schema";
import type { TransitAnalysisReport } from "./types";
import {
  parseTransitAnalysisReportStatus,
  type TransitAnalysisReportStatus,
} from "./status";

/**
 * Prompt 35/36: el JSON persistido es la salida IA validada más la edición
 * profesional. No incluye snapshot de TransitAnalysis ni de la Carta Natal.
 */
export type TransitAnalysisReportSummary = {
  id: string;
  clientId: string;
  transitAnalysisId: string;
  reportVersion: string;
  methodologyVersion: string;
  generatedAt: string;
  createdAt: string;
  status: TransitAnalysisReportStatus;
};

export type TransitAnalysisReportRecord = TransitAnalysisReportSummary & {
  report: TransitAnalysisReport;
  generatedReport: TransitAnalysisReport;
};

export type TransitAnalysisReportSummaryRow = {
  id: string;
  client_id: string;
  transit_analysis_id: string;
  report_version: string;
  methodology_version: string;
  generated_at: string;
  created_at: string;
  status: string;
};

export type TransitAnalysisReportRow = TransitAnalysisReportSummaryRow & {
  report: unknown;
  generated_report: unknown;
};

export const TRANSIT_ANALYSIS_REPORT_SUMMARY_COLUMNS = [
  "id",
  "client_id",
  "transit_analysis_id",
  "report_version",
  "methodology_version",
  "generated_at",
  "created_at",
  "status",
] as const;

export const TRANSIT_ANALYSIS_REPORT_DETAIL_COLUMNS = [
  ...TRANSIT_ANALYSIS_REPORT_SUMMARY_COLUMNS,
  "report",
  "generated_report",
] as const;

export const TRANSIT_ANALYSIS_REPORT_SUMMARY_SELECT =
  TRANSIT_ANALYSIS_REPORT_SUMMARY_COLUMNS.join(", ");

export const TRANSIT_ANALYSIS_REPORT_FULL_SELECT =
  TRANSIT_ANALYSIS_REPORT_DETAIL_COLUMNS.join(", ");

export function parseStoredTransitAnalysisReport(
  value: unknown,
): TransitAnalysisReport | null {
  const parsed = transitAnalysisReportSchema.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export function mapTransitAnalysisReportSummaryRow(
  row: TransitAnalysisReportSummaryRow,
): TransitAnalysisReportSummary | null {
  const status = parseTransitAnalysisReportStatus(row.status);

  if (
    typeof row.id !== "string" ||
    typeof row.client_id !== "string" ||
    typeof row.transit_analysis_id !== "string" ||
    typeof row.report_version !== "string" ||
    typeof row.methodology_version !== "string" ||
    typeof row.generated_at !== "string" ||
    typeof row.created_at !== "string" ||
    !status
  ) {
    return null;
  }

  return {
    id: row.id,
    clientId: row.client_id,
    transitAnalysisId: row.transit_analysis_id,
    reportVersion: row.report_version,
    methodologyVersion: row.methodology_version,
    generatedAt: row.generated_at,
    createdAt: row.created_at,
    status,
  };
}

export function mapTransitAnalysisReportRow(
  row: TransitAnalysisReportRow,
): TransitAnalysisReportRecord | null {
  const summary = mapTransitAnalysisReportSummaryRow(row);
  const report = parseStoredTransitAnalysisReport(row.report);
  const generatedReport = parseStoredTransitAnalysisReport(row.generated_report);

  if (!summary || !report || !generatedReport) {
    return null;
  }

  return {
    ...summary,
    report,
    generatedReport,
  };
}

export function transitAnalysisReportOwnershipMatches(input: {
  reportClientId: string;
  reportTransitAnalysisId: string;
  expectedClientId: string;
  expectedTransitAnalysisId: string;
}): boolean {
  return (
    input.reportClientId === input.expectedClientId &&
    input.reportTransitAnalysisId === input.expectedTransitAnalysisId
  );
}

export function sortTransitAnalysisReportSummariesLatestFirst(
  items: readonly TransitAnalysisReportSummary[],
): TransitAnalysisReportSummary[] {
  return [...items].sort((left, right) => {
    const rightTime = Date.parse(right.generatedAt);
    const leftTime = Date.parse(left.generatedAt);

    if (Number.isNaN(rightTime) || Number.isNaN(leftTime)) {
      return 0;
    }

    return rightTime - leftTime;
  });
}

export function getLatestTransitAnalysisReportSummary(
  items: readonly TransitAnalysisReportSummary[],
): TransitAnalysisReportSummary | null {
  return sortTransitAnalysisReportSummariesLatestFirst(items)[0] ?? null;
}

export function isLatestTransitAnalysisReportSummary(
  item: TransitAnalysisReportSummary,
  items: readonly TransitAnalysisReportSummary[],
): boolean {
  return getLatestTransitAnalysisReportSummary(items)?.id === item.id;
}
