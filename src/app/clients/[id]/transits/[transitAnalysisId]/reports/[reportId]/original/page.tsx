import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { TransitAnalysisReportView } from "@/components/reports/TransitAnalysisReportView";
import { TransitAnalysisReportWorkspace } from "@/components/reports/TransitAnalysisReportWorkspace";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import { hasTransitClientReport } from "@/lib/reports/transits/client-report/repository";
import { getTransitAnalysisReportById } from "@/lib/reports/transits/repository";
import { getTransitAnalysisById } from "@/lib/transits/repository";
import { formatIsoDateOnlyEs } from "@/lib/transits";
import {
  ORIGINAL_VERSION_NOTICE_BODY,
  ORIGINAL_VERSION_NOTICE_TITLE,
  ORIGINAL_VERSION_TAB_LABEL,
} from "@/lib/reports";

export const dynamic = "force-dynamic";

type OriginalTransitAnalysisReportPageProps = {
  params: Promise<{
    id: string;
    transitAnalysisId: string;
    reportId: string;
  }>;
};

export async function generateMetadata({
  params,
}: OriginalTransitAnalysisReportPageProps): Promise<Metadata> {
  const { id } = await params;
  const clientResult = await getClientById(id);

  if (clientResult.status !== "ok") {
    return { title: ORIGINAL_VERSION_TAB_LABEL };
  }

  return {
    title: `${ORIGINAL_VERSION_TAB_LABEL} · ${clientResult.data.firstName} ${clientResult.data.lastName}`,
  };
}

export default async function OriginalTransitAnalysisReportPage({
  params,
}: OriginalTransitAnalysisReportPageProps) {
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
      hasTransitClientReport({
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

  if (clientResult.status !== "ok" || analysisResult.status !== "ok") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          {ORIGINAL_VERSION_TAB_LABEL}
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No se pudo cargar esta versión."
          actions={
            <Button href="/clients" variant="secondary">
              Volver a consultantes
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
          {ORIGINAL_VERSION_TAB_LABEL}
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No se pudo cargar esta versión."
          actions={
            <Button
              href={`/clients/${clientResult.data.id}/transits/${analysisResult.data.id}`}
              variant="secondary"
            >
              Volver al análisis
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const client = clientResult.data;
  const analysis = analysisResult.data;
  const stored = reportResult.data;
  const clientName = `${client.firstName} ${client.lastName}`;

  return (
    <TransitAnalysisReportWorkspace
      clientId={client.id}
      transitAnalysisId={analysis.id}
      reportId={stored.id}
      clientName={clientName}
      generatedAt={stored.generatedAt}
      status={stored.status}
      current="original"
      hasClientReport={
        clientReportResult.status === "ok" && clientReportResult.data
      }
      back={{
        href: `/clients/${client.id}/transits/${analysis.id}`,
        label: "← Volver al análisis",
      }}
      description={
        formatIsoDateOnlyEs(analysis.analysisDate) || analysis.analysisDate
      }
      notice={
        <Alert variant="info" title={ORIGINAL_VERSION_NOTICE_TITLE}>
          {ORIGINAL_VERSION_NOTICE_BODY}
        </Alert>
      }
    >
      <TransitAnalysisReportView
        variant="original"
        report={stored.generatedReport}
      />
    </TransitAnalysisReportWorkspace>
  );
}
