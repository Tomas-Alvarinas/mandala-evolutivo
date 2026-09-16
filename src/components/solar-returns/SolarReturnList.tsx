import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DeleteSolarReturnControl } from "@/components/solar-returns/DeleteSolarReturnControl";
import { formatLongDateEs } from "@/lib/dates";
import {
  formatSolarReturnPeriod,
  type SolarReturnSummary,
} from "@/lib/solar-returns";
import {
  interactiveListCardActionClassName,
  interactiveListCardClassName,
} from "@/lib/ui/list-card";

type SolarReturnListProps = {
  clientId: string;
  summaries: SolarReturnSummary[];
  showDelete?: boolean;
};

export function SolarReturnList({
  clientId,
  summaries,
  showDelete = false,
}: SolarReturnListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {summaries.map((summary) => {
        const href = `/clients/${clientId}/solar-returns/${summary.id}`;
        const createdLabel = formatLongDateEs(summary.createdAt);
        const periodLabel = formatSolarReturnPeriod(summary);

        if (!showDelete) {
          return (
            <li key={summary.id}>
              <Card
                href={href}
                variant="interactive"
                padding="compact"
                className={interactiveListCardClassName}
              >
                <div className="min-w-0">
                  <p className="break-words font-medium text-foreground">
                    {periodLabel}
                  </p>
                  {createdLabel ? (
                    <p className="mt-1 text-sm text-muted">
                      Cargada el {createdLabel}
                    </p>
                  ) : null}
                </div>
                <span className={interactiveListCardActionClassName}>
                  Ver →
                </span>
              </Card>
            </li>
          );
        }

        return (
          <li key={summary.id}>
            <Card
              padding="compact"
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link href={href} className="min-w-0">
                <p className="break-words font-medium text-foreground">
                  {periodLabel}
                </p>
                {createdLabel ? (
                  <p className="mt-1 text-sm text-muted">
                    Cargada el {createdLabel}
                  </p>
                ) : null}
              </Link>
              <DeleteSolarReturnControl
                clientId={clientId}
                solarReturnId={summary.id}
                periodStart={summary.periodStart}
                periodEnd={summary.periodEnd}
              />
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
