"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { createNatalChartClientReport } from "@/lib/reports/natal-chart/client-report/actions";

type CreateNatalChartClientReportButtonProps = {
  clientId: string;
  reportId: string;
  variant?: "primary" | "secondary";
};

export function CreateNatalChartClientReportButton({
  clientId,
  reportId,
  variant = "primary",
}: CreateNatalChartClientReportButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (isCreating) {
      return;
    }

    setIsCreating(true);
    setError(null);

    const result = await createNatalChartClientReport({
      clientId,
      reportId,
    });

    if (!result.success) {
      setError(result.error);
      setIsCreating(false);
      return;
    }

    router.push(`/clients/${clientId}/reports/${reportId}/client`);
    router.refresh();
  }

  return (
    <div>
      <Button type="button" variant={variant} disabled={isCreating} onClick={handleCreate}>
        {isCreating
          ? "Preparando..."
          : "Preparar versión consultante"}
      </Button>
      {error ? (
        <Alert variant="danger" className="mt-3" role="alert" title={error} />
      ) : null}
    </div>
  );
}
