import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DeleteClientControl } from "@/components/clients/DeleteClientControl";
import { ClientFichaHub } from "@/components/clients/ClientFichaHub";
import { SupabaseSetupNotice } from "@/components/clients/SupabaseSetupNotice";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { getClientById } from "@/lib/clients/repository";
import {
  formatSolarReturnPeriodYears,
  getLatestSolarReturnSummary,
} from "@/lib/solar-returns";
import { listSolarReturnsByClientId } from "@/lib/solar-returns/repository";
import { listTransitAnalysesByClientId } from "@/lib/transits/repository";

export const dynamic = "force-dynamic";

type ClientPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ClientPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getClientById(id);

  if (result.status !== "ok") {
    return { title: "Consultante" };
  }

  return {
    title: `${result.data.firstName} ${result.data.lastName}`,
  };
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;
  const result = await getClientById(id);

  if (result.status === "unauthorized") {
    redirect("/login");
  }

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "not_configured") {
    return (
      <PageContainer size="wide">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Consultante
        </h1>
        <div className="mt-8">
          <SupabaseSetupNotice />
        </div>
      </PageContainer>
    );
  }

  if (result.status === "error") {
    return (
      <PageContainer size="wide">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Consultante
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

  const client = result.data;
  const [transitsResult, solarReturnsResult] = await Promise.all([
    listTransitAnalysesByClientId(client.id),
    listSolarReturnsByClientId(client.id),
  ]);
  const transits =
    transitsResult.status === "ok" ? transitsResult.data : null;
  const solarReturns =
    solarReturnsResult.status === "ok" ? solarReturnsResult.data : null;
  const latestSolarReturn = solarReturns
    ? getLatestSolarReturnSummary(solarReturns)
    : null;

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <TextLink href="/clients" variant="back">
            ← Volver a consultantes
          </TextLink>
        }
        title={`${client.firstName} ${client.lastName}`}
        description={`${client.age} años`}
        actions={
          <Button
            href={`/clients/${client.id}/edit`}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Editar consultante
          </Button>
        }
      />

      {client.professionalNotes ? (
        <div className="mt-8 max-w-2xl">
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
            Notas de la profesional
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {client.professionalNotes}
          </p>
        </div>
      ) : null}

      <div className="mt-10">
        <ClientFichaHub
          clientId={client.id}
          transitsCount={transits ? transits.length : null}
          solarReturnsCount={solarReturns ? solarReturns.length : null}
          latestSolarReturnPeriodLabel={
            latestSolarReturn
              ? formatSolarReturnPeriodYears(latestSolarReturn)
              : null
          }
        />
      </div>

      <div className="mt-16 border-t border-border pt-8">
        <DeleteClientControl
          clientId={client.id}
          clientName={`${client.firstName} ${client.lastName}`}
        />
      </div>
    </PageContainer>
  );
}
