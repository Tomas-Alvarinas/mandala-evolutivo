export const NATAL_CHART_REPORT_VERSION = "1.1";

export const NATAL_CHART_REPORT_SECTION_IDS = [
  "evolutionaryMandalaSummary",
  "identity",
  "emotionalWorld",
  "potential",
  "evolutionaryChallenges",
  "shadowPatterns",
  "systemicAndAstrogenealogicalReading",
  "innerDialogue",
  "relationships",
  "security",
  "moneyAndResources",
  "workAndVocation",
  "bodyWellbeingAndHabits",
  "evolutionaryPurpose",
  "nervousSystemRegulation",
  "survivalMode",
  "creativeMode",
  "beliefsToExplore",
  "byronKatieQuestions",
  "identityReprogramming",
  "dispenzaInspiredWork",
  "practicalActions",
  "empoweringWords",
  "symbolsAndColors",
  "mandalaIntervention",
  "finalSynthesis",
] as const;

export type NatalChartReportSectionId =
  (typeof NATAL_CHART_REPORT_SECTION_IDS)[number];

export const STRUCTURED_NATAL_CHART_REPORT_SECTION_IDS = [
  "beliefsToExplore",
  "byronKatieQuestions",
  "practicalActions",
  "empoweringWords",
  "symbolsAndColors",
  "mandalaIntervention",
] as const satisfies readonly NatalChartReportSectionId[];

export type StructuredNatalChartReportSectionId =
  (typeof STRUCTURED_NATAL_CHART_REPORT_SECTION_IDS)[number];

export type NarrativeNatalChartReportSectionId = Exclude<
  NatalChartReportSectionId,
  StructuredNatalChartReportSectionId
>;

const structuredSectionIds = new Set<string>(
  STRUCTURED_NATAL_CHART_REPORT_SECTION_IDS,
);

export const NARRATIVE_NATAL_CHART_REPORT_SECTION_IDS =
  NATAL_CHART_REPORT_SECTION_IDS.filter(
    (sectionId): sectionId is NarrativeNatalChartReportSectionId =>
      !structuredSectionIds.has(sectionId),
  );

export const NATAL_CHART_REPORT_SECTION_LABELS = {
  evolutionaryMandalaSummary: "Síntesis del Mandala Evolutivo",
  identity: "Esencia e identidad",
  emotionalWorld: "Mundo emocional",
  potential: "Potencialidades",
  evolutionaryChallenges: "Desafíos evolutivos",
  shadowPatterns: "Sombra y patrones",
  systemicAndAstrogenealogicalReading: "Mirada sistémica y astrogenealógica",
  innerDialogue: "Diálogo interno",
  relationships: "Vínculos",
  security: "Seguridad",
  moneyAndResources: "Dinero y recursos",
  workAndVocation: "Trabajo y vocación",
  bodyWellbeingAndHabits: "Cuerpo, bienestar y hábitos",
  evolutionaryPurpose: "Propósito evolutivo",
  nervousSystemRegulation: "Sistema nervioso y regulación",
  survivalMode: "Modo supervivencia",
  creativeMode: "Modo creativo",
  beliefsToExplore: "Creencias a explorar",
  byronKatieQuestions: "Preguntas inspiradas en Byron Katie",
  identityReprogramming: "Identidad y reprogramación",
  dispenzaInspiredWork: "Trabajo inspirado en Joe Dispenza",
  practicalActions: "Acciones y prácticas concretas",
  empoweringWords: "Palabras empoderadoras",
  symbolsAndColors: "Símbolos y colores",
  mandalaIntervention: "Intervención del Mandala Evolutivo",
  finalSynthesis: "Síntesis final",
} as const satisfies Record<NatalChartReportSectionId, string>;

export function getNatalChartReportSectionLabel(
  sectionId: NatalChartReportSectionId,
): string {
  return NATAL_CHART_REPORT_SECTION_LABELS[sectionId];
}
