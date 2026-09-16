import { toPdfFilename } from "@/lib/pdf/filename";

export function toTransitClientPdfFilename(clientName: string) {
  return toPdfFilename("mandala-evolutivo-transitos", clientName);
}
