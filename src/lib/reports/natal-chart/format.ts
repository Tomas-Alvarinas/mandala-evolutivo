import { formatDateTimeEs, formatNumericDateEs } from "@/lib/dates";

export function formatNatalChartReportCreatedAt(isoDate: string) {
  return formatNumericDateEs(isoDate);
}

export function formatNatalChartReportDateTime(isoDate: string) {
  return formatDateTimeEs(isoDate);
}

export function natalChartReportWasEdited(createdAt: string, updatedAt: string) {
  const created = Date.parse(createdAt);
  const updated = Date.parse(updatedAt);

  if (Number.isNaN(created) || Number.isNaN(updated)) {
    return false;
  }

  return updated - created > 1500;
}
