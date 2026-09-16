"use client";

import type { ChangeEvent } from "react";
import { controlClassName } from "@/lib/ui/control-classes";
import { cx } from "@/lib/ui/cx";

export type SelectOption<T extends string | number> = {
  id: T;
  label: string;
};

type SelectProps<T extends string | number> = {
  id?: string;
  name?: string;
  value: T | null;
  onChange: (value: T | null) => void;
  options: readonly SelectOption<T>[];
  placeholder: string;
  disabled?: boolean;
  disabledIds?: readonly T[];
  className?: string;
  "aria-label"?: string;
};

export function Select<T extends string | number>({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  disabledIds = [],
  className = "",
  "aria-label": ariaLabel,
}: SelectProps<T>) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextValue = event.target.value;

    if (nextValue === "") {
      onChange(null);
      return;
    }

    const match = options.find((option) => String(option.id) === nextValue);

    if (match) {
      onChange(match.id);
    }
  }

  return (
    <select
      id={id}
      name={name}
      aria-label={ariaLabel}
      value={value === null ? "" : String(value)}
      onChange={handleChange}
      disabled={disabled}
      className={cx(controlClassName, className)}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option
          key={String(option.id)}
          value={String(option.id)}
          disabled={disabledIds.includes(option.id)}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
