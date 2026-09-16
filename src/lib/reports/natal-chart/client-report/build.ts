import { NARRATIVE_NATAL_CHART_REPORT_SECTION_IDS } from "../constants";
import type { NatalChartReport } from "../types";
import {
  NATAL_CHART_CLIENT_REPORT_COVER_SUBTITLE,
  NATAL_CHART_CLIENT_REPORT_COVER_TITLE,
  NATAL_CHART_CLIENT_REPORT_VERSION,
} from "./constants";
import { NATAL_CHART_CLIENT_SECTION_ORDER, getNatalChartClientSectionTitle } from "./titles";
import type {
  NatalChartClientReport,
  NatalChartClientSection,
} from "./types";

export function buildNatalChartClientReport(input: {
  report: NatalChartReport;
  clientName: string;
  createdAt?: string;
}): NatalChartClientReport {
  const createdAt = input.createdAt ?? new Date().toISOString();

  return {
    metadata: {
      version: NATAL_CHART_CLIENT_REPORT_VERSION,
      createdAt,
    },
    cover: {
      title: NATAL_CHART_CLIENT_REPORT_COVER_TITLE,
      subtitle: NATAL_CHART_CLIENT_REPORT_COVER_SUBTITLE,
      clientName: input.clientName,
    },
    introduction: {
      content: input.report.evolutionaryMandalaSummary.content,
    },
    sections: NATAL_CHART_CLIENT_SECTION_ORDER.map((sectionId) =>
      toClientSection(sectionId, input.report),
    ),
    closing: {
      content: input.report.finalSynthesis.content,
    },
  };
}

function toClientSection(
  sectionId: (typeof NATAL_CHART_CLIENT_SECTION_ORDER)[number],
  report: NatalChartReport,
): NatalChartClientSection {
  const title = getNatalChartClientSectionTitle(sectionId);

  switch (sectionId) {
    case "beliefsToExplore":
      return {
        sourceSectionId: sectionId,
        kind: "list",
        title,
        items: [...report.beliefsToExplore],
      };
    case "byronKatieQuestions":
      return {
        sourceSectionId: sectionId,
        kind: "list",
        title,
        items: [...report.byronKatieQuestions],
      };
    case "practicalActions":
      return {
        sourceSectionId: sectionId,
        kind: "list",
        title,
        items: [...report.practicalActions],
      };
    case "empoweringWords":
      return {
        sourceSectionId: sectionId,
        kind: "list",
        title,
        items: [...report.empoweringWords],
      };
    case "symbolsAndColors":
      return {
        sourceSectionId: sectionId,
        kind: "symbolsAndColors",
        title,
        symbols: report.symbolsAndColors.symbols.map((item) => ({ ...item })),
        colors: report.symbolsAndColors.colors.map((item) => ({ ...item })),
      };
    case "mandalaIntervention":
      return {
        sourceSectionId: sectionId,
        kind: "mandala",
        title,
        intention: report.mandalaIntervention.intention,
        assignment: report.mandalaIntervention.assignment,
        elements: [...report.mandalaIntervention.suggestedElements],
        questions: [...report.mandalaIntervention.processQuestions],
      };
    default:
      if (!isNarrativeSectionId(sectionId)) {
        throw new Error(`Unsupported natal chart section: ${sectionId}`);
      }

      return {
        sourceSectionId: sectionId,
        kind: "narrative",
        title,
        content: report[sectionId].content,
      };
  }
}

function isNarrativeSectionId(
  sectionId: (typeof NATAL_CHART_CLIENT_SECTION_ORDER)[number],
): sectionId is (typeof NARRATIVE_NATAL_CHART_REPORT_SECTION_IDS)[number] {
  return NARRATIVE_NATAL_CHART_REPORT_SECTION_IDS.includes(
    sectionId as (typeof NARRATIVE_NATAL_CHART_REPORT_SECTION_IDS)[number],
  );
}
