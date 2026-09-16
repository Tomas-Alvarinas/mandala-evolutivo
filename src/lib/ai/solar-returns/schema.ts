import { z } from "zod";
import type { SolarReturnReport } from "@/lib/reports/solar-returns/types";
import { GeminiEngineError } from "../gemini/errors";
import { toGeminiJsonSchema } from "../natal-chart/schema";

const nonEmptyString = z.string().min(1);

const reportSectionSchema = z
  .object({
    content: nonEmptyString.describe(
      "Texto interpretativo de la sección. Hipótesis de trabajo sobre el año, no predicción.",
    ),
    astrologicalBasis: z
      .array(nonEmptyString)
      .min(1)
      .describe(
        "Cadenas exactas de la lista de evidencia permitida que sostienen esta sección.",
      ),
  })
  .describe("Sección narrativa con fundamento astrológico trazable.");

export const geminiSolarReturnReportSchema = z.object({
  annualTheme: reportSectionSchema.describe(
    "Síntesis del proceso predominante del período, de cumpleaños a cumpleaños siguiente.",
  ),
  solarAscendant: reportSectionSchema.describe(
    "Ascendente RS integrado con la casa natal de superposición y su contexto anual.",
  ),
  ascendantRuler: reportSectionSchema.describe(
    "Regente del Ascendente RS: posición, casa RS, overlay natal, aspectos y contactos.",
  ),
  sunDirection: reportSectionSchema.describe(
    "Sol RS: casa RS, overlay natal, aspectos y dirección de expresión del año.",
  ),
  emotionalWorld: reportSectionSchema.describe(
    "Luna y clima emocional del año: sensibilidad, necesidades, adaptación y seguridad.",
  ),
  personalPlanets: reportSectionSchema.describe(
    "Mercurio, Venus y Marte cuando sean relevantes para la dinámica cotidiana. No un mini-informe por planeta.",
  ),
  energyConcentration: reportSectionSchema.describe(
    "Concentración de energía por casas o puntos relevantes y síntesis de elementos cargada. No recalcular elementos.",
  ),
  lifeAreas: reportSectionSchema.describe(
    "Áreas de vida destacadas cuando la evidencia lo permita: laboral, económica, social o vincular. No forzar los cuatro dominios.",
  ),
  evolutionaryChallenges: reportSectionSchema.describe(
    "Tensiones, fricciones, patrones y zonas de trabajo del año. Hipótesis, no destino.",
  ),
  opportunities: reportSectionSchema.describe(
    "Posibilidades de desarrollo, recursos, expansión o expresión. Favorable no significa garantía.",
  ),
  learnings: reportSectionSchema.describe(
    "Qué invita a aprender, integrar, revisar o desarrollar el período.",
  ),
  evolutionarySynthesis: reportSectionSchema.describe(
    "Cierre integrado y práctico: cómo puede trabajar conscientemente con este año.",
  ),
});

export const solarReturnReportSchema = geminiSolarReturnReportSchema.extend({
  metadata: z.object({
    reportVersion: nonEmptyString,
    methodologyVersion: nonEmptyString,
    generatedAt: nonEmptyString,
    solarReturnId: nonEmptyString,
    periodStart: nonEmptyString,
    periodEnd: nonEmptyString,
  }),
});

export type GeminiSolarReturnReport = z.infer<
  typeof geminiSolarReturnReportSchema
>;
export type ParsedSolarReturnReport = z.infer<typeof solarReturnReportSchema>;

type AssertEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type SolarReturnReportMatchesSchema = AssertEqual<
  ParsedSolarReturnReport,
  SolarReturnReport
>;

const solarReturnReportMatchesSchema: SolarReturnReportMatchesSchema = true;

void solarReturnReportMatchesSchema;

export function getSolarReturnGeminiJsonSchema(): Record<string, unknown> {
  return toGeminiJsonSchema(geminiSolarReturnReportSchema);
}

export function parseSolarReturnGeminiOutput(
  text: string,
): GeminiSolarReturnReport {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new GeminiEngineError(
      "invalid_json",
      "Gemini no devolvió un JSON válido.",
    );
  }

  const result = geminiSolarReturnReportSchema.safeParse(parsed);

  if (!result.success) {
    throw new GeminiEngineError(
      "invalid_schema",
      "El JSON recibido no cumple el contrato SolarReturnReport.",
    );
  }

  return result.data;
}
