/**
 * Contrato estructurado del informe de Carta Natal.
 *
 * El contenido interpretativo se trata como hipótesis de trabajo, no como hecho.
 * El lenguaje previsto para el agente es exploratorio:
 * "puede manifestarse", "podría aparecer", "es posible explorar".
 * Evitar diagnósticos, predicciones, destinos fijos o prescripciones médicas,
 * vocacionales o financieras.
 */

export interface ReportSection {
  content: string;
  astrologicalBasis: string[];
}

export interface SymbolicResource {
  symbol: string;
  meaning: string;
}

export interface ColorResource {
  color: string;
  intention: string;
}

export interface SymbolsAndColors {
  symbols: SymbolicResource[];
  colors: ColorResource[];
}

export interface MandalaIntervention {
  intention: string;
  assignment: string;
  suggestedElements: string[];
  processQuestions: string[];
}

export interface NatalChartReportMetadata {
  version: string;
  generatedAt: string;
}

export interface NatalChartReport {
  metadata: NatalChartReportMetadata;
  evolutionaryMandalaSummary: ReportSection;
  identity: ReportSection;
  emotionalWorld: ReportSection;
  potential: ReportSection;
  evolutionaryChallenges: ReportSection;
  shadowPatterns: ReportSection;
  /** Hipótesis sistémicas y astrogenealógicas. No es biografía familiar. */
  systemicAndAstrogenealogicalReading: ReportSection;
  innerDialogue: ReportSection;
  relationships: ReportSection;
  security: ReportSection;
  moneyAndResources: ReportSection;
  workAndVocation: ReportSection;
  /** Relación simbólica con cuerpo y hábitos. No es diagnóstico ni consejo médico. */
  bodyWellbeingAndHabits: ReportSection;
  evolutionaryPurpose: ReportSection;
  /** Hipótesis reflexivas, no inferencia clínica del sistema nervioso. */
  nervousSystemRegulation: ReportSection;
  survivalMode: ReportSection;
  creativeMode: ReportSection;
  beliefsToExplore: string[];
  /** Preguntas de autoindagación. No constituyen tratamiento psicológico. */
  byronKatieQuestions: string[];
  identityReprogramming: ReportSection;
  /** Propuestas reflexivas. Sin afirmaciones médicas o neurocientíficas. */
  dispenzaInspiredWork: ReportSection;
  practicalActions: string[];
  empoweringWords: string[];
  symbolsAndColors: SymbolsAndColors;
  mandalaIntervention: MandalaIntervention;
  finalSynthesis: ReportSection;
}

