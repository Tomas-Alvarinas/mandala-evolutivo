"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { prepareTransitClientReport } from "@/lib/reports/transits/client-report/actions";

type CreateTransitClientReportButtonProps = {
  clientId: string;
  transitAnalysisId: string;
  professionalReportId: string;
  variant?: "primary" | "secondary";
};

export function CreateTransitClientReportButton({
  clientId,
  transitAnalysisId,
  professionalReportId,
  variant = "primary",
}: CreateTransitClientReportButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (isCreating) {
      return;
    }

    setIsCreating(true);
    setError(null);

    const result = await prepareTransitClientReport({
      clientId,
      transitAnalysisId,
      professionalReportId,
    });

    if (!result.success) {
      setError(result.error);
      setIsCreating(false);
      return;
    }

    router.push(
      `/clients/${clientId}/transits/${transitAnalysisId}/reports/${professionalReportId}/client`,
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
