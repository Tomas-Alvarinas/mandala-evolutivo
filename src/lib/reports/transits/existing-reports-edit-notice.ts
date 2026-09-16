export const EXISTING_TRANSIT_REPORTS_EDIT_NOTICE_TITLE =
  "Este análisis ya tiene informes generados.";

export const EXISTING_TRANSIT_REPORTS_EDIT_NOTICE_BODY =
  "Los cambios en los datos de Tránsitos no modifican los análisis ya generados. Si querés reflejar los cambios, generá un nuevo análisis.";

export function shouldShowExistingTransitReportsEditNotice(reportCount: number) {
  return reportCount > 0;
}
