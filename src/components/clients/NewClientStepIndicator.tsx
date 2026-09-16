import { TextLink } from "@/components/ui/TextLink";
import { cx } from "@/lib/ui/cx";

const STEPS = [
  { id: "personal", label: "Datos personales", href: "/clients/new" },
  { id: "natal-chart", label: "Carta Natal", href: "/clients/new/natal-chart" },
  { id: "review", label: "Revisión", href: "/clients/new/review" },
] as const;

export type NewClientStepId = (typeof STEPS)[number]["id"];

type NewClientStepIndicatorProps = {
  current: NewClientStepId;
};

export function NewClientStepIndicator({
  current,
}: NewClientStepIndicatorProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Progreso del alta" className="mt-8">
      <ol className="flex flex-wrap items-center gap-y-2 text-sm">
        {STEPS.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <li key={step.id} className="flex items-center">
              {index > 0 ? (
                <span aria-hidden="true" className="px-2.5 text-muted">
                  ·
                </span>
              ) : null}
              {isCompleted ? (
                <TextLink href={step.href} variant="subtle" className="text-sm">
                  <span className="tabular-nums">{index + 1}.</span> {step.label}
                </TextLink>
              ) : (
                <span
                  className={cx(
                    isCurrent ? "font-medium text-foreground" : "text-muted",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span className="tabular-nums">{index + 1}.</span> {step.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
