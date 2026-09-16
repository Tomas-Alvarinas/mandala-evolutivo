import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { TransitAnalysisList } from "@/components/transits/TransitAnalysisList";
import type { TransitAnalysisSummary } from "@/lib/transits";

const FICHA_PREVIEW_LIMIT = 3;

type TransitAnalysesSectionProps = {
  clientId: string;
  summaries: TransitAnalysisSummary[] | null;
  loadError?: boolean;
};

export function TransitAnalysesSection({
  clientId,
  summaries,
  loadError = false,
}: TransitAnalysesSectionProps) {
  const preview = summaries?.slice(0, FICHA_PREVIEW_LIMIT) ?? [];
  const hasAnalyses = preview.length > 0;

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-section-title">Tránsitos y Eclipses</h2>
        <Button
          href={`/clients/${clientId}/transits/new`}
          variant="secondary"
          className="w-full sm:w-auto"
        >
          Nuevo período de tránsitos
        </Button>
      </div>

      {loadError || summaries === null ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          No se pudieron cargar los períodos de tránsitos.
        </p>
      ) : null}

      {!loadError && summaries && !hasAnalyses ? (
        <p className="mt-3 text-sm text-muted">
          Todavía no hay períodos de tránsitos.
        </p>
      ) : null}

      {!loadError && summaries && hasAnalyses ? (
        <div className="mt-5">
          <TransitAnalysisList clientId={clientId} summaries={preview} />
          <p className="mt-3">
            <TextLink
              href={`/clients/${clientId}/transits`}
              variant="subtle"
              className="text-sm"
            >
              Ver todos →
            </TextLink>
          </p>
        </div>
      ) : null}
    </section>
  );
}
