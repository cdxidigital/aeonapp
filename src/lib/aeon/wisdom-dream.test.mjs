import test from "node:test";
import assert from "node:assert/strict";
import { buildWisdomIndex, searchWisdom, validateWisdomRecord, wisdomAnswerContext } from "./wisdom-dream.mjs";
const verified = {
  id: "source-1", title: "A documented discussion of consciousness",
  kind: "document", sourceUrl: "https://example.org/document",
  verified: true, evidence: "User supplied and manually checked document",
  retrievedAt: "2026-11-14", summary: "A philosophical reflection",
  topics: ["consciousness", "reflection"]
};
test("accepts attributed verified records", () => {
  assert.equal(validateWisdomRecord(verified).ok, true);
});
test("rejects unverified and unsupported records", () => {
  assert.equal(validateWisdomRecord({...verified, verified: false}).ok, false);
  assert.equal(validateWisdomRecord({...verified, kind: "invented"}).ok, false);
  assert.equal(validateWisdomRecord({...verified, sourceUrl: "javascript:alert(1)"}).ok, false);
  assert.equal(validateWisdomRecord({...verified, kind: "archive-video"}).ok, false);
});
test("indexes only verified unique records", () => {
  const index = buildWisdomIndex([verified, verified, {...verified, id:"other", verified:false}]);
  assert.equal(index.records.length, 1);
  assert.equal(index.rejected.length, 2);
});
test("search matches verified topics and returns provenance", () => {
  const index = buildWisdomIndex([verified]);
  assert.equal(searchWisdom(index, "consciousness").length, 1);
  assert.equal(searchWisdom(index, "not present").length, 0);
  assert.equal(wisdomAnswerContext(index.records)[0].sourceUrl, verified.sourceUrl);
});
test("empty corpus never invents teachings", () => {
  assert.deepEqual(searchWisdom(buildWisdomIndex([]), "stars"), []);
});
