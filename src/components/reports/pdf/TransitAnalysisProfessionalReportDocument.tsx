import { TRANSIT_METHODOLOGY_NAME } from "@/lib/ai/methodology";
import { formatDateTimeEs } from "@/lib/dates";
import { formatIsoDateOnlyEs } from "@/lib/transits";
import {
  TRANSIT_ANALYSIS_PROFESSIONAL_PDF_COVER_SUBTITLE,
  TRANSIT_ANALYSIS_PROFESSIONAL_PDF_COVER_TITLE,
} from "@/lib/reports/transits/professional-pdf/constants";
import {
  TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  TRANSIT_ANALYSIS_REPORT_SECTION_LABELS,
  type TransitAnalysisReport,
} from "@/lib/reports";
import type { ReportSection } from "@/lib/reports/natal-chart/types";
import { ClientReportCover } from "./ClientReportCover";

const SHORT_ASTRO_BASIS_LIMIT = 6;

type TransitAnalysisProfessionalReportBodyDocumentProps = {
  report: TransitAnalysisReport;
};

export function TransitAnalysisProfessionalReportCoverDocument({
  clientName,
  analysisDate,
}: {
  clientName: string;
  analysisDate?: string;
}) {
  const date = analysisDate ? formatIsoDateOnlyEs(analysisDate) : "";

  return (
    <main className="document">
      <ClientReportCover
        cover={{
          title: TRANSIT_ANALYSIS_PROFESSIONAL_PDF_COVER_TITLE,
          subtitle: TRANSIT_ANALYSIS_PROFESSIONAL_PDF_COVER_SUBTITLE,
          clientName,
        }}
        date={date || undefined}
      />
    </main>
  );
}

export function TransitAnalysisProfessionalReportBodyDocument({
  report,
}: TransitAnalysisProfessionalReportBodyDocumentProps) {
  return (
    <main className="document">
      {TRANSIT_ANALYSIS_REPORT_SECTION_IDS.map((sectionId, index) => (
        <NarrativeProfessionalSection
          key={sectionId}
          title={TRANSIT_ANALYSIS_REPORT_SECTION_LABELS[sectionId]}
          section={report[sectionId]}
          report={report}
          isLast={index === TRANSIT_ANALYSIS_REPORT_SECTION_IDS.length - 1}
        />
      ))}
    </main>
  );
}

function NarrativeProfessionalSection({
  title,
  section,
  report,
  isLast,
}: {
  title: string;
  section: ReportSection;
  report: TransitAnalysisReport;
  isLast: boolean;
}) {
  const keepAstro =
    !isLast &&
    section.astrologicalBasis.length > 0 &&
    section.astrologicalBasis.length <= SHORT_ASTRO_BASIS_LIMIT;

  return (
    <section className="section">
      <div className="heading-block">
        <h2 className="section-title">{title}</h2>
      </div>
      <p className="prose">{section.content}</p>
      {section.astrologicalBasis.length > 0 ? (
        <aside
          className={keepAstro ? "astro-basis astro-basis-keep" : "astro-basis"}
        >
          <h3 className="astro-basis-label">Base astrológica</h3>
          <ul className="astro-basis-list">
            {section.astrologicalBasis.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </aside>
      ) : null}
      {isLast ? <ProfessionalTechnicalFooter report={report} /> : null}
    </section>
  );
}

function ProfessionalTechnicalFooter({
  report,
}: {
  report: TransitAnalysisReport;
}) {
  const generated = formatDateTimeEs(report.metadata.generatedAt);
  const analysisDate = formatIsoDateOnlyEs(report.metadata.analysisDate);

  return (
    <div className="tech-meta">
      <p className="tech-meta-label">Datos técnicos</p>
      <p>
        {TRANSIT_METHODOLOGY_NAME} {report.metadata.methodologyVersion}
      </p>
      <p>Informe {report.metadata.reportVersion}</p>
      {generated ? <p>Generado {generated}</p> : null}
      {analysisDate ? <p>Fecha del análisis {analysisDate}</p> : null}
    </div>
  );
}
