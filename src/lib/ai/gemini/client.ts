import "server-only";

import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from "./config";
import { GeminiEngineError } from "./errors";

export function createGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new GeminiEngineError(
      "missing_api_key",
      "Falta configurar GEMINI_API_KEY para generar el informe.",
    );
  }

  // El SDK 2.19.0 usa v1beta por defecto. Interactions está GA en v1.
  return new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: "v1" },
  });
}
