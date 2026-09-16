import assert from "node:assert/strict";
import { houseRulersFromQuery } from "./house-rulers";

function run() {
  const empty = houseRulersFromQuery({ data: [], error: null });
  assert.equal(empty.status, "ok");
  if (empty.status === "ok") {
    assert.deepEqual(empty.data, []);
  }

  const missingRows = houseRulersFromQuery({ data: null, error: null });
  assert.equal(missingRows.status, "ok");
  if (missingRows.status === "ok") {
    assert.deepEqual(missingRows.data, []);
  }

  const queryFailed = houseRulersFromQuery({
    data: [
      { house: 1, planet: "mars", sign: "aries" },
    ],
    error: { message: "relation does not exist", code: "42P01" },
  });
  assert.equal(queryFailed.status, "error");
  assert.equal("data" in queryFailed, false);

  const mapped = houseRulersFromQuery({
    data: [
      { house: 2, planet: "venus", sign: "taurus" },
      { house: 1, planet: "mars", sign: "aries" },
    ],
    error: null,
  });
  assert.equal(mapped.status, "ok");
  if (mapped.status === "ok") {
    assert.deepEqual(mapped.data, [
      { house: 1, planet: "mars", sign: "aries" },
      { house: 2, planet: "venus", sign: "taurus" },
    ]);
  }
}

run();
console.log("house rulers load tests ok");
