import {
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_SECTION_LABELS,
  type SolarReturnClientReport,
} from "@/lib/reports";

type SolarReturnClientReportViewProps = {
  report: SolarReturnClientReport;
};

export function SolarReturnClientReportView({
  report,
}: SolarReturnClientReportViewProps) {
  return (
    <article className="max-w-2xl">
      {SOLAR_RETURN_REPORT_SECTION_IDS.map((sectionId) => (
        <section
          key={sectionId}
          className="border-t border-border/70 pt-10 first:border-t-0 first:pt-0"
        >
          <h2 className="font-serif text-2xl tracking-tight text-foreground">
            {SOLAR_RETURN_REPORT_SECTION_LABELS[sectionId]}
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-foreground">
            {report[sectionId].content}
          </p>
        </section>
      ))}
    </article>
  );
}
