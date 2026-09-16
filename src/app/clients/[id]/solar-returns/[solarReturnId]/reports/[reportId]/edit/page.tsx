import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { SolarReturnReportEditor } from "@/components/reports/SolarReturnReportEditor";
import { SolarReturnReportWorkspace } from "@/components/reports/SolarReturnReportWorkspace";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import { getSolarReturnReportById } from "@/lib/reports/solar-returns/repository";
import { formatSolarReturnPeriod } from "@/lib/solar-returns";
import { getSolarReturnById } from "@/lib/solar-returns/repository";

export const dynamic = "force-dynamic";

type EditSolarReturnReportPageProps = {
  params: Promise<{
    id: string;
    solarReturnId: string;
    reportId: string;
  }>;
};

export async function generateMetadata({
  params,
}: EditSolarReturnReportPageProps): Promise<Metadata> {
  const { id } = await params;
  const clientResult = await getClientById(id);

  if (clientResult.status !== "ok") {
    return { title: "Editar informe" };
  }

  return {
    title: `Editar informe · ${clientResult.data.firstName} ${clientResult.data.lastName}`,
  };
}

export default async function EditSolarReturnReportPage({
  params,
}: EditSolarReturnReportPageProps) {
  const { id, solarReturnId, reportId } = await params;
  const [clientResult, solarReturnResult, reportResult] = await Promise.all([
    getClientById(id),
    getSolarReturnById(solarReturnId),
    getSolarReturnReportById({
      clientId: id,
      solarReturnId,
      reportId,
    }),
  ]);

  if (
    clientResult.status === "unauthorized" ||
    solarReturnResult.status === "unauthorized" ||
    reportResult.status === "unauthorized"
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

  if (solarReturnResult.status !== "ok") {
    return (
      <PageContainer>
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Editar informe profesional
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
        />
      </PageContainer>
    );
  }

  const client = clientResult.data;
  const solarReturn = solarReturnResult.data;
  const backHref = `/clients/${client.id}/solar-returns/${solarReturn.id}/reports/${reportId}`;
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
    <SolarReturnReportWorkspace
      clientId={client.id}
      solarReturnId={solarReturn.id}
      reportId={stored.id}
      clientName={clientName}
      generatedAt={stored.generatedAt}
      status={stored.status}
      back={{ href: backHref, label: "← Volver al informe" }}
      description={`Editar informe profesional · ${formatSolarReturnPeriod(solarReturn)}`}
      notice={
        <Alert variant="warning">
          Al guardar, el informe vuelve a Borrador aunque estuviera Revisado o
          Listo para entregar.
        </Alert>
      }
    >
      <SolarReturnReportEditor
        clientId={client.id}
        solarReturnId={solarReturn.id}
        reportId={stored.id}
        report={stored.report}
      />
    </SolarReturnReportWorkspace>
  );
}
