import { solarReturnReportSchema } from "@/lib/ai/solar-returns/schema";
import type { SolarReturnReport } from "./types";
import {
  parseSolarReturnReportStatus,
  type SolarReturnReportStatus,
} from "./status";

export type SolarReturnReportSummary = {
  id: string;
  clientId: string;
  solarReturnId: string;
  reportVersion: string;
  methodologyVersion: string;
  generatedAt: string;
  createdAt: string;
  status: SolarReturnReportStatus;
};

export type SolarReturnReportRecord = SolarReturnReportSummary & {
  report: SolarReturnReport;
  generatedReport: SolarReturnReport;
};

export type SolarReturnReportSummaryRow = {
  id: string;
  client_id: string;
  solar_return_id: string;
  report_version: string;
  methodology_version: string;
  generated_at: string;
  created_at: string;
  status: string;
};

export type SolarReturnReportRow = SolarReturnReportSummaryRow & {
  report: unknown;
  generated_report: unknown;
};

export const SOLAR_RETURN_REPORT_SUMMARY_COLUMNS = [
  "id",
  "client_id",
  "solar_return_id",
  "report_version",
  "methodology_version",
  "generated_at",
  "created_at",
  "status",
] as const;

export const SOLAR_RETURN_REPORT_DETAIL_COLUMNS = [
  ...SOLAR_RETURN_REPORT_SUMMARY_COLUMNS,
  "report",
  "generated_report",
] as const;

export const SOLAR_RETURN_REPORT_SUMMARY_SELECT =
  SOLAR_RETURN_REPORT_SUMMARY_COLUMNS.join(", ");

export const SOLAR_RETURN_REPORT_FULL_SELECT =
  SOLAR_RETURN_REPORT_DETAIL_COLUMNS.join(", ");

export function parseStoredSolarReturnReport(
  value: unknown,
): SolarReturnReport | null {
  const parsed = solarReturnReportSchema.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export function mapSolarReturnReportSummaryRow(
  row: SolarReturnReportSummaryRow,
): SolarReturnReportSummary | null {
  const status = parseSolarReturnReportStatus(row.status);

  if (
    typeof row.id !== "string" ||
    typeof row.client_id !== "string" ||
    typeof row.solar_return_id !== "string" ||
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
    solarReturnId: row.solar_return_id,
    reportVersion: row.report_version,
    methodologyVersion: row.methodology_version,
    generatedAt: row.generated_at,
    createdAt: row.created_at,
    status,
  };
}

export function mapSolarReturnReportRow(
  row: SolarReturnReportRow,
): SolarReturnReportRecord | null {
  const summary = mapSolarReturnReportSummaryRow(row);
  const report = parseStoredSolarReturnReport(row.report);
  const generatedReport = parseStoredSolarReturnReport(row.generated_report);

  if (!summary || !report || !generatedReport) {
    return null;
  }

  return {
    ...summary,
    report,
    generatedReport,
  };
}

export function solarReturnReportOwnershipMatches(input: {
  reportClientId: string;
  reportSolarReturnId: string;
  expectedClientId: string;
  expectedSolarReturnId: string;
}): boolean {
  return (
    input.reportClientId === input.expectedClientId &&
    input.reportSolarReturnId === input.expectedSolarReturnId
  );
}

export function sortSolarReturnReportSummariesLatestFirst(
  items: readonly SolarReturnReportSummary[],
): SolarReturnReportSummary[] {
  return [...items].sort((left, right) => {
    const rightTime = Date.parse(right.generatedAt);
    const leftTime = Date.parse(left.generatedAt);

    if (Number.isNaN(rightTime) || Number.isNaN(leftTime)) {
      return 0;
    }

    return rightTime - leftTime;
  });
}

export function getLatestSolarReturnReportSummary(
  items: readonly SolarReturnReportSummary[],
): SolarReturnReportSummary | null {
  return sortSolarReturnReportSummariesLatestFirst(items)[0] ?? null;
}

export function isLatestSolarReturnReportSummary(
  item: SolarReturnReportSummary,
  items: readonly SolarReturnReportSummary[],
): boolean {
  return getLatestSolarReturnReportSummary(items)?.id === item.id;
}
