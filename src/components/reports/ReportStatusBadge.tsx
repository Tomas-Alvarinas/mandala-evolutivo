import { Badge } from "@/components/ui/Badge";
import type { PendingProfessionalStatus } from "@/lib/home/pending-work";
import { NATAL_CHART_REPORT_STATUS_LABELS } from "@/lib/reports";

type ReportStatusBadgeProps = {
  status: PendingProfessionalStatus;
};

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const variant =
    status === "ready" ? "success" : status === "reviewed" ? "warning" : "neutral";

  return (
    <Badge variant={variant}>{NATAL_CHART_REPORT_STATUS_LABELS[status]}</Badge>
  );
}
