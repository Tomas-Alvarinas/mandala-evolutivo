import type { Metadata } from "next";
import { NewClientStepIndicator } from "@/components/clients/NewClientStepIndicator";
import { NatalChartReview } from "@/components/natal-chart/NatalChartReview";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Revisar consultante",
};

export default function ReviewPage() {
  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <span className="text-sm text-muted">Nuevo consultante</span>
        }
        title="Revisar consultante"
        description="Verificá los datos antes de guardar."
      />
      <NewClientStepIndicator current="review" />
      <div className="mt-8">
        <NatalChartReview />
      </div>
    </PageContainer>
  );
}
