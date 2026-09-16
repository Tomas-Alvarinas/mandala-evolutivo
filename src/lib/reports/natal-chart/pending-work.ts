import {
  classifyPendingProfessionalWork,
  getPendingWorkActionLabel,
  selectPendingWork,
  type PendingProfessionalWorkKind,
} from "@/lib/home/pending-work";
import type { NatalChartReportStatus } from "./status";

export type PendingNatalChartWorkKind = PendingProfessionalWorkKind;

export type PendingNatalChartWorkItem = {
  reportId: string;
  clientId: string;
  clientFirstName: string;
  clientLastName: string;
  status: NatalChartReportStatus;
  kind: PendingNatalChartWorkKind;
  updatedAt: string;
};

export function classifyPendingNatalChartWork(input: {
  status: NatalChartReportStatus;
  hasClientReport: boolean;
}): PendingNatalChartWorkKind | null {
  return classifyPendingProfessionalWork(input);
}

export function getPendingNatalChartWorkActionLabel(
  kind: PendingNatalChartWorkKind,
) {
  return getPendingWorkActionLabel(kind);
}

export function getPendingNatalChartWorkHref(input: {
  clientId: string;
  reportId: string;
}) {
  return `/clients/${input.clientId}/reports/${input.reportId}`;
}

export function selectPendingNatalChartWork<T extends { updatedAt: string }>(
  items: T[],
  limit: number,
): { items: T[]; hasMore: boolean } {
  return selectPendingWork(items, limit);
}
