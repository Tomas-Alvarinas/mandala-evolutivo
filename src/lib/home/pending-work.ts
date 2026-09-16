export type PendingWorkModule = "natal" | "transits" | "solar";

export type PendingProfessionalWorkKind =
  | "draft"
  | "reviewed"
  | "ready_without_client_report";

export type PendingProfessionalStatus = "draft" | "reviewed" | "ready";

export type PendingWorkItem = {
  key: string;
  module: PendingWorkModule;
  clientId: string;
  clientFirstName: string;
  clientLastName: string;
  status: PendingProfessionalStatus;
  kind: PendingProfessionalWorkKind;
  updatedAt: string;
  href: string;
  contextLabel?: string | null;
};

export function classifyPendingProfessionalWork(input: {
  status: PendingProfessionalStatus;
  hasClientReport: boolean;
}): PendingProfessionalWorkKind | null {
  if (input.status === "draft") {
    return "draft";
  }

  if (input.status === "reviewed") {
    return "reviewed";
  }

  if (input.status === "ready" && !input.hasClientReport) {
    return "ready_without_client_report";
  }

  return null;
}

export function getPendingWorkActionLabel(kind: PendingProfessionalWorkKind) {
  switch (kind) {
    case "draft":
    case "reviewed":
    case "ready_without_client_report":
      return "Continuar informe";
  }
}

export function getPendingWorkModuleLabel(module: PendingWorkModule) {
  switch (module) {
    case "natal":
      return "Carta Natal";
    case "transits":
      return "Tránsitos y Eclipses";
    case "solar":
      return "Revolución Solar";
  }
}

export function selectPendingWork<T extends { updatedAt: string }>(
  items: T[],
  limit: number,
): { items: T[]; hasMore: boolean } {
  const ordered = [...items].sort((left, right) => {
    const leftTime = Date.parse(left.updatedAt);
    const rightTime = Date.parse(right.updatedAt);

    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
      return 0;
    }

    if (Number.isNaN(leftTime)) {
      return 1;
    }

    if (Number.isNaN(rightTime)) {
      return -1;
    }

    return rightTime - leftTime;
  });

  return {
    items: ordered.slice(0, limit),
    hasMore: ordered.length > limit,
  };
}

export function mergePendingWork(
  natalItems: PendingWorkItem[],
  transitItems: PendingWorkItem[],
  solarItems: PendingWorkItem[],
  limit: number,
  extras?: {
    natalHasMore?: boolean;
    transitHasMore?: boolean;
    solarHasMore?: boolean;
  },
): { items: PendingWorkItem[]; hasMore: boolean } {
  const selected = selectPendingWork(
    [...natalItems, ...transitItems, ...solarItems],
    limit,
  );

  return {
    items: selected.items,
    hasMore:
      selected.hasMore ||
      Boolean(extras?.natalHasMore) ||
      Boolean(extras?.transitHasMore) ||
      Boolean(extras?.solarHasMore),
  };
}

export function hasPendingWork(items: readonly unknown[]) {
  return items.length > 0;
}
