import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";

export default function TransitAnalysisNotFound() {
  return (
    <PageContainer>
      <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
        Análisis no encontrado
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted">
        No encontramos este análisis de tránsitos.
      </p>
      <div className="mt-8">
        <Button href="/clients">Volver a consultantes</Button>
      </div>
    </PageContainer>
  );
}
