import {
  ASTROLOGY_REFERENCE_LENSES,
  ASTROLOGY_REFERENCE_LENSES_ENABLED,
  PAULA_LENS,
} from "../methodology";
import { NATAL_CHART_ANALYSIS_INSTRUCTIONS } from "./instructions";

export function buildNatalChartSystemInstruction(): string {
  const experimentalLenses = ASTROLOGY_REFERENCE_LENSES_ENABLED
    ? `

---

${ASTROLOGY_REFERENCE_LENSES}`
    : "";

  return `${PAULA_LENS}${experimentalLenses}

---

${NATAL_CHART_ANALYSIS_INSTRUCTIONS}`;
}

export function buildNatalChartUserPrompt(contextText: string): string {
  return `Generá el análisis integrado de Carta Natal para el siguiente consultante.

Devolvé exclusivamente un JSON que cumpla el schema recibido.

En cada astrologicalBasis usá únicamente cadenas de la lista de evidencia permitida, copiadas de forma exacta.

Cuando un planeta aparezca como regente de una casa, cruzalo con su posición natal y con sus aspectos o configuraciones cargados si aportan. No inventes regentes.

No inventes biografía ni historia familiar. No diagnostiques. No predijas.

${contextText}`;
}
