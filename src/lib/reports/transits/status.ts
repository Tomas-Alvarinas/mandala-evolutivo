export const TRANSIT_ANALYSIS_REPORT_STATUSES = [
  "draft",
  "reviewed",
  "ready",
] as const;

export type TransitAnalysisReportStatus =
  (typeof TRANSIT_ANALYSIS_REPORT_STATUSES)[number];

export const TRANSIT_ANALYSIS_REPORT_DEFAULT_STATUS: TransitAnalysisReportStatus =
  "draft";

export const TRANSIT_ANALYSIS_REPORT_STATUS_LABELS = {
  draft: "Borrador",
  reviewed: "Revisado",
  ready: "Listo para entregar",
} as const satisfies Record<TransitAnalysisReportStatus, string>;

export function isTransitAnalysisReportStatus(
  value: unknown,
): value is TransitAnalysisReportStatus {
  return (
    typeof value === "string" &&
    (TRANSIT_ANALYSIS_REPORT_STATUSES as readonly string[]).includes(value)
  );
}

export function parseTransitAnalysisReportStatus(
  value: unknown,
): TransitAnalysisReportStatus | null {
  return isTransitAnalysisReportStatus(value) ? value : null;
}

export function getTransitAnalysisReportStatusLabel(
  status: TransitAnalysisReportStatus,
): string {
  return TRANSIT_ANALYSIS_REPORT_STATUS_LABELS[status];
}
