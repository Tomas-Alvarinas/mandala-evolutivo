import { toPdfFilename } from "@/lib/pdf/filename";

export function toSolarReturnProfessionalPdfFilename(clientName: string) {
  return toPdfFilename(
    "mandala-evolutivo-revolucion-solar-profesional",
    clientName,
  );
}
