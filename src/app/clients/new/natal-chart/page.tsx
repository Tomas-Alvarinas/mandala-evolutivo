import type { Metadata } from "next";
import { NewClientStepIndicator } from "@/components/clients/NewClientStepIndicator";
import { NatalChartForm } from "@/components/natal-chart/NatalChartForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Carta Natal",
};

export default function NatalChartPage() {
  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <span className="text-sm text-muted">Nuevo consultante</span>
        }
        title="Carta Natal"
        description="Cargá los datos astrológicos del consultante."
      />
      <NewClientStepIndicator current="natal-chart" />
      <div className="mt-8">
        <NatalChartForm />
      </div>
    </PageContainer>
  );
}
