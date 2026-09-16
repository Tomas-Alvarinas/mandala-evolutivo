import { SOLAR_RETURN_METHODOLOGY_NAME } from "@/lib/ai/methodology";
import { formatDateTimeEs } from "@/lib/dates";
import { formatSolarReturnPeriod } from "@/lib/solar-returns";
import {
  SOLAR_RETURN_PROFESSIONAL_PDF_COVER_SUBTITLE,
  SOLAR_RETURN_PROFESSIONAL_PDF_COVER_TITLE,
} from "@/lib/reports/solar-returns/professional-pdf/constants";
import {
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_SECTION_LABELS,
  type SolarReturnReport,
} from "@/lib/reports";
import type { ReportSection } from "@/lib/reports/natal-chart/types";
import { ClientReportCover } from "./ClientReportCover";

const SHORT_ASTRO_BASIS_LIMIT = 6;

type SolarReturnProfessionalReportBodyDocumentProps = {
  report: SolarReturnReport;
};

export function SolarReturnProfessionalReportCoverDocument({
  clientName,
  periodStart,
  periodEnd,
}: {
  clientName: string;
  periodStart?: string;
  periodEnd?: string;
}) {
  const period =
    periodStart && periodEnd
      ? formatSolarReturnPeriod({ periodStart, periodEnd })
      : "";

  return (
    <main className="document">
      <ClientReportCover
        cover={{
          title: SOLAR_RETURN_PROFESSIONAL_PDF_COVER_TITLE,
          subtitle: SOLAR_RETURN_PROFESSIONAL_PDF_COVER_SUBTITLE,
          clientName,
        }}
        date={period || undefined}
      />
    </main>
  );
}

export function SolarReturnProfessionalReportBodyDocument({
  report,
}: SolarReturnProfessionalReportBodyDocumentProps) {
  return (
    <main className="document">
      {SOLAR_RETURN_REPORT_SECTION_IDS.map((sectionId, index) => (
        <NarrativeProfessionalSection
          key={sectionId}
          title={SOLAR_RETURN_REPORT_SECTION_LABELS[sectionId]}
          section={report[sectionId]}
          report={report}
          isLast={index === SOLAR_RETURN_REPORT_SECTION_IDS.length - 1}
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
  report: SolarReturnReport;
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
  report: SolarReturnReport;
}) {
  const generated = formatDateTimeEs(report.metadata.generatedAt);
  const period = formatSolarReturnPeriod({
    periodStart: report.metadata.periodStart,
    periodEnd: report.metadata.periodEnd,
  });

  return (
    <div className="tech-meta">
      <p className="tech-meta-label">Datos técnicos</p>
      <p>
        {SOLAR_RETURN_METHODOLOGY_NAME} {report.metadata.methodologyVersion}
      </p>
      <p>Informe {report.metadata.reportVersion}</p>
      {generated ? <p>Generado {generated}</p> : null}
      {period ? <p>Período {period}</p> : null}
    </div>
  );
}
