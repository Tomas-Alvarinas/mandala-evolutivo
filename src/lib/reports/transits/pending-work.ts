import {
  classifyPendingProfessionalWork,
  getPendingWorkActionLabel,
  type PendingProfessionalWorkKind,
} from "@/lib/home/pending-work";
import type { TransitAnalysisReportStatus } from "./status";

export type PendingTransitAnalysisWorkKind = PendingProfessionalWorkKind;

export type PendingTransitAnalysisWorkItem = {
  reportId: string;
  clientId: string;
  transitAnalysisId: string;
  clientFirstName: string;
  clientLastName: string;
  status: TransitAnalysisReportStatus;
  kind: PendingTransitAnalysisWorkKind;
  updatedAt: string;
  contextLabel: string | null;
};

export function classifyPendingTransitAnalysisWork(input: {
  status: TransitAnalysisReportStatus;
  hasClientReport: boolean;
}) {
  return classifyPendingProfessionalWork(input);
}

export function getPendingTransitAnalysisWorkActionLabel(
  kind: PendingTransitAnalysisWorkKind,
) {
  return getPendingWorkActionLabel(kind);
}

export function getPendingTransitAnalysisWorkHref(input: {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
}) {
  return `/clients/${input.clientId}/transits/${input.transitAnalysisId}/reports/${input.reportId}`;
}
