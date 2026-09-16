import { TransitAnalysisPanel } from "@/components/reports/TransitAnalysisPanel";
import { TransitAnalysisReportStatusBadge } from "@/components/reports/TransitAnalysisReportStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatLongDateEs } from "@/lib/dates";
import {
  isLatestTransitAnalysisReportSummary,
  type TransitAnalysisReportSummary,
} from "@/lib/reports";
import {
  interactiveListCardActionClassName,
  interactiveListCardClassName,
} from "@/lib/ui/list-card";

type TransitAnalysisReportsSectionProps = {
  clientId: string;
  transitAnalysisId: string;
  summaries: TransitAnalysisReportSummary[] | null;
  loadError?: boolean;
};

export function TransitAnalysisReportsSection({
  clientId,
  transitAnalysisId,
  summaries,
  loadError = false,
}: TransitAnalysisReportsSectionProps) {
  const historyUnavailable = summaries === null || loadError;
  const hasReports = (summaries?.length ?? 0) > 0;

  return (
    <section>
      <TransitAnalysisPanel
        clientId={clientId}
        transitAnalysisId={transitAnalysisId}
      />

      {historyUnavailable ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          No se pudo cargar el historial de informes.
        </p>
      ) : null}

      {!historyUnavailable && !hasReports ? (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Todavía no hay informes generados.
        </p>
      ) : null}

      {!historyUnavailable && summaries && hasReports ? (
        <ul className="mt-5 flex flex-col gap-3">
          {summaries.map((summary) => {
            const generatedAt = formatLongDateEs(summary.generatedAt);
            const latest = isLatestTransitAnalysisReportSummary(
              summary,
              summaries,
            );

            return (
              <li key={summary.id}>
                <Card
                  href={`/clients/${clientId}/transits/${transitAnalysisId}/reports/${summary.id}`}
                  variant="interactive"
                  padding="compact"
                  className={interactiveListCardClassName}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <p className="font-medium text-foreground">
                        {generatedAt || "Fecha no disponible"}
                      </p>
                      <TransitAnalysisReportStatusBadge status={summary.status} />
                      {latest ? <Badge variant="info">Más reciente</Badge> : null}
                    </div>
                  </div>
                  <span className={interactiveListCardActionClassName}>
                    Ver informe →
                  </span>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
