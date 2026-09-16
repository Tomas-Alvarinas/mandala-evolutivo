import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DeleteTransitAnalysisControl } from "@/components/transits/DeleteTransitAnalysisControl";
import { formatIsoDateOnlyEs, type TransitAnalysisSummary } from "@/lib/transits";
import {
  interactiveListCardActionClassName,
  interactiveListCardClassName,
} from "@/lib/ui/list-card";

type TransitAnalysisListProps = {
  clientId: string;
  summaries: TransitAnalysisSummary[];
  showDelete?: boolean;
};

export function TransitAnalysisList({
  clientId,
  summaries,
  showDelete = false,
}: TransitAnalysisListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {summaries.map((summary) => {
        const dateLabel =
          formatIsoDateOnlyEs(summary.analysisDate) || summary.analysisDate;
        const counts = formatCounts(summary);
        const href = `/clients/${clientId}/transits/${summary.id}`;

        if (!showDelete) {
          return (
            <li key={summary.id}>
              <Card
                href={href}
                variant="interactive"
                padding="compact"
                className={interactiveListCardClassName}
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{dateLabel}</p>
                  <p className="mt-1 text-sm text-muted">{counts}</p>
                </div>
                <span className={interactiveListCardActionClassName}>
                  Ver →
                </span>
              </Card>
            </li>
          );
        }

        return (
          <li key={summary.id}>
            <Card
              padding="compact"
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link href={href} className="min-w-0">
                <p className="font-medium text-foreground">{dateLabel}</p>
                <p className="mt-1 text-sm text-muted">{counts}</p>
              </Link>
              <DeleteTransitAnalysisControl
                clientId={clientId}
                analysisId={summary.id}
                analysisDate={summary.analysisDate}
              />
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

export function formatCounts(summary: TransitAnalysisSummary): string {
  return [
    countLabel(summary.positionCount, "tránsito", "tránsitos"),
    countLabel(summary.aspectCount, "aspecto", "aspectos"),
    countLabel(summary.eclipseCount, "eclipse", "eclipses"),
  ].join(" · ");
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}
