import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { TextLink } from "@/components/ui/TextLink";
import type { RecentClientSummary } from "@/lib/clients/repository";
import { formatLongDateEs } from "@/lib/dates";
import {
  interactiveListCardActionClassName,
  interactiveListCardClassName,
} from "@/lib/ui/list-card";

type HomeRecentClientsProps = {
  clients: RecentClientSummary[];
  hasMore: boolean;
  error: boolean;
};

export function HomeRecentClients({
  clients,
  hasMore,
  error,
}: HomeRecentClientsProps) {
  return (
    <section aria-labelledby="home-recent-heading">
      <h2 id="home-recent-heading" className="text-section-title">
        Consultantes recientes
      </h2>

      {error ? (
        <Alert
          variant="danger"
          className="mt-4"
          role="alert"
          title="No se pudieron cargar los consultantes recientes."
        >
          Intentá de nuevo en unos instantes.
        </Alert>
      ) : clients.length === 0 ? (
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          Todavía no hay consultantes recientes.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {clients.map((client) => {
            const updatedAt = formatLongDateEs(client.updatedAt);

            return (
              <li key={client.id}>
                <Card
                  href={`/clients/${client.id}`}
                  variant="interactive"
                  padding="compact"
                  className={interactiveListCardClassName}
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium text-foreground">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-muted">
                      {client.age} años
                      {updatedAt ? ` · ${updatedAt}` : ""}
                    </p>
                  </div>
                  <span className={interactiveListCardActionClassName}>
                    Ver ficha →
                  </span>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore ? (
        <p className="mt-4">
          <TextLink href="/clients">Ver todos los consultantes</TextLink>
        </p>
      ) : null}
    </section>
  );
}
