import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import {
  assertUniqueSlugs,
  parsePostMeta,
  resolveWithin,
  validateDate,
  validateSlug
} from "../build-scripts/post-validation.js";

const validPost = {
  title: "Post",
  slug: "safe-post",
  date: "2026-07-29",
  excerpt: "Excerpt",
  tags: ["typescript"]
};

test("parsePostMeta accepts a complete post", () => {
  assert.deepEqual(parsePostMeta(validPost), validPost);
});

test("validateSlug rejects traversal and noncanonical slugs", () => {
  assert.throws(() => validateSlug("../../outside"), /lowercase letters/);
  assert.throws(() => validateSlug("Uppercase"), /lowercase letters/);
  assert.throws(() => validateSlug("double--hyphen"), /lowercase letters/);
});

test("validateDate rejects impossible calendar dates", () => {
  assert.throws(() => validateDate("2026-02-30"), /calendar date/);
  assert.throws(() => validateDate("2026/07/29"), /YYYY-MM-DD/);
});

test("assertUniqueSlugs rejects duplicate output paths", () => {
  assert.throws(() => assertUniqueSlugs([validPost, { ...validPost }]), /Duplicate post slug/);
});

test("resolveWithin rejects paths outside the output root", () => {
  const root = path.resolve("/tmp/devlog-test-root");
  assert.equal(resolveWithin(root, "posts", "safe.html"), path.join(root, "posts", "safe.html"));
  assert.throws(() => resolveWithin(root, "..", "outside.html"), /escapes its allowed root/);
});
