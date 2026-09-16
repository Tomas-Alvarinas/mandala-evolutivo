export type { SolarReturnClientReport, SolarReturnClientReportSection } from "./types";
export type { StoredSolarReturnClientReport } from "./stored";
export { solarReturnClientReportSchema } from "./schema";
export {
  buildSolarReturnClientReportSnapshot,
  canExecuteRefreshSolarReturnClientReportFromProfessional,
  shouldOfferRefreshSolarReturnClientReportFromProfessional,
  toSolarReturnClientReport,
  toSolarReturnClientReportRefreshWrite,
} from "./from-professional";
export { applySolarReturnClientReportEdits } from "./editorial";
export { areSolarReturnReportValuesStructurallyEqual } from "./equality";
export { isSolarReturnClientReportSourceOutdated } from "./source-outdated";
export {
  getSolarReturnProfessionalReportNextStep,
  shouldOfferPrepareSolarReturnClientReport,
} from "./primary-action";
