import { CreateNatalChartClientReportButton } from "@/components/reports/CreateNatalChartClientReportButton";
import { DownloadReportPdfButton } from "@/components/reports/DownloadReportPdfButton";
import { Button } from "@/components/ui/Button";
import {
  PROFESSIONAL_PDF_DOWNLOAD_LABEL,
  getProfessionalActionHierarchy,
  shouldOfferPrepareClientReport,
  type NatalChartReportStatus,
} from "@/lib/reports";

type ProfessionalReportActionsProps = {
  clientId: string;
  reportId: string;
  status: NatalChartReportStatus;
  hasClientReport: boolean;
};

export function ProfessionalReportActions({
  clientId,
  reportId,
  status,
  hasClientReport,
}: ProfessionalReportActionsProps) {
  const editHref = `/clients/${clientId}/reports/${reportId}/edit`;
  const hierarchy = getProfessionalActionHierarchy({ status, hasClientReport });

  return (
    <>
      <DownloadReportPdfButton
        endpoint={`/api/clients/${clientId}/reports/${reportId}/pdf`}
        variant={hierarchy.pdfVariant}
        label={PROFESSIONAL_PDF_DOWNLOAD_LABEL}
      />
      {shouldOfferPrepareClientReport({ status, hasClientReport }) &&
      hierarchy.prepareVariant ? (
        <CreateNatalChartClientReportButton
          clientId={clientId}
          reportId={reportId}
          variant={hierarchy.prepareVariant}
        />
      ) : null}
      <Button href={editHref} variant={hierarchy.editVariant}>
        Editar informe
      </Button>
    </>
  );
}
