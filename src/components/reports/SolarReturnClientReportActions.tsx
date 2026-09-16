import { DownloadReportPdfButton } from "@/components/reports/DownloadReportPdfButton";
import { Button } from "@/components/ui/Button";

type SolarReturnClientReportActionsProps = {
  clientId: string;
  solarReturnId: string;
  reportId: string;
};

export function SolarReturnClientReportActions({
  clientId,
  solarReturnId,
  reportId,
}: SolarReturnClientReportActionsProps) {
  return (
    <>
      <DownloadReportPdfButton
        endpoint={`/api/clients/${clientId}/solar-returns/${solarReturnId}/reports/${reportId}/client/pdf`}
        variant="primary"
        fallbackFilename="mandala-evolutivo-revolucion-solar.pdf"
      />
      <Button
        href={`/clients/${clientId}/solar-returns/${solarReturnId}/reports/${reportId}/client/edit`}
        variant="secondary"
      >
        Editar versión consultante
      </Button>
    </>
  );
}
