export type ProfessionalEditorialStatus = "draft" | "reviewed" | "ready";

export const PROFESSIONAL_PDF_DOWNLOAD_LABEL = "Descargar PDF";

export type ProfessionalActionHierarchy = {
  editVariant: "primary" | "secondary";
  pdfVariant: "primary" | "secondary";
  prepareVariant: "primary" | "secondary" | null;
};

export function getProfessionalActionHierarchy(input: {
  status: ProfessionalEditorialStatus;
  hasClientReport: boolean;
}): ProfessionalActionHierarchy {
  if (input.status === "ready" && !input.hasClientReport) {
    return {
      editVariant: "secondary",
      pdfVariant: "primary",
      prepareVariant: "secondary",
    };
  }

  return {
    editVariant: "secondary",
    pdfVariant: "primary",
    prepareVariant: null,
  };
}
