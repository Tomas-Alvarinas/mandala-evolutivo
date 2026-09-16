export function toSanitizedFilenameSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toPdfFilename(prefix: string, clientName: string) {
  const slug = toSanitizedFilenameSlug(clientName);
  return `${prefix}-${slug || "consultante"}.pdf`;
}
