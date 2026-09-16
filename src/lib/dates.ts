const TIME_ZONE = "America/Argentina/Buenos_Aires";

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

type ZonedDateParts = {
  day: number;
  month: number;
  year: number;
  hour: string;
  minute: string;
};

function getZonedDateParts(isoDate: string): ZonedDateParts | null {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  const day = get("day");
  const month = get("month");
  const year = get("year");
  const hour = get("hour");
  const minute = get("minute");

  if (!day || !month || !year) {
    return null;
  }

  return {
    day: Number(day),
    month: Number(month),
    year: Number(year),
    hour: (hour ?? "00").padStart(2, "0"),
    minute: (minute ?? "00").padStart(2, "0"),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatLongDateEs(isoDate: string) {
  const parts = getZonedDateParts(isoDate);

  if (!parts) {
    return "";
  }

  return `${parts.day} de ${MONTHS_ES[parts.month - 1]} de ${parts.year}`;
}

export function formatGeneratedOnEs(isoDate: string) {
  const formatted = formatLongDateEs(isoDate);
  return formatted ? `Generado el ${formatted}` : "";
}

export function formatNumericDateEs(isoDate: string) {
  const parts = getZonedDateParts(isoDate);

  if (!parts) {
    return "";
  }

  return `${pad(parts.day)}/${pad(parts.month)}/${parts.year}`;
}

export function formatDateTimeEs(isoDate: string) {
  const parts = getZonedDateParts(isoDate);

  if (!parts) {
    return "";
  }

  return `${formatNumericDateEs(isoDate)}, ${parts.hour}:${parts.minute}`;
}
