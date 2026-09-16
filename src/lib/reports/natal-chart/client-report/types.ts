import type { NatalChartReportSectionId } from "../constants";

export type NatalChartClientReportMetadata = {
  version: string;
  createdAt: string;
};

export type NatalChartClientCover = {
  title: string;
  subtitle: string;
  clientName: string;
};

export type NatalChartClientNarrativeSection = {
  sourceSectionId: NatalChartReportSectionId;
  kind: "narrative";
  title: string;
  content: string;
};

export type NatalChartClientListSection = {
  sourceSectionId: NatalChartReportSectionId;
  kind: "list";
  title: string;
  items: string[];
};

export type NatalChartClientSymbolsSection = {
  sourceSectionId: NatalChartReportSectionId;
  kind: "symbolsAndColors";
  title: string;
  symbols: Array<{
    symbol: string;
    meaning: string;
  }>;
  colors: Array<{
    color: string;
    intention: string;
  }>;
};

export type NatalChartClientMandalaSection = {
  sourceSectionId: NatalChartReportSectionId;
  kind: "mandala";
  title: string;
  intention: string;
  assignment: string;
  elements: string[];
  questions: string[];
};

export type NatalChartClientSection =
  | NatalChartClientNarrativeSection
  | NatalChartClientListSection
  | NatalChartClientSymbolsSection
  | NatalChartClientMandalaSection;

export type NatalChartClientReport = {
  metadata: NatalChartClientReportMetadata;
  cover: NatalChartClientCover;
  introduction: {
    content: string;
  };
  sections: NatalChartClientSection[];
  closing: {
    content: string;
  };
};
