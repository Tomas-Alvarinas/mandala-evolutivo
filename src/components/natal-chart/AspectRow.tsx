import type { AspectId, ChartPointId } from "@/lib/astrology";
import {
  AspectSelect,
  ChartPointSelect,
} from "@/components/astrology/selects";
import { Button } from "@/components/ui/Button";

type AspectRowProps = {
  pointA: ChartPointId | null;
  aspect: AspectId | null;
  pointB: ChartPointId | null;
  onPointAChange: (point: ChartPointId | null) => void;
  onAspectChange: (aspect: AspectId | null) => void;
  onPointBChange: (point: ChartPointId | null) => void;
  onRemove: () => void;
};

export function AspectRow({
  pointA,
  aspect,
  pointB,
  onPointAChange,
  onAspectChange,
  onPointBChange,
  onRemove,
}: AspectRowProps) {
  const isSelfAspect = pointA !== null && pointA === pointB;

  return (
    <div className="flex flex-col gap-2 border-b border-border/70 py-3 last:border-0">
      <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <ChartPointSelect
          value={pointA}
          onChange={(nextPoint) => {
            onPointAChange(nextPoint);
            if (nextPoint !== null && nextPoint === pointB) {
              onPointBChange(null);
            }
          }}
          aria-label="Punto 1"
        />
        <AspectSelect value={aspect} onChange={onAspectChange} />
        <ChartPointSelect
          value={pointB}
          onChange={onPointBChange}
          disabledIds={pointA ? [pointA] : []}
          aria-label="Punto 2"
        />
        <Button
          type="button"
          variant="ghost"
          className="justify-self-start px-3 sm:justify-self-auto"
          aria-label="Eliminar aspecto"
          onClick={onRemove}
        >
          Eliminar
        </Button>
      </div>
      {isSelfAspect ? (
        <p className="text-sm text-danger" role="alert">
          Elegí dos puntos distintos para el aspecto.
        </p>
      ) : null}
    </div>
  );
}
