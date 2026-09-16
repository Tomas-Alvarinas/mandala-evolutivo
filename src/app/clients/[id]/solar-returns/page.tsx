import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SolarReturnList } from "@/components/solar-returns/SolarReturnList";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextLink } from "@/components/ui/TextLink";
import { SupabaseSetupNotice } from "@/components/clients/SupabaseSetupNotice";
import { getClientById } from "@/lib/clients/repository";
import { listSolarReturnsByClientId } from "@/lib/solar-returns/repository";

export const dynamic = "force-dynamic";

type SolarReturnsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: SolarReturnsPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getClientById(id);

  if (result.status !== "ok") {
    return { title: "Revolución Solar" };
  }

  return {
    title: `Revolución Solar · ${result.data.firstName} ${result.data.lastName}`,
  };
}

export default async function SolarReturnsPage({ params }: SolarReturnsPageProps) {
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
          Revolución Solar
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
          Revolución Solar
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
  const summariesResult = await listSolarReturnsByClientId(client.id);

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
        title="Revolución Solar"
        description={`${client.firstName} ${client.lastName}`}
        actions={
          <Button
            href={`/clients/${client.id}/solar-returns/new`}
            className="w-full sm:w-auto"
          >
            Nueva Revolución Solar
          </Button>
        }
      />

      {summaries === null ? (
        <p className="mt-8 text-sm leading-relaxed text-muted">
          No se pudieron cargar las revoluciones solares.
        </p>
      ) : summaries.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Todavía no hay revoluciones solares cargadas."
            description="Cargá una Revolución Solar para comenzar a trabajar este período."
            action={
              <Button
                href={`/clients/${client.id}/solar-returns/new`}
                className="w-full sm:w-auto"
              >
                Nueva Revolución Solar
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-8">
          <SolarReturnList
            clientId={client.id}
            summaries={summaries}
            showDelete
          />
        </div>
      )}
    </PageContainer>
  );
}
