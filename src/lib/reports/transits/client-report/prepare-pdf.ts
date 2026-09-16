import { normalizePdfText } from "@/lib/reports/natal-chart/client-report/normalize-pdf-text";
import { TRANSIT_ANALYSIS_REPORT_SECTION_IDS } from "../constants";
import type { TransitClientReport } from "./types";

export function prepareTransitClientReportForPdf(
  report: TransitClientReport,
): TransitClientReport {
  const next = {} as TransitClientReport;

  for (const sectionId of TRANSIT_ANALYSIS_REPORT_SECTION_IDS) {
    next[sectionId] = {
      content: normalizePdfText(report[sectionId].content),
    };
  }

  return next;
}
