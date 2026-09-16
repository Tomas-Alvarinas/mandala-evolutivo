import { TRANSIT_ANALYSIS_REPORT_SECTION_IDS } from "./constants";
import type { TransitAnalysisReport } from "./types";

export function applyTransitAnalysisProfessionalEdits(
  original: TransitAnalysisReport,
  edited: TransitAnalysisReport,
): TransitAnalysisReport {
  const next: TransitAnalysisReport = {
    ...original,
    metadata: original.metadata,
  };

  for (const sectionId of TRANSIT_ANALYSIS_REPORT_SECTION_IDS) {
    const editedSection = edited[sectionId];

    next[sectionId] = {
      content:
        typeof editedSection?.content === "string" ? editedSection.content : "",
      astrologicalBasis: original[sectionId].astrologicalBasis,
    };
  }

  return next;
}
