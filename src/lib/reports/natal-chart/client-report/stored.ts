import type { NatalChartReport } from "../types";
import type { NatalChartClientReport } from "./types";

export type StoredNatalChartClientReport = {
  id: string;
  clientId: string;
  natalChartReportId: string;
  sourceReport: NatalChartReport;
  clientReport: NatalChartClientReport;
  createdAt: string;
  updatedAt: string;
};
