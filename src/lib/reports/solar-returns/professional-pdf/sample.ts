import {
  SOLAR_RETURN_METHODOLOGY_VERSION,
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_VERSION,
} from "../constants";
import type { SolarReturnReport } from "../types";

export function createSolarReturnProfessionalPdfSampleReport(): SolarReturnReport {
  const sections = Object.fromEntries(
    SOLAR_RETURN_REPORT_SECTION_IDS.map((sectionId) => [
      sectionId,
      {
        content: "Puede ser un año de aprendizaje y presencia.",
        astrologicalBasis: ["Venus RS en Capricornio — Casa RS 10 — Casa natal 2"],
      },
    ]),
  ) as Pick<SolarReturnReport, (typeof SOLAR_RETURN_REPORT_SECTION_IDS)[number]>;

  return {
    metadata: {
      reportVersion: SOLAR_RETURN_REPORT_VERSION,
      methodologyVersion: SOLAR_RETURN_METHODOLOGY_VERSION,
      generatedAt: "2026-09-07T18:00:00.000Z",
      solarReturnId: "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff",
      periodStart: "2026-09-01",
      periodEnd: "2027-09-01",
    },
    ...sections,
    annualTheme: {
      content:
        "Puede ser un año en el que se active una zona natal ya conocida — ¿cómo estás, ñandú?",
      astrologicalBasis: [
        "Sol RS en Virgo — Casa RS 10 — Casa natal 1",
        "Sol trígono Luna natal",
      ],
    },
    learnings: {
      content: "El aprendizaje posible es habitar la pregunta sin forzar respuesta.",
      astrologicalBasis: ["Nodo Norte natal en Sagitario — Casa 9"],
    },
    energyConcentration: {
      content: "Hay una concentración de auto\u00ADcustodia y de diálogo interno.",
      astrologicalBasis: ["Saturno RS en Capricornio — Casa RS 2"],
    },
  };
}
