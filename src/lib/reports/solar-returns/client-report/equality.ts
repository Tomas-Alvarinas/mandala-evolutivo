export function areSolarReturnReportValuesStructurallyEqual(
  left: unknown,
  right: unknown,
): boolean {
  return stableSerialize(left) === stableSerialize(right);
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();

  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(",")}}`;
}
