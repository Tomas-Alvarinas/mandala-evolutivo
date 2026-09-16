import { toPdfFilename } from "@/lib/pdf/filename";

export function toTransitAnalysisProfessionalPdfFilename(clientName: string) {
  return toPdfFilename("mandala-evolutivo-transitos-profesional", clientName);
}
