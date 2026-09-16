import { solarReturnReportSchema } from "@/lib/ai/solar-returns/schema";
import { SOLAR_RETURN_REPORT_SECTION_IDS } from "../constants";
import type { SolarReturnReportStatus } from "../status";
import type { SolarReturnReport } from "../types";
import { solarReturnClientReportSchema } from "./schema";
import type { SolarReturnClientReport } from "./types";

export type SolarReturnClientReportFromProfessionalResult =
  | {
      status: "ok";
      sourceReport: SolarReturnReport;
      clientReport: SolarReturnClientReport;
    }
  | { status: "not_ready" }
  | { status: "invalid" };

export function shouldOfferRefreshSolarReturnClientReportFromProfessional(
  sourceOutdated: boolean,
) {
  return sourceOutdated;
}

export function canExecuteRefreshSolarReturnClientReportFromProfessional(input: {
  sourceOutdated: boolean;
  professionalStatus: SolarReturnReportStatus;
}) {
  return input.sourceOutdated && input.professionalStatus === "ready";
}

export function toSolarReturnClientReport(
  professionalReport: SolarReturnReport,
): SolarReturnClientReport {
  const next = {} as SolarReturnClientReport;

  for (const sectionId of SOLAR_RETURN_REPORT_SECTION_IDS) {
    next[sectionId] = { content: professionalReport[sectionId].content };
  }

  return next;
}

export function buildSolarReturnClientReportSnapshot(input: {
  professionalReport: unknown;
  professionalStatus: SolarReturnReportStatus;
}): SolarReturnClientReportFromProfessionalResult {
  if (input.professionalStatus !== "ready") {
    return { status: "not_ready" };
  }

  const sourceReport = solarReturnReportSchema.safeParse(
    input.professionalReport,
  );

  if (!sourceReport.success) {
    return { status: "invalid" };
  }

  const built = toSolarReturnClientReport(sourceReport.data);
  const parsedClientReport = solarReturnClientReportSchema.safeParse(built);

  if (!parsedClientReport.success) {
    return { status: "invalid" };
  }

  return {
    status: "ok",
    sourceReport: sourceReport.data,
    clientReport: parsedClientReport.data,
  };
}

export function toSolarReturnClientReportRefreshWrite(input: {
  sourceReport: SolarReturnReport;
  clientReport: SolarReturnClientReport;
}) {
  return {
    source_report: input.sourceReport,
    client_report: input.clientReport,
  };
}
