import { SOLAR_RETURN_REPORT_SECTION_IDS } from "../constants";
import type { SolarReturnClientReport } from "./types";

export function applySolarReturnClientReportEdits(
  original: SolarReturnClientReport,
  edited: SolarReturnClientReport,
): SolarReturnClientReport {
  const next = { ...original };

  for (const sectionId of SOLAR_RETURN_REPORT_SECTION_IDS) {
    const editedSection = edited[sectionId];

    next[sectionId] = {
      content:
        typeof editedSection?.content === "string" ? editedSection.content : "",
    };
  }

  return next;
}
