import type { SolarReturnReport } from "../types";
import type { SolarReturnClientReport } from "./types";

export type StoredSolarReturnClientReport = {
  id: string;
  clientId: string;
  solarReturnId: string;
  professionalReportId: string;
  sourceReport: SolarReturnReport;
  clientReport: SolarReturnClientReport;
  createdAt: string;
  updatedAt: string;
};
