import {
  ClientVersionTab,
  VersionTab,
} from "@/components/reports/ReportVersionNav";
import { tabListClassName } from "@/lib/ui/control-classes";
import { ORIGINAL_VERSION_TAB_LABEL } from "@/lib/reports";

export type SolarReturnReportVersionId =
  | "professional"
  | "client"
  | "original";

type SolarReturnReportVersionNavProps = {
  clientId: string;
  solarReturnId: string;
  reportId: string;
  current: SolarReturnReportVersionId;
  hasClientReport: boolean;
};

export function SolarReturnReportVersionNav({
  clientId,
  solarReturnId,
  reportId,
  current,
  hasClientReport,
}: SolarReturnReportVersionNavProps) {
  const base = `/clients/${clientId}/solar-returns/${solarReturnId}/reports/${reportId}`;

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
