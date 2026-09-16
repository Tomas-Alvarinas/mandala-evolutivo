"use client";

import { SOLAR_RETURN_POINTS, type SolarReturnPointId } from "@/lib/solar-returns";
import { Select } from "@/components/ui/Select";

type SolarReturnPointSelectProps = {
  id?: string;
  value: SolarReturnPointId | null;
  onChange: (value: SolarReturnPointId | null) => void;
  disabled?: boolean;
  disabledIds?: readonly SolarReturnPointId[];
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
};

export function SolarReturnPointSelect({
  id,
  value,
  onChange,
  disabled,
  disabledIds,
  className,
  placeholder = "Punto RS",
  "aria-label": ariaLabel = "Punto de Revolución Solar",
}: SolarReturnPointSelectProps) {
  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      options={SOLAR_RETURN_POINTS}
      placeholder={placeholder}
      aria-label={ariaLabel}
      disabled={disabled}
      disabledIds={disabledIds}
      className={className}
    />
  );
}
