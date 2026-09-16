"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  controlClassName,
  fieldErrorClassName,
  labelClassName,
} from "@/lib/ui/control-classes";
import { cx } from "@/lib/ui/cx";
import { updateTransitAnalysisReportStatus } from "@/lib/reports/transits/actions";
import {
  TRANSIT_ANALYSIS_REPORT_STATUSES,
  getTransitAnalysisReportStatusLabel,
  isTransitAnalysisReportStatus,
  type TransitAnalysisReportStatus,
} from "@/lib/reports";

type TransitAnalysisReportStatusSelectProps = {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
  status: TransitAnalysisReportStatus;
};

export function TransitAnalysisReportStatusSelect({
  clientId,
  transitAnalysisId,
  reportId,
  status,
}: TransitAnalysisReportStatusSelectProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [pendingStatus, setPendingStatus] =
    useState<TransitAnalysisReportStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shownStatus = pendingStatus ?? status;

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value;

    if (
      !isTransitAnalysisReportStatus(nextStatus) ||
      isSaving ||
      nextStatus === status
    ) {
      return;
    }

    setIsSaving(true);
    setPendingStatus(nextStatus);
    setError(null);

    const result = await updateTransitAnalysisReportStatus({
      clientId,
      transitAnalysisId,
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
      <label htmlFor="transit-analysis-report-status" className={labelClassName}>
        Estado
      </label>
      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        <select
          id="transit-analysis-report-status"
          aria-label="Estado del informe"
          aria-busy={isSaving}
          value={shownStatus}
          disabled={isSaving}
          onChange={handleChange}
          className={cx(controlClassName, "max-w-xs cursor-pointer")}
        >
          {TRANSIT_ANALYSIS_REPORT_STATUSES.map((nextStatus) => (
            <option key={nextStatus} value={nextStatus}>
              {getTransitAnalysisReportStatusLabel(nextStatus)}
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
