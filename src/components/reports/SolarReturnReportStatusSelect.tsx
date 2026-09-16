"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  controlClassName,
  fieldErrorClassName,
  labelClassName,
} from "@/lib/ui/control-classes";
import { cx } from "@/lib/ui/cx";
import { updateSolarReturnReportStatus } from "@/lib/reports/solar-returns/actions";
import {
  SOLAR_RETURN_REPORT_STATUSES,
  getSolarReturnReportStatusLabel,
  isSolarReturnReportStatus,
  type SolarReturnReportStatus,
} from "@/lib/reports";

type SolarReturnReportStatusSelectProps = {
  clientId: string;
  solarReturnId: string;
  reportId: string;
  status: SolarReturnReportStatus;
};

export function SolarReturnReportStatusSelect({
  clientId,
  solarReturnId,
  reportId,
  status,
}: SolarReturnReportStatusSelectProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [pendingStatus, setPendingStatus] =
    useState<SolarReturnReportStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shownStatus = pendingStatus ?? status;

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value;

    if (
      !isSolarReturnReportStatus(nextStatus) ||
      isSaving ||
      nextStatus === status
    ) {
      return;
    }

    setIsSaving(true);
    setPendingStatus(nextStatus);
    setError(null);

    const result = await updateSolarReturnReportStatus({
      clientId,
      solarReturnId,
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
      <label htmlFor="solar-return-report-status" className={labelClassName}>
        Estado
      </label>
      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        <select
          id="solar-return-report-status"
          aria-label="Estado del informe"
          aria-busy={isSaving}
          value={shownStatus}
          disabled={isSaving}
          onChange={handleChange}
          className={cx(controlClassName, "max-w-xs cursor-pointer")}
        >
          {SOLAR_RETURN_REPORT_STATUSES.map((nextStatus) => (
            <option key={nextStatus} value={nextStatus}>
              {getSolarReturnReportStatusLabel(nextStatus)}
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
