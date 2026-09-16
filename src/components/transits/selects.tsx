"use client";

import {
  ECLIPSE_TYPES,
  TRANSIT_PLANETS,
  type EclipseType,
  type TransitPlanetId,
} from "@/lib/transits";
import { Select } from "@/components/ui/Select";

type CommonSelectProps<T extends string> = {
  id?: string;
  value: T | null;
  onChange: (value: T | null) => void;
  disabled?: boolean;
  disabledIds?: readonly T[];
  className?: string;
  "aria-label"?: string;
};

export function TransitPlanetSelect({
  id,
  value,
  onChange,
  disabled,
  disabledIds,
  className,
  "aria-label": ariaLabel = "Planeta",
}: CommonSelectProps<TransitPlanetId>) {
  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      options={TRANSIT_PLANETS}
      placeholder="Planeta"
      aria-label={ariaLabel}
      disabled={disabled}
      disabledIds={disabledIds}
      className={className}
    />
  );
}

export function EclipseTypeSelect({
  id,
  value,
  onChange,
  disabled,
  className,
  "aria-label": ariaLabel = "Tipo",
}: CommonSelectProps<EclipseType>) {
  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      options={ECLIPSE_TYPES}
      placeholder="Tipo"
      aria-label={ariaLabel}
      disabled={disabled}
      className={className}
    />
  );
}
