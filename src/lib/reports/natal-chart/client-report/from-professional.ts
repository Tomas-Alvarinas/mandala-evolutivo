import { natalChartReportSchema } from "@/lib/ai/natal-chart/schema";
import type { NatalChartReportStatus } from "../status";
import type { NatalChartReport } from "../types";
import { buildNatalChartClientReport } from "./build";
import { natalChartClientReportSchema } from "./schema";
import type { NatalChartClientReport } from "./types";

export type ClientReportFromProfessionalResult =
  | {
      status: "ok";
      sourceReport: NatalChartReport;
      clientReport: NatalChartClientReport;
    }
  | { status: "not_ready" }
  | { status: "invalid" };

export function shouldOfferRefreshClientReportFromProfessional(
  sourceOutdated: boolean,
) {
  return sourceOutdated;
}

export function canExecuteRefreshClientReportFromProfessional(input: {
  sourceOutdated: boolean;
  professionalStatus: NatalChartReportStatus;
}) {
  return input.sourceOutdated && input.professionalStatus === "ready";
}

export function buildClientReportSnapshotFromProfessional(input: {
  professionalReport: unknown;
  professionalStatus: NatalChartReportStatus;
  clientName: string;
  createdAt?: string;
}): ClientReportFromProfessionalResult {
  if (input.professionalStatus !== "ready") {
    return { status: "not_ready" };
  }

  const sourceReport = natalChartReportSchema.safeParse(input.professionalReport);

  if (!sourceReport.success) {
    return { status: "invalid" };
  }

  const built = buildNatalChartClientReport({
    report: sourceReport.data,
    clientName: input.clientName,
    createdAt: input.createdAt,
  });
  const parsedClientReport = natalChartClientReportSchema.safeParse(built);

  if (!parsedClientReport.success) {
    return { status: "invalid" };
  }

  return {
    status: "ok",
    sourceReport: sourceReport.data,
    clientReport: parsedClientReport.data,
  };
}

export function toClientReportRefreshWrite(input: {
  sourceReport: NatalChartReport;
  clientReport: NatalChartClientReport;
}) {
  return {
    source_report: input.sourceReport,
    client_report: input.clientReport,
  };
}
