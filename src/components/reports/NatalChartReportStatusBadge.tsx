import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { badgeVariantClasses } from "@/components/ui/Badge";
import type { NatalChartReportStatus } from "@/lib/reports";

export const natalChartReportStatusToneClasses: Record<
  NatalChartReportStatus,
  string
> = {
  draft: badgeVariantClasses.neutral,
  reviewed: badgeVariantClasses.warning,
  ready: badgeVariantClasses.success,
};

type NatalChartReportStatusBadgeProps = {
  status: NatalChartReportStatus;
};

export function NatalChartReportStatusBadge({
  status,
}: NatalChartReportStatusBadgeProps) {
  return <ReportStatusBadge status={status} />;
}
