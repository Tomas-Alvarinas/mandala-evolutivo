import type { TransitAnalysisReportSectionId } from "../constants";

export type TransitClientReportSection = {
  content: string;
};

export type TransitClientReport = Record<
  TransitAnalysisReportSectionId,
  TransitClientReportSection
>;
