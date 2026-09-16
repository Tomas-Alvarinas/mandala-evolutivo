import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SupabaseSetupNotice } from "@/components/clients/SupabaseSetupNotice";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransitAnalysisReportsSection } from "@/components/reports/TransitAnalysisReportsSection";
import { DeleteTransitAnalysisControl } from "@/components/transits/DeleteTransitAnalysisControl";
import { TransitAnalysisDetails } from "@/components/transits/TransitAnalysisDetails";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextLink } from "@/components/ui/TextLink";
import { getClientById } from "@/lib/clients/repository";
import { formatIsoDateOnlyEs } from "@/lib/transits";
import { getTransitAnalysisById } from "@/lib/transits/repository";
import { listTransitAnalysisReports } from "@/lib/reports/transits/repository";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type TransitDetailPageProps = {
  params: Promise<{ id: string; transitAnalysisId: string }>;
};

export async function generateMetadata({
  params,
}: TransitDetailPageProps): Promise<Metadata> {
  const { transitAnalysisId } = await params;
  const result = await getTransitAnalysisById(transitAnalysisId);

  if (result.status !== "ok") {
    return { title: "Análisis de tránsitos" };
  }

  return {
    title: `Tránsitos · ${formatIsoDateOnlyEs(result.data.analysisDate) || result.data.analysisDate}`,
  };
}

export default async function TransitDetailPage({
  params,
}: TransitDetailPageProps) {
  const { id, transitAnalysisId } = await params;
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
          Análisis de tránsitos
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
          Análisis de tránsitos
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

  const analysisResult = await getTransitAnalysisById(transitAnalysisId);

  if (analysisResult.status === "unauthorized") {
    redirect("/login");
  }

  if (
    analysisResult.status === "not_found" ||
    (analysisResult.status === "ok" &&
      analysisResult.data.clientId !== clientResult.data.id)
  ) {
    notFound();
  }

  if (analysisResult.status !== "ok") {
    return (
      <PageContainer size="wide">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Análisis de tránsitos
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No se pudo cargar este análisis."
          actions={
            <Button
              href={`/clients/${clientResult.data.id}/transits`}
              variant="secondary"
            >
              Volver a Tránsitos y Eclipses
            </Button>
          }
        >
          Intentá de nuevo en unos instantes.
        </Alert>
      </PageContainer>
    );
  }

  const client = clientResult.data;
  const analysis = analysisResult.data;
  const dateLabel =
    formatIsoDateOnlyEs(analysis.analysisDate) || analysis.analysisDate;
  const historyResult = await listTransitAnalysisReports({
    clientId: client.id,
    transitAnalysisId: analysis.id,
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
          <TextLink href={`/clients/${client.id}/transits`} variant="back">
            ← Volver a Tránsitos y Eclipses
          </TextLink>
        }
        title={dateLabel}
        description={`${client.firstName} ${client.lastName}`}
        actions={
          <Button
            href={`/clients/${client.id}/transits/${analysis.id}/edit`}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Editar análisis
          </Button>
        }
      />

      <Card className="mt-8">
        <TransitAnalysisDetails analysis={analysis} />
      </Card>

      <div className="mt-10">
        <TransitAnalysisReportsSection
          clientId={client.id}
          transitAnalysisId={analysis.id}
          summaries={historySummaries}
          loadError={historyResult.status === "error"}
        />
      </div>

      <div className="mt-16 border-t border-border pt-8">
        <DeleteTransitAnalysisControl
          clientId={client.id}
          analysisId={analysis.id}
          analysisDate={analysis.analysisDate}
        />
      </div>
    </PageContainer>
  );
}
