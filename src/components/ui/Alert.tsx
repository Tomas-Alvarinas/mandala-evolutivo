import type { ReactNode } from "react";
import { cx } from "@/lib/ui/cx";

const variantClasses = {
  info: "border-info/20 bg-info-background",
  warning: "border-warning/25 bg-warning-background",
  danger: "border-danger/25 bg-danger-background",
  success: "border-success/25 bg-success-background",
} as const;

type AlertProps = {
  variant?: keyof typeof variantClasses;
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  role?: "status" | "alert";
};

export function Alert({
  variant = "info",
  title,
  children,
  actions,
  className = "",
  role = "status",
}: AlertProps) {
  return (
    <div
      className={cx(
        "rounded-xl border px-4 py-3",
        variantClasses[variant],
        className,
      )}
      role={role}
    >
      {title ? (
        <p className="text-sm font-medium text-foreground">{title}</p>
      ) : null}
      {children ? (
        <div
          className={cx(
            "text-sm leading-relaxed text-muted",
            title ? "mt-1" : "",
          )}
        >
          {children}
        </div>
      ) : null}
      {actions ? <div className="mt-4">{actions}</div> : null}
    </div>
  );
}
