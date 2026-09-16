import { PAULA_LENS_NAME } from "@/lib/ai/methodology";
import { formatDateTimeEs, formatLongDateEs } from "@/lib/dates";
import {
  NATAL_CHART_PROFESSIONAL_PDF_COVER_SUBTITLE,
  NATAL_CHART_PROFESSIONAL_PDF_COVER_TITLE,
} from "@/lib/reports/natal-chart/professional-pdf/constants";
import {
  NATAL_CHART_REPORT_SECTION_IDS,
  NATAL_CHART_REPORT_SECTION_LABELS,
  type NatalChartReport,
  type NatalChartReportSectionId,
  type ReportSection,
} from "@/lib/reports";
import { ClientReportCover } from "./ClientReportCover";
import { ClientReportSection } from "./ClientReportSection";

export type ProfessionalPdfTechnical = {
  paulaLensVersion: string;
  geminiModel: string;
};

type NatalChartProfessionalReportDocumentProps = {
  report: NatalChartReport;
  clientName: string;
  technical?: ProfessionalPdfTechnical;
};

export function NatalChartProfessionalReportCoverDocument({
  clientName,
  generatedAt,
}: {
  clientName: string;
  generatedAt?: string;
}) {
  const date = generatedAt ? formatLongDateEs(generatedAt) : "";

  return (
    <main className="document">
      <ClientReportCover
        cover={{
          title: NATAL_CHART_PROFESSIONAL_PDF_COVER_TITLE,
          subtitle: NATAL_CHART_PROFESSIONAL_PDF_COVER_SUBTITLE,
          clientName,
        }}
        date={date || undefined}
      />
    </main>
  );
}

export function NatalChartProfessionalReportBodyDocument({
  report,
  technical,
}: Pick<NatalChartProfessionalReportDocumentProps, "report" | "technical">) {
  return (
    <main className="document">
      {NATAL_CHART_REPORT_SECTION_IDS.map((sectionId, index) => (
        <ProfessionalReportSection
          key={sectionId}
          sectionId={sectionId}
          report={report}
          technical={technical}
          isLast={index === NATAL_CHART_REPORT_SECTION_IDS.length - 1}
        />
      ))}
    </main>
  );
}

function ProfessionalReportSection({
  sectionId,
  report,
  technical,
  isLast,
}: {
  sectionId: NatalChartReportSectionId;
  report: NatalChartReport;
  technical?: ProfessionalPdfTechnical;
  isLast: boolean;
}) {
  const title = NATAL_CHART_REPORT_SECTION_LABELS[sectionId];

  switch (sectionId) {
    case "beliefsToExplore":
    case "byronKatieQuestions":
    case "practicalActions":
    case "empoweringWords":
      return (
        <ClientReportSection
          section={{
            sourceSectionId: sectionId,
            kind: "list",
            title,
            items: report[sectionId],
          }}
        />
      );
    case "symbolsAndColors":
      return (
        <ClientReportSection
          section={{
            sourceSectionId: sectionId,
            kind: "symbolsAndColors",
            title,
            symbols: report.symbolsAndColors.symbols,
            colors: report.symbolsAndColors.colors,
          }}
        />
      );
    case "mandalaIntervention":
      return (
        <ClientReportSection
          section={{
            sourceSectionId: sectionId,
            kind: "mandala",
            title,
            intention: report.mandalaIntervention.intention,
            assignment: report.mandalaIntervention.assignment,
            elements: report.mandalaIntervention.suggestedElements,
            questions: report.mandalaIntervention.processQuestions,
          }}
        />
      );
    default:
      return (
        <NarrativeProfessionalSection
          title={title}
          section={report[sectionId]}
          report={report}
          technical={technical}
          isLast={isLast}
        />
      );
  }
}

const SHORT_ASTRO_BASIS_LIMIT = 6;

function NarrativeProfessionalSection({
  title,
  section,
  report,
  technical,
  isLast,
}: {
  title: string;
  section: ReportSection;
  report: NatalChartReport;
  technical?: ProfessionalPdfTechnical;
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
      {isLast ? (
        <ProfessionalTechnicalFooter report={report} technical={technical} />
      ) : null}
    </section>
  );
}

function ProfessionalTechnicalFooter({
  report,
  technical,
}: {
  report: NatalChartReport;
  technical?: ProfessionalPdfTechnical;
}) {
  const generated = formatDateTimeEs(report.metadata.generatedAt);

  return (
    <div className="tech-meta">
      <p className="tech-meta-label">Datos técnicos</p>
      {technical ? (
        <p>
          {PAULA_LENS_NAME} {technical.paulaLensVersion}
        </p>
      ) : null}
      <p>Informe {report.metadata.version}</p>
      {technical ? <p>Modelo {technical.geminiModel}</p> : null}
      {generated ? <p>Generado {generated}</p> : null}
    </div>
  );
}
