export {
  SOLAR_RETURN_METHODOLOGY_VERSION,
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_SECTION_LABELS,
  SOLAR_RETURN_REPORT_VERSION,
  getSolarReturnReportSectionLabel,
} from "./constants";

export type { SolarReturnReportSectionId } from "./constants";

export type {
  SolarReturnReport,
  SolarReturnReportMetadata,
} from "./types";

export {
  SOLAR_RETURN_REPORT_DETAIL_COLUMNS,
  SOLAR_RETURN_REPORT_FULL_SELECT,
  SOLAR_RETURN_REPORT_SUMMARY_COLUMNS,
  SOLAR_RETURN_REPORT_SUMMARY_SELECT,
  getLatestSolarReturnReportSummary,
  isLatestSolarReturnReportSummary,
  mapSolarReturnReportRow,
  mapSolarReturnReportSummaryRow,
  parseStoredSolarReturnReport,
  solarReturnReportOwnershipMatches,
  sortSolarReturnReportSummariesLatestFirst,
} from "./stored";

export type {
  SolarReturnReportRecord,
  SolarReturnReportRow,
  SolarReturnReportSummary,
  SolarReturnReportSummaryRow,
} from "./stored";

export type { SolarReturnReportStatus } from "./status";

export {
  SOLAR_RETURN_REPORT_DEFAULT_STATUS,
  SOLAR_RETURN_REPORT_STATUSES,
  SOLAR_RETURN_REPORT_STATUS_LABELS,
  getSolarReturnReportStatusLabel,
  isSolarReturnReportStatus,
  parseSolarReturnReportStatus,
} from "./status";

export { applySolarReturnProfessionalEdits } from "./editorial";

export {
  classifyPendingSolarReturnWork,
  getPendingSolarReturnWorkActionLabel,
  getPendingSolarReturnWorkHref,
} from "./pending-work";
export type {
  PendingSolarReturnWorkItem,
  PendingSolarReturnWorkKind,
} from "./pending-work";

export { createSampleSolarReturnReport } from "./sample";

export {
  canExecuteRefreshSolarReturnClientReportFromProfessional,
  getSolarReturnProfessionalReportNextStep,
  isSolarReturnClientReportSourceOutdated,
  shouldOfferPrepareSolarReturnClientReport,
  shouldOfferRefreshSolarReturnClientReportFromProfessional,
  toSolarReturnClientReport,
} from "./client-report";

export type { SolarReturnClientReport } from "./client-report";
