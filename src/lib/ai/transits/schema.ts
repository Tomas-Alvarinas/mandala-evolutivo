import { z } from "zod";
import type { TransitAnalysisReport } from "@/lib/reports/transits/types";
import { toGeminiJsonSchema } from "../natal-chart/schema";

const nonEmptyString = z.string().min(1);

const reportSectionSchema = z
  .object({
    content: nonEmptyString.describe(
      "Texto interpretativo de la sección. Hipótesis de trabajo sobre el momento actual, no predicción.",
    ),
    astrologicalBasis: z
      .array(nonEmptyString)
      .min(1)
      .describe(
        "Cadenas exactas de la lista de evidencia permitida que sostienen esta sección.",
      ),
  })
  .describe("Sección narrativa con fundamento astrológico trazable.");

export const geminiTransitAnalysisReportSchema = z.object({
  mandalaImpact: reportSectionSchema.describe(
    "Cómo impacta el momento actual en el Mandala Evolutivo natal. Síntesis, no diccionario.",
  ),
  activatedAreas: reportSectionSchema.describe(
    "Áreas de la Carta Natal que están siendo activadas ahora.",
  ),
  evolutionaryChallenges: reportSectionSchema.describe(
    "Desafíos evolutivos del período. Hipótesis, no destino.",
  ),
  availableResources: reportSectionSchema.describe(
    "Recursos disponibles en la estructura natal para este momento.",
  ),
  opportunities: reportSectionSchema.describe(
    "Oportunidades de desarrollo. No promesas ni hechos futuros.",
  ),
  learnings: reportSectionSchema.describe(
    "Aprendizajes posibles del período. Exploratorio, no mandato.",
  ),
});

export const transitAnalysisReportSchema = geminiTransitAnalysisReportSchema.extend({
  metadata: z.object({
    reportVersion: nonEmptyString,
    methodologyVersion: nonEmptyString,
    generatedAt: nonEmptyString,
    transitAnalysisId: nonEmptyString,
    analysisDate: nonEmptyString,
  }),
});

export type GeminiTransitAnalysisReport = z.infer<
  typeof geminiTransitAnalysisReportSchema
>;
export type ParsedTransitAnalysisReport = z.infer<
  typeof transitAnalysisReportSchema
>;

type AssertEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type TransitAnalysisReportMatchesSchema = AssertEqual<
  ParsedTransitAnalysisReport,
  TransitAnalysisReport
>;

const transitAnalysisReportMatchesSchema: TransitAnalysisReportMatchesSchema =
  true;

void transitAnalysisReportMatchesSchema;

export function getTransitAnalysisGeminiJsonSchema(): Record<string, unknown> {
  return toGeminiJsonSchema(geminiTransitAnalysisReportSchema);
}
