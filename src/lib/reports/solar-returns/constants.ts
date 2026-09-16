export const SOLAR_RETURN_REPORT_VERSION = "1.0";

export const SOLAR_RETURN_METHODOLOGY_VERSION = "1.0";

export const SOLAR_RETURN_REPORT_SECTION_IDS = [
  "annualTheme",
  "solarAscendant",
  "ascendantRuler",
  "sunDirection",
  "emotionalWorld",
  "personalPlanets",
  "energyConcentration",
  "lifeAreas",
  "evolutionaryChallenges",
  "opportunities",
  "learnings",
  "evolutionarySynthesis",
] as const;

export type SolarReturnReportSectionId =
  (typeof SOLAR_RETURN_REPORT_SECTION_IDS)[number];

export const SOLAR_RETURN_REPORT_SECTION_LABELS = {
  annualTheme: "Tema central del año",
  solarAscendant: "Ascendente del año y área natal activada",
  ascendantRuler: "Regente del Ascendente",
  sunDirection: "Sol y dirección del año",
  emotionalWorld: "Mundo emocional y necesidades del año",
  personalPlanets: "Planetas personales y dinámica cotidiana",
  energyConcentration: "Concentración de energía y síntesis de elementos",
  lifeAreas: "Áreas de vida destacadas",
  evolutionaryChallenges: "Desafíos evolutivos",
  opportunities: "Oportunidades y áreas favorables",
  learnings: "Aprendizajes del año",
  evolutionarySynthesis: "Síntesis evolutiva del año",
} as const satisfies Record<SolarReturnReportSectionId, string>;

export function getSolarReturnReportSectionLabel(
  sectionId: SolarReturnReportSectionId,
): string {
  return SOLAR_RETURN_REPORT_SECTION_LABELS[sectionId];
}
