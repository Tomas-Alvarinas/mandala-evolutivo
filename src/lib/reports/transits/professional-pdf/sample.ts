import {
  TRANSIT_ANALYSIS_REPORT_VERSION,
  TRANSIT_METHODOLOGY_VERSION,
} from "../constants";
import type { TransitAnalysisReport } from "../types";

export function createTransitProfessionalPdfSampleReport(): TransitAnalysisReport {
  return {
    metadata: {
      reportVersion: TRANSIT_ANALYSIS_REPORT_VERSION,
      methodologyVersion: TRANSIT_METHODOLOGY_VERSION,
      generatedAt: "2026-09-02T18:00:00.000Z",
      transitAnalysisId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      analysisDate: "2026-09-02",
    },
    mandalaImpact: {
      content:
        "Puede ser un período de aprendizaje y presencia — ¿cómo estás, ñandú?",
      astrologicalBasis: [
        "Júpiter en tránsito en Leo por Casa 5",
        "Júpiter trígono Venus natal",
      ],
    },
    activatedAreas: {
      content: "Se activan áreas de creación, reconocimiento y vínculo.",
      astrologicalBasis: ["Venus natal en Aries — Casa 1"],
    },
    evolutionaryChallenges: {
      content: "El desafío es no anticipar de más y sostener el ritmo.",
      astrologicalBasis: ["Saturno en tránsito en Piscis por Casa 12"],
    },
    availableResources: {
      content: "Hay recursos de auto\u00ADcustodia y de diálogo interno.",
      astrologicalBasis: ["Sol natal en Leo — Casa 5"],
    },
    opportunities: {
      content: "Aparece una oportunidad de ordenar el tiempo y el deseo.",
      astrologicalBasis: ["Júpiter trígono Sol natal"],
    },
    learnings: {
      content: "El aprendizaje posible es habitar la pregunta sin forzar respuesta.",
      astrologicalBasis: ["Nodo Norte natal en Sagitario — Casa 9"],
    },
  };
}
