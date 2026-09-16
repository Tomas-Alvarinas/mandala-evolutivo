import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { SolarReturnClientReportEditor } from "@/components/reports/SolarReturnClientReportEditor";
import { SolarReturnReportWorkspace } from "@/components/reports/SolarReturnReportWorkspace";
import { SolarReturnSourceOutdatedAlert } from "@/components/reports/SolarReturnSourceOutdatedAlert";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import { isSolarReturnClientReportSourceOutdated } from "@/lib/reports";
import { getSolarReturnClientReportByProfessionalReportId } from "@/lib/reports/solar-returns/client-report/repository";
import { getSolarReturnReportById } from "@/lib/reports/solar-returns/repository";
import { getSolarReturnById } from "@/lib/solar-returns/repository";

export const dynamic = "force-dynamic";

type EditSolarReturnClientReportPageProps = {
  params: Promise<{
    id: string;
    solarReturnId: string;
    reportId: string;
  }>;
};

export async function generateMetadata({
  params,
}: EditSolarReturnClientReportPageProps): Promise<Metadata> {
  const { id } = await params;
  const clientResult = await getClientById(id);

  if (clientResult.status !== "ok") {
    return { title: "Editar versión consultante" };
  }

  return {
    title: `Editar versión consultante · ${clientResult.data.firstName} ${clientResult.data.lastName}`,
  };
}

export default async function EditSolarReturnClientReportPage({
  params,
}: EditSolarReturnClientReportPageProps) {
  const { id, solarReturnId, reportId } = await params;
  const [clientResult, solarReturnResult, professionalResult, clientReportResult] =
    await Promise.all([
      getClientById(id),
      getSolarReturnById(solarReturnId),
      getSolarReturnReportById({
        clientId: id,
        solarReturnId,
        reportId,
      }),
      getSolarReturnClientReportByProfessionalReportId({
        clientId: id,
        solarReturnId,
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
  const viewHref = `/clients/${client.id}/solar-returns/${solarReturnId}/reports/${reportId}/client`;
  const professionalHref = `/clients/${client.id}/solar-returns/${solarReturnId}/reports/${reportId}`;
  const clientName = `${client.firstName} ${client.lastName}`;

  if (
    solarReturnResult.status === "ok" &&
    solarReturnResult.data.clientId !== client.id
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
    isSolarReturnClientReportSourceOutdated(
      stored.sourceReport,
      professionalResult.data.report,
    );
  const professionalReady =
    professionalResult.status === "ok" &&
    professionalResult.data.status === "ready";

  return (
    <SolarReturnReportWorkspace
      clientId={client.id}
      solarReturnId={solarReturnId}
      reportId={reportId}
      clientName={clientName}
      generatedAt=""
      status={null}
      back={{ href: viewHref, label: "← Volver al informe" }}
      description="Editar versión consultante"
      notice={
        sourceOutdated ? (
          <SolarReturnSourceOutdatedAlert professionalReady={professionalReady} />
        ) : null
      }
    >
      <SolarReturnClientReportEditor
        clientId={client.id}
        solarReturnId={solarReturnId}
        reportId={reportId}
        report={stored.clientReport}
      />
    </SolarReturnReportWorkspace>
  );
}
