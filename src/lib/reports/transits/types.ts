import type { ReportSection } from "@/lib/reports/natal-chart/types";

export type TransitAnalysisReportMetadata = {
  reportVersion: string;
  methodologyVersion: string;
  generatedAt: string;
  transitAnalysisId: string;
  analysisDate: string;
};

export type TransitAnalysisReport = {
  metadata: TransitAnalysisReportMetadata;
  mandalaImpact: ReportSection;
  activatedAreas: ReportSection;
  evolutionaryChallenges: ReportSection;
  availableResources: ReportSection;
  opportunities: ReportSection;
  learnings: ReportSection;
};
