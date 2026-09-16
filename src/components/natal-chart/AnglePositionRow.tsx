import {
  getAngleLabel,
  type AngleId,
  type ZodiacSignId,
} from "@/lib/astrology";
import { SignSelect } from "@/components/astrology/selects";

type AnglePositionRowProps = {
  angle: AngleId;
  sign: ZodiacSignId | null;
  onSignChange: (sign: ZodiacSignId | null) => void;
};

export function AnglePositionRow({
  angle,
  sign,
  onSignChange,
}: AnglePositionRowProps) {
  const label = getAngleLabel(angle);

  return (
    <div className="grid grid-cols-1 items-center gap-2 border-b border-border/70 py-2.5 last:border-0 sm:grid-cols-[minmax(7.5rem,9rem)_minmax(0,1fr)] sm:gap-3">
      <label
        htmlFor={`angle-sign-${angle}`}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <SignSelect
        id={`angle-sign-${angle}`}
        value={sign}
        onChange={onSignChange}
        aria-label={`${label}: signo`}
      />
    </div>
  );
}
