import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SupabaseSetupNotice } from "@/components/clients/SupabaseSetupNotice";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { NatalChartDetails } from "@/components/natal-chart/NatalChartDetails";
import { NatalChartReportsSection } from "@/components/reports/NatalChartReportsSection";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextLink } from "@/components/ui/TextLink";
import { getClientById } from "@/lib/clients/repository";
import {
  getLatestNatalChartReport,
  getNatalChartReports,
} from "@/lib/reports/natal-chart/repository";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type NatalChartPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: NatalChartPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getClientById(id);

  if (result.status !== "ok") {
    return { title: "Carta Natal" };
  }

  return {
    title: `Carta Natal · ${result.data.firstName} ${result.data.lastName}`,
  };
}

export default async function NatalChartPage({ params }: NatalChartPageProps) {
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
          Carta Natal
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
          Carta Natal
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
  const [summariesResult, latestResult] = await Promise.all([
    getNatalChartReports(client.id),
    getLatestNatalChartReport(client.id),
  ]);
  const natalSummaries =
    summariesResult.status === "ok" ? summariesResult.data : null;
  const latestReport = latestResult.status === "ok" ? latestResult.data : null;

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <TextLink href={`/clients/${client.id}`} variant="back">
            ← Volver a la ficha
          </TextLink>
        }
        title="Carta Natal"
        description={`${client.firstName} ${client.lastName}`}
        actions={
          <Button
            href={`/clients/${client.id}/edit`}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Editar Carta Natal
          </Button>
        }
      />

      <Card className="mt-8">
        <NatalChartDetails chart={client.natalChart} showTitle={false} />
      </Card>

      <div className="mt-10">
        <NatalChartReportsSection
          clientId={client.id}
          latest={latestReport}
          latestInvalid={latestResult.status === "invalid"}
          latestError={
            latestResult.status === "error" ||
            latestResult.status === "not_configured" ||
            latestResult.status === "not_found"
          }
          summaries={natalSummaries}
        />
      </div>
    </PageContainer>
  );
}
