import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SupabaseSetupNotice } from "@/components/clients/SupabaseSetupNotice";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SolarReturnReportsSection } from "@/components/reports/SolarReturnReportsSection";
import { DeleteSolarReturnControl } from "@/components/solar-returns/DeleteSolarReturnControl";
import { SolarReturnDetails } from "@/components/solar-returns/SolarReturnDetails";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextLink } from "@/components/ui/TextLink";
import { getClientById } from "@/lib/clients/repository";
import { listSolarReturnReports } from "@/lib/reports/solar-returns/repository";
import { formatSolarReturnPeriod } from "@/lib/solar-returns";
import { getSolarReturnById } from "@/lib/solar-returns/repository";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type SolarReturnDetailPageProps = {
  params: Promise<{ id: string; solarReturnId: string }>;
};

export async function generateMetadata({
  params,
}: SolarReturnDetailPageProps): Promise<Metadata> {
  const { solarReturnId } = await params;
  const result = await getSolarReturnById(solarReturnId);

  if (result.status !== "ok") {
    return { title: "Revolución Solar" };
  }

  return {
    title: `Revolución Solar · ${formatSolarReturnPeriod(result.data)}`,
  };
}

export default async function SolarReturnDetailPage({
  params,
}: SolarReturnDetailPageProps) {
  const { id, solarReturnId } = await params;
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

  const solarReturnResult = await getSolarReturnById(solarReturnId);

  if (solarReturnResult.status === "unauthorized") {
    redirect("/login");
  }

  if (
    solarReturnResult.status === "not_found" ||
    (solarReturnResult.status === "ok" &&
      solarReturnResult.data.clientId !== clientResult.data.id)
  ) {
    notFound();
  }

  if (solarReturnResult.status !== "ok") {
    return (
      <PageContainer size="wide">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Revolución Solar
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No se pudo cargar esta Revolución Solar."
          actions={
            <Button
              href={`/clients/${clientResult.data.id}/solar-returns`}
              variant="secondary"
            >
              Volver a Revolución Solar
            </Button>
          }
        >
          Intentá de nuevo en unos instantes.
        </Alert>
      </PageContainer>
    );
  }

  const client = clientResult.data;
  const solarReturn = solarReturnResult.data;
  const historyResult = await listSolarReturnReports({
    clientId: client.id,
    solarReturnId: solarReturn.id,
  });

  if (historyResult.status === "unauthorized") {
    redirect("/login");
  }

  const historySummaries =
    historyResult.status === "ok" ? historyResult.data : null;

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <TextLink href={`/clients/${client.id}/solar-returns`} variant="back">
            ← Volver a Revolución Solar
          </TextLink>
        }
        title={formatSolarReturnPeriod(solarReturn)}
        description={`${client.firstName} ${client.lastName}`}
        actions={
          <Button
            href={`/clients/${client.id}/solar-returns/${solarReturn.id}/edit`}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Editar Revolución Solar
          </Button>
        }
      />

      <Card className="mt-8">
        <SolarReturnDetails solarReturn={solarReturn} />
      </Card>

      <div className="mt-10">
        <SolarReturnReportsSection
          clientId={client.id}
          solarReturnId={solarReturn.id}
          summaries={historySummaries}
          loadError={historyResult.status === "error"}
        />
      </div>

      <div className="mt-16 border-t border-border pt-8">
        <DeleteSolarReturnControl
          clientId={client.id}
          solarReturnId={solarReturn.id}
          periodStart={solarReturn.periodStart}
          periodEnd={solarReturn.periodEnd}
        />
      </div>
    </PageContainer>
  );
}
