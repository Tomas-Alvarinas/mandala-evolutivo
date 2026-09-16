import type { SolarReturnReport } from "../types";
import { areSolarReturnReportValuesStructurallyEqual } from "./equality";

export function isSolarReturnClientReportSourceOutdated(
  sourceReport: SolarReturnReport,
  currentProfessionalReport: SolarReturnReport,
): boolean {
  return !areSolarReturnReportValuesStructurallyEqual(
    sourceReport,
    currentProfessionalReport,
  );
}
