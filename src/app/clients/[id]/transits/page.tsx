import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransitAnalysisList } from "@/components/transits/TransitAnalysisList";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextLink } from "@/components/ui/TextLink";
import { SupabaseSetupNotice } from "@/components/clients/SupabaseSetupNotice";
import { getClientById } from "@/lib/clients/repository";
import { listTransitAnalysesByClientId } from "@/lib/transits/repository";

export const dynamic = "force-dynamic";

type TransitsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TransitsPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getClientById(id);

  if (result.status !== "ok") {
    return { title: "Tránsitos y Eclipses" };
  }

  return {
    title: `Tránsitos · ${result.data.firstName} ${result.data.lastName}`,
  };
}

export default async function TransitsPage({ params }: TransitsPageProps) {
  const { id } = await params;
  const clientResult = await getClientById(id);

  if (clientResult.status === "unauthorized") {
    redirect("/login");
  }

  if (clientResult.status === "not_found") {
    notFound();
  }

  if (clientResult.status === "not_configured") {
    return (
      <PageContainer size="wide">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Tránsitos y Eclipses
        </h1>
        <div className="mt-8">
          <SupabaseSetupNotice />
        </div>
      </PageContainer>
    );
  }

  if (clientResult.status === "error") {
    return (
      <PageContainer size="wide">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Tránsitos y Eclipses
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No se pudo cargar este consultante."
          actions={
            <Button href="/clients" variant="secondary">
              Volver a consultantes
            </Button>
          }
        >
          Intentá de nuevo en unos instantes.
        </Alert>
      </PageContainer>
    );
  }

  const client = clientResult.data;
  const summariesResult = await listTransitAnalysesByClientId(client.id);

  if (summariesResult.status === "unauthorized") {
    redirect("/login");
  }

  const summaries =
    summariesResult.status === "ok" ? summariesResult.data : null;

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <TextLink href={`/clients/${client.id}`} variant="back">
            ← Volver a la ficha
          </TextLink>
        }
        title="Tránsitos y Eclipses"
        description={`${client.firstName} ${client.lastName}`}
        actions={
          <Button
            href={`/clients/${client.id}/transits/new`}
            className="w-full sm:w-auto"
          >
            Nuevo período de tránsitos
          </Button>
        }
      />

      {summaries === null ? (
        <p className="mt-8 text-sm leading-relaxed text-muted">
          No se pudieron cargar los períodos de tránsitos.
        </p>
      ) : summaries.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Todavía no hay períodos de tránsitos."
            description="Cargá un período para trabajar tránsitos y eclipses de este consultante."
            action={
              <Button
                href={`/clients/${client.id}/transits/new`}
                className="w-full sm:w-auto"
              >
                Nuevo período de tránsitos
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-8">
          <TransitAnalysisList
            clientId={client.id}
            summaries={summaries}
            showDelete
          />
        </div>
      )}
    </PageContainer>
  );
}
