import { normalizePdfText } from "@/lib/reports/natal-chart/client-report/normalize-pdf-text";
import { SOLAR_RETURN_REPORT_SECTION_IDS } from "../constants";
import type { SolarReturnClientReport } from "./types";

export function prepareSolarReturnClientReportForPdf(
  report: SolarReturnClientReport,
): SolarReturnClientReport {
  const next = {} as SolarReturnClientReport;

  for (const sectionId of SOLAR_RETURN_REPORT_SECTION_IDS) {
    next[sectionId] = {
      content: normalizePdfText(report[sectionId].content),
    };
  }

  return next;
}
