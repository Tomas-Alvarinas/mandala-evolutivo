import { CreateTransitClientReportButton } from "@/components/reports/CreateTransitClientReportButton";
import { DownloadReportPdfButton } from "@/components/reports/DownloadReportPdfButton";
import { Button } from "@/components/ui/Button";
import {
  PROFESSIONAL_PDF_DOWNLOAD_LABEL,
  getProfessionalActionHierarchy,
  shouldOfferPrepareTransitClientReport,
  type TransitAnalysisReportStatus,
} from "@/lib/reports";

type TransitProfessionalReportActionsProps = {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
  status: TransitAnalysisReportStatus;
  hasClientReport: boolean;
};

export function TransitProfessionalReportActions({
  clientId,
  transitAnalysisId,
  reportId,
  status,
  hasClientReport,
}: TransitProfessionalReportActionsProps) {
  const editHref = `/clients/${clientId}/transits/${transitAnalysisId}/reports/${reportId}/edit`;
  const hierarchy = getProfessionalActionHierarchy({ status, hasClientReport });

  return (
    <>
      <DownloadReportPdfButton
        endpoint={`/api/clients/${clientId}/transits/${transitAnalysisId}/reports/${reportId}/pdf`}
        variant={hierarchy.pdfVariant}
        label={PROFESSIONAL_PDF_DOWNLOAD_LABEL}
        fallbackFilename="mandala-evolutivo-transitos-profesional.pdf"
      />
      {shouldOfferPrepareTransitClientReport({ status, hasClientReport }) &&
      hierarchy.prepareVariant ? (
        <CreateTransitClientReportButton
          clientId={clientId}
          transitAnalysisId={transitAnalysisId}
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
