import { toPdfFilename } from "@/lib/pdf/filename";

export function toNatalChartProfessionalPdfFilename(clientName: string) {
  return toPdfFilename("carta-natal-profesional", clientName);
}
