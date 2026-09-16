import { formatIsoDateOnlyEs } from "@/lib/transits";
import {
  TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  TRANSIT_ANALYSIS_REPORT_SECTION_LABELS,
  type TransitClientReport,
} from "@/lib/reports";
import {
  TRANSIT_CLIENT_PDF_COVER_SUBTITLE,
  TRANSIT_CLIENT_PDF_COVER_TITLE,
} from "@/lib/reports/transits/client-report/pdf-constants";
import { ClientReportCover } from "./ClientReportCover";

type TransitClientReportDocumentProps = {
  report: TransitClientReport;
  clientName: string;
  analysisDate?: string;
};

export function TransitClientReportCoverDocument({
  clientName,
  analysisDate,
}: Pick<TransitClientReportDocumentProps, "clientName" | "analysisDate">) {
  const date = analysisDate ? formatIsoDateOnlyEs(analysisDate) : "";

  return (
    <main className="document">
      <ClientReportCover
        cover={{
          title: TRANSIT_CLIENT_PDF_COVER_TITLE,
          subtitle: TRANSIT_CLIENT_PDF_COVER_SUBTITLE,
          clientName,
        }}
        date={date || undefined}
      />
    </main>
  );
}

export function TransitClientReportBodyDocument({
  report,
}: Pick<TransitClientReportDocumentProps, "report">) {
  return (
    <main className="document">
      {TRANSIT_ANALYSIS_REPORT_SECTION_IDS.map((sectionId) => (
        <section key={sectionId} className="section">
          <div className="heading-block">
            <h2 className="section-title">
              {TRANSIT_ANALYSIS_REPORT_SECTION_LABELS[sectionId]}
            </h2>
          </div>
          <p className="prose">{report[sectionId].content}</p>
        </section>
      ))}
    </main>
  );
}
