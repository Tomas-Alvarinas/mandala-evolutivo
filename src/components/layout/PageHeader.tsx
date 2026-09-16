import type { ReactNode } from "react";
import { cx } from "@/lib/ui/cx";

type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={cx(className)}>
      {eyebrow}
      <div
        className={cx(
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
          eyebrow ? "mt-4" : "",
        )}
      >
        <div className="min-w-0">
          <h1 className="text-page-title break-words">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-muted">{description}</p>
          ) : null}
          {meta ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm leading-snug text-muted">
              {meta}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:items-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}