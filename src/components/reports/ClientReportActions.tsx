import { DownloadReportPdfButton } from "@/components/reports/DownloadReportPdfButton";
import { Button } from "@/components/ui/Button";

type ClientReportActionsProps = {
  clientId: string;
  reportId: string;
};

export function ClientReportActions({
  clientId,
  reportId,
}: ClientReportActionsProps) {
  return (
    <>
      <DownloadReportPdfButton
        endpoint={`/api/clients/${clientId}/reports/${reportId}/client/pdf`}
        variant="primary"
      />
      <Button
        href={`/clients/${clientId}/reports/${reportId}/client/edit`}
        variant="secondary"
      >
        Editar versión consultante
      </Button>
    </>
  );
}
