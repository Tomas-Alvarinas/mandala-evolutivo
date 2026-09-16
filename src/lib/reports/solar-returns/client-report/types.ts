import type { SolarReturnReportSectionId } from "../constants";

export type SolarReturnClientReportSection = {
  content: string;
};

export type SolarReturnClientReport = Record<
  SolarReturnReportSectionId,
  SolarReturnClientReportSection
>;
