/**
 * Equivalencia lexical controlada para Tránsitos.
 *
 * Solo inserta o quita el marcador de palabra "natal" en evidencias de
 * posición natal. La whitelist canónica sigue siendo la fuente de verdad.
 * No hay fuzzy matching ni inferencia de grados, orbes o aspectos.
 */

const NATAL_TOKEN = /^natal$/i;
const NATAL_SIGN_HOUSE = /^.+ en .+ — Casa \d+$/;
const NATAL_HOUSE_ONLY = /^.+ en Casa \d+$/;

export function stripNatalMarker(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter((token) => !NATAL_TOKEN.test(token))
    .join(" ");
}

export function isNatalPositionEvidenceFormat(value: string): boolean {
  const stripped = stripNatalMarker(value);

  if (/\ben tránsito\b/i.test(stripped) || /^Eclipse\b/i.test(stripped)) {
    return false;
  }

  return NATAL_SIGN_HOUSE.test(stripped) || NATAL_HOUSE_ONLY.test(stripped);
}

export function canonicalizeTransitEvidence(
  received: string,
  allowedEvidence: ReadonlySet<string>,
): string | null {
  const trimmed = received.trim();

  if (trimmed === "") {
    return null;
  }

  if (allowedEvidence.has(trimmed)) {
    return trimmed;
  }

  if (!isNatalPositionEvidenceFormat(trimmed)) {
    return null;
  }

  const receivedWithoutNatal = stripNatalMarker(trimmed);
  const matches: string[] = [];

  for (const canonical of allowedEvidence) {
    if (!isNatalPositionEvidenceFormat(canonical)) {
      continue;
    }

    if (stripNatalMarker(canonical) !== receivedWithoutNatal) {
      continue;
    }

    matches.push(canonical);
  }

  if (matches.length === 0) {
    return null;
  }

  if (matches.includes(receivedWithoutNatal)) {
    return receivedWithoutNatal;
  }

  return matches.slice().sort()[0] ?? null;
}

export function logNormalizedTransitEvidence(input: {
  received: string;
  canonical: string;
}): void {
  if (input.received === input.canonical) {
    return;
  }

  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.info("[ai.transits.evidence] normalized", {
    stage: "evidence_normalized",
    received: input.received,
    canonical: input.canonical,
  });
}
