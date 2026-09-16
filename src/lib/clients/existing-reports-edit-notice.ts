export const EXISTING_REPORTS_EDIT_NOTICE_TITLE =
  "Este consultante ya tiene informes de Carta Natal.";

export const EXISTING_REPORTS_EDIT_NOTICE_BODY =
  "Si modificás la Carta Natal, los informes existentes no se actualizan automáticamente. Generá un nuevo análisis si querés que los cambios queden reflejados.";

export function shouldShowExistingReportsEditNotice(reportCount: number) {
  return reportCount > 0;
}
