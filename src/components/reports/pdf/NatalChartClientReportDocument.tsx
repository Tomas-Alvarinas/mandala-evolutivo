import { formatLongDateEs } from "@/lib/dates";
import type { NatalChartClientReport } from "@/lib/reports/natal-chart/client-report";
import { ClientReportCover } from "./ClientReportCover";
import { ClientReportSection } from "./ClientReportSection";

type NatalChartClientReportDocumentProps = {
  report: NatalChartClientReport;
};

export function NatalChartClientReportCoverDocument({
  report,
}: NatalChartClientReportDocumentProps) {
  const date = formatLongDateEs(report.metadata.createdAt);

  return (
    <main className="document">
      <ClientReportCover cover={report.cover} date={date || undefined} />
    </main>
  );
}

export function NatalChartClientReportBodyDocument({
  report,
}: NatalChartClientReportDocumentProps) {
  const showIntroduction = report.introduction.content.trim() !== "";
  const showClosing = report.closing.content.trim() !== "";

  return (
    <main className="document">
      {showIntroduction ? (
        <section className="section intro">
          <div className="heading-block">
            <h2 className="section-title">Introducción</h2>
          </div>
          <p className="prose">{report.introduction.content}</p>
        </section>
      ) : null}

      {report.sections.map((section, index) => (
        <ClientReportSection
          key={`${section.sourceSectionId}-${index}`}
          section={section}
        />
      ))}

      {showClosing ? (
        <section className="section closing">
          <div className="heading-block">
            <h2 className="section-title">Cierre</h2>
          </div>
          <p className="prose">{report.closing.content}</p>
        </section>
      ) : null}
    </main>
  );
}

export function NatalChartClientReportDocument({
  report,
}: NatalChartClientReportDocumentProps) {
  return (
    <main className="document">
      <ClientReportCover
        cover={report.cover}
        date={formatLongDateEs(report.metadata.createdAt) || undefined}
      />
      <NatalChartClientReportBodyDocument report={report} />
    </main>
  );
}
