import assert from "node:assert/strict";
import {
  buildClientListPath,
  escapeIlikePattern,
  firstSearchParam,
  getClientSearchTokens,
  normalizeClientSearchQuery,
  parseClientListSort,
} from "./list-query";

function run() {
  assert.equal(parseClientListSort("recent"), "recent");
  assert.equal(parseClientListSort("name-asc"), "name-asc");
  assert.equal(parseClientListSort("name-desc"), "name-desc");
  assert.equal(parseClientListSort("age-desc"), "recent");
  assert.equal(parseClientListSort(""), "recent");
  assert.equal(parseClientListSort(undefined), "recent");

  assert.equal(normalizeClientSearchQuery("  Tomas  "), "Tomas");
  assert.equal(
    normalizeClientSearchQuery("  tomas   alvariñas  "),
    "tomas alvariñas",
  );
  assert.equal(normalizeClientSearchQuery("   "), "");

  assert.deepEqual(getClientSearchTokens("tomas"), ["tomas"]);
  assert.deepEqual(getClientSearchTokens("  Alvariñas "), ["Alvariñas"]);
  assert.deepEqual(getClientSearchTokens("tomas alvariñas"), [
    "tomas",
    "alvariñas",
  ]);
  assert.deepEqual(getClientSearchTokens("%_;,()"), []);

  assert.equal(escapeIlikePattern("100%_ok"), "100\\%\\_ok");

  assert.equal(firstSearchParam(["tomas", "other"]), "tomas");
  assert.equal(firstSearchParam(undefined), "");

  assert.equal(buildClientListPath({}), "/clients");
  assert.equal(buildClientListPath({ q: "  ", sort: "recent" }), "/clients");
  assert.equal(buildClientListPath({ q: "tomas" }), "/clients?q=tomas");
  assert.equal(
    buildClientListPath({ q: "tomas", sort: "name-asc" }),
    "/clients?q=tomas&sort=name-asc",
  );
  assert.equal(
    buildClientListPath({ sort: "bogus" }),
    "/clients",
  );
  assert.equal(
    buildClientListPath({ q: "  Tomas  ", sort: "name-desc" }),
    "/clients?q=Tomas&sort=name-desc",
  );
}

run();
console.log("client list query tests ok");
