import type { TransitAnalysisReport } from "../types";
import type { TransitClientReport } from "./types";

export type StoredTransitClientReport = {
  id: string;
  clientId: string;
  transitAnalysisId: string;
  professionalReportId: string;
  sourceReport: TransitAnalysisReport;
  clientReport: TransitClientReport;
  createdAt: string;
  updatedAt: string;
};
