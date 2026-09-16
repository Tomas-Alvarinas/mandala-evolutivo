import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransitAnalysisReportStatusBadge } from "@/components/reports/TransitAnalysisReportStatusBadge";
import {
  TransitAnalysisReportVersionNav,
  type TransitAnalysisReportVersionId,
} from "@/components/reports/TransitAnalysisReportVersionNav";
import { TextLink } from "@/components/ui/TextLink";
import { formatGeneratedOnEs } from "@/lib/dates";
import type { TransitAnalysisReportStatus } from "@/lib/reports";

type TransitAnalysisReportWorkspaceProps = {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
  clientName: string;
  generatedAt: string;
  status: TransitAnalysisReportStatus | null;
  back: {
    href: string;
    label: string;
  };
  current?: TransitAnalysisReportVersionId;
  hasClientReport?: boolean;
  workflow?: ReactNode;
  actions?: ReactNode;
  hint?: ReactNode;
  notice?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
};

export function TransitAnalysisReportWorkspace({
  clientId,
  transitAnalysisId,
  reportId,
  clientName,
  generatedAt,
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
}: TransitAnalysisReportWorkspaceProps) {
  const generatedLabel = generatedAt ? formatGeneratedOnEs(generatedAt) : "";

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={
          <div className="flex flex-col gap-3">
            <TextLink href={back.href} variant="back">
              {back.label}
            </TextLink>
            <p className="text-sm text-muted">Tránsitos y Eclipses</p>
          </div>
        }
        title={clientName}
        description={description}
        meta={
          generatedLabel || status ? (
            <>
              {generatedLabel ? <span>{generatedLabel}</span> : null}
              {status ? (
                <TransitAnalysisReportStatusBadge status={status} />
              ) : null}
            </>
          ) : undefined
        }
      />

      {current ? (
        <div className="mt-8">
          <TransitAnalysisReportVersionNav
            clientId={clientId}
            transitAnalysisId={transitAnalysisId}
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
