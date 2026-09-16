import {
  TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  type TransitAnalysisReportSectionId,
} from "@/lib/reports";
import type { ReportSection } from "@/lib/reports/natal-chart/types";
import type { GeminiTransitAnalysisReport } from "./schema";
import {
  canonicalizeTransitEvidence,
  logNormalizedTransitEvidence,
} from "./evidence-normalize";

export type InventedTransitEvidence = {
  section: TransitAnalysisReportSectionId;
  value: string;
};

export type TransitAstrologicalBasisValidation =
  | { ok: true; report: GeminiTransitAnalysisReport }
  | { ok: false; invented: InventedTransitEvidence[] };

export function validateTransitAstrologicalBasis(
  report: GeminiTransitAnalysisReport,
  allowedEvidence: ReadonlySet<string>,
): TransitAstrologicalBasisValidation {
  const invented: InventedTransitEvidence[] = [];
  const nextReport = { ...report };

  for (const sectionId of TRANSIT_ANALYSIS_REPORT_SECTION_IDS) {
    const section = report[sectionId];

    if (!isReportSection(section)) {
      continue;
    }

    const seenInSection = new Set<string>();
    const canonicalBasis: string[] = [];

    for (const value of section.astrologicalBasis) {
      const received = value.trim();
      const canonical = canonicalizeTransitEvidence(
        received,
        allowedEvidence,
      );

      if (canonical === null) {
        invented.push({ section: sectionId, value: received });
        continue;
      }

      if (received !== canonical) {
        logNormalizedTransitEvidence({ received, canonical });
      }

      if (seenInSection.has(canonical)) {
        continue;
      }

      seenInSection.add(canonical);
      canonicalBasis.push(canonical);
    }

    nextReport[sectionId] = {
      ...section,
      astrologicalBasis: canonicalBasis,
    };
  }

  if (invented.length > 0) {
    return { ok: false, invented };
  }

  return { ok: true, report: nextReport };
}

function isReportSection(value: unknown): value is ReportSection {
  return (
    typeof value === "object" &&
    value !== null &&
    "content" in value &&
    "astrologicalBasis" in value
  );
}
