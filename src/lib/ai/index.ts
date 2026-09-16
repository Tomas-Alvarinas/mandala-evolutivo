export {
  CRISTAL_PAULA_CORE,
  PAULA_LENS,
  PAULA_LENS_NAME,
  PAULA_LENS_VERSION,
} from "./methodology";

export {
  NATAL_CHART_ANALYSIS_INSTRUCTIONS,
  buildNatalChartContext,
  buildNatalChartEvidence,
  generateNatalChartReport,
  getNatalChartGenerationTrace,
  validateAstrologicalBasis,
  type NatalChartAnalysisInput,
} from "./natal-chart";

export {
  buildTransitAnalysisContext,
  buildTransitAnalysisEvidence,
  generateTransitAnalysisReport,
  getTransitAnalysisGenerationTrace,
  validateTransitAstrologicalBasis,
} from "./transits";

export {
  buildSolarReturnContext,
  buildSolarReturnEvidence,
  generateSolarReturnReport,
  getSolarReturnGenerationTrace,
  validateSolarReturnAstrologicalBasis,
} from "./solar-returns";

export {
  GEMINI_NATAL_CHART_MODEL,
  isGeminiConfigured,
} from "./gemini/config";
export {
  GeminiEngineError,
  isGeminiEngineError,
} from "./gemini/errors";
