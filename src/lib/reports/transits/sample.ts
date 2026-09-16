import {
  TRANSIT_ANALYSIS_REPORT_VERSION,
  TRANSIT_METHODOLOGY_VERSION,
} from "./constants";
import type { TransitAnalysisReport } from "./types";

const SECTION = {
  content:
    "Puede ser un período en el que se active una polaridad natal ya conocida.",
  astrologicalBasis: ["Júpiter en tránsito en Leo por Casa 5"],
};

export function createSampleTransitAnalysisReport(input?: {
  transitAnalysisId?: string;
  analysisDate?: string;
  generatedAt?: string;
}): TransitAnalysisReport {
  return {
    metadata: {
      reportVersion: TRANSIT_ANALYSIS_REPORT_VERSION,
      methodologyVersion: TRANSIT_METHODOLOGY_VERSION,
      generatedAt: input?.generatedAt ?? "2026-09-02T18:00:00.000Z",
      transitAnalysisId:
        input?.transitAnalysisId ?? "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      analysisDate: input?.analysisDate ?? "2026-09-02",
    },
    mandalaImpact: SECTION,
    activatedAreas: SECTION,
    evolutionaryChallenges: SECTION,
    availableResources: SECTION,
    opportunities: SECTION,
    learnings: SECTION,
  };
}
