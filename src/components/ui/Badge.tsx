import type { ReactNode } from "react";
import { cx } from "@/lib/ui/cx";

const variantClasses = {
  neutral: "border-border bg-background text-muted",
  warning: "border-warning/25 bg-warning-background text-foreground",
  success: "border-success/30 bg-success-background text-success",
  info: "border-info/20 bg-info-background text-info",
  danger: "border-danger/25 bg-danger-background text-danger",
} as const;

type BadgeProps = {
  variant?: keyof typeof variantClasses;
  className?: string;
  children: ReactNode;
};

export function Badge({
  variant = "neutral",
  className = "",
  children,
}: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const badgeVariantClasses = variantClasses;
