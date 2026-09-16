export const APP_NAME = "Mandala Evolutivo";

export const APP_DESCRIPTION =
  "Plataforma de análisis astrológico evolutivo y generación de informes personalizados.";

export const PROFESSIONAL_PROFILE = {
  name: "Lic. Paula Martini",
  role: "Psicopedagoga y Astróloga",
  email: "paulamartini4920@gmail.com",
  instagram: "@paulitamartini",
} as const;

export function formatProfessionalCreditLine() {
  return `${PROFESSIONAL_PROFILE.name} - ${PROFESSIONAL_PROFILE.role} - ${PROFESSIONAL_PROFILE.email} - ${PROFESSIONAL_PROFILE.instagram}`;
}

export function formatProfessionalPdfCreditLine() {
  return `${PROFESSIONAL_PROFILE.name} · ${PROFESSIONAL_PROFILE.role} · ${PROFESSIONAL_PROFILE.email} · ${PROFESSIONAL_PROFILE.instagram}`;
}
