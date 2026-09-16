import type { NatalChartClientReport } from "./types";
import { normalizePdfText } from "./normalize-pdf-text";
import { getClientReportWebPresentation } from "./prepare-web";

export function prepareClientReportForPdf(
  report: NatalChartClientReport,
): NatalChartClientReport {
  const normalized = normalizeClientReport(report);
  const presentation = getClientReportWebPresentation(normalized);

  return {
    ...normalized,
    introduction: presentation.hideIntroduction
      ? { content: "" }
      : normalized.introduction,
    closing: presentation.hideClosing ? { content: "" } : normalized.closing,
  };
}

function normalizeClientReport(
  report: NatalChartClientReport,
): NatalChartClientReport {
  return {
    ...report,
    cover: {
      title: normalizePdfText(report.cover.title),
      subtitle: normalizePdfText(report.cover.subtitle),
      clientName: normalizePdfText(report.cover.clientName),
    },
    introduction: {
      content: normalizePdfText(report.introduction.content),
    },
    sections: report.sections.map((section) => {
      switch (section.kind) {
        case "narrative":
          return {
            ...section,
            title: normalizePdfText(section.title),
            content: normalizePdfText(section.content),
          };
        case "list":
          return {
            ...section,
            title: normalizePdfText(section.title),
            items: section.items.map(normalizePdfText),
          };
        case "symbolsAndColors":
          return {
            ...section,
            title: normalizePdfText(section.title),
            symbols: section.symbols.map((item) => ({
              symbol: normalizePdfText(item.symbol),
              meaning: normalizePdfText(item.meaning),
            })),
            colors: section.colors.map((item) => ({
              color: normalizePdfText(item.color),
              intention: normalizePdfText(item.intention),
            })),
          };
        case "mandala":
          return {
            ...section,
            title: normalizePdfText(section.title),
            intention: normalizePdfText(section.intention),
            assignment: normalizePdfText(section.assignment),
            elements: section.elements.map(normalizePdfText),
            questions: section.questions.map(normalizePdfText),
          };
      }
    }),
    closing: {
      content: normalizePdfText(report.closing.content),
    },
  };
}
