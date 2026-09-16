import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { SolarReturnProfessionalReportActions } from "@/components/reports/SolarReturnProfessionalReportActions";
import { SolarReturnReportStatusSelect } from "@/components/reports/SolarReturnReportStatusSelect";
import { SolarReturnReportView } from "@/components/reports/SolarReturnReportView";
import { SolarReturnReportWorkspace } from "@/components/reports/SolarReturnReportWorkspace";
import { SolarReturnSourceOutdatedAlert } from "@/components/reports/SolarReturnSourceOutdatedAlert";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import { formatLongDateEs } from "@/lib/dates";
import {
  GO_TO_CLIENT_VERSION_LABEL,
  getSolarReturnProfessionalReportNextStep,
  isSolarReturnClientReportSourceOutdated,
} from "@/lib/reports";
import { getSolarReturnClientReportByProfessionalReportId } from "@/lib/reports/solar-returns/client-report/repository";
import { getSolarReturnReportById } from "@/lib/reports/solar-returns/repository";
import { formatSolarReturnPeriod } from "@/lib/solar-returns";
import { getSolarReturnById } from "@/lib/solar-returns/repository";

export const dynamic = "force-dynamic";

type SolarReturnReportPageProps = {
  params: Promise<{
    id: string;
    solarReturnId: string;
    reportId: string;
  }>;
};

export async function generateMetadata({
  params,
}: SolarReturnReportPageProps): Promise<Metadata> {
  const { id, solarReturnId, reportId } = await params;
  const [clientResult, reportResult] = await Promise.all([
    getClientById(id),
    getSolarReturnReportById({
      clientId: id,
      solarReturnId,
      reportId,
    }),
  ]);

  if (clientResult.status !== "ok") {
    return { title: "Revolución Solar" };
  }

  const name = `${clientResult.data.firstName} ${clientResult.data.lastName}`;

  if (reportResult.status !== "ok") {
    return { title: `Revolución Solar · ${name}` };
  }

  const generatedAt =
    formatLongDateEs(reportResult.data.generatedAt) ||
    reportResult.data.generatedAt;

  return { title: `Revolución Solar · ${generatedAt}` };
}

export default async function SolarReturnReportPage({
  params,
}: SolarReturnReportPageProps) {
  const { id, solarReturnId, reportId } = await params;
  const [clientResult, solarReturnResult, reportResult, clientReportResult] =
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
    reportResult.status === "unauthorized" ||
    clientReportResult.status === "unauthorized"
  ) {
    redirect("/login");
  }

  if (
    clientResult.status === "not_found" ||
    solarReturnResult.status === "not_found" ||
    reportResult.status === "not_found"
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
          Revolución Solar
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

  if (solarReturnResult.status !== "ok") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Revolución Solar
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No se pudo cargar esta Revolución Solar."
          actions={
            <Button
              href={`/clients/${clientResult.data.id}/solar-returns`}
              variant="secondary"
            >
              Volver a Revolución Solar
            </Button>
          }
        >
          Intentá de nuevo en unos instantes.
        </Alert>
      </PageContainer>
    );
  }

  const client = clientResult.data;
  const solarReturn = solarReturnResult.data;
  const backHref = `/clients/${client.id}/solar-returns/${solarReturn.id}`;
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
              Volver a Revolución Solar
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
          Revolución Solar
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No se pudo cargar este informe."
          actions={
            <Button href={backHref} variant="secondary">
              Volver a Revolución Solar
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const stored = reportResult.data;
  const hasClientReport = clientReportResult.status === "ok";
  const sourceOutdated =
    clientReportResult.status === "ok" &&
    isSolarReturnClientReportSourceOutdated(
      clientReportResult.data.sourceReport,
      stored.report,
    );

  return (
    <SolarReturnReportWorkspace
      clientId={client.id}
      solarReturnId={solarReturn.id}
      reportId={stored.id}
      clientName={clientName}
      generatedAt={stored.generatedAt}
      status={stored.status}
      current="professional"
      hasClientReport={hasClientReport}
      back={{ href: backHref, label: "← Volver a Revolución Solar" }}
      description={formatSolarReturnPeriod(solarReturn)}
      workflow={
        <SolarReturnReportStatusSelect
          clientId={client.id}
          solarReturnId={solarReturn.id}
          reportId={stored.id}
          status={stored.status}
        />
      }
      actions={
        <SolarReturnProfessionalReportActions
          clientId={client.id}
          solarReturnId={solarReturn.id}
          reportId={stored.id}
          status={stored.status}
          hasClientReport={hasClientReport}
        />
      }
      hint={getSolarReturnProfessionalReportNextStep({
        status: stored.status,
        hasClientReport,
      })}
      notice={
        sourceOutdated ? (
          <SolarReturnSourceOutdatedAlert>
            <Button
              href={`/clients/${client.id}/solar-returns/${solarReturn.id}/reports/${stored.id}/client`}
              variant="secondary"
            >
              {GO_TO_CLIENT_VERSION_LABEL}
            </Button>
          </SolarReturnSourceOutdatedAlert>
        ) : null
      }
    >
      <SolarReturnReportView report={stored.report} />
    </SolarReturnReportWorkspace>
  );
}
