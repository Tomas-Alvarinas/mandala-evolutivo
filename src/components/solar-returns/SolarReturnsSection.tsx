import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { SolarReturnList } from "@/components/solar-returns/SolarReturnList";
import type { SolarReturnSummary } from "@/lib/solar-returns";

const FICHA_PREVIEW_LIMIT = 3;

type SolarReturnsSectionProps = {
  clientId: string;
  summaries: SolarReturnSummary[] | null;
  loadError?: boolean;
};

export function SolarReturnsSection({
  clientId,
  summaries,
  loadError = false,
}: SolarReturnsSectionProps) {
  const preview = summaries?.slice(0, FICHA_PREVIEW_LIMIT) ?? [];
  const hasItems = preview.length > 0;

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-section-title">Revolución Solar</h2>
        <Button
          href={`/clients/${clientId}/solar-returns/new`}
          variant="secondary"
          className="w-full sm:w-auto"
        >
          Nueva Revolución Solar
        </Button>
      </div>

      {loadError || summaries === null ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          No se pudieron cargar las revoluciones solares.
        </p>
      ) : null}

      {!loadError && summaries && !hasItems ? (
        <p className="mt-3 text-sm text-muted">
          Todavía no hay revoluciones solares cargadas.
        </p>
      ) : null}

      {!loadError && summaries && hasItems ? (
        <div className="mt-5">
          <SolarReturnList clientId={clientId} summaries={preview} />
          <p className="mt-3">
            <TextLink
              href={`/clients/${clientId}/solar-returns`}
              variant="subtle"
              className="text-sm"
            >
              Ver todas →
            </TextLink>
          </p>
        </div>
      ) : null}
    </section>
  );
}
