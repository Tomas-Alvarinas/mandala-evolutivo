/**
 * Modelo por defecto para el análisis de Carta Natal.
 *
 * gemini-2.5-pro:
 * - soporte oficial de Structured Outputs
 * - thinking interno por defecto
 * - 65.536 tokens de salida (necesario para 26 secciones)
 * - estable, no preview
 * - pensado para análisis textual complejo
 *
 * Alternativas para pruebas A/B: gemini-3.5-flash, gemini-3.6-flash.
 * Cambiar únicamente esta constante.
 */
export const GEMINI_NATAL_CHART_MODEL = "gemini-3.6-flash";

/** Tiempo máximo de espera de red. Un informe largo con thinking puede tardar. */
export const GEMINI_NATAL_CHART_TIMEOUT_MS = 300_000;

export function getGeminiApiKey(): string | null {
  const value = process.env.GEMINI_API_KEY?.trim();
  return value ? value : null;
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey() !== null;
}
