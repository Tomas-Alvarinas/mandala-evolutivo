import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { NatalChartReportEditor } from "@/components/reports/NatalChartReportEditor";
import { NatalChartReportWorkspace } from "@/components/reports/NatalChartReportWorkspace";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import { getNatalChartReportById } from "@/lib/reports/natal-chart/repository";

export const dynamic = "force-dynamic";

type EditNatalChartReportPageProps = {
  params: Promise<{ id: string; reportId: string }>;
};

export async function generateMetadata({
  params,
}: EditNatalChartReportPageProps): Promise<Metadata> {
  const { id, reportId } = await params;
  const clientResult = await getClientById(id);
  const reportResult = await getNatalChartReportById({
    clientId: id,
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

export default async function EditNatalChartReportPage({
  params,
}: EditNatalChartReportPageProps) {
  const { id, reportId } = await params;
  const [clientResult, reportResult] = await Promise.all([
    getClientById(id),
    getNatalChartReportById({ clientId: id, reportId }),
  ]);

  if (
    clientResult.status === "unauthorized" ||
    reportResult.status === "unauthorized"
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
          Editar informe profesional
        </h1>
        <Alert
          variant="danger"
          className="mt-8"
          role="alert"
          title={
            clientResult.status === "not_configured"
              ? "Falta configurar el acceso a los datos para editar este informe."
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
  const backHref = `/clients/${client.id}/reports/${reportId}`;
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
            <Button href={`/clients/${client.id}`} variant="secondary">
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
          title="Este informe está dañado y no se puede editar."
          actions={
            <Button href={`/clients/${client.id}`} variant="secondary">
              Volver a la ficha
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
        >
          Intentá de nuevo en unos instantes.
        </Alert>
      </PageContainer>
    );
  }

  const stored = reportResult.data;

  return (
    <NatalChartReportWorkspace
      clientId={client.id}
      reportId={stored.id}
      clientName={clientName}
      createdAt={stored.createdAt}
      status={stored.status}
      back={{ href: backHref, label: "← Volver al informe" }}
      description="Editar informe profesional"
      notice={
        <Alert variant="warning">
          Al guardar, el informe vuelve a Borrador aunque estuviera Revisado o
          Listo para entregar.
        </Alert>
      }
    >
      <NatalChartReportEditor
        clientId={client.id}
        reportId={stored.id}
        report={stored.report}
      />
    </NatalChartReportWorkspace>
  );
}
