import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { badgeVariantClasses } from "@/components/ui/Badge";
import type { TransitAnalysisReportStatus } from "@/lib/reports";

export const transitAnalysisReportStatusToneClasses: Record<
  TransitAnalysisReportStatus,
  string
> = {
  draft: badgeVariantClasses.neutral,
  reviewed: badgeVariantClasses.warning,
  ready: badgeVariantClasses.success,
};

type TransitAnalysisReportStatusBadgeProps = {
  status: TransitAnalysisReportStatus;
};

export function TransitAnalysisReportStatusBadge({
  status,
}: TransitAnalysisReportStatusBadgeProps) {
  return <ReportStatusBadge status={status} />;
}
