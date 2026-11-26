import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const LANGUAGE_MAP = {
  "c++": "cpp",
  x86asm: "asm",
  bash: "bash",
  cpp: "cpp",
  c: "c"
};

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function decodeHtmlEntities(text) {
  return text
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function makeExcerptFromBody(body) {
  const plain = decodeHtmlEntities(body)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, 150);
}

function extractAttr(fragment, name) {
  const re = new RegExp(`${name}="([\\s\\S]*?)"`, "i");
  const match = fragment.match(re);
  return match ? decodeHtmlEntities(match[1].trim()) : "";
}

function extractFirstHref(fragment) {
  const match = fragment.match(/<a[^>]*href="([^"]+)"/i);
  return match ? decodeHtmlEntities(match[1].trim()) : "";
}

function textFromHtml(fragment) {
  return decodeHtmlEntities(fragment.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function buildEmbedCard({ url, title, description, host, image }) {
  const safeUrl = url ? escapeHtml(url) : "";
  const safeTitle = escapeHtml(title || host || "External content");
  const safeDesc = description ? escapeHtml(description) : "";

  let resolvedHost = host;
  if (!resolvedHost && url) {
    try {
      resolvedHost = new URL(url).hostname;
    } catch {
      resolvedHost = "external";
    }
  }
  const safeHost = escapeHtml(resolvedHost || "external");

  const imageHtml = image
    ? `<div class="embed-card-media"><img src="${escapeHtml(image)}" alt="${safeTitle}" loading="lazy" /></div>`
    : "";

  const cardClass = image ? "embed-card-link" : "embed-card-link embed-card-no-media";

  const bodyHtml = `<div class="embed-card-body"><p class="embed-card-title">${safeTitle}</p>${
    safeDesc ? `<p class="embed-card-desc">${safeDesc}</p>` : ""
  }<p class="embed-card-host">${safeHost}</p></div>`;

  if (safeUrl) {
    return `<div class="embed-card"><a class="${cardClass}" href="${safeUrl}" target="_blank" rel="noreferrer noopener">${imageHtml}${bodyHtml}</a></div>`;
  }

  return `<div class="embed-card"><div class="${cardClass}">${imageHtml}${bodyHtml}</div></div>`;
}

function getParagraphsFromFigure(figure) {
  return [...figure.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => textFromHtml(m[1]))
    .filter(Boolean);
}

function normalizeEmbedFigures(content) {
  let out = content;

  out = out.replace(/<figure[\s\S]*?data-og-url="[\s\S]*?<\/figure>/gi, (figure) => {
    const url = extractAttr(figure, "data-og-url") || extractAttr(figure, "data-og-source-url") || extractFirstHref(figure);
    const title = extractAttr(figure, "data-og-title") || textFromHtml(figure).slice(0, 120);
    const description = extractAttr(figure, "data-og-description");
    const host = extractAttr(figure, "data-og-host");
    const image = extractAttr(figure, "data-og-image");
    return `\n\n${buildEmbedCard({ url, title, description, host, image })}\n\n`;
  });

  out = out.replace(/<figure[\s\S]*?data-og-source-url="[\s\S]*?<\/figure>/gi, (figure) => {
    const url = extractAttr(figure, "data-og-url") || extractAttr(figure, "data-og-source-url") || extractFirstHref(figure);
    const paras = getParagraphsFromFigure(figure);
    const title = extractAttr(figure, "data-og-title") || paras[0] || "Embedded link";
    const description = extractAttr(figure, "data-og-description") || paras[1] || "";
    const host = extractAttr(figure, "data-og-host") || paras[2] || "";
    const image = extractAttr(figure, "data-og-image");
    return `\n\n${buildEmbedCard({ url, title, description, host, image })}\n\n`;
  });

  out = out.replace(/<figure[\s\S]*?<iframe[^>]*src="([^"]+)"[^>]*>[\s\S]*?<\/figure>/gi, (_m, src) => {
    const url = decodeHtmlEntities(src.trim());
    return `\n\n${buildEmbedCard({ url, title: "Embedded media", description: "Open media in a new tab" })}\n\n`;
  });

  out = out.replace(/<iframe[^>]*src="([^"]+)"[^>]*><\/iframe>/gi, (_m, src) => {
    const url = decodeHtmlEntities(src.trim());
    return `\n\n${buildEmbedCard({ url, title: "Embedded media", description: "Open media in a new tab" })}\n\n`;
  });

  out = out.replace(/<figure[\s\S]*?<a[^>]*href="([^"]+)"[\s\S]*?<\/figure>/gi, (figure, href) => {
    if (/<img\b/i.test(figure)) {
      return figure;
    }
    const url = decodeHtmlEntities(String(href).trim());
    const paras = getParagraphsFromFigure(figure);
    const title = paras[0] || textFromHtml(figure) || "External link";
    const description = paras[1] || "";
    const host = paras[2] || "";
    return `\n\n${buildEmbedCard({ url, title, description, host })}\n\n`;
  });

  return out;
}

function normalizeFrontmatter(frontmatter, excerpt) {
  const lines = frontmatter
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("excerpt:"));

  let insertAt = lines.findIndex((line) => line.trimStart().startsWith("date:"));
  if (insertAt === -1) {
    insertAt = lines.findIndex((line) => line.trimStart().startsWith("slug:"));
  }
  if (insertAt === -1) {
    insertAt = 0;
  }

  lines.splice(insertAt + 1, 0, `excerpt: ${JSON.stringify(excerpt)}`);
  return lines.join("\n").trimEnd();
}

function normalizeBody(body) {
  let out = body.replace(/\r\n/g, "\n");
  const codeBlocks = [];

  out = normalizeEmbedFigures(out);

  out = out.replace(/<pre[^>]*data-ke-language="([^"]*)"[^>]*><code>([\s\S]*?)<\/code><\/pre>/gi, (_m, lang, code) => {
    const mappedLang = LANGUAGE_MAP[(lang ?? "").trim().toLowerCase()] ?? "text";
    const cleanCode = decodeHtmlEntities(code).replace(/<br\s*\/?\s*>/gi, "\n").trim();
    const block = ["", "", "```" + mappedLang, cleanCode, "```", "", ""].join("\n");
    const idx = codeBlocks.length;
    codeBlocks.push(block);
    return `@@CODE_${idx}@@`;
  });

  out = out.replace(/<figure[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>[\s\S]*?<\/figure>/gi, (_m, src) => {
    const absolute = src.startsWith("//") ? `https:${src}` : src;
    return `\n\n![](${absolute})\n\n`;
  });

  out = decodeHtmlEntities(out);
  out = out.replace(/<\/?(span|tbody|thead|tr|td|th)[^>]*>/gi, "");
  out = out.replace(/\sdata-ke-[a-zA-Z-]+="[^"]*"/g, "");
  out = out.replace(/\sstyle="[^"]*"/g, "");
  out = out.replace(/<br\s*\/?\s*>/gi, "<br>");

  out = out.replace(/<p>[\s\u00A0\u200B\uFEFF]*<\/p>/gi, "<p><br></p>");
  out = out.replace(/(<p><br><\/p>\s*){2,}/gi, "<p><br></p>\n");

  for (let i = 0; i < codeBlocks.length; i += 1) {
    out = out.replace(`@@CODE_${i}@@`, codeBlocks[i]);
  }

  out = out.replace(/```\n([a-zA-Z0-9+#-]+)\n/g, "```$1\n");

  return out.replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeFile(raw) {
  const matched = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!matched) return raw;
  const body = normalizeBody(matched[2]);
  const excerpt = makeExcerptFromBody(body);
  const fm = normalizeFrontmatter(matched[1], excerpt);
  return `---\n${fm}\n---\n\n${body}\n`;
}

async function main() {
  const entries = await readdir(POSTS_DIR, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));
  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file.name);
    const raw = await readFile(filePath, "utf8");
    await writeFile(filePath, normalizeFile(raw), "utf8");
  }
  console.log(`Normalized ${files.length} markdown files`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
