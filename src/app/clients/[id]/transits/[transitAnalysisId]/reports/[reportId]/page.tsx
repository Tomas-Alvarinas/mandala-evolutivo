import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { TransitAnalysisReportStatusSelect } from "@/components/reports/TransitAnalysisReportStatusSelect";
import { TransitAnalysisReportView } from "@/components/reports/TransitAnalysisReportView";
import { TransitAnalysisReportWorkspace } from "@/components/reports/TransitAnalysisReportWorkspace";
import { TransitProfessionalReportActions } from "@/components/reports/TransitProfessionalReportActions";
import { TransitSourceOutdatedAlert } from "@/components/reports/TransitSourceOutdatedAlert";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import { formatLongDateEs } from "@/lib/dates";
import {
  GO_TO_CLIENT_VERSION_LABEL,
  getTransitProfessionalReportNextStep,
  isTransitClientReportSourceOutdated,
} from "@/lib/reports";
import { getTransitClientReportByProfessionalReportId } from "@/lib/reports/transits/client-report/repository";
import { getTransitAnalysisReportById } from "@/lib/reports/transits/repository";
import { formatIsoDateOnlyEs } from "@/lib/transits";
import { getTransitAnalysisById } from "@/lib/transits/repository";

export const dynamic = "force-dynamic";

type TransitAnalysisReportPageProps = {
  params: Promise<{
    id: string;
    transitAnalysisId: string;
    reportId: string;
  }>;
};

export async function generateMetadata({
  params,
}: TransitAnalysisReportPageProps): Promise<Metadata> {
  const { id, transitAnalysisId, reportId } = await params;
  const [clientResult, reportResult] = await Promise.all([
    getClientById(id),
    getTransitAnalysisReportById({
      clientId: id,
      transitAnalysisId,
      reportId,
    }),
  ]);

  if (clientResult.status !== "ok") {
    return { title: "Análisis de tránsitos" };
  }

  const name = `${clientResult.data.firstName} ${clientResult.data.lastName}`;

  if (reportResult.status !== "ok") {
    return { title: `Tránsitos · ${name}` };
  }

  const generatedAt =
    formatLongDateEs(reportResult.data.generatedAt) ||
    reportResult.data.generatedAt;

  return { title: `Tránsitos · ${generatedAt}` };
}

export default async function TransitAnalysisReportPage({
  params,
}: TransitAnalysisReportPageProps) {
  const { id, transitAnalysisId, reportId } = await params;
  const [clientResult, analysisResult, reportResult, clientReportResult] =
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
    reportResult.status === "unauthorized" ||
    clientReportResult.status === "unauthorized"
  ) {
    redirect("/login");
  }

  if (
    clientResult.status === "not_found" ||
    analysisResult.status === "not_found" ||
    reportResult.status === "not_found"
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

  if (analysisResult.status !== "ok") {
    return (
      <PageContainer>
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
  const backHref = `/clients/${client.id}/transits/${analysis.id}`;
  const clientName = `${client.firstName} ${client.lastName}`;

  if (reportResult.status === "invalid") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Informe no disponible
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="Este informe está dañado y no se puede mostrar."
          actions={
            <Button href={backHref} variant="secondary">
              Volver al análisis
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (reportResult.status !== "ok") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Análisis de tránsitos
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No se pudo cargar este informe."
          actions={
            <Button href={backHref} variant="secondary">
              Volver al análisis
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const stored = reportResult.data;
  const hasClientReport = clientReportResult.status === "ok";
  const sourceOutdated =
    hasClientReport &&
    isTransitClientReportSourceOutdated(
      clientReportResult.data.sourceReport,
      stored.report,
    );

  return (
    <TransitAnalysisReportWorkspace
      clientId={client.id}
      transitAnalysisId={analysis.id}
      reportId={stored.id}
      clientName={clientName}
      generatedAt={stored.generatedAt}
      status={stored.status}
      current="professional"
      hasClientReport={hasClientReport}
      back={{ href: backHref, label: "← Volver al análisis" }}
      description={
        formatIsoDateOnlyEs(analysis.analysisDate) || analysis.analysisDate
      }
      workflow={
        <TransitAnalysisReportStatusSelect
          clientId={client.id}
          transitAnalysisId={analysis.id}
          reportId={stored.id}
          status={stored.status}
        />
      }
      actions={
        <TransitProfessionalReportActions
          clientId={client.id}
          transitAnalysisId={analysis.id}
          reportId={stored.id}
          status={stored.status}
          hasClientReport={hasClientReport}
        />
      }
      hint={getTransitProfessionalReportNextStep({
        status: stored.status,
        hasClientReport,
      })}
      notice={
        sourceOutdated ? (
          <TransitSourceOutdatedAlert>
            <Button
              href={`/clients/${client.id}/transits/${analysis.id}/reports/${stored.id}/client`}
              variant="secondary"
            >
              {GO_TO_CLIENT_VERSION_LABEL}
            </Button>
          </TransitSourceOutdatedAlert>
        ) : null
      }
    >
      <TransitAnalysisReportView report={stored.report} />
    </TransitAnalysisReportWorkspace>
  );
}
