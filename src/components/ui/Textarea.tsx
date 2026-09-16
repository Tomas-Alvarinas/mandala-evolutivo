import type { TextareaHTMLAttributes } from "react";
import { describedByForField, Field } from "@/components/ui/Field";
import { controlErrorClassName, textareaClassName } from "@/lib/ui/control-classes";
import { cx } from "@/lib/ui/cx";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
};

export function Textarea({
  id,
  label,
  optional = false,
  hint,
  error,
  className = "",
  rows = 5,
  ...props
}: TextareaProps) {
  return (
    <Field id={id} label={label} optional={optional} hint={hint} error={error}>
      <textarea
        {...props}
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedByForField({ id, error, hint })}
        className={cx(textareaClassName, error && controlErrorClassName, className)}
      />
    </Field>
  );
}
