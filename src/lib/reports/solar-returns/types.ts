import type { ReportSection } from "@/lib/reports/natal-chart/types";

export type SolarReturnReportMetadata = {
  reportVersion: string;
  methodologyVersion: string;
  generatedAt: string;
  solarReturnId: string;
  periodStart: string;
  periodEnd: string;
};

export type SolarReturnReport = {
  metadata: SolarReturnReportMetadata;
  annualTheme: ReportSection;
  solarAscendant: ReportSection;
  ascendantRuler: ReportSection;
  sunDirection: ReportSection;
  emotionalWorld: ReportSection;
  personalPlanets: ReportSection;
  energyConcentration: ReportSection;
  lifeAreas: ReportSection;
  evolutionaryChallenges: ReportSection;
  opportunities: ReportSection;
  learnings: ReportSection;
  evolutionarySynthesis: ReportSection;
};
