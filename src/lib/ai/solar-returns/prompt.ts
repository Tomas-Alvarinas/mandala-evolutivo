import {
  CRISTAL_PAULA_CORE,
  SOLAR_RETURN_REFERENCE_LENSES,
  SOLAR_RETURN_REFERENCE_LENSES_ENABLED,
} from "../methodology";
import { SOLAR_RETURN_ANALYSIS_INSTRUCTIONS } from "./instructions";

export function buildSolarReturnSystemInstruction(): string {
  const solarReturnLenses = SOLAR_RETURN_REFERENCE_LENSES_ENABLED
    ? `

---

${SOLAR_RETURN_REFERENCE_LENSES}`
    : "";

  return `${CRISTAL_PAULA_CORE}${solarReturnLenses}

---

${SOLAR_RETURN_ANALYSIS_INSTRUCTIONS}`;
}

export function buildSolarReturnUserPrompt(contextText: string): string {
  return `Generá el análisis integrado de Revolución Solar para el siguiente consultante.

Devolvé exclusivamente un JSON que cumpla el schema recibido.

En cada astrologicalBasis usá únicamente cadenas de la lista de evidencia permitida, copiadas de forma exacta. No agregues grados, orbes, artículos ni explicaciones.

No interpretes la Revolución Solar como carta aislada. La Carta Natal es la matriz de referencia.

No calcules astrología. No descubras posiciones, casas, aspectos, superposiciones ni contactos no cargados.

Cuando una dinámica lo justifique, traducirla a uno o dos ejemplos cotidianos posibles, sin predecir hechos ni inventar situaciones reales.

No inventes biografía. No diagnostiques. No predijas hechos.

${contextText}`;
}
