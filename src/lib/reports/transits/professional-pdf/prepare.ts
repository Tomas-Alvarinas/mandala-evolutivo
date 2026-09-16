import { normalizePdfText } from "@/lib/reports/natal-chart/client-report/normalize-pdf-text";
import { TRANSIT_ANALYSIS_REPORT_SECTION_IDS } from "../constants";
import type { TransitAnalysisReport } from "../types";
import type { ReportSection } from "@/lib/reports/natal-chart/types";

export function prepareTransitAnalysisProfessionalReportForPdf(
  report: TransitAnalysisReport,
): TransitAnalysisReport {
  const next = {
    metadata: {
      reportVersion: normalizePdfText(report.metadata.reportVersion),
      methodologyVersion: normalizePdfText(report.metadata.methodologyVersion),
      generatedAt: normalizePdfText(report.metadata.generatedAt),
      transitAnalysisId: normalizePdfText(report.metadata.transitAnalysisId),
      analysisDate: normalizePdfText(report.metadata.analysisDate),
    },
  } as TransitAnalysisReport;

  for (const sectionId of TRANSIT_ANALYSIS_REPORT_SECTION_IDS) {
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
