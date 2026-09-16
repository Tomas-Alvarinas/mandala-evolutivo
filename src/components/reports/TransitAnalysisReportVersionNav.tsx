import {
  ClientVersionTab,
  VersionTab,
} from "@/components/reports/ReportVersionNav";
import { tabListClassName } from "@/lib/ui/control-classes";
import { ORIGINAL_VERSION_TAB_LABEL } from "@/lib/reports";

export type TransitAnalysisReportVersionId =
  | "professional"
  | "client"
  | "original";

type TransitAnalysisReportVersionNavProps = {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
  current: TransitAnalysisReportVersionId;
  hasClientReport: boolean;
};

export function TransitAnalysisReportVersionNav({
  clientId,
  transitAnalysisId,
  reportId,
  current,
  hasClientReport,
}: TransitAnalysisReportVersionNavProps) {
  const base = `/clients/${clientId}/transits/${transitAnalysisId}/reports/${reportId}`;

  return (
    <nav aria-label="Versiones del informe" className={tabListClassName}>
      <VersionTab href={base} current={current === "professional"}>
        Informe profesional
      </VersionTab>
      <ClientVersionTab
        href={`${base}/client`}
        current={current === "client"}
        hasClientReport={hasClientReport}
      />
      <VersionTab href={`${base}/original`} current={current === "original"}>
        {ORIGINAL_VERSION_TAB_LABEL}
      </VersionTab>
    </nav>
  );
}
