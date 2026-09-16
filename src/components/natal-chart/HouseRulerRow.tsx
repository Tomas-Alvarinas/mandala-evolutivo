import type { HouseNumber, RulerPlanetId, ZodiacSignId } from "@/lib/astrology";
import {
  HouseSelect,
  RulerPlanetSelect,
  SignSelect,
} from "@/components/astrology/selects";
import { Button } from "@/components/ui/Button";

type HouseRulerRowProps = {
  house: HouseNumber | null;
  planet: RulerPlanetId | null;
  sign: ZodiacSignId | null;
  disabledHouseNumbers: readonly HouseNumber[];
  onHouseChange: (house: HouseNumber | null) => void;
  onPlanetChange: (planet: RulerPlanetId | null) => void;
  onSignChange: (sign: ZodiacSignId | null) => void;
  onRemove: () => void;
};

export function HouseRulerRow({
  house,
  planet,
  sign,
  disabledHouseNumbers,
  onHouseChange,
  onPlanetChange,
  onSignChange,
  onRemove,
}: HouseRulerRowProps) {
  return (
    <div className="grid grid-cols-1 items-center gap-2 border-b border-border/70 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <HouseSelect
        value={house}
        onChange={onHouseChange}
        disabledIds={disabledHouseNumbers}
        aria-label="Casa"
      />
      <RulerPlanetSelect
        value={planet}
        onChange={onPlanetChange}
        aria-label="Planeta regente"
      />
      <SignSelect
        value={sign}
        onChange={onSignChange}
        aria-label="Signo del planeta regente"
      />
      <Button
        type="button"
        variant="ghost"
        className="justify-self-start px-3 sm:justify-self-auto"
        aria-label="Eliminar regente"
        onClick={onRemove}
      >
        Eliminar
      </Button>
    </div>
  );
}
