import { NARRATIVE_NATAL_CHART_REPORT_SECTION_IDS } from "./constants";
import type { NatalChartReport } from "./types";

export function applyProfessionalEdits(
  original: NatalChartReport,
  edited: NatalChartReport,
): NatalChartReport {
  const next: NatalChartReport = {
    ...original,
    metadata: original.metadata,
    beliefsToExplore: edited.beliefsToExplore,
    byronKatieQuestions: edited.byronKatieQuestions,
    practicalActions: edited.practicalActions,
    empoweringWords: edited.empoweringWords,
    symbolsAndColors: edited.symbolsAndColors,
    mandalaIntervention: edited.mandalaIntervention,
  };

  for (const sectionId of NARRATIVE_NATAL_CHART_REPORT_SECTION_IDS) {
    next[sectionId] = {
      content: edited[sectionId].content,
      astrologicalBasis: original[sectionId].astrologicalBasis,
    };
  }

  return next;
}
