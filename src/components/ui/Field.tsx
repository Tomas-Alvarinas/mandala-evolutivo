import type { ReactNode } from "react";
import {
  fieldErrorClassName,
  fieldHintClassName,
  labelClassName,
  optionalMarkClassName,
} from "@/lib/ui/control-classes";

type FieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function Field({
  id,
  label,
  optional = false,
  hint,
  error,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClassName}>
        {label}
        {optional ? (
          <span className={optionalMarkClassName}> (opcional)</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className={fieldErrorClassName} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={fieldHintClassName}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function describedByForField(input: {
  id: string;
  error?: string;
  hint?: string;
}) {
  if (input.error) {
    return `${input.id}-error`;
  }

  if (input.hint) {
    return `${input.id}-hint`;
  }

  return undefined;
}
