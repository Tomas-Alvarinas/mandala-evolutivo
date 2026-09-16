import {
  CRISTAL_PAULA_CORE,
  TRANSIT_REFERENCE_LENSES,
  TRANSIT_REFERENCE_LENSES_ENABLED,
} from "../methodology";
import { TRANSIT_ANALYSIS_INSTRUCTIONS } from "./instructions";

export function buildTransitAnalysisSystemInstruction(): string {
  const transitLenses = TRANSIT_REFERENCE_LENSES_ENABLED
    ? `

---

${TRANSIT_REFERENCE_LENSES}`
    : "";

  return `${CRISTAL_PAULA_CORE}${transitLenses}

---

${TRANSIT_ANALYSIS_INSTRUCTIONS}`;
}

export function buildTransitAnalysisUserPrompt(contextText: string): string {
  return `Generá el análisis integrado de Tránsitos y Eclipses para el siguiente consultante.

Devolvé exclusivamente un JSON que cumpla el schema recibido.

En cada astrologicalBasis usá únicamente cadenas de la lista de evidencia permitida, copiadas de forma exacta. No agregues “natal”, artículos, grados ni explicaciones.

No redescribas toda la Carta Natal. Interpretá qué partes se activan ahora.

Cuando una dinámica lo justifique, traducirla a uno o dos ejemplos cotidianos posibles, sin predecir hechos ni inventar situaciones reales.

No inventes biografía. No diagnostiques. No predijas hechos.

${contextText}`;
}
