import { Button } from "@/components/ui/Button";

type NatalChartSectionProps = {
  clientId: string;
};

export function NatalChartSection({ clientId }: NatalChartSectionProps) {
  const editHref = `/clients/${clientId}/edit`;

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-section-title">Carta Natal</h2>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            href={`/clients/${clientId}/natal-chart`}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Ver Carta Natal
          </Button>
          <Button href={editHref} variant="secondary" className="w-full sm:w-auto">
            Editar Carta Natal
          </Button>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        Carta natal cargada
      </p>
    </section>
  );
}
