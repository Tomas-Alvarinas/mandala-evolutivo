import {
  getAstrologicalBodyLabel,
  type AstrologicalBodyId,
  type HouseNumber,
  type ZodiacSignId,
} from "@/lib/astrology";
import { HouseSelect, SignSelect } from "@/components/astrology/selects";

type AstrologicalPositionRowProps = {
  point: AstrologicalBodyId;
  sign: ZodiacSignId | null;
  house: HouseNumber | null;
  onSignChange: (sign: ZodiacSignId | null) => void;
  onHouseChange: (house: HouseNumber | null) => void;
};

export function AstrologicalPositionRow({
  point,
  sign,
  house,
  onSignChange,
  onHouseChange,
}: AstrologicalPositionRowProps) {
  const label = getAstrologicalBodyLabel(point);

  return (
    <div className="grid grid-cols-1 gap-2 border-b border-border/70 py-2.5 last:border-0 sm:grid-cols-[minmax(7.5rem,9rem)_minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-3">
      <label
        htmlFor={`position-sign-${point}`}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2 sm:contents">
        <SignSelect
          id={`position-sign-${point}`}
          value={sign}
          onChange={onSignChange}
          aria-label={`${label}: signo`}
        />
        <HouseSelect
          id={`position-house-${point}`}
          value={house}
          onChange={onHouseChange}
          aria-label={`${label}: casa`}
        />
      </div>
    </div>
  );
}
