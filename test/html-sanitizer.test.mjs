import assert from "node:assert/strict";
import test from "node:test";
import { sanitizePostHtml } from "../build-scripts/html-sanitizer.js";

test("removes executable markup and unsafe URL schemes", () => {
  const actual = sanitizePostHtml(
    '<script>alert(1)</script><img src="x" onerror="alert(2)"><a href="javascript:alert(3)">link</a>'
  );

  assert.doesNotMatch(actual, /script|onerror|javascript:/i);
  assert.match(actual, /<img src="x" \/>/);
  assert.match(actual, /<a>link<\/a>/);
});

test("keeps the attributes used by post enhancements", () => {
  const actual = sanitizePostHtml(
    '<div class="spoiler" tabindex="0" role="button" aria-label="스포일러 보기" aria-expanded="false">' +
      '<img src="data:image/png;base64,AA==" alt="예시" loading="lazy" decoding="async">' +
      "</div>"
  );

  assert.match(actual, /class="spoiler"/);
  assert.match(actual, /aria-expanded="false"/);
  assert.match(actual, /src="data:image\/png;base64,AA=="/);
  assert.match(actual, /loading="lazy"/);
});

test("hardens links that open a new browsing context", () => {
  const actual = sanitizePostHtml('<a href="https://example.com" target="_blank">example</a>');

  assert.match(actual, /target="_blank"/);
  assert.match(actual, /rel="noopener noreferrer"/);
});
