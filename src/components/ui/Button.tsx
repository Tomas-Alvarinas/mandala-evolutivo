import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/ui/cx";

const baseClasses =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-lg px-5 text-sm font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const variantClasses = {
  primary:
    "bg-accent text-primary-foreground hover:bg-accent-hover active:bg-accent-active focus-visible:ring-ring",
  secondary:
    "border border-border bg-card text-foreground hover:bg-background active:bg-surface-subtle focus-visible:ring-ring",
  ghost:
    "text-muted hover:bg-background hover:text-foreground active:bg-surface-subtle focus-visible:ring-ring",
  danger:
    "bg-danger text-primary-foreground hover:bg-danger-hover active:bg-danger-hover focus-visible:ring-danger",
} as const;

type ButtonVariant = keyof typeof variantClasses;

type ButtonBaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type ButtonLinkProps = ButtonBaseProps & {
  href: string;
};

type ButtonElementProps = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonLinkProps | ButtonElementProps) {
  const classes = cx(baseClasses, variantClasses[variant], className);

  if (isLinkProps(props)) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

function isLinkProps(
  props: { href: string } | Omit<ButtonElementProps, keyof ButtonBaseProps>,
): props is { href: string } {
  return "href" in props && typeof props.href === "string";
}
