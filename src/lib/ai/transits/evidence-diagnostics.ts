import type { TransitAnalysisReportSectionId } from "@/lib/reports";
import type { InventedTransitEvidence } from "./validate";

export const TRANSIT_EVIDENCE_DIAGNOSTIC_LOG_PREFIX = "[ai.transits.evidence]";

const STOP_WORDS = new Set([
  "a",
  "al",
  "de",
  "del",
  "el",
  "en",
  "la",
  "las",
  "lo",
  "los",
  "por",
  "un",
  "una",
  "y",
]);

const MAX_CLOSEST_ALLOWED = 3;
const FORMAT_MISMATCH_JACCARD = 0.45;
const MIN_CLOSEST_JACCARD = 0.2;

export type TransitEvidenceRejectReason =
  | "no_exact_match"
  | "invalid_duplicate"
  | "unexpected_format";

export type TransitEvidenceMismatchClass =
  | "format_mismatch"
  | "unsupported_inference"
  | "unknown_reference";

export type TransitEvidenceDiagnostic = {
  section: TransitAnalysisReportSectionId;
  received: string;
  reasons: TransitEvidenceRejectReason[];
  classification: TransitEvidenceMismatchClass;
  closestAllowed: string[];
};

export function diagnoseRejectedTransitEvidence(input: {
  invented: InventedTransitEvidence[];
  allowedEvidence: ReadonlySet<string>;
}): TransitEvidenceDiagnostic[] {
  const seen = new Map<string, number>();
  const allowed = [...input.allowedEvidence];

  return input.invented.map((item) => {
    const key = `${item.section}:${item.value}`;
    const count = (seen.get(key) ?? 0) + 1;
    seen.set(key, count);

    const reasons: TransitEvidenceRejectReason[] = ["no_exact_match"];

    if (count > 1) {
      reasons.push("invalid_duplicate");
    }

    if (hasUnexpectedFormat(item.value)) {
      reasons.push("unexpected_format");
    }

    const closestAllowed = findClosestAllowed(item.value, allowed);

    return {
      section: item.section,
      received: item.value,
      reasons,
      classification: classifyMismatch(item.value, closestAllowed, allowed),
      closestAllowed,
    };
  });
}

export function logRejectedTransitEvidence(input: {
  invented: InventedTransitEvidence[];
  allowedEvidence: ReadonlySet<string>;
  model: string;
  reportVersion: string;
  methodologyVersion: string;
}): TransitEvidenceDiagnostic[] {
  const diagnostics = diagnoseRejectedTransitEvidence(input);

  for (const diagnostic of diagnostics) {
    console.info(`${TRANSIT_EVIDENCE_DIAGNOSTIC_LOG_PREFIX} rejected`, {
      stage: "evidence_mismatch",
      section: diagnostic.section,
      received: diagnostic.received,
      reasons: diagnostic.reasons,
      classification: diagnostic.classification,
      closestAllowed: diagnostic.closestAllowed,
      model: input.model,
      reportVersion: input.reportVersion,
      methodologyVersion: input.methodologyVersion,
    });
  }

  return diagnostics;
}

export function hasUnexpectedFormat(value: string): boolean {
  return (
    /\d+\s*°/.test(value) ||
    /\borbe\b/i.test(value) ||
    /\borb\b/i.test(value) ||
    value.includes(" · ") ||
    /\btransitando\b/i.test(value) ||
    /\ben casa \d/i.test(value)
  );
}

function classifyMismatch(
  received: string,
  closestAllowed: string[],
  allowed: string[],
): TransitEvidenceMismatchClass {
  const receivedTokens = tokenize(received);
  const best = closestAllowed[0];
  const bestTokens = best ? tokenize(best) : [];
  const bestJaccard = best ? jaccard(receivedTokens, bestTokens) : 0;
  const bestTokenSet = new Set(bestTokens);
  const extraTokens = receivedTokens.filter((token) => !bestTokenSet.has(token));
  const receivedNumbers = numbersIn(receivedTokens);
  const bestNumbers = new Set(numbersIn(bestTokens));
  const hasForeignNumber = receivedNumbers.some(
    (value) => !bestNumbers.has(value),
  );

  if (hasForeignNumber) {
    return "unsupported_inference";
  }

  const otherAllowed = allowed.filter((item) => item !== best);
  const extraFromOtherEvidence = extraTokens.filter((token) =>
    otherAllowed.some((item) => tokenize(item).includes(token)),
  );

  if (extraFromOtherEvidence.length >= 2) {
    return "unsupported_inference";
  }

  if (bestJaccard >= FORMAT_MISMATCH_JACCARD) {
    return "format_mismatch";
  }

  const corpus = new Set(allowed.flatMap((item) => tokenize(item)));
  const overlap = receivedTokens.filter((token) => corpus.has(token));

  if (overlap.length >= 2) {
    return "unsupported_inference";
  }

  return "unknown_reference";
}

function numbersIn(tokens: string[]): string[] {
  return tokens.filter((token) => /^\d+$/.test(token));
}

function findClosestAllowed(received: string, allowed: string[]): string[] {
  const receivedTokens = tokenize(received);

  return allowed
    .map((candidate) => ({
      candidate,
      score: jaccard(receivedTokens, tokenize(candidate)),
    }))
    .filter((item) => item.score >= MIN_CLOSEST_JACCARD)
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_CLOSEST_ALLOWED)
    .map((item) => item.candidate);
}

function jaccard(left: string[], right: string[]): number {
  if (left.length === 0 || right.length === 0) {
    return 0;
  }

  const rightSet = new Set(right);
  const intersection = left.filter((token) => rightSet.has(token)).length;
  const union = new Set([...left, ...right]).size;

  if (union === 0) {
    return 0;
  }

  return intersection / union;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token));
}
