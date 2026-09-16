import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { SolarReturnReportView } from "@/components/reports/SolarReturnReportView";
import { SolarReturnReportWorkspace } from "@/components/reports/SolarReturnReportWorkspace";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import { hasSolarReturnClientReport } from "@/lib/reports/solar-returns/client-report/repository";
import { getSolarReturnReportById } from "@/lib/reports/solar-returns/repository";
import { formatSolarReturnPeriod } from "@/lib/solar-returns";
import { getSolarReturnById } from "@/lib/solar-returns/repository";
import {
  ORIGINAL_VERSION_NOTICE_BODY,
  ORIGINAL_VERSION_NOTICE_TITLE,
  ORIGINAL_VERSION_TAB_LABEL,
} from "@/lib/reports";

export const dynamic = "force-dynamic";

type OriginalSolarReturnReportPageProps = {
  params: Promise<{
    id: string;
    solarReturnId: string;
    reportId: string;
  }>;
};

export async function generateMetadata({
  params,
}: OriginalSolarReturnReportPageProps): Promise<Metadata> {
  const { id } = await params;
  const clientResult = await getClientById(id);

  if (clientResult.status !== "ok") {
    return { title: ORIGINAL_VERSION_TAB_LABEL };
  }

  return {
    title: `${ORIGINAL_VERSION_TAB_LABEL} · ${clientResult.data.firstName} ${clientResult.data.lastName}`,
  };
}

export default async function OriginalSolarReturnReportPage({
  params,
}: OriginalSolarReturnReportPageProps) {
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
      hasSolarReturnClientReport({
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

  if (clientResult.status !== "ok" || solarReturnResult.status !== "ok") {
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
              href={`/clients/${clientResult.data.id}/solar-returns/${solarReturnResult.data.id}`}
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
  const stored = reportResult.data;
  const clientName = `${client.firstName} ${client.lastName}`;

  return (
    <SolarReturnReportWorkspace
      clientId={client.id}
      solarReturnId={solarReturn.id}
      reportId={stored.id}
      clientName={clientName}
      generatedAt={stored.generatedAt}
      status={stored.status}
      current="original"
      hasClientReport={
        clientReportResult.status === "ok" && clientReportResult.data
      }
      back={{
        href: `/clients/${client.id}/solar-returns/${solarReturn.id}`,
        label: "← Volver a Revolución Solar",
      }}
      description={formatSolarReturnPeriod(solarReturn)}
      notice={
        <Alert variant="info" title={ORIGINAL_VERSION_NOTICE_TITLE}>
          {ORIGINAL_VERSION_NOTICE_BODY}
        </Alert>
      }
    >
      <SolarReturnReportView
        variant="original"
        report={stored.generatedReport}
      />
    </SolarReturnReportWorkspace>
  );
}
