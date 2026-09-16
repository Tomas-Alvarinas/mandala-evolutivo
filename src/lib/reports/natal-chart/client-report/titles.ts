import {
  NATAL_CHART_REPORT_SECTION_IDS,
  type NatalChartReportSectionId,
} from "../constants";

export const NATAL_CHART_CLIENT_SECTION_TITLES = {
  evolutionaryMandalaSummary: "Una mirada de conjunto",
  identity: "Tu identidad y forma de expresarte",
  emotionalWorld: "Tu mundo emocional",
  potential: "Tus potencialidades",
  evolutionaryChallenges: "Tus desafíos evolutivos",
  shadowPatterns: "Sombra y patrones",
  systemicAndAstrogenealogicalReading: "Tu mirada sistémica",
  innerDialogue: "Tu diálogo interno",
  relationships: "Tus vínculos",
  security: "Tu seguridad y pertenencia",
  moneyAndResources: "Tu relación con los recursos y el valor",
  workAndVocation: "Tu camino vocacional y profesional",
  bodyWellbeingAndHabits: "Cuerpo, bienestar y hábitos",
  evolutionaryPurpose: "Tu propósito y dirección",
  nervousSystemRegulation: "Cómo recuperar tu equilibrio",
  survivalMode: "Cuando aparece el modo supervivencia",
  creativeMode: "Tu modo creativo",
  beliefsToExplore: "Creencias para explorar",
  byronKatieQuestions: "Preguntas para tu proceso",
  identityReprogramming: "Identidad y nuevas respuestas",
  dispenzaInspiredWork: "Prácticas de atención y visualización",
  practicalActions: "Acciones y prácticas concretas",
  empoweringWords: "Palabras para acompañar tu proceso",
  symbolsAndColors: "Símbolos y colores",
  mandalaIntervention: "Tu Mandala Evolutivo",
  finalSynthesis: "Síntesis para tu camino",
} as const satisfies Record<NatalChartReportSectionId, string>;

export function getNatalChartClientSectionTitle(
  sectionId: NatalChartReportSectionId,
): string {
  return NATAL_CHART_CLIENT_SECTION_TITLES[sectionId];
}

export const NATAL_CHART_CLIENT_SECTION_ORDER = NATAL_CHART_REPORT_SECTION_IDS;
