import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { NatalChartReportView } from "@/components/reports/NatalChartReportView";
import { NatalChartReportWorkspace } from "@/components/reports/NatalChartReportWorkspace";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getClientById } from "@/lib/clients/repository";
import { getNatalChartClientReport } from "@/lib/reports/natal-chart/client-report/repository";
import { getNatalChartReportById } from "@/lib/reports/natal-chart/repository";
import {
  ORIGINAL_VERSION_NOTICE_BODY,
  ORIGINAL_VERSION_NOTICE_TITLE,
  ORIGINAL_VERSION_TAB_LABEL,
} from "@/lib/reports";

export const dynamic = "force-dynamic";

type OriginalReportPageProps = {
  params: Promise<{ id: string; reportId: string }>;
};

export async function generateMetadata({
  params,
}: OriginalReportPageProps): Promise<Metadata> {
  const { id } = await params;
  const clientResult = await getClientById(id);

  if (clientResult.status !== "ok") {
    return { title: ORIGINAL_VERSION_TAB_LABEL };
  }

  return {
    title: `${ORIGINAL_VERSION_TAB_LABEL} · ${clientResult.data.firstName} ${clientResult.data.lastName}`,
  };
}

export default async function NatalChartOriginalReportPage({
  params,
}: OriginalReportPageProps) {
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

  if (clientResult.status !== "ok" || reportResult.status !== "ok") {
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

  const client = clientResult.data;
  const stored = reportResult.data;
  const clientName = `${client.firstName} ${client.lastName}`;

  return (
    <NatalChartReportWorkspace
      clientId={client.id}
      reportId={stored.id}
      clientName={clientName}
      createdAt={stored.createdAt}
      status={stored.status}
      current="original"
      hasClientReport={clientReportResult.status === "ok"}
      back={{
        href: `/clients/${client.id}`,
        label: "← Volver a la ficha",
      }}
      notice={
        <Alert variant="info" title={ORIGINAL_VERSION_NOTICE_TITLE}>
          {ORIGINAL_VERSION_NOTICE_BODY}
        </Alert>
      }
    >
      <NatalChartReportView
        variant="original"
        report={stored.generatedReport}
      />
    </NatalChartReportWorkspace>
  );
}
