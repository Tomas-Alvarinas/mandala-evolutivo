const INVISIBLE_OR_CONTROL_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFFC\uFFFD\uFFFE\uFFFF]/g;

export function normalizePdfText(value: string) {
  return value.replace(INVISIBLE_OR_CONTROL_CHARS, "");
}

export function normalizeComparableText(value: string) {
  return normalizePdfText(value).replace(/\s+/g, " ").trim();
}

export function arePdfTextsEquivalent(left: string, right: string) {
  return normalizeComparableText(left) === normalizeComparableText(right);
}
