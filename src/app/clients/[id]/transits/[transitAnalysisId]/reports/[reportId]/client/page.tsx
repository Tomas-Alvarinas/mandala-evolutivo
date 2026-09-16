import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { TransitAnalysisReportWorkspace } from "@/components/reports/TransitAnalysisReportWorkspace";
import { TransitClientReportActions } from "@/components/reports/TransitClientReportActions";
import { TransitClientReportView } from "@/components/reports/TransitClientReportView";
import { TransitSourceOutdatedAlert } from "@/components/reports/TransitSourceOutdatedAlert";
import { RefreshTransitClientReportFromProfessionalControl } from "@/components/reports/RefreshTransitClientReportFromProfessionalControl";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import {
  canExecuteRefreshTransitClientReportFromProfessional,
  isTransitClientReportSourceOutdated,
} from "@/lib/reports";
import { getTransitClientReportByProfessionalReportId } from "@/lib/reports/transits/client-report/repository";
import { getTransitAnalysisReportById } from "@/lib/reports/transits/repository";
import { formatIsoDateOnlyEs } from "@/lib/transits";
import { getTransitAnalysisById } from "@/lib/transits/repository";

export const dynamic = "force-dynamic";

type TransitClientReportPageProps = {
  params: Promise<{
    id: string;
    transitAnalysisId: string;
    reportId: string;
  }>;
};

export async function generateMetadata({
  params,
}: TransitClientReportPageProps): Promise<Metadata> {
  const { id } = await params;
  const clientResult = await getClientById(id);

  if (clientResult.status !== "ok") {
    return { title: "Versión consultante" };
  }

  return {
    title: `Versión consultante · ${clientResult.data.firstName} ${clientResult.data.lastName}`,
  };
}

export default async function TransitClientReportPage({
  params,
}: TransitClientReportPageProps) {
  const { id, transitAnalysisId, reportId } = await params;
  const [clientResult, analysisResult, professionalResult, clientReportResult] =
    await Promise.all([
      getClientById(id),
      getTransitAnalysisById(transitAnalysisId),
      getTransitAnalysisReportById({
        clientId: id,
        transitAnalysisId,
        reportId,
      }),
      getTransitClientReportByProfessionalReportId({
        clientId: id,
        transitAnalysisId,
        professionalReportId: reportId,
      }),
    ]);

  if (
    clientResult.status === "unauthorized" ||
    analysisResult.status === "unauthorized" ||
    professionalResult.status === "unauthorized" ||
    clientReportResult.status === "unauthorized"
  ) {
    redirect("/login");
  }

  if (
    clientResult.status === "not_found" ||
    analysisResult.status === "not_found"
  ) {
    notFound();
  }

  if (
    analysisResult.status === "ok" &&
    clientResult.status === "ok" &&
    analysisResult.data.clientId !== clientResult.data.id
  ) {
    notFound();
  }

  if (clientResult.status !== "ok") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Versión consultante
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
        />
      </PageContainer>
    );
  }

  const client = clientResult.data;
  const analysisHref = `/clients/${client.id}/transits/${transitAnalysisId}`;
  const professionalHref = `${analysisHref}/reports/${reportId}`;
  const clientName = `${client.firstName} ${client.lastName}`;
  const analysisDate =
    analysisResult.status === "ok"
      ? formatIsoDateOnlyEs(analysisResult.data.analysisDate) ||
        analysisResult.data.analysisDate
      : "";

  if (clientReportResult.status === "not_found") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Versión consultante
        </h1>
        <Alert
          variant="info"
          className="mt-8"
          title="Todavía no hay una versión consultante de este informe."
          actions={
            <Button href={professionalHref} variant="secondary">
              Ir al informe profesional
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (clientReportResult.status === "invalid") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Versión no disponible
        </h1>
        <Alert
          variant="warning"
          className="mt-8"
          role="alert"
          title="Esta versión consultante está dañada y no se puede mostrar."
          actions={
            <Button href={analysisHref} variant="secondary">
              Volver al análisis
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (clientReportResult.status !== "ok") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Versión consultante
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No se pudo cargar la versión consultante."
          actions={
            <Button href={analysisHref} variant="secondary">
              Volver al análisis
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const stored = clientReportResult.data;
  const sourceOutdated =
    professionalResult.status === "ok" &&
    isTransitClientReportSourceOutdated(
      stored.sourceReport,
      professionalResult.data.report,
    );
  const canRefresh =
    professionalResult.status === "ok" &&
    canExecuteRefreshTransitClientReportFromProfessional({
      sourceOutdated,
      professionalStatus: professionalResult.data.status,
    });

  return (
    <TransitAnalysisReportWorkspace
      clientId={client.id}
      transitAnalysisId={transitAnalysisId}
      reportId={reportId}
      clientName={clientName}
      generatedAt=""
      status={null}
      current="client"
      hasClientReport
      back={{ href: analysisHref, label: "← Volver al análisis" }}
      description={
        analysisDate
          ? `Versión consultante · ${analysisDate}`
          : "Versión consultante"
      }
      actions={
        <TransitClientReportActions
          clientId={client.id}
          transitAnalysisId={transitAnalysisId}
          reportId={reportId}
        />
      }
      notice={
        sourceOutdated ? (
          <TransitSourceOutdatedAlert professionalReady={canRefresh}>
            {canRefresh ? (
              <RefreshTransitClientReportFromProfessionalControl
                clientId={client.id}
                transitAnalysisId={transitAnalysisId}
                professionalReportId={reportId}
              />
            ) : null}
          </TransitSourceOutdatedAlert>
        ) : null
      }
    >
      <TransitClientReportView report={stored.clientReport} />
    </TransitAnalysisReportWorkspace>
  );
}
