import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransitAnalysisForm } from "@/components/transits/TransitAnalysisForm";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { SupabaseSetupNotice } from "@/components/clients/SupabaseSetupNotice";
import { getClientById } from "@/lib/clients/repository";
import {
  EXISTING_TRANSIT_REPORTS_EDIT_NOTICE_BODY,
  EXISTING_TRANSIT_REPORTS_EDIT_NOTICE_TITLE,
  shouldShowExistingTransitReportsEditNotice,
} from "@/lib/reports";
import { countTransitAnalysisReports } from "@/lib/reports/transits/repository";
import {
  formatIsoDateOnlyEs,
  transitAnalysisToDraft,
} from "@/lib/transits";
import { getTransitAnalysisById } from "@/lib/transits/repository";

export const dynamic = "force-dynamic";

type EditTransitPageProps = {
  params: Promise<{ id: string; transitAnalysisId: string }>;
};

export async function generateMetadata({
  params,
}: EditTransitPageProps): Promise<Metadata> {
  const { transitAnalysisId } = await params;
  const result = await getTransitAnalysisById(transitAnalysisId);

  if (result.status !== "ok") {
    return { title: "Editar período de tránsitos" };
  }

  return {
    title: `Editar tránsitos · ${formatIsoDateOnlyEs(result.data.analysisDate) || result.data.analysisDate}`,
  };
}

export default async function EditTransitPage({
  params,
}: EditTransitPageProps) {
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
          Editar período de tránsitos
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
          Editar período de tránsitos
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
          Editar período de tránsitos
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
  const reportsCountResult = await countTransitAnalysisReports({
    clientId: client.id,
    transitAnalysisId: analysis.id,
  });

  if (reportsCountResult.status === "unauthorized") {
    redirect("/login");
  }

  const reportCount =
    reportsCountResult.status === "ok" ? reportsCountResult.data : 0;
  const showExistingReportsNotice =
    shouldShowExistingTransitReportsEditNotice(reportCount);

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <TextLink
            href={`/clients/${client.id}/transits/${analysis.id}`}
            variant="back"
          >
            ← Volver al análisis
          </TextLink>
        }
        title="Editar período de tránsitos"
        description={`${client.firstName} ${client.lastName} · ${formatIsoDateOnlyEs(analysis.analysisDate) || analysis.analysisDate}`}
      />
      {showExistingReportsNotice ? (
        <Alert
          variant="warning"
          className="mt-8"
          role="status"
          title={EXISTING_TRANSIT_REPORTS_EDIT_NOTICE_TITLE}
        >
          {EXISTING_TRANSIT_REPORTS_EDIT_NOTICE_BODY}
        </Alert>
      ) : null}
      <div className={showExistingReportsNotice ? "mt-6" : "mt-8"}>
        <TransitAnalysisForm
          clientId={client.id}
          analysisId={analysis.id}
          initialDraft={transitAnalysisToDraft(analysis)}
          cancelHref={`/clients/${client.id}/transits/${analysis.id}`}
        />
      </div>
    </PageContainer>
  );
}
