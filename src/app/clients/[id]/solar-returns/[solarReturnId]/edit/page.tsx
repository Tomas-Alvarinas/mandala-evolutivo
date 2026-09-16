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
import {
  formatSolarReturnPeriod,
  solarReturnToDraft,
} from "@/lib/solar-returns";
import { getSolarReturnById } from "@/lib/solar-returns/repository";

export const dynamic = "force-dynamic";

type EditSolarReturnPageProps = {
  params: Promise<{ id: string; solarReturnId: string }>;
};

export async function generateMetadata({
  params,
}: EditSolarReturnPageProps): Promise<Metadata> {
  const { solarReturnId } = await params;
  const result = await getSolarReturnById(solarReturnId);

  if (result.status !== "ok") {
    return { title: "Editar Revolución Solar" };
  }

  return {
    title: `Editar Revolución Solar · ${formatSolarReturnPeriod(result.data)}`,
  };
}

export default async function EditSolarReturnPage({
  params,
}: EditSolarReturnPageProps) {
  const { id, solarReturnId } = await params;
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
          Editar Revolución Solar
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
          Editar Revolución Solar
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

  const solarReturnResult = await getSolarReturnById(solarReturnId);

  if (solarReturnResult.status === "unauthorized") {
    redirect("/login");
  }

  if (
    solarReturnResult.status === "not_found" ||
    (solarReturnResult.status === "ok" &&
      solarReturnResult.data.clientId !== clientResult.data.id)
  ) {
    notFound();
  }

  if (solarReturnResult.status !== "ok") {
    return (
      <PageContainer size="wide">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Editar Revolución Solar
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

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <TextLink
            href={`/clients/${client.id}/solar-returns/${solarReturn.id}`}
            variant="back"
          >
            ← Volver a Revolución Solar
          </TextLink>
        }
        title="Editar Revolución Solar"
        description={`${client.firstName} ${client.lastName} · ${formatSolarReturnPeriod(solarReturn)}`}
      />
      <div className="mt-8">
        <SolarReturnForm
          clientId={client.id}
          solarReturnId={solarReturn.id}
          initialDraft={solarReturnToDraft(solarReturn)}
          cancelHref={`/clients/${client.id}/solar-returns/${solarReturn.id}`}
        />
      </div>
    </PageContainer>
  );
}
