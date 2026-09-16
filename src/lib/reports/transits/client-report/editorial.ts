import { TRANSIT_ANALYSIS_REPORT_SECTION_IDS } from "../constants";
import type { TransitClientReport } from "./types";

export function applyTransitClientReportEdits(
  original: TransitClientReport,
  edited: TransitClientReport,
): TransitClientReport {
  const next = { ...original };

  for (const sectionId of TRANSIT_ANALYSIS_REPORT_SECTION_IDS) {
    const editedSection = edited[sectionId];

    next[sectionId] = {
      content:
        typeof editedSection?.content === "string" ? editedSection.content : "",
    };
  }

  return next;
}
