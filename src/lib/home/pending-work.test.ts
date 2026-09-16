import assert from "node:assert/strict";
import {
  classifyPendingProfessionalWork,
  getPendingWorkActionLabel,
  getPendingWorkModuleLabel,
  hasPendingWork,
  mergePendingWork,
  type PendingWorkItem,
} from "./pending-work";

function item(
  overrides: Partial<PendingWorkItem> & Pick<PendingWorkItem, "key" | "module">,
): PendingWorkItem {
  return {
    clientId: "client-1",
    clientFirstName: "María",
    clientLastName: "Pérez",
    status: "draft",
    kind: "draft",
    updatedAt: "2026-09-01T12:00:00.000Z",
    href: "/clients/client-1",
    ...overrides,
  };
}

function run() {
  assert.equal(
    classifyPendingProfessionalWork({ status: "draft", hasClientReport: false }),
    "draft",
  );
  assert.equal(
    classifyPendingProfessionalWork({
      status: "reviewed",
      hasClientReport: false,
    }),
    "reviewed",
  );
  assert.equal(
    classifyPendingProfessionalWork({
      status: "ready",
      hasClientReport: false,
    }),
    "ready_without_client_report",
  );
  assert.equal(
    classifyPendingProfessionalWork({
      status: "ready",
      hasClientReport: true,
    }),
    null,
  );

  assert.equal(getPendingWorkModuleLabel("natal"), "Carta Natal");
  assert.equal(getPendingWorkModuleLabel("transits"), "Tránsitos y Eclipses");
  assert.equal(getPendingWorkModuleLabel("solar"), "Revolución Solar");
  assert.equal(getPendingWorkActionLabel("draft"), "Continuar informe");
  assert.equal(getPendingWorkActionLabel("reviewed"), "Continuar informe");
  assert.equal(
    getPendingWorkActionLabel("ready_without_client_report"),
    "Continuar informe",
  );

  const natalDraft = item({
    key: "natal-old",
    module: "natal",
    updatedAt: "2026-08-01T12:00:00.000Z",
  });
  const natalReady = item({
    key: "natal-ready",
    module: "natal",
    status: "ready",
    kind: "ready_without_client_report",
    updatedAt: "2026-08-20T12:00:00.000Z",
  });
  const transitDraft = item({
    key: "transit-new",
    module: "transits",
    clientFirstName: "Luis",
    clientLastName: "Gómez",
    updatedAt: "2026-09-02T12:00:00.000Z",
    href: "/clients/client-1/transits/a/reports/r",
  });
  const solarDraft = item({
    key: "solar-newest",
    module: "solar",
    clientFirstName: "Ana",
    clientLastName: "López",
    updatedAt: "2026-09-03T12:00:00.000Z",
    href: "/clients/client-1/solar-returns/s/reports/r",
    contextLabel: "2026–2027",
  });

  const merged = mergePendingWork(
    [natalDraft, natalReady],
    [transitDraft],
    [solarDraft],
    2,
  );
  assert.deepEqual(
    merged.items.map((entry) => entry.key),
    ["solar-newest", "transit-new"],
  );
  assert.equal(merged.hasMore, true);
  assert.equal(merged.items[0]?.module, "solar");
  assert.equal(hasPendingWork(merged.items), true);

  const onlyNatal = mergePendingWork([natalDraft], [], [], 8);
  assert.equal(onlyNatal.items[0]?.module, "natal");
  assert.equal(onlyNatal.hasMore, false);

  const onlyTransit = mergePendingWork([], [transitDraft], [], 8);
  assert.equal(onlyTransit.items[0]?.module, "transits");
  assert.equal(hasPendingWork(onlyTransit.items), true);

  const onlySolar = mergePendingWork([], [], [solarDraft], 8);
  assert.equal(onlySolar.items[0]?.module, "solar");
  assert.equal(onlySolar.items[0]?.href.includes("/solar-returns/"), true);
  assert.equal(onlySolar.items[0]?.contextLabel, "2026–2027");

  const empty = mergePendingWork([], [], [], 8);
  assert.equal(hasPendingWork(empty.items), false);
  assert.equal(empty.items.length, 0);

  const extras = mergePendingWork([], [], [], 8, { solarHasMore: true });
  assert.equal(extras.hasMore, true);
}

run();
console.log("home pending work tests ok");
