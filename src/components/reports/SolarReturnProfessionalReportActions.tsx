import { CreateSolarReturnClientReportButton } from "@/components/reports/CreateSolarReturnClientReportButton";
import { DownloadReportPdfButton } from "@/components/reports/DownloadReportPdfButton";
import { Button } from "@/components/ui/Button";
import {
  PROFESSIONAL_PDF_DOWNLOAD_LABEL,
  getProfessionalActionHierarchy,
  shouldOfferPrepareSolarReturnClientReport,
  type SolarReturnReportStatus,
} from "@/lib/reports";

type SolarReturnProfessionalReportActionsProps = {
  clientId: string;
  solarReturnId: string;
  reportId: string;
  status: SolarReturnReportStatus;
  hasClientReport: boolean;
};

export function SolarReturnProfessionalReportActions({
  clientId,
  solarReturnId,
  reportId,
  status,
  hasClientReport,
}: SolarReturnProfessionalReportActionsProps) {
  const editHref = `/clients/${clientId}/solar-returns/${solarReturnId}/reports/${reportId}/edit`;
  const hierarchy = getProfessionalActionHierarchy({ status, hasClientReport });

  return (
    <>
      <DownloadReportPdfButton
        endpoint={`/api/clients/${clientId}/solar-returns/${solarReturnId}/reports/${reportId}/pdf`}
        variant={hierarchy.pdfVariant}
        label={PROFESSIONAL_PDF_DOWNLOAD_LABEL}
        fallbackFilename="mandala-evolutivo-revolucion-solar-profesional.pdf"
      />
      {shouldOfferPrepareSolarReturnClientReport({ status, hasClientReport }) &&
      hierarchy.prepareVariant ? (
        <CreateSolarReturnClientReportButton
          clientId={clientId}
          solarReturnId={solarReturnId}
          professionalReportId={reportId}
          variant={hierarchy.prepareVariant}
        />
      ) : null}
      <Button href={editHref} variant={hierarchy.editVariant}>
        Editar informe
      </Button>
    </>
  );
}
