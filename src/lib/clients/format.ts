import { formatLongDateEs } from "@/lib/dates";

export function formatClientCreatedAt(isoDate: string) {
  return formatLongDateEs(isoDate);
}
