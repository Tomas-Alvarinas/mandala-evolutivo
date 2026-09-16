import type { ComponentType } from "react";
import { Card } from "@/components/ui/Card";
import {
  CLIENT_FICHA_HUB_ITEMS,
  CLIENT_FICHA_SECTION_IDS,
  formatClientFichaNatalSummary,
  formatClientFichaSolarReturnsSummary,
  formatClientFichaTransitsSummary,
  getClientFichaHubHref,
} from "@/lib/clients/ficha";

type ClientFichaHubProps = {
  clientId: string;
  transitsCount: number | null;
  solarReturnsCount: number | null;
  latestSolarReturnPeriodLabel: string | null;
};

const iconSvgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-5",
  "aria-hidden": true as const,
};

function FichaNatalIcon() {
  return (
    <svg {...iconSvgProps}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M6 19.25c.85-3.1 3.15-4.75 6-4.75s5.15 1.65 6 4.75" />
    </svg>
  );
}

function FichaTransitsIcon() {
  return (
    <svg {...iconSvgProps}>
      <path d="M4.5 16.5 10 11l3.25 3.25L19.5 8" />
      <path d="M14.5 8H19.5V13" />
    </svg>
  );
}

function FichaSolarIcon() {
  return (
    <svg {...iconSvgProps}>
      <circle cx="12" cy="12" r="3.25" />
      <path d="M12 3.5v1.75M12 18.75V20.5M3.5 12h1.75M18.75 12H20.5M6.4 6.4l1.24 1.24M16.36 16.36l1.24 1.24M6.4 17.6l1.24-1.24M16.36 7.64l1.24-1.24" />
    </svg>
  );
}

const FICHA_HUB_ICONS: Record<
  (typeof CLIENT_FICHA_HUB_ITEMS)[number]["id"],
  ComponentType
> = {
  [CLIENT_FICHA_SECTION_IDS.natalChart]: FichaNatalIcon,
  [CLIENT_FICHA_SECTION_IDS.transits]: FichaTransitsIcon,
  [CLIENT_FICHA_SECTION_IDS.solarReturns]: FichaSolarIcon,
};

export function ClientFichaHub({
  clientId,
  transitsCount,
  solarReturnsCount,
  latestSolarReturnPeriodLabel,
}: ClientFichaHubProps) {
  const summaries: Record<(typeof CLIENT_FICHA_HUB_ITEMS)[number]["id"], string> =
    {
      [CLIENT_FICHA_SECTION_IDS.natalChart]: formatClientFichaNatalSummary(),
      [CLIENT_FICHA_SECTION_IDS.transits]:
        formatClientFichaTransitsSummary(transitsCount),
      [CLIENT_FICHA_SECTION_IDS.solarReturns]:
        formatClientFichaSolarReturnsSummary({
          count: solarReturnsCount,
          latestPeriodLabel: latestSolarReturnPeriodLabel,
        }),
    };

  return (
    <nav aria-label="Áreas de la ficha">
      <ul className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CLIENT_FICHA_HUB_ITEMS.map((item) => {
          const Icon = FICHA_HUB_ICONS[item.id];

          return (
            <li key={item.id} className="min-w-0">
              <Card
                href={getClientFichaHubHref({
                  sectionId: item.id,
                  clientId,
                })}
                variant="interactive"
                padding="compact"
                className="h-full"
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center rounded-full bg-surface-subtle text-accent transition-colors group-hover:text-accent-hover"
                >
                  <Icon />
                </span>
                <p className="mt-4 break-words font-medium text-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {summaries[item.id]}
                </p>
              </Card>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
