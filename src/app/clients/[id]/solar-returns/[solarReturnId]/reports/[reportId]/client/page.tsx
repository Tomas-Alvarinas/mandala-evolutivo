import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { RefreshSolarReturnClientReportFromProfessionalControl } from "@/components/reports/RefreshSolarReturnClientReportFromProfessionalControl";
import { SolarReturnClientReportActions } from "@/components/reports/SolarReturnClientReportActions";
import { SolarReturnClientReportView } from "@/components/reports/SolarReturnClientReportView";
import { SolarReturnReportWorkspace } from "@/components/reports/SolarReturnReportWorkspace";
import { SolarReturnSourceOutdatedAlert } from "@/components/reports/SolarReturnSourceOutdatedAlert";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import {
  canExecuteRefreshSolarReturnClientReportFromProfessional,
  isSolarReturnClientReportSourceOutdated,
} from "@/lib/reports";
import { getSolarReturnClientReportByProfessionalReportId } from "@/lib/reports/solar-returns/client-report/repository";
import { getSolarReturnReportById } from "@/lib/reports/solar-returns/repository";
import { formatSolarReturnPeriod } from "@/lib/solar-returns";
import { getSolarReturnById } from "@/lib/solar-returns/repository";

export const dynamic = "force-dynamic";

type SolarReturnClientReportPageProps = {
  params: Promise<{
    id: string;
    solarReturnId: string;
    reportId: string;
  }>;
};

export async function generateMetadata({
  params,
}: SolarReturnClientReportPageProps): Promise<Metadata> {
  const { id } = await params;
  const clientResult = await getClientById(id);

  if (clientResult.status !== "ok") {
    return { title: "Versión consultante" };
  }

  return {
    title: `Versión consultante · ${clientResult.data.firstName} ${clientResult.data.lastName}`,
  };
}

export default async function SolarReturnClientReportPage({
  params,
}: SolarReturnClientReportPageProps) {
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
    solarReturnResult.status === "unauthorized" ||
    professionalResult.status === "unauthorized" ||
    clientReportResult.status === "unauthorized"
  ) {
    redirect("/login");
  }

  if (
    clientResult.status === "not_found" ||
    solarReturnResult.status === "not_found"
  ) {
    notFound();
  }

  if (
    solarReturnResult.status === "ok" &&
    clientResult.status === "ok" &&
    solarReturnResult.data.clientId !== clientResult.data.id
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
  const solarReturnHref = `/clients/${client.id}/solar-returns/${solarReturnId}`;
  const professionalHref = `${solarReturnHref}/reports/${reportId}`;
  const clientName = `${client.firstName} ${client.lastName}`;
  const period =
    solarReturnResult.status === "ok"
      ? formatSolarReturnPeriod(solarReturnResult.data)
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
            <Button href={solarReturnHref} variant="secondary">
              Volver a Revolución Solar
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
            <Button href={solarReturnHref} variant="secondary">
              Volver a Revolución Solar
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
  const canRefresh =
    professionalResult.status === "ok" &&
    canExecuteRefreshSolarReturnClientReportFromProfessional({
      sourceOutdated,
      professionalStatus: professionalResult.data.status,
    });

  return (
    <SolarReturnReportWorkspace
      clientId={client.id}
      solarReturnId={solarReturnId}
      reportId={reportId}
      clientName={clientName}
      generatedAt=""
      status={null}
      current="client"
      hasClientReport
      back={{ href: solarReturnHref, label: "← Volver a Revolución Solar" }}
      description={
        period ? `Versión consultante · ${period}` : "Versión consultante"
      }
      actions={
        <SolarReturnClientReportActions
          clientId={client.id}
          solarReturnId={solarReturnId}
          reportId={reportId}
        />
      }
      notice={
        sourceOutdated ? (
          <SolarReturnSourceOutdatedAlert professionalReady={canRefresh}>
            {canRefresh ? (
              <RefreshSolarReturnClientReportFromProfessionalControl
                clientId={client.id}
                solarReturnId={solarReturnId}
                professionalReportId={reportId}
              />
            ) : null}
          </SolarReturnSourceOutdatedAlert>
        ) : null
      }
    >
      <SolarReturnClientReportView report={stored.clientReport} />
    </SolarReturnReportWorkspace>
  );
}
