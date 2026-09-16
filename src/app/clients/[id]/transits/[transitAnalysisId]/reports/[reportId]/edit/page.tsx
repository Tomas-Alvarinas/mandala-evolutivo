import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { TransitAnalysisReportEditor } from "@/components/reports/TransitAnalysisReportEditor";
import { TransitAnalysisReportWorkspace } from "@/components/reports/TransitAnalysisReportWorkspace";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import { getTransitAnalysisReportById } from "@/lib/reports/transits/repository";
import { formatIsoDateOnlyEs } from "@/lib/transits";
import { getTransitAnalysisById } from "@/lib/transits/repository";

export const dynamic = "force-dynamic";

type EditTransitAnalysisReportPageProps = {
  params: Promise<{
    id: string;
    transitAnalysisId: string;
    reportId: string;
  }>;
};

export async function generateMetadata({
  params,
}: EditTransitAnalysisReportPageProps): Promise<Metadata> {
  const { id, transitAnalysisId, reportId } = await params;
  const clientResult = await getClientById(id);
  const reportResult = await getTransitAnalysisReportById({
    clientId: id,
    transitAnalysisId,
    reportId,
  });

  if (clientResult.status !== "ok") {
    return { title: "Editar informe" };
  }

  const name = `${clientResult.data.firstName} ${clientResult.data.lastName}`;

  if (reportResult.status !== "ok") {
    return { title: `Editar informe · ${name}` };
  }

  return { title: `Editar informe · ${name}` };
}

export default async function EditTransitAnalysisReportPage({
  params,
}: EditTransitAnalysisReportPageProps) {
  const { id, transitAnalysisId, reportId } = await params;
  const [clientResult, analysisResult, reportResult] = await Promise.all([
    getClientById(id),
    getTransitAnalysisById(transitAnalysisId),
    getTransitAnalysisReportById({
      clientId: id,
      transitAnalysisId,
      reportId,
    }),
  ]);

  if (
    clientResult.status === "unauthorized" ||
    analysisResult.status === "unauthorized" ||
    reportResult.status === "unauthorized"
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
          Editar informe profesional
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

  if (analysisResult.status !== "ok") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Editar informe profesional
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
        />
      </PageContainer>
    );
  }

  const client = clientResult.data;
  const analysis = analysisResult.data;
  const backHref = `/clients/${client.id}/transits/${analysis.id}/reports/${reportId}`;
  const clientName = `${client.firstName} ${client.lastName}`;

  if (reportResult.status === "invalid") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Informe no disponible
        </h1>
        <Alert
          variant="warning"
          className="mt-8"
          role="alert"
          title="Este informe está dañado y no se puede editar."
          actions={
            <Button href={backHref} variant="secondary">
              Volver al informe
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
          Editar informe profesional
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No se pudo cargar este informe."
          actions={
            <Button href={backHref} variant="secondary">
              Volver al informe
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const stored = reportResult.data;

  return (
    <TransitAnalysisReportWorkspace
      clientId={client.id}
      transitAnalysisId={analysis.id}
      reportId={stored.id}
      clientName={clientName}
      generatedAt={stored.generatedAt}
      status={stored.status}
      back={{ href: backHref, label: "← Volver al informe" }}
      description={`Editar informe profesional · ${formatIsoDateOnlyEs(analysis.analysisDate) || analysis.analysisDate}`}
      notice={
        <Alert variant="warning">
          Al guardar, el informe vuelve a Borrador aunque estuviera Revisado o
          Listo para entregar.
        </Alert>
      }
    >
      <TransitAnalysisReportEditor
        clientId={client.id}
        transitAnalysisId={analysis.id}
        reportId={stored.id}
        report={stored.report}
      />
    </TransitAnalysisReportWorkspace>
  );
}
