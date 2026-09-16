import assert from "node:assert/strict";
import {
  classifyPendingNatalChartWork,
  selectPendingNatalChartWork,
} from "./pending-work";

function run() {
  assert.equal(
    classifyPendingNatalChartWork({ status: "draft", hasClientReport: false }),
    "draft",
  );
  assert.equal(
    classifyPendingNatalChartWork({ status: "draft", hasClientReport: true }),
    "draft",
  );
  assert.equal(
    classifyPendingNatalChartWork({
      status: "reviewed",
      hasClientReport: false,
    }),
    "reviewed",
  );
  assert.equal(
    classifyPendingNatalChartWork({
      status: "ready",
      hasClientReport: false,
    }),
    "ready_without_client_report",
  );
  assert.equal(
    classifyPendingNatalChartWork({
      status: "ready",
      hasClientReport: true,
    }),
    null,
  );

  const selected = selectPendingNatalChartWork(
    [
      { id: "older", updatedAt: "2026-08-01T12:00:00.000Z" },
      { id: "newest", updatedAt: "2026-08-28T18:00:00.000Z" },
      { id: "middle", updatedAt: "2026-08-10T09:00:00.000Z" },
    ],
    2,
  );
  assert.deepEqual(
    selected.items.map((item) => item.id),
    ["newest", "middle"],
  );
  assert.equal(selected.hasMore, true);

  const allFit = selectPendingNatalChartWork(
    [{ id: "only", updatedAt: "2026-08-28T18:00:00.000Z" }],
    8,
  );
  assert.equal(allFit.hasMore, false);
  assert.equal(allFit.items.length, 1);
}

run();
console.log("pending natal chart work tests ok");
