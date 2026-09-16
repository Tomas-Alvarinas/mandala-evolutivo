import { Card } from "@/components/ui/Card";
import { NatalChartAnalysisPanel } from "@/components/reports/NatalChartAnalysisPanel";
import { NatalChartReportStatusBadge } from "@/components/reports/NatalChartReportStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { formatLongDateEs } from "@/lib/dates";
import {
  isLatestNatalChartReportSummary,
  type StoredNatalChartReport,
  type StoredNatalChartReportSummary,
} from "@/lib/reports";
import {
  interactiveListCardActionClassName,
  interactiveListCardClassName,
} from "@/lib/ui/list-card";

type NatalChartReportsSectionProps = {
  clientId: string;
  latest: StoredNatalChartReport | null;
  latestInvalid: boolean;
  latestError: boolean;
  summaries: StoredNatalChartReportSummary[] | null;
};

export function NatalChartReportsSection({
  clientId,
  latest,
  latestInvalid,
  latestError,
  summaries,
}: NatalChartReportsSectionProps) {
  const historyUnavailable = summaries === null;
  const reportCards = summaries ?? (latest ? [latest] : []);
  const hasReports = reportCards.length > 0;

  return (
    <section>
      <NatalChartAnalysisPanel clientId={clientId} />

      {historyUnavailable && latestError ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          No se pudieron cargar los informes de este consultante.
        </p>
      ) : null}

      {historyUnavailable && !latestError ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          No se pudo cargar el historial de informes.
        </p>
      ) : null}

      {latestError && !historyUnavailable ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          No se pudo cargar el último informe.
        </p>
      ) : null}

      {latestInvalid ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          El último informe está dañado y no se puede mostrar. El resto de la
          ficha sigue disponible.
        </p>
      ) : null}

      {!hasReports && !historyUnavailable && !latestError && !latestInvalid ? (
        <p className="mt-3 text-sm text-muted">
          Todavía no hay informes generados.
        </p>
      ) : null}

      {hasReports ? (
        <ul className="mt-5 flex flex-col gap-3">
          {reportCards.map((summary) => {
            const createdAt = formatLongDateEs(summary.createdAt);
            const latestCard = isLatestNatalChartReportSummary(
              summary,
              reportCards,
            );

            return (
              <li key={summary.id}>
                <Card
                  href={`/clients/${clientId}/reports/${summary.id}`}
                  variant="interactive"
                  padding="compact"
                  className={interactiveListCardClassName}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <p className="font-medium text-foreground">
                        {createdAt || "Fecha no disponible"}
                      </p>
                      <NatalChartReportStatusBadge status={summary.status} />
                      {latestCard ? (
                        <Badge variant="info">Más reciente</Badge>
                      ) : null}
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
