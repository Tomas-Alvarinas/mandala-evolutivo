export const TRANSIT_ANALYSIS_REPORT_VERSION = "1.0";

export const TRANSIT_METHODOLOGY_VERSION = "1.1";

export const TRANSIT_ANALYSIS_REPORT_SECTION_IDS = [
  "mandalaImpact",
  "activatedAreas",
  "evolutionaryChallenges",
  "availableResources",
  "opportunities",
  "learnings",
] as const;

export type TransitAnalysisReportSectionId =
  (typeof TRANSIT_ANALYSIS_REPORT_SECTION_IDS)[number];

export const TRANSIT_ANALYSIS_REPORT_SECTION_LABELS = {
  mandalaImpact: "Cómo impacta en el Mandala Evolutivo",
  activatedAreas: "Áreas activadas de la Carta Natal",
  evolutionaryChallenges: "Desafíos evolutivos",
  availableResources: "Recursos disponibles",
  opportunities: "Oportunidades",
  learnings: "Aprendizajes",
} as const satisfies Record<TransitAnalysisReportSectionId, string>;

export function getTransitAnalysisReportSectionLabel(
  sectionId: TransitAnalysisReportSectionId,
): string {
  return TRANSIT_ANALYSIS_REPORT_SECTION_LABELS[sectionId];
}
