export const NATAL_CHART_REPORT_STATUSES = [
  "draft",
  "reviewed",
  "ready",
] as const;

export type NatalChartReportStatus =
  (typeof NATAL_CHART_REPORT_STATUSES)[number];

export const NATAL_CHART_REPORT_DEFAULT_STATUS: NatalChartReportStatus =
  "draft";

export const NATAL_CHART_REPORT_STATUS_LABELS = {
  draft: "Borrador",
  reviewed: "Revisado",
  ready: "Listo para entregar",
} as const satisfies Record<NatalChartReportStatus, string>;

export const NATAL_CHART_REPORT_STATUS_ACTION_LABELS = {
  draft: "Volver a borrador",
  reviewed: "Marcar como revisado",
  ready: "Marcar como listo para entregar",
} as const satisfies Record<NatalChartReportStatus, string>;

export function isNatalChartReportStatus(
  value: unknown,
): value is NatalChartReportStatus {
  return (
    typeof value === "string" &&
    (NATAL_CHART_REPORT_STATUSES as readonly string[]).includes(value)
  );
}

export function parseNatalChartReportStatus(
  value: unknown,
): NatalChartReportStatus | null {
  return isNatalChartReportStatus(value) ? value : null;
}

export function getNatalChartReportStatusLabel(
  status: NatalChartReportStatus,
): string {
  return NATAL_CHART_REPORT_STATUS_LABELS[status];
}

export function getNatalChartReportStatusActionLabel(
  status: NatalChartReportStatus,
): string {
  return NATAL_CHART_REPORT_STATUS_ACTION_LABELS[status];
}
