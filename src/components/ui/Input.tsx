import type { InputHTMLAttributes } from "react";
import { describedByForField, Field } from "@/components/ui/Field";
import { controlClassName, controlErrorClassName } from "@/lib/ui/control-classes";
import { cx } from "@/lib/ui/cx";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
};

export function Input({
  id,
  label,
  optional = false,
  hint,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <Field id={id} label={label} optional={optional} hint={hint} error={error}>
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedByForField({ id, error, hint })}
        className={cx(controlClassName, error && controlErrorClassName, className)}
      />
    </Field>
  );
}
