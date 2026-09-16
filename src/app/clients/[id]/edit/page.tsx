import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EditClientForm } from "@/components/clients/EditClientForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { SupabaseSetupNotice } from "@/components/clients/SupabaseSetupNotice";
import {
  EXISTING_REPORTS_EDIT_NOTICE_BODY,
  EXISTING_REPORTS_EDIT_NOTICE_TITLE,
  shouldShowExistingReportsEditNotice,
} from "@/lib/clients/existing-reports-edit-notice";
import { natalChartToDraft } from "@/lib/clients/natal-chart-form";
import { getClientById } from "@/lib/clients/repository";
import { countNatalChartReports } from "@/lib/reports/natal-chart/repository";

export const dynamic = "force-dynamic";

type EditClientPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditClientPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getClientById(id);

  if (result.status !== "ok") {
    return { title: "Editar consultante" };
  }

  return {
    title: `Editar ${result.data.firstName} ${result.data.lastName}`,
  };
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const result = await getClientById(id);

  if (result.status === "unauthorized") {
    redirect("/login");
  }

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "not_configured") {
    return (
      <PageContainer size="wide">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Editar consultante
        </h1>
        <div className="mt-8">
          <SupabaseSetupNotice />
        </div>
      </PageContainer>
    );
  }

  if (result.status === "error") {
    return (
      <PageContainer size="wide">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Editar consultante
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

  const client = result.data;
  const reportsCountResult = await countNatalChartReports(client.id);

  if (reportsCountResult.status === "unauthorized") {
    redirect("/login");
  }

  const reportCount =
    reportsCountResult.status === "ok" ? reportsCountResult.data : 0;
  const showExistingReportsNotice =
    shouldShowExistingReportsEditNotice(reportCount);

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <TextLink href={`/clients/${client.id}`} variant="back">
            ← Volver a la ficha
          </TextLink>
        }
        title="Editar consultante"
        description={`${client.firstName} ${client.lastName}`}
      />
      {showExistingReportsNotice ? (
        <Alert
          variant="warning"
          className="mt-8"
          role="status"
          title={EXISTING_REPORTS_EDIT_NOTICE_TITLE}
        >
          {EXISTING_REPORTS_EDIT_NOTICE_BODY}
        </Alert>
      ) : null}
      <div className={showExistingReportsNotice ? "mt-6" : "mt-8"}>
        <EditClientForm
          clientId={client.id}
          initialClient={{
            firstName: client.firstName,
            lastName: client.lastName,
            age: String(client.age),
            professionalNotes: client.professionalNotes ?? "",
          }}
          initialNatalChart={natalChartToDraft(client.natalChart)}
        />
      </div>
    </PageContainer>
  );
}
