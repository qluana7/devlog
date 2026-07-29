import assert from "node:assert/strict";
import test from "node:test";
import { escapeHtml, formatDate, toAbsoluteUrl } from "../build-scripts/render-utils.js";

test("escapeHtml escapes text used in generated markup", () => {
  assert.equal(escapeHtml('<a title="x">&</a>'), "&lt;a title=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
});

test("formatDate formats validated ISO dates", () => {
  assert.equal(formatDate("2026-07-29"), "2026.07.29");
});

test("toAbsoluteUrl keeps the project base path", () => {
  assert.equal(
    toAbsoluteUrl("https://qluana7.github.io/devlog/", "/posts/example.html"),
    "https://qluana7.github.io/devlog/posts/example.html"
  );
});
