import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientsDirectoryControls } from "@/components/clients/ClientsDirectoryControls";
import { SupabaseSetupNotice } from "@/components/clients/SupabaseSetupNotice";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextLink } from "@/components/ui/TextLink";
import { formatClientCreatedAt } from "@/lib/clients/format";
import {
  buildClientListPath,
  firstSearchParam,
  normalizeClientSearchQuery,
  parseClientListSort,
} from "@/lib/clients/list-query";
import { listClients } from "@/lib/clients/repository";
import {
  interactiveListCardActionClassName,
  interactiveListCardClassName,
} from "@/lib/ui/list-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consultantes",
};

type ClientsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    sort?: string | string[];
  }>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams;
  const query = normalizeClientSearchQuery(firstSearchParam(params.q));
  const sort = parseClientListSort(firstSearchParam(params.sort));
  const result = await listClients({ search: query, sort });

  if (result.status === "unauthorized") {
    redirect("/login");
  }

  const isEmptyBase =
    result.status === "ok" && result.data.length === 0 && query.length === 0;
  const hasNoSearchResults =
    result.status === "ok" && result.data.length === 0 && query.length > 0;
  const showDirectoryControls =
    result.status === "ok" && !isEmptyBase;

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Consultantes"
        description={
          showDirectoryControls ? "Buscá por nombre o apellido." : undefined
        }
        actions={
          result.status !== "not_configured" ? (
            <Button href="/clients/new" className="w-full sm:w-auto">
              Nuevo consultante
            </Button>
          ) : null
        }
      />

      <div className="mt-8">
        {result.status === "not_configured" ? (
          <SupabaseSetupNotice />
        ) : result.status === "error" ? (
          <Alert
            variant="danger"
            role="alert"
            title="No se pudieron cargar los consultantes."
          >
            Revisá la conexión e intentá de nuevo.
          </Alert>
        ) : isEmptyBase ? (
          <EmptyState
            title="Todavía no hay consultantes."
            description="Creá el primer consultante para comenzar a trabajar con su Carta Natal."
            action={
              <Button href="/clients/new" className="w-full sm:w-auto">
                Nuevo consultante
              </Button>
            }
          />
        ) : (
          <>
            <ClientsDirectoryControls query={query} sort={sort} />
            {query ? (
              <p className="mt-6 text-sm text-muted">
                Resultados para “{query}”
              </p>
            ) : null}
            {hasNoSearchResults ? (
              <div className={query ? "mt-4" : "mt-6"}>
                <p className="text-sm leading-relaxed text-muted">
                  No encontramos consultantes que coincidan con tu búsqueda.
                </p>
                <p className="mt-3">
                  <TextLink href={buildClientListPath({ sort })}>
                    Limpiar búsqueda
                  </TextLink>
                </p>
              </div>
            ) : (
              <ul className={query ? "mt-4 flex flex-col gap-3" : "mt-6 flex flex-col gap-3"}>
                {result.data.map((client) => {
                  const updatedAt = formatClientCreatedAt(client.updatedAt);

                  return (
                    <li key={client.id}>
                      <Card
                        href={`/clients/${client.id}`}
                        variant="interactive"
                        padding="compact"
                        className={interactiveListCardClassName}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
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
          </>
        )}
      </div>
    </PageContainer>
  );
}
