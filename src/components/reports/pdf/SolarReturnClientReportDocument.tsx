import { formatSolarReturnPeriod } from "@/lib/solar-returns";
import {
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_SECTION_LABELS,
  type SolarReturnClientReport,
} from "@/lib/reports";
import {
  SOLAR_RETURN_CLIENT_PDF_COVER_SUBTITLE,
  SOLAR_RETURN_CLIENT_PDF_COVER_TITLE,
} from "@/lib/reports/solar-returns/client-report/pdf-constants";
import { ClientReportCover } from "./ClientReportCover";

type SolarReturnClientReportDocumentProps = {
  report: SolarReturnClientReport;
  clientName: string;
  periodStart?: string;
  periodEnd?: string;
};

export function SolarReturnClientReportCoverDocument({
  clientName,
  periodStart,
  periodEnd,
}: Pick<
  SolarReturnClientReportDocumentProps,
  "clientName" | "periodStart" | "periodEnd"
>) {
  const period =
    periodStart && periodEnd
      ? formatSolarReturnPeriod({ periodStart, periodEnd })
      : "";

  return (
    <main className="document">
      <ClientReportCover
        cover={{
          title: SOLAR_RETURN_CLIENT_PDF_COVER_TITLE,
          subtitle: SOLAR_RETURN_CLIENT_PDF_COVER_SUBTITLE,
          clientName,
        }}
        date={period || undefined}
      />
    </main>
  );
}

export function SolarReturnClientReportBodyDocument({
  report,
}: Pick<SolarReturnClientReportDocumentProps, "report">) {
  return (
    <main className="document">
      {SOLAR_RETURN_REPORT_SECTION_IDS.map((sectionId) => (
        <section key={sectionId} className="section">
          <div className="heading-block">
            <h2 className="section-title">
              {SOLAR_RETURN_REPORT_SECTION_LABELS[sectionId]}
            </h2>
          </div>
          <p className="prose">{report[sectionId].content}</p>
        </section>
      ))}
    </main>
  );
}
