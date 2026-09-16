import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import type { SolarReturnReportStatus } from "@/lib/reports";

type SolarReturnReportStatusBadgeProps = {
  status: SolarReturnReportStatus;
};

export function SolarReturnReportStatusBadge({
  status,
}: SolarReturnReportStatusBadgeProps) {
  return <ReportStatusBadge status={status} />;
}
