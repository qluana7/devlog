import assert from "node:assert/strict";
import test from "node:test";
import { buildPageSeries, clampPage, tagPathSegment } from "../build-scripts/client-utils.js";

test("buildPageSeries returns every page for short ranges", () => {
  assert.deepEqual(buildPageSeries(4, 2), [1, 2, 3, 4]);
});

test("buildPageSeries compacts long ranges around the current page", () => {
  assert.deepEqual(buildPageSeries(20, 10), [1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
});

test("clampPage normalizes invalid and out-of-range values", () => {
  assert.equal(clampPage(Number.NaN, 5), 1);
  assert.equal(clampPage(-3, 5), 1);
  assert.equal(clampPage(9, 5), 5);
  assert.equal(clampPage(2.9, 5), 2);
});

test("tagPathSegment creates filesystem-safe, URL-stable names", () => {
  assert.equal(tagPathSegment("assembly"), "assembly");
  assert.equal(tagPathSegment("C# 8.0"), "C~23~208~2E0");
  assert.equal(tagPathSegment("modr/m"), "modr~2Fm");
  assert.equal(tagPathSegment("../escape"), "~2E~2E~2Fescape");
});
