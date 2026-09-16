import {
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_SECTION_LABELS,
  type SolarReturnReport,
} from "@/lib/reports/solar-returns";
import type { ReportSection } from "@/lib/reports/natal-chart/types";
import { cx } from "@/lib/ui/cx";

type SolarReturnReportViewProps = {
  report: SolarReturnReport;
  variant?: "professional" | "original";
};

export function SolarReturnReportView({
  report,
  variant = "professional",
}: SolarReturnReportViewProps) {
  const compact = variant === "original";

  return (
    <article className="max-w-2xl">
      <div>
        {SOLAR_RETURN_REPORT_SECTION_IDS.map((sectionId) => (
          <section
            key={sectionId}
            className={cx(
              "border-t border-border/70 first:border-t-0 first:pt-0",
              compact ? "pt-8" : "pt-10",
            )}
          >
            <h2
              className={cx(
                "font-serif tracking-tight text-foreground",
                compact ? "text-xl" : "text-2xl",
              )}
            >
              {SOLAR_RETURN_REPORT_SECTION_LABELS[sectionId]}
            </h2>
            <div className={compact ? "mt-3" : "mt-4"}>
              <NarrativeBody section={report[sectionId]} />
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

function NarrativeBody({ section }: { section: ReportSection }) {
  return (
    <div>
      <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
        {section.content}
      </p>
      {section.astrologicalBasis.length > 0 ? (
        <div className="mt-6 rounded-xl bg-surface-subtle px-4 py-3">
          <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
            Base astrológica
          </h3>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed text-muted">
            {section.astrologicalBasis.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
