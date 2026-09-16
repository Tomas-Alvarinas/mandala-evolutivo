import Link from "next/link";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { APP_NAME } from "@/lib/constants";
import {
  containerMaxWidthClass,
  containerPaddingXClass,
} from "@/lib/ui/containers";
import { cx } from "@/lib/ui/cx";

export async function Header() {
  const user = await getAuthenticatedUser();

  return (
    <header className="border-b border-border bg-card">
      <div
        className={cx(
          "mx-auto flex w-full flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-3.5",
          containerMaxWidthClass.wide,
          containerPaddingXClass,
        )}
      >
        <Link
          href={user ? "/" : "/login"}
          className="w-fit rounded-sm font-serif text-xl tracking-tight text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {APP_NAME}
        </Link>
        {user ? <HeaderNav /> : null}
      </div>
    </header>
  );
}
