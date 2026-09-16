import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/ui/cx";

const variantClasses = {
  default: "border-border bg-card shadow-card",
  subtle: "border-border/80 bg-surface-subtle shadow-none",
  interactive:
    "border-border bg-card shadow-card transition-colors hover:border-border-strong hover:bg-background/70",
} as const;

const paddingClasses = {
  default: "px-6 py-6 sm:px-8",
  compact: "px-5 py-4",
  comfortable: "px-8 py-10",
} as const;

const focusClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type CardProps = {
  as?: "section" | "article" | "div" | "li";
  href?: string;
  variant?: keyof typeof variantClasses;
  padding?: keyof typeof paddingClasses;
  className?: string;
  children: ReactNode;
};

export function Card({
  as: Tag = "section",
  href,
  variant = "default",
  padding = "default",
  className = "",
  children,
}: CardProps) {
  const classes = cx(
    "rounded-2xl border",
    variantClasses[variant],
    paddingClasses[padding],
    href ? cx("group block cursor-pointer", focusClassName) : "",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <Tag className={classes}>{children}</Tag>;
}