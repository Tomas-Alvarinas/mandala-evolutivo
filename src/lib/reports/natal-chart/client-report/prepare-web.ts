import type { NatalChartClientReport } from "./types";
import { arePdfTextsEquivalent } from "./normalize-pdf-text";

export type ClientReportWebPresentation = {
  hideIntroduction: boolean;
  hideClosing: boolean;
};

export function getClientReportWebPresentation(
  report: NatalChartClientReport,
): ClientReportWebPresentation {
  const first = report.sections[0];
  const last = report.sections[report.sections.length - 1];

  return {
    hideIntroduction:
      first?.kind === "narrative" &&
      arePdfTextsEquivalent(report.introduction.content, first.content),
    hideClosing:
      last?.kind === "narrative" &&
      arePdfTextsEquivalent(report.closing.content, last.content),
  };
}
