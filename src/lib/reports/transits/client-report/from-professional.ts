import { transitAnalysisReportSchema } from "@/lib/ai/transits/schema";
import type { TransitAnalysisReportStatus } from "../status";
import type { TransitAnalysisReport } from "../types";
import { transitClientReportSchema } from "./schema";
import type { TransitClientReport } from "./types";

export type TransitClientReportFromProfessionalResult =
  | {
      status: "ok";
      sourceReport: TransitAnalysisReport;
      clientReport: TransitClientReport;
    }
  | { status: "not_ready" }
  | { status: "invalid" };

export function shouldOfferRefreshTransitClientReportFromProfessional(
  sourceOutdated: boolean,
) {
  return sourceOutdated;
}

export function canExecuteRefreshTransitClientReportFromProfessional(input: {
  sourceOutdated: boolean;
  professionalStatus: TransitAnalysisReportStatus;
}) {
  return input.sourceOutdated && input.professionalStatus === "ready";
}

export function toTransitClientReport(
  professionalReport: TransitAnalysisReport,
): TransitClientReport {
  return {
    mandalaImpact: { content: professionalReport.mandalaImpact.content },
    activatedAreas: { content: professionalReport.activatedAreas.content },
    evolutionaryChallenges: {
      content: professionalReport.evolutionaryChallenges.content,
    },
    availableResources: {
      content: professionalReport.availableResources.content,
    },
    opportunities: { content: professionalReport.opportunities.content },
    learnings: { content: professionalReport.learnings.content },
  };
}

export function buildTransitClientReportSnapshot(input: {
  professionalReport: unknown;
  professionalStatus: TransitAnalysisReportStatus;
}): TransitClientReportFromProfessionalResult {
  if (input.professionalStatus !== "ready") {
    return { status: "not_ready" };
  }

  const sourceReport = transitAnalysisReportSchema.safeParse(
    input.professionalReport,
  );

  if (!sourceReport.success) {
    return { status: "invalid" };
  }

  const built = toTransitClientReport(sourceReport.data);
  const parsedClientReport = transitClientReportSchema.safeParse(built);

  if (!parsedClientReport.success) {
    return { status: "invalid" };
  }

  return {
    status: "ok",
    sourceReport: sourceReport.data,
    clientReport: parsedClientReport.data,
  };
}

export function toTransitClientReportRefreshWrite(input: {
  sourceReport: TransitAnalysisReport;
  clientReport: TransitClientReport;
}) {
  return {
    source_report: input.sourceReport,
    client_report: input.clientReport,
  };
}
