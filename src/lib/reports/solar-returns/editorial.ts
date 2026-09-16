import { SOLAR_RETURN_REPORT_SECTION_IDS } from "./constants";
import type { SolarReturnReport } from "./types";

export function applySolarReturnProfessionalEdits(
  original: SolarReturnReport,
  edited: SolarReturnReport,
): SolarReturnReport {
  const next: SolarReturnReport = {
    ...original,
    metadata: original.metadata,
  };

  for (const sectionId of SOLAR_RETURN_REPORT_SECTION_IDS) {
    const editedSection = edited[sectionId];

    next[sectionId] = {
      content:
        typeof editedSection?.content === "string" ? editedSection.content : "",
      astrologicalBasis: original[sectionId].astrologicalBasis,
    };
  }

  return next;
}
