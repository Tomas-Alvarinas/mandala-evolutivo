import { toPdfFilename } from "@/lib/pdf/filename";

export function toNatalChartClientPdfFilename(clientName: string) {
  return toPdfFilename("carta-natal", clientName);
}
