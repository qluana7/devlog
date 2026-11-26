import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const SITEMAP_URL = "https://thinkcs.tistory.com/sitemap.xml";
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const MONTHS = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12"
};

function decodeHtmlEntities(input) {
  return input
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&nbsp;", " ");
}

function stripHtml(input) {
  return input
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyFromLink(link, index) {
  const segment = link.split("/").filter(Boolean).at(-1) ?? `post-${index + 1}`;
  const decoded = decodeURIComponent(segment);
  const slug = decoded
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `post-${index + 1}`;
}

function normalizeKoreanDate(raw) {
  const match = raw.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\./);
  if (!match) return null;
  return `${match[1]}-${String(Number(match[2])).padStart(2, "0")}-${String(Number(match[3])).padStart(2, "0")}`;
}

function normalizeRssDate(pubDate) {
  const match = pubDate.match(/,\s*(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (!match) return "2022-01-01";
  const day = String(Number(match[1])).padStart(2, "0");
  const month = MONTHS[match[2]] ?? "01";
  const year = match[3];
  return `${year}-${month}-${day}`;
}

function absolutizeProtocolRelative(html) {
  return html
    .replace(/(src|href)="\/\//g, "$1=\"https://")
    .replace(/(srcset)="\/\//g, "$1=\"https://");
}

function extractSitemapEntryUrls(xmlText) {
  const urls = [];
  for (const match of xmlText.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const loc = match[1].trim();
    if (!loc.includes("/entry/")) continue;
    if (loc.includes("/m/entry/")) continue;
    urls.push(loc);
  }
  return [...new Set(urls)];
}

async function fetchPostFromMobilePage(url, index) {
  const mobileUrl = url.includes("/m/entry/") ? url : url.replace("/entry/", "/m/entry/");
  const response = await fetch(mobileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch entry: ${mobileUrl} (${response.status})`);
  }

  const html = await response.text();

  const titleMatch = html.match(/<h3 class="tit_blogview">([\s\S]*?)<\/h3>/i);
  const title = decodeHtmlEntities((titleMatch?.[1] ?? "").trim()) || `Imported Post ${index + 1}`;

  const dateMatch = html.match(/<span class="txt_date">([\s\S]*?)<\/span>/i);
  const date = normalizeKoreanDate((dateMatch?.[1] ?? "").trim()) ?? "2022-01-01";

  const contentMatch = html.match(/<div class="blogview_content[\s\S]*?">([\s\S]*?)<\/div>\s*<!-- System - START -->/i);
  const contentHtml = absolutizeProtocolRelative((contentMatch?.[1] ?? "").trim());

  const tagBlockMatch = html.match(/<div class="list_tag">([\s\S]*?)<\/div>/i);
  const tags = [];
  if (tagBlockMatch) {
    for (const tagMatch of tagBlockMatch[1].matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)) {
      const tag = decodeHtmlEntities(tagMatch[1].trim());
      if (tag) tags.push(tag);
    }
  }

  const bodyText = stripHtml(contentHtml);
  const excerpt = bodyText.slice(0, 150) || title;
  const slug = slugifyFromLink(url, index);
  const safeTags = [...new Set(tags)].slice(0, 8);

  return {
    title,
    slug,
    date,
    excerpt,
    tags: safeTags.length ? safeTags : ["imported", "legacy"],
    source: url,
    contentHtml
  };
}

function toMarkdown(post) {
  return [
    "---",
    `title: ${JSON.stringify(post.title)}`,
    `slug: ${JSON.stringify(post.slug)}`,
    `date: ${JSON.stringify(post.date)}`,
    `excerpt: ${JSON.stringify(post.excerpt)}`,
    "tags:",
    ...post.tags.map((tag) => `  - ${JSON.stringify(tag)}`),
    "---",
    "",
    post.contentHtml,
    ""
  ].join("\n");
}

async function main() {
  const sitemapResponse = await fetch(SITEMAP_URL);
  if (!sitemapResponse.ok) {
    throw new Error(`Failed to fetch sitemap: ${sitemapResponse.status}`);
  }
  const sitemapXml = await sitemapResponse.text();
  const entryUrls = extractSitemapEntryUrls(sitemapXml);

  if (!entryUrls.length) {
    throw new Error("No entry URLs found in sitemap.");
  }

  await mkdir(POSTS_DIR, { recursive: true });
  const existing = await readdir(POSTS_DIR);
  await Promise.all(
    existing
      .filter((name) => name.endsWith(".md"))
      .map((name) => rm(path.join(POSTS_DIR, name), { force: true }))
  );

  for (let i = 0; i < entryUrls.length; i += 1) {
    const post = await fetchPostFromMobilePage(entryUrls[i], i);
    await writeFile(path.join(POSTS_DIR, `${post.slug}.md`), toMarkdown(post), "utf8");
  }

  console.log(`Imported ${entryUrls.length} posts into ${POSTS_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
