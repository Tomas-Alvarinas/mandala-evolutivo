export const SOLAR_RETURN_REPORT_STATUSES = [
  "draft",
  "reviewed",
  "ready",
] as const;

export type SolarReturnReportStatus =
  (typeof SOLAR_RETURN_REPORT_STATUSES)[number];

export const SOLAR_RETURN_REPORT_DEFAULT_STATUS: SolarReturnReportStatus =
  "draft";

export const SOLAR_RETURN_REPORT_STATUS_LABELS = {
  draft: "Borrador",
  reviewed: "Revisado",
  ready: "Listo para entregar",
} as const satisfies Record<SolarReturnReportStatus, string>;

export function isSolarReturnReportStatus(
  value: unknown,
): value is SolarReturnReportStatus {
  return (
    typeof value === "string" &&
    (SOLAR_RETURN_REPORT_STATUSES as readonly string[]).includes(value)
  );
}

export function parseSolarReturnReportStatus(
  value: unknown,
): SolarReturnReportStatus | null {
  return isSolarReturnReportStatus(value) ? value : null;
}

export function getSolarReturnReportStatusLabel(
  status: SolarReturnReportStatus,
): string {
  return SOLAR_RETURN_REPORT_STATUS_LABELS[status];
}
