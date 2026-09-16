import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ClientReportActions } from "@/components/reports/ClientReportActions";
import { NatalChartClientReportView } from "@/components/reports/NatalChartClientReportView";
import { NatalChartReportWorkspace } from "@/components/reports/NatalChartReportWorkspace";
import { RefreshClientReportFromProfessionalControl } from "@/components/reports/RefreshClientReportFromProfessionalControl";
import { SourceOutdatedAlert } from "@/components/reports/SourceOutdatedAlert";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import { areNatalChartValuesStructurallyEqual } from "@/lib/reports/natal-chart/client-report";
import { getNatalChartClientReport } from "@/lib/reports/natal-chart/client-report/repository";
import { getNatalChartReportById } from "@/lib/reports/natal-chart/repository";

export const dynamic = "force-dynamic";

type ClientReportPageProps = {
  params: Promise<{ id: string; reportId: string }>;
};

export async function generateMetadata({
  params,
}: ClientReportPageProps): Promise<Metadata> {
  const { id } = await params;
  const clientResult = await getClientById(id);

  if (clientResult.status !== "ok") {
    return { title: "Versión consultante" };
  }

  return {
    title: `Versión consultante · ${clientResult.data.firstName} ${clientResult.data.lastName}`,
  };
}

export default async function NatalChartClientReportPage({
  params,
}: ClientReportPageProps) {
  const { id, reportId } = await params;
  const [clientResult, professionalResult, clientReportResult] =
    await Promise.all([
      getClientById(id),
      getNatalChartReportById({ clientId: id, reportId }),
      getNatalChartClientReport({
        clientId: id,
        natalChartReportId: reportId,
      }),
    ]);

  if (
    clientResult.status === "unauthorized" ||
    professionalResult.status === "unauthorized" ||
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
  const backHref = `/clients/${client.id}`;
  const clientName = `${client.firstName} ${client.lastName}`;

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
            <Button href={`/clients/${client.id}/reports/${reportId}`} variant="secondary">
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
            <Button href={backHref} variant="secondary">
              Volver a la ficha
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
            <Button href={backHref} variant="secondary">
              Volver a la ficha
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const stored = clientReportResult.data;
  const sourceOutdated =
    professionalResult.status === "ok" &&
    !areNatalChartValuesStructurallyEqual(
      stored.sourceReport,
      professionalResult.data.report,
    );
  const professionalReady =
    professionalResult.status === "ok" &&
    professionalResult.data.status === "ready";

  return (
    <NatalChartReportWorkspace
      clientId={client.id}
      reportId={reportId}
      clientName={clientName}
      createdAt={
        professionalResult.status === "ok"
          ? professionalResult.data.createdAt
          : stored.createdAt
      }
      status={
        professionalResult.status === "ok"
          ? professionalResult.data.status
          : null
      }
      current="client"
      hasClientReport
      back={{ href: backHref, label: "← Volver a la ficha" }}
      actions={
        <ClientReportActions clientId={client.id} reportId={reportId} />
      }
      notice={
        sourceOutdated ? (
          <SourceOutdatedAlert professionalReady={professionalReady}>
            {professionalReady ? (
              <RefreshClientReportFromProfessionalControl
                clientId={client.id}
                reportId={reportId}
                canRefresh
              />
            ) : null}
          </SourceOutdatedAlert>
        ) : null
      }
    >
      <NatalChartClientReportView report={stored.clientReport} />
    </NatalChartReportWorkspace>
  );
}
