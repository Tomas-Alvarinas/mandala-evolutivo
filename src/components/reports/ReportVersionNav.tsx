import Link from "next/link";
import {
  tabActiveClassName,
  tabClassName,
  tabDisabledClassName,
  tabInactiveClassName,
  tabListClassName,
} from "@/lib/ui/control-classes";
import { cx } from "@/lib/ui/cx";
import {
  CLIENT_VERSION_TAB_LABEL,
  CLIENT_VERSION_UNPREPARED_DESCRIPTION,
  CLIENT_VERSION_UNPREPARED_LABEL,
  ORIGINAL_VERSION_TAB_LABEL,
} from "@/lib/reports";

export type ReportVersionId = "professional" | "client" | "original";

type ReportVersionNavProps = {
  clientId: string;
  reportId: string;
  current: ReportVersionId;
  hasClientReport: boolean;
};

export function ReportVersionNav({
  clientId,
  reportId,
  current,
  hasClientReport,
}: ReportVersionNavProps) {
  const base = `/clients/${clientId}/reports/${reportId}`;

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

export function ClientVersionTab({
  href,
  current,
  hasClientReport,
}: {
  href: string;
  current: boolean;
  hasClientReport: boolean;
}) {
  if (hasClientReport) {
    return (
      <VersionTab href={href} current={current}>
        {CLIENT_VERSION_TAB_LABEL}
      </VersionTab>
    );
  }

  return (
    <span
      className={cx(tabClassName, tabDisabledClassName, "flex-col")}
      aria-disabled="true"
      aria-describedby="client-version-unprepared-hint"
    >
      <span>{CLIENT_VERSION_TAB_LABEL}</span>
      <span className="mt-0.5 block text-xs font-normal leading-snug">
        {CLIENT_VERSION_UNPREPARED_LABEL}
      </span>
      <span id="client-version-unprepared-hint" className="sr-only">
        {CLIENT_VERSION_UNPREPARED_DESCRIPTION}
      </span>
    </span>
  );
}

export function VersionTab({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: string;
}) {
  if (current) {
    return (
      <span
        aria-current="page"
        className={cx(tabClassName, tabActiveClassName)}
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={cx(tabClassName, tabInactiveClassName)}>
      {children}
    </Link>
  );
}
