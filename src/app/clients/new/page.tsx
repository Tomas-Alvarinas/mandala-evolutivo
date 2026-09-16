import type { Metadata } from "next";
import { NewClientForm } from "@/components/clients/NewClientForm";
import { NewClientStepIndicator } from "@/components/clients/NewClientStepIndicator";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Nuevo consultante",
};

export default function NewClientPage() {
  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <span className="text-sm text-muted">Nuevo consultante</span>
        }
        title="Datos personales"
        description="Ingresá la información básica del consultante."
      />
      <NewClientStepIndicator current="personal" />
      <Card className="mt-8">
        <NewClientForm />
      </Card>
    </PageContainer>
  );
}
