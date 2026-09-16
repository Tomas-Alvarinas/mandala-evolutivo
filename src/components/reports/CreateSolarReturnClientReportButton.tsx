"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { prepareSolarReturnClientReport } from "@/lib/reports/solar-returns/client-report/actions";

type CreateSolarReturnClientReportButtonProps = {
  clientId: string;
  solarReturnId: string;
  professionalReportId: string;
  variant?: "primary" | "secondary";
};

export function CreateSolarReturnClientReportButton({
  clientId,
  solarReturnId,
  professionalReportId,
  variant = "primary",
}: CreateSolarReturnClientReportButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (isCreating) {
      return;
    }

    setIsCreating(true);
    setError(null);

    const result = await prepareSolarReturnClientReport({
      clientId,
      solarReturnId,
      professionalReportId,
    });

    if (!result.success) {
      setError(result.error);
      setIsCreating(false);
      return;
    }

    router.push(
      `/clients/${clientId}/solar-returns/${solarReturnId}/reports/${professionalReportId}/client`,
    );
    router.refresh();
  }

  return (
    <div>
      <Button
        type="button"
        variant={variant}
        disabled={isCreating}
        onClick={handleCreate}
      >
        {isCreating ? "Preparando..." : "Preparar versión consultante"}
      </Button>
      {error ? (
        <Alert variant="danger" className="mt-3" role="alert" title={error} />
      ) : null}
    </div>
  );
}
