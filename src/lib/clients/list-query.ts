export const CLIENT_LIST_SORTS = ["recent", "name-asc", "name-desc"] as const;

export type ClientListSort = (typeof CLIENT_LIST_SORTS)[number];

export const DEFAULT_CLIENT_LIST_SORT: ClientListSort = "recent";

export const CLIENT_SEARCH_DEBOUNCE_MS = 300;

const MAX_SEARCH_LENGTH = 80;
const MAX_SEARCH_TOKENS = 5;

export function firstSearchParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function parseClientListSort(value: string | null | undefined): ClientListSort {
  if (value === "name-asc" || value === "name-desc" || value === "recent") {
    return value;
  }

  return DEFAULT_CLIENT_LIST_SORT;
}

export function normalizeClientSearchQuery(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, MAX_SEARCH_LENGTH);
}

export function getClientSearchTokens(query: string): string[] {
  const normalized = normalizeClientSearchQuery(query);

  if (!normalized) {
    return [];
  }

  const tokens: string[] = [];

  for (const part of normalized.split(" ")) {
    const token = sanitizeClientSearchToken(part);

    if (!token) {
      continue;
    }

    tokens.push(token);

    if (tokens.length >= MAX_SEARCH_TOKENS) {
      break;
    }
  }

  return tokens;
}

export function sanitizeClientSearchToken(value: string) {
  const token = value.replace(/[^\p{L}\p{M}'’-]/gu, "");
  return token || null;
}

export function escapeIlikePattern(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export function buildClientListPath(input: {
  q?: string;
  sort?: string | null;
}) {
  const params = new URLSearchParams();
  const query = normalizeClientSearchQuery(input.q ?? "");
  const sort = parseClientListSort(input.sort);

  if (query) {
    params.set("q", query);
  }

  if (sort !== DEFAULT_CLIENT_LIST_SORT) {
    params.set("sort", sort);
  }

  const serialized = params.toString();
  return serialized ? `/clients?${serialized}` : "/clients";
}
