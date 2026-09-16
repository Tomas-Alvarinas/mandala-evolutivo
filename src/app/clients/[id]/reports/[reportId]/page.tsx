import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProfessionalReportActions } from "@/components/reports/ProfessionalReportActions";
import { NatalChartReportStatusSelect } from "@/components/reports/NatalChartReportStatusSelect";
import { NatalChartReportView } from "@/components/reports/NatalChartReportView";
import { NatalChartReportWorkspace } from "@/components/reports/NatalChartReportWorkspace";
import { SourceOutdatedAlert } from "@/components/reports/SourceOutdatedAlert";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import {
  getProfessionalReportNextStep,
  GO_TO_CLIENT_VERSION_LABEL,
} from "@/lib/reports";
import { areNatalChartValuesStructurallyEqual } from "@/lib/reports/natal-chart/client-report";
import { getNatalChartClientReport } from "@/lib/reports/natal-chart/client-report/repository";
import { getNatalChartReportById } from "@/lib/reports/natal-chart/repository";

export const dynamic = "force-dynamic";

type NatalChartReportPageProps = {
  params: Promise<{ id: string; reportId: string }>;
};

export async function generateMetadata({
  params,
}: NatalChartReportPageProps): Promise<Metadata> {
  const { id, reportId } = await params;
  const [clientResult, reportResult] = await Promise.all([
    getClientById(id),
    getNatalChartReportById({ clientId: id, reportId }),
  ]);

  if (clientResult.status !== "ok") {
    return { title: "Carta Natal" };
  }

  const name = `${clientResult.data.firstName} ${clientResult.data.lastName}`;

  if (reportResult.status !== "ok") {
    return { title: `Carta Natal · ${name}` };
  }

  return { title: `Carta Natal · ${name}` };
}

export default async function NatalChartReportPage({
  params,
}: NatalChartReportPageProps) {
  const { id, reportId } = await params;
  const [clientResult, reportResult, clientReportResult] = await Promise.all([
    getClientById(id),
    getNatalChartReportById({ clientId: id, reportId }),
    getNatalChartClientReport({
      clientId: id,
      natalChartReportId: reportId,
    }),
  ]);

  if (
    clientResult.status === "unauthorized" ||
    reportResult.status === "unauthorized" ||
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
          Carta Natal
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title={
            clientResult.status === "not_configured"
              ? "Falta configurar el acceso a los datos para cargar este informe."
              : "No se pudo cargar este consultante."
          }
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
  const backHref = `/clients/${client.id}`;
  const clientName = `${client.firstName} ${client.lastName}`;

  if (reportResult.status === "not_found") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Informe no encontrado
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No encontramos este informe de Carta Natal."
          actions={
            <Button href={backHref} variant="secondary">
              Volver a la ficha
            </Button>
          }
        />
      </PageContainer>
    );
  }

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
          title="Este informe está dañado y no se puede mostrar."
          actions={
            <Button href={backHref} variant="secondary">
              Volver a la ficha
            </Button>
          }
        >
          El resto de la ficha sigue disponible.
        </Alert>
      </PageContainer>
    );
  }

  if (reportResult.status !== "ok") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Carta Natal
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title="No se pudo cargar este informe."
          actions={
            <Button href={backHref} variant="secondary">
              Volver a la ficha
            </Button>
          }
        >
          Intentá de nuevo en unos instantes.
        </Alert>
      </PageContainer>
    );
  }

  const stored = reportResult.data;
  const hasClientReport = clientReportResult.status === "ok";
  const sourceOutdated =
    hasClientReport &&
    !areNatalChartValuesStructurallyEqual(
      clientReportResult.data.sourceReport,
      stored.report,
    );

  return (
    <NatalChartReportWorkspace
      clientId={client.id}
      reportId={stored.id}
      clientName={clientName}
      createdAt={stored.createdAt}
      status={stored.status}
      current="professional"
      hasClientReport={hasClientReport}
      back={{ href: backHref, label: "← Volver a la ficha" }}
      workflow={
        <NatalChartReportStatusSelect
          clientId={client.id}
          reportId={stored.id}
          status={stored.status}
        />
      }
      actions={
        <ProfessionalReportActions
          clientId={client.id}
          reportId={stored.id}
          status={stored.status}
          hasClientReport={hasClientReport}
        />
      }
      hint={getProfessionalReportNextStep({
        status: stored.status,
        hasClientReport,
      })}
      notice={
        sourceOutdated ? (
          <SourceOutdatedAlert>
            <Button
              href={`/clients/${client.id}/reports/${stored.id}/client`}
              variant="secondary"
            >
              {GO_TO_CLIENT_VERSION_LABEL}
            </Button>
          </SourceOutdatedAlert>
        ) : null
      }
    >
      <NatalChartReportView report={stored.report} />
    </NatalChartReportWorkspace>
  );
}
