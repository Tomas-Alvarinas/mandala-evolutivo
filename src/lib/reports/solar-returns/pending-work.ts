import {
  classifyPendingProfessionalWork,
  getPendingWorkActionLabel,
  type PendingProfessionalWorkKind,
} from "@/lib/home/pending-work";
import type { SolarReturnReportStatus } from "./status";

export type PendingSolarReturnWorkKind = PendingProfessionalWorkKind;

export type PendingSolarReturnWorkItem = {
  reportId: string;
  clientId: string;
  solarReturnId: string;
  clientFirstName: string;
  clientLastName: string;
  status: SolarReturnReportStatus;
  kind: PendingSolarReturnWorkKind;
  updatedAt: string;
  contextLabel: string | null;
};

export function classifyPendingSolarReturnWork(input: {
  status: SolarReturnReportStatus;
  hasClientReport: boolean;
}) {
  return classifyPendingProfessionalWork(input);
}

export function getPendingSolarReturnWorkActionLabel(
  kind: PendingSolarReturnWorkKind,
) {
  return getPendingWorkActionLabel(kind);
}

export function getPendingSolarReturnWorkHref(input: {
  clientId: string;
  solarReturnId: string;
  reportId: string;
}) {
  return `/clients/${input.clientId}/solar-returns/${input.solarReturnId}/reports/${input.reportId}`;
}
