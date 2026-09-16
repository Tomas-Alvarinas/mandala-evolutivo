import { normalizePdfText } from "@/lib/reports/natal-chart/client-report/normalize-pdf-text";
import type { ReportSection } from "@/lib/reports/natal-chart/types";
import { SOLAR_RETURN_REPORT_SECTION_IDS } from "../constants";
import type { SolarReturnReport } from "../types";

export function prepareSolarReturnProfessionalReportForPdf(
  report: SolarReturnReport,
): SolarReturnReport {
  const next = {
    metadata: {
      reportVersion: normalizePdfText(report.metadata.reportVersion),
      methodologyVersion: normalizePdfText(report.metadata.methodologyVersion),
      generatedAt: normalizePdfText(report.metadata.generatedAt),
      solarReturnId: normalizePdfText(report.metadata.solarReturnId),
      periodStart: normalizePdfText(report.metadata.periodStart),
      periodEnd: normalizePdfText(report.metadata.periodEnd),
    },
  } as SolarReturnReport;

  for (const sectionId of SOLAR_RETURN_REPORT_SECTION_IDS) {
    next[sectionId] = normalizeSection(report[sectionId]);
  }

  return next;
}

function normalizeSection(section: ReportSection): ReportSection {
  return {
    content: normalizePdfText(section.content),
    astrologicalBasis: section.astrologicalBasis.map(normalizePdfText),
  };
}
