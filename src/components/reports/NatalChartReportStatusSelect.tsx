"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  controlClassName,
  fieldErrorClassName,
  labelClassName,
} from "@/lib/ui/control-classes";
import { cx } from "@/lib/ui/cx";
import { updateNatalChartReportStatus } from "@/lib/reports/natal-chart/actions";
import {
  NATAL_CHART_REPORT_STATUSES,
  getNatalChartReportStatusLabel,
  isNatalChartReportStatus,
  type NatalChartReportStatus,
} from "@/lib/reports";

type NatalChartReportStatusSelectProps = {
  clientId: string;
  reportId: string;
  status: NatalChartReportStatus;
};

export function NatalChartReportStatusSelect({
  clientId,
  reportId,
  status,
}: NatalChartReportStatusSelectProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [pendingStatus, setPendingStatus] =
    useState<NatalChartReportStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shownStatus = pendingStatus ?? status;

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value;

    if (!isNatalChartReportStatus(nextStatus) || isSaving || nextStatus === status) {
      return;
    }

    setIsSaving(true);
    setPendingStatus(nextStatus);
    setError(null);

    const result = await updateNatalChartReportStatus({
      clientId,
      reportId,
      status: nextStatus,
    });

    if (!result.success) {
      setError(result.error);
      setIsSaving(false);
      setPendingStatus(null);
      return;
    }

    router.refresh();
    setIsSaving(false);
    setPendingStatus(null);
  }

  return (
    <div>
      <label htmlFor="natal-chart-report-status" className={labelClassName}>
        Estado
      </label>
      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        <select
          id="natal-chart-report-status"
          aria-label="Estado del informe"
          aria-busy={isSaving}
          value={shownStatus}
          disabled={isSaving}
          onChange={handleChange}
          className={cx(controlClassName, "max-w-xs cursor-pointer")}
        >
          {NATAL_CHART_REPORT_STATUSES.map((nextStatus) => (
            <option key={nextStatus} value={nextStatus}>
              {getNatalChartReportStatusLabel(nextStatus)}
            </option>
          ))}
        </select>
        {isSaving ? (
          <span className="text-sm text-muted" aria-live="polite">
            Guardando...
          </span>
        ) : null}
      </div>
      {error ? (
        <p className={`mt-2 ${fieldErrorClassName}`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
