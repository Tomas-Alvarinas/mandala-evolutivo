import type { NatalChartReportStatus } from "./status";
import type { NatalChartReport } from "./types";

export type StoredNatalChartReportSummary = {
  id: string;
  clientId: string;
  natalChartId: string;
  reportVersion: string;
  paulaLensVersion: string;
  geminiModel: string;
  status: NatalChartReportStatus;
  createdAt: string;
};

export type StoredNatalChartReport = StoredNatalChartReportSummary & {
  report: NatalChartReport;
  generatedReport: NatalChartReport;
  generationDurationMs: number | null;
  updatedAt: string;
};

export function sortNatalChartReportSummariesLatestFirst<
  T extends { createdAt: string },
>(items: readonly T[]): T[] {
  return [...items].sort((left, right) => {
    const rightTime = Date.parse(right.createdAt);
    const leftTime = Date.parse(left.createdAt);

    if (Number.isNaN(rightTime) || Number.isNaN(leftTime)) {
      return 0;
    }

    return rightTime - leftTime;
  });
}

export function getLatestNatalChartReportSummary<
  T extends { id: string; createdAt: string },
>(items: readonly T[]): T | null {
  return sortNatalChartReportSummariesLatestFirst(items)[0] ?? null;
}

export function isLatestNatalChartReportSummary<
  T extends { id: string; createdAt: string },
>(item: T, items: readonly T[]): boolean {
  return getLatestNatalChartReportSummary(items)?.id === item.id;
}
