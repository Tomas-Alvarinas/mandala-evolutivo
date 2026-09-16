import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/ui/cx";

const variantClasses = {
  default:
    "text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  subtle:
    "text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  back: "inline-flex text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
} as const;

type TextLinkProps = {
  href: string;
  variant?: keyof typeof variantClasses;
  className?: string;
  children: ReactNode;
};

export function TextLink({
  href,
  variant = "default",
  className = "",
  children,
}: TextLinkProps) {
  return (
    <Link href={href} className={cx(variantClasses[variant], className)}>
      {children}
    </Link>
  );
}
