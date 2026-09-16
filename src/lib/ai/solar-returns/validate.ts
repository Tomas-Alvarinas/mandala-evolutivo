import {
  SOLAR_RETURN_REPORT_SECTION_IDS,
  type SolarReturnReportSectionId,
} from "@/lib/reports/solar-returns/constants";
import type { ReportSection } from "@/lib/reports/natal-chart/types";
import type { GeminiSolarReturnReport } from "./schema";

export type InventedSolarReturnEvidence = {
  section: SolarReturnReportSectionId;
  value: string;
};

export type SolarReturnAstrologicalBasisValidation =
  | { ok: true; report: GeminiSolarReturnReport }
  | { ok: false; invented: InventedSolarReturnEvidence[] };

export function canonicalizeSolarReturnEvidence(
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

  return null;
}

export function validateSolarReturnAstrologicalBasis(
  report: GeminiSolarReturnReport,
  allowedEvidence: ReadonlySet<string>,
): SolarReturnAstrologicalBasisValidation {
  const invented: InventedSolarReturnEvidence[] = [];
  const nextReport = { ...report };

  for (const sectionId of SOLAR_RETURN_REPORT_SECTION_IDS) {
    const section = report[sectionId];

    if (!isReportSection(section)) {
      continue;
    }

    const seenInSection = new Set<string>();
    const canonicalBasis: string[] = [];

    for (const value of section.astrologicalBasis) {
      const received = value.trim();
      const canonical = canonicalizeSolarReturnEvidence(
        received,
        allowedEvidence,
      );

      if (canonical === null) {
        invented.push({ section: sectionId, value: received });
        continue;
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
