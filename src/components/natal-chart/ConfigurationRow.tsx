import {
  canAddConfigurationPoint,
  canRemoveConfigurationPoint,
  getConfigurationPointRule,
  type ChartPointId,
  type ConfigurationId,
} from "@/lib/astrology";
import {
  ChartPointSelect,
  ConfigurationSelect,
} from "@/components/astrology/selects";
import { Button } from "@/components/ui/Button";

type ConfigurationRowProps = {
  type: ConfigurationId;
  points: Array<ChartPointId | null>;
  disabledTypeIds: readonly ConfigurationId[];
  onTypeChange: (type: ConfigurationId) => void;
  onPointChange: (index: number, point: ChartPointId | null) => void;
  onAddPoint: () => void;
  onRemovePoint: (index: number) => void;
  onRemove: () => void;
};

export function ConfigurationRow({
  type,
  points,
  disabledTypeIds,
  onTypeChange,
  onPointChange,
  onAddPoint,
  onRemovePoint,
  onRemove,
}: ConfigurationRowProps) {
  const rule = getConfigurationPointRule(type);
  const canAddPoint = canAddConfigurationPoint(type, points.length);
  const canRemoveExtraPoint = canRemoveConfigurationPoint(type, points.length);

  return (
    <div className="border-b border-border/70 py-4 last:border-0 last:pb-0 first:pt-0">
      <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,16rem)_auto]">
        <ConfigurationSelect
          value={type}
          onChange={onTypeChange}
          disabledIds={disabledTypeIds}
        />
        <Button
          type="button"
          variant="ghost"
          className="justify-self-start px-3 sm:justify-self-auto"
          aria-label="Eliminar configuración"
          onClick={onRemove}
        >
          Eliminar
        </Button>
      </div>

      <div
        className="mt-3"
        role="group"
        aria-label="Participantes de la configuración"
      >
        <p className="text-xs font-medium tracking-wide text-muted uppercase">
          Participantes
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {points.map((point, index) => {
            const disabledIds = points.filter(
              (entry, entryIndex): entry is ChartPointId =>
                entry !== null && entryIndex !== index,
            );

            return (
              <div
                key={`${type}-${index}`}
                className="flex min-w-0 items-center gap-2 sm:min-w-[10rem] sm:max-w-[14rem] sm:flex-1"
              >
                <ChartPointSelect
                  value={point}
                  onChange={(nextPoint) => onPointChange(index, nextPoint)}
                  disabledIds={disabledIds}
                  aria-label={`Participante ${index + 1}`}
                />
                {canRemoveExtraPoint && index >= rule.min ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0 px-3"
                    aria-label={`Quitar participante ${index + 1}`}
                    onClick={() => onRemovePoint(index)}
                  >
                    Quitar
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
        {canAddPoint ? (
          <div className="mt-3">
            <Button type="button" variant="secondary" onClick={onAddPoint}>
              Agregar participante
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
