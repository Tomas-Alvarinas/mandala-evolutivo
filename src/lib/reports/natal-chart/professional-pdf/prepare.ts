import { normalizePdfText } from "@/lib/reports/natal-chart/client-report/normalize-pdf-text";
import type {
  NatalChartReport,
  ReportSection,
} from "@/lib/reports/natal-chart/types";

export function prepareProfessionalReportForPdf(
  report: NatalChartReport,
): NatalChartReport {
  return {
    metadata: {
      version: normalizePdfText(report.metadata.version),
      generatedAt: normalizePdfText(report.metadata.generatedAt),
    },
    evolutionaryMandalaSummary: normalizeSection(
      report.evolutionaryMandalaSummary,
    ),
    identity: normalizeSection(report.identity),
    emotionalWorld: normalizeSection(report.emotionalWorld),
    potential: normalizeSection(report.potential),
    evolutionaryChallenges: normalizeSection(report.evolutionaryChallenges),
    shadowPatterns: normalizeSection(report.shadowPatterns),
    systemicAndAstrogenealogicalReading: normalizeSection(
      report.systemicAndAstrogenealogicalReading,
    ),
    innerDialogue: normalizeSection(report.innerDialogue),
    relationships: normalizeSection(report.relationships),
    security: normalizeSection(report.security),
    moneyAndResources: normalizeSection(report.moneyAndResources),
    workAndVocation: normalizeSection(report.workAndVocation),
    bodyWellbeingAndHabits: normalizeSection(report.bodyWellbeingAndHabits),
    evolutionaryPurpose: normalizeSection(report.evolutionaryPurpose),
    nervousSystemRegulation: normalizeSection(report.nervousSystemRegulation),
    survivalMode: normalizeSection(report.survivalMode),
    creativeMode: normalizeSection(report.creativeMode),
    beliefsToExplore: report.beliefsToExplore.map(normalizePdfText),
    byronKatieQuestions: report.byronKatieQuestions.map(normalizePdfText),
    identityReprogramming: normalizeSection(report.identityReprogramming),
    dispenzaInspiredWork: normalizeSection(report.dispenzaInspiredWork),
    practicalActions: report.practicalActions.map(normalizePdfText),
    empoweringWords: report.empoweringWords.map(normalizePdfText),
    symbolsAndColors: {
      symbols: report.symbolsAndColors.symbols.map((item) => ({
        symbol: normalizePdfText(item.symbol),
        meaning: normalizePdfText(item.meaning),
      })),
      colors: report.symbolsAndColors.colors.map((item) => ({
        color: normalizePdfText(item.color),
        intention: normalizePdfText(item.intention),
      })),
    },
    mandalaIntervention: {
      intention: normalizePdfText(report.mandalaIntervention.intention),
      assignment: normalizePdfText(report.mandalaIntervention.assignment),
      suggestedElements:
        report.mandalaIntervention.suggestedElements.map(normalizePdfText),
      processQuestions:
        report.mandalaIntervention.processQuestions.map(normalizePdfText),
    },
    finalSynthesis: normalizeSection(report.finalSynthesis),
  };
}

function normalizeSection(section: ReportSection): ReportSection {
  return {
    content: normalizePdfText(section.content),
    astrologicalBasis: section.astrologicalBasis.map(normalizePdfText),
  };
}
