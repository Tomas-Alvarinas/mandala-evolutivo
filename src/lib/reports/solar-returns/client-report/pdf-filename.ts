import { toPdfFilename } from "@/lib/pdf/filename";

export function toSolarReturnClientPdfFilename(clientName: string) {
  return toPdfFilename("mandala-evolutivo-revolucion-solar", clientName);
}
