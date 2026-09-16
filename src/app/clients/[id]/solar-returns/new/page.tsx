import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SolarReturnForm } from "@/components/solar-returns/SolarReturnForm";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { SupabaseSetupNotice } from "@/components/clients/SupabaseSetupNotice";
import { getClientById } from "@/lib/clients/repository";
import { createEmptySolarReturnDraft } from "@/lib/solar-returns";

export const dynamic = "force-dynamic";

type NewSolarReturnPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: NewSolarReturnPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getClientById(id);

  if (result.status !== "ok") {
    return { title: "Nueva Revolución Solar" };
  }

  return {
    title: `Nueva Revolución Solar · ${result.data.firstName} ${result.data.lastName}`,
  };
}

export default async function NewSolarReturnPage({
  params,
}: NewSolarReturnPageProps) {
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
          Nueva Revolución Solar
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
          Nueva Revolución Solar
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
          <TextLink href={`/clients/${client.id}/solar-returns`} variant="back">
            ← Volver a Revolución Solar
          </TextLink>
        }
        title="Nueva Revolución Solar"
        description={`${client.firstName} ${client.lastName}`}
      />
      <div className="mt-8">
        <SolarReturnForm
          clientId={client.id}
          initialDraft={createEmptySolarReturnDraft()}
          cancelHref={`/clients/${client.id}/solar-returns`}
        />
      </div>
    </PageContainer>
  );
}
