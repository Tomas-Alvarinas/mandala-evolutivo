import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { NatalChartReportStatusBadge } from "@/components/reports/NatalChartReportStatusBadge";
import {
  ReportVersionNav,
  type ReportVersionId,
} from "@/components/reports/ReportVersionNav";
import { TextLink } from "@/components/ui/TextLink";
import { formatGeneratedOnEs } from "@/lib/dates";
import type { NatalChartReportStatus } from "@/lib/reports";

type NatalChartReportWorkspaceProps = {
  clientId: string;
  reportId: string;
  clientName: string;
  createdAt: string;
  status: NatalChartReportStatus | null;
  back: {
    href: string;
    label: string;
  };
  current?: ReportVersionId;
  hasClientReport?: boolean;
  workflow?: ReactNode;
  actions?: ReactNode;
  hint?: ReactNode;
  notice?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
};

export function NatalChartReportWorkspace({
  clientId,
  reportId,
  clientName,
  createdAt,
  status,
  back,
  current,
  hasClientReport = false,
  workflow,
  actions,
  hint,
  notice,
  description,
  children,
}: NatalChartReportWorkspaceProps) {
  const generatedDescription = createdAt
    ? formatGeneratedOnEs(createdAt)
    : undefined;

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <div className="flex flex-col gap-3">
            <TextLink href={back.href} variant="back">
              {back.label}
            </TextLink>
            <p className="text-sm text-muted">Carta Natal</p>
          </div>
        }
        title={clientName}
        description={description ?? generatedDescription}
        meta={
          (description && generatedDescription) || status ? (
            <>
              {description && generatedDescription ? (
                <span>{generatedDescription}</span>
              ) : null}
              {status ? (
                <NatalChartReportStatusBadge status={status} />
              ) : null}
            </>
          ) : undefined
        }
      />

      {current ? (
        <div className="mt-8">
          <ReportVersionNav
            clientId={clientId}
            reportId={reportId}
            current={current}
            hasClientReport={hasClientReport}
          />
        </div>
      ) : null}

      {workflow || actions || hint ? (
        <div className="mt-6 border-t border-border/70 pt-6">
          {workflow || actions ? (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              {workflow ? <div className="min-w-0">{workflow}</div> : null}
              {actions ? (
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap lg:ml-auto lg:justify-end">
                  {actions}
                </div>
              ) : null}
            </div>
          ) : null}
          {hint ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              {hint}
            </p>
          ) : null}
        </div>
      ) : null}

      {notice ? <div className="mt-6">{notice}</div> : null}

      <div className="mt-10">{children}</div>
    </PageContainer>
  );
}
