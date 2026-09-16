import { DownloadReportPdfButton } from "@/components/reports/DownloadReportPdfButton";
import { Button } from "@/components/ui/Button";

type TransitClientReportActionsProps = {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
};

export function TransitClientReportActions({
  clientId,
  transitAnalysisId,
  reportId,
}: TransitClientReportActionsProps) {
  return (
    <>
      <DownloadReportPdfButton
        endpoint={`/api/clients/${clientId}/transits/${transitAnalysisId}/reports/${reportId}/client/pdf`}
        variant="primary"
        fallbackFilename="mandala-evolutivo-transitos.pdf"
      />
      <Button
        href={`/clients/${clientId}/transits/${transitAnalysisId}/reports/${reportId}/client/edit`}
        variant="secondary"
      >
        Editar versión consultante
      </Button>
    </>
  );
}
