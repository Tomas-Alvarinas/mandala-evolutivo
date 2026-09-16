"use client";

import {
  ASPECTS,
  CHART_CONFIGURATIONS,
  CHART_POINTS,
  HOUSE_NUMBERS,
  RULER_PLANETS,
  ZODIAC_SIGNS,
  getHouseLabel,
  type AspectId,
  type ChartPointId,
  type ConfigurationId,
  type HouseNumber,
  type RulerPlanetId,
  type ZodiacSignId,
} from "@/lib/astrology";
import { Select } from "@/components/ui/Select";

type CommonSelectProps<T extends string | number> = {
  id?: string;
  value: T | null;
  onChange: (value: T | null) => void;
  disabled?: boolean;
  disabledIds?: readonly T[];
  className?: string;
  "aria-label"?: string;
};

export function SignSelect({
  id,
  value,
  onChange,
  disabled,
  className,
  "aria-label": ariaLabel = "Signo",
}: CommonSelectProps<ZodiacSignId>) {
  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      options={ZODIAC_SIGNS}
      placeholder="Signo"
      aria-label={ariaLabel}
      disabled={disabled}
      className={className}
    />
  );
}

export function HouseSelect({
  id,
  value,
  onChange,
  disabled,
  disabledIds,
  className,
  placeholder = "Casa",
  "aria-label": ariaLabel = "Casa",
}: CommonSelectProps<HouseNumber> & { placeholder?: string }) {
  const options = HOUSE_NUMBERS.map((house) => ({
    id: house,
    label: getHouseLabel(house),
  }));

  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      aria-label={ariaLabel}
      disabled={disabled}
      disabledIds={disabledIds}
      className={className}
    />
  );
}

export function ChartPointSelect({
  id,
  value,
  onChange,
  disabled,
  disabledIds,
  className,
  "aria-label": ariaLabel = "Punto astrológico",
}: CommonSelectProps<ChartPointId> & { "aria-label"?: string }) {
  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      options={CHART_POINTS}
      placeholder="Punto"
      aria-label={ariaLabel}
      disabled={disabled}
      disabledIds={disabledIds}
      className={className}
    />
  );
}

export function AspectSelect({
  id,
  value,
  onChange,
  disabled,
  className,
  "aria-label": ariaLabel = "Aspecto",
}: CommonSelectProps<AspectId>) {
  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      options={ASPECTS}
      placeholder="Aspecto"
      aria-label={ariaLabel}
      disabled={disabled}
      className={className}
    />
  );
}

export function ConfigurationSelect({
  id,
  value,
  onChange,
  disabled,
  disabledIds,
  className,
}: Omit<CommonSelectProps<ConfigurationId>, "value" | "onChange"> & {
  value: ConfigurationId;
  onChange: (value: ConfigurationId) => void;
}) {
  function handleChange(nextValue: ConfigurationId | null) {
    if (nextValue) {
      onChange(nextValue);
    }
  }

  return (
    <Select
      id={id}
      value={value}
      onChange={handleChange}
      options={CHART_CONFIGURATIONS}
      placeholder="Configuración"
      aria-label="Configuración"
      disabled={disabled}
      disabledIds={disabledIds}
      className={className}
    />
  );
}

export function RulerPlanetSelect({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder = "Planeta",
  "aria-label": ariaLabel = "Planeta",
}: CommonSelectProps<RulerPlanetId> & { placeholder?: string }) {
  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      options={RULER_PLANETS}
      placeholder={placeholder}
      aria-label={ariaLabel}
      disabled={disabled}
      className={className}
    />
  );
}
