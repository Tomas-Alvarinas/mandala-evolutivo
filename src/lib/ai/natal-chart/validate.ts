import {
  NARRATIVE_NATAL_CHART_REPORT_SECTION_IDS,
  type NatalChartReportSectionId,
  type ReportSection,
} from "@/lib/reports";
import type { GeminiNatalChartReport } from "./schema";

export type InventedEvidence = {
  section: NatalChartReportSectionId;
  value: string;
};

export type AstrologicalBasisValidation =
  | { ok: true }
  | { ok: false; invented: InventedEvidence[] };

export function validateAstrologicalBasis(
  report: GeminiNatalChartReport,
  allowedEvidence: ReadonlySet<string>,
): AstrologicalBasisValidation {
  const invented: InventedEvidence[] = [];

  for (const sectionId of NARRATIVE_NATAL_CHART_REPORT_SECTION_IDS) {
    const section = report[sectionId];

    if (!isReportSection(section)) {
      continue;
    }

    for (const value of section.astrologicalBasis) {
      const normalized = value.trim();

      if (!allowedEvidence.has(normalized)) {
        invented.push({ section: sectionId, value: normalized });
      }
    }
  }

  if (invented.length > 0) {
    return { ok: false, invented };
  }

  return { ok: true };
}

function isReportSection(value: unknown): value is ReportSection {
  return (
    typeof value === "object" &&
    value !== null &&
    "content" in value &&
    "astrologicalBasis" in value
  );
}
