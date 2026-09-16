import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransitAnalysisForm } from "@/components/transits/TransitAnalysisForm";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { SupabaseSetupNotice } from "@/components/clients/SupabaseSetupNotice";
import { getClientById } from "@/lib/clients/repository";
import {
  createEmptyTransitAnalysisDraft,
  todayIsoDate,
} from "@/lib/transits";

export const dynamic = "force-dynamic";

type NewTransitPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: NewTransitPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getClientById(id);

  if (result.status !== "ok") {
    return { title: "Nuevo período de tránsitos" };
  }

  return {
    title: `Nuevo período · ${result.data.firstName} ${result.data.lastName}`,
  };
}

export default async function NewTransitPage({ params }: NewTransitPageProps) {
  const { id } = await params;
  const clientResult = await getClientById(id);

  if (clientResult.status === "unauthorized") {
    redirect("/login");
  }

  if (clientResult.status === "not_found") {
    notFound();
  }

  if (clientResult.status === "not_configured") {
    return (
      <PageContainer size="wide">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Nuevo período de tránsitos
        </h1>
        <div className="mt-8">
          <SupabaseSetupNotice />
        </div>
      </PageContainer>
    );
  }

  if (clientResult.status === "error") {
    return (
      <PageContainer size="wide">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Nuevo período de tránsitos
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

  const client = clientResult.data;

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <TextLink href={`/clients/${client.id}/transits`} variant="back">
            ← Volver a Tránsitos y Eclipses
          </TextLink>
        }
        title="Nuevo período de tránsitos"
        description={`${client.firstName} ${client.lastName}`}
      />
      <div className="mt-8">
        <TransitAnalysisForm
          clientId={client.id}
          initialDraft={createEmptyTransitAnalysisDraft(todayIsoDate())}
          cancelHref={`/clients/${client.id}/transits`}
        />
      </div>
    </PageContainer>
  );
}
