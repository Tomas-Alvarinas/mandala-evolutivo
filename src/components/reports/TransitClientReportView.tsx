import {
  TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  TRANSIT_ANALYSIS_REPORT_SECTION_LABELS,
  type TransitClientReport,
} from "@/lib/reports";

type TransitClientReportViewProps = {
  report: TransitClientReport;
};

export function TransitClientReportView({
  report,
}: TransitClientReportViewProps) {
  return (
    <article className="max-w-2xl">
      {TRANSIT_ANALYSIS_REPORT_SECTION_IDS.map((sectionId) => (
        <section
          key={sectionId}
          className="border-t border-border/70 pt-10 first:border-t-0 first:pt-0"
        >
          <h2 className="font-serif text-2xl tracking-tight text-foreground">
            {TRANSIT_ANALYSIS_REPORT_SECTION_LABELS[sectionId]}
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-foreground">
            {report[sectionId].content}
          </p>
        </section>
      ))}
    </article>
  );
}
