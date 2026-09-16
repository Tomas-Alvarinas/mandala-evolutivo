"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth/actions";
import { cx } from "@/lib/ui/cx";

const focusClassName =
  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function HeaderNav() {
  const pathname = usePathname();
  const newClientActive =
    pathname === "/clients/new" || pathname.startsWith("/clients/new/");
  const clientsActive =
    !newClientActive &&
    (pathname === "/clients" || pathname.startsWith("/clients/"));

  return (
    <nav
      aria-label="Principal"
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
    >
      <HeaderNavLink href="/clients" active={clientsActive}>
        Consultantes
      </HeaderNavLink>
      <HeaderNavLink href="/clients/new" active={newClientActive}>
        Nuevo consultante
      </HeaderNavLink>
      <form
        action={logout}
        className="sm:ml-1 sm:border-l sm:border-border sm:pl-4"
      >
        <button
          type="submit"
          className={cx(
            "text-muted/70 transition-colors hover:text-muted",
            focusClassName,
          )}
        >
          Cerrar sesión
        </button>
      </form>
    </nav>
  );
}

function HeaderNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "transition-colors",
        focusClassName,
        active
          ? "font-medium text-foreground underline decoration-accent/45 underline-offset-4"
          : "text-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
