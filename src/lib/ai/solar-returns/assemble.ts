import {
  SOLAR_RETURN_METHODOLOGY_VERSION,
  SOLAR_RETURN_REPORT_VERSION,
} from "@/lib/reports/solar-returns/constants";
import type { SolarReturnReport } from "@/lib/reports/solar-returns/types";
import { GeminiEngineError } from "../gemini/errors";
import type { SolarReturnEngineInput } from "./context";
import {
  buildSolarReturnEvidence,
  createEvidenceWhitelist,
} from "./evidence";
import { parseSolarReturnGeminiOutput } from "./schema";
import { validateSolarReturnAstrologicalBasis } from "./validate";

export function assembleSolarReturnReportFromModelOutput(input: {
  rawText: string;
  engineInput: SolarReturnEngineInput;
  generatedAt?: string;
}): SolarReturnReport {
  const parsedReport = parseSolarReturnGeminiOutput(input.rawText);
  const evidence = buildSolarReturnEvidence({
    natalChart: input.engineInput.natalChart,
    solarReturn: input.engineInput.solarReturn,
  });
  const allowedEvidence = createEvidenceWhitelist(evidence);
  const basis = validateSolarReturnAstrologicalBasis(
    parsedReport,
    allowedEvidence,
  );

  if (!basis.ok) {
    throw new GeminiEngineError(
      "invented_evidence",
      "El modelo citó evidencia astrológica que no está en los datos cargados.",
    );
  }

  return {
    ...basis.report,
    metadata: {
      reportVersion: SOLAR_RETURN_REPORT_VERSION,
      methodologyVersion: SOLAR_RETURN_METHODOLOGY_VERSION,
      generatedAt: input.generatedAt ?? new Date().toISOString(),
      solarReturnId: input.engineInput.solarReturn.id,
      periodStart: input.engineInput.solarReturn.periodStart,
      periodEnd: input.engineInput.solarReturn.periodEnd,
    },
  };
}
