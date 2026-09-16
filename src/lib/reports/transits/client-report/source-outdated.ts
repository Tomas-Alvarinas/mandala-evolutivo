import type { TransitAnalysisReport } from "../types";
import { areTransitReportValuesStructurallyEqual } from "./equality";

export function isTransitClientReportSourceOutdated(
  sourceReport: TransitAnalysisReport,
  currentProfessionalReport: TransitAnalysisReport,
): boolean {
  return !areTransitReportValuesStructurallyEqual(
    sourceReport,
    currentProfessionalReport,
  );
}
