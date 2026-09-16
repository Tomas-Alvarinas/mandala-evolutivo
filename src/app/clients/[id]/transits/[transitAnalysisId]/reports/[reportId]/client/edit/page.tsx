import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { TransitAnalysisReportWorkspace } from "@/components/reports/TransitAnalysisReportWorkspace";
import { TransitClientReportEditor } from "@/components/reports/TransitClientReportEditor";
import { TransitSourceOutdatedAlert } from "@/components/reports/TransitSourceOutdatedAlert";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import { isTransitClientReportSourceOutdated } from "@/lib/reports";
import { getTransitClientReportByProfessionalReportId } from "@/lib/reports/transits/client-report/repository";
import { getTransitAnalysisReportById } from "@/lib/reports/transits/repository";
import { getTransitAnalysisById } from "@/lib/transits/repository";

export const dynamic = "force-dynamic";

type EditTransitClientReportPageProps = {
  params: Promise<{
    id: string;
    transitAnalysisId: string;
    reportId: string;
  }>;
};

export async function generateMetadata({
  params,
}: EditTransitClientReportPageProps): Promise<Metadata> {
  const { id } = await params;
  const clientResult = await getClientById(id);

  if (clientResult.status !== "ok") {
    return { title: "Editar versión consultante" };
  }

  return {
    title: `Editar versión consultante · ${clientResult.data.firstName} ${clientResult.data.lastName}`,
  };
}

export default async function EditTransitClientReportPage({
  params,
}: EditTransitClientReportPageProps) {
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
    clientReportResult.status === "unauthorized"
  ) {
    redirect("/login");
  }

  if (clientResult.status === "not_found") {
    notFound();
  }

  if (clientResult.status !== "ok") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Editar versión consultante
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
  const viewHref = `/clients/${client.id}/transits/${transitAnalysisId}/reports/${reportId}/client`;
  const professionalHref = `/clients/${client.id}/transits/${transitAnalysisId}/reports/${reportId}`;
  const clientName = `${client.firstName} ${client.lastName}`;

  if (
    analysisResult.status === "ok" &&
    analysisResult.data.clientId !== client.id
  ) {
    notFound();
  }

  if (clientReportResult.status === "not_found") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Versión no encontrada
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

  if (clientReportResult.status !== "ok") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Editar versión consultante
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No se pudo cargar la versión consultante."
          actions={
            <Button href={viewHref} variant="secondary">
              Volver
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
  const professionalReady =
    professionalResult.status === "ok" &&
    professionalResult.data.status === "ready";

  return (
    <TransitAnalysisReportWorkspace
      clientId={client.id}
      transitAnalysisId={transitAnalysisId}
      reportId={reportId}
      clientName={clientName}
      generatedAt=""
      status={null}
      back={{ href: viewHref, label: "← Volver al informe" }}
      description="Editar versión consultante"
      notice={
        sourceOutdated ? (
          <TransitSourceOutdatedAlert professionalReady={professionalReady} />
        ) : null
      }
    >
      <TransitClientReportEditor
        clientId={client.id}
        transitAnalysisId={transitAnalysisId}
        reportId={reportId}
        report={stored.clientReport}
      />
    </TransitAnalysisReportWorkspace>
  );
}
