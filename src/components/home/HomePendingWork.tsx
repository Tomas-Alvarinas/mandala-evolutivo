import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { TextLink } from "@/components/ui/TextLink";
import { formatLongDateEs } from "@/lib/dates";
import {
  getPendingWorkActionLabel,
  getPendingWorkModuleLabel,
  type PendingWorkItem,
} from "@/lib/home/pending-work";
import {
  interactiveListCardActionClassName,
  interactiveListCardClassName,
} from "@/lib/ui/list-card";

type HomePendingWorkProps = {
  items: PendingWorkItem[];
  hasMore: boolean;
  error: boolean;
};

export function HomePendingWork({
  items,
  hasMore,
  error,
}: HomePendingWorkProps) {
  return (
    <section aria-labelledby="home-pending-heading">
      <h2 id="home-pending-heading" className="text-section-title">
        Trabajo pendiente
      </h2>

      {error ? (
        <Alert
          variant="danger"
          className="mt-4"
          role="alert"
          title="No se pudo cargar el trabajo pendiente."
        >
          Intentá de nuevo en unos instantes.
        </Alert>
      ) : null}

      {!error && items.length === 0 ? (
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          No tenés informes pendientes en este momento.
        </p>
      ) : items.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-3">
          {items.map((item) => {
            const updatedAt = formatLongDateEs(item.updatedAt);
            const moduleLabel = getPendingWorkModuleLabel(item.module);
            const context = item.contextLabel
              ? `${moduleLabel} · ${item.contextLabel}`
              : moduleLabel;

            return (
              <li key={item.key}>
                <Card
                  href={item.href}
                  variant="interactive"
                  padding="compact"
                  className={interactiveListCardClassName}
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium text-foreground">
                      {item.clientFirstName} {item.clientLastName}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm leading-snug text-muted">{context}</p>
                      <ReportStatusBadge status={item.status} />
                      {updatedAt ? (
                        <p className="text-sm leading-snug text-muted">
                          {updatedAt}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span className={interactiveListCardActionClassName}>
                    {getPendingWorkActionLabel(item.kind)} →
                  </span>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : null}

      {hasMore ? (
        <p className="mt-4">
          <TextLink href="/clients">Ver todos los consultantes</TextLink>
        </p>
      ) : null}
    </section>
  );
}
