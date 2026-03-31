import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import matter from "gray-matter";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

loadEnv();

type PostMeta = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
};

type Post = PostMeta & {
  html: string;
  content: string;
};

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "posts");
const SITE_DIR = path.join(ROOT, "site");
const POSTS_OUT_DIR = path.join(SITE_DIR, "posts");
const TAGS_OUT_DIR = path.join(SITE_DIR, "tags");
const UPLOADS_OUT_DIR = path.join(SITE_DIR, "assets", "uploads");
const POSTS_PER_PAGE = 8;

const GISCUS_CONFIG = {
  enabled: (process.env.GISCUS_ENABLED ?? "true") === "true",
  repo: process.env.GISCUS_REPO ?? "qluana7/devlog",
  repoId: process.env.GISCUS_REPO_ID ?? "R_kgDOR1RBKw",
  category: process.env.GISCUS_CATEGORY ?? "Comment",
  categoryId: process.env.GISCUS_CATEGORY_ID ?? "DIC_kwDOR1RBK84C5qRC",
  mapping: process.env.GISCUS_MAPPING ?? "pathname",
  strict: process.env.GISCUS_STRICT ?? "0",
  theme: process.env.GISCUS_THEME ?? "dark_dimmed"
};

const ENGAGEMENT_CONFIG = {
  enabled: process.env.ENGAGEMENT_ENABLED === "true",
  supabaseUrl: process.env.ENGAGEMENT_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.ENGAGEMENT_SUPABASE_ANON_KEY ?? ""
};

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  })
);

function assertString(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid frontmatter: '${name}' must be a non-empty string.`);
  }
  return value.trim();
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function sanitizeForSearch(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isExternalAsset(target: string): boolean {
  return /^(https?:\/\/|data:|mailto:|#|\/)/i.test(target);
}

function splitMarkdownDestination(raw: string): { target: string; trailing: string } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\S+)(\s+["'][\s\S]*["'])$/);
  if (match) {
    return { target: match[1], trailing: match[2] };
  }
  return { target: trimmed, trailing: "" };
}

async function rewriteMarkdownImages(markdown: string, slug: string, sourceDir: string): Promise<string> {
  const pattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const copied = new Map<string, string>();
  let rebuilt = "";
  let lastIndex = 0;
  let assetIndex = 0;

  for (const match of markdown.matchAll(pattern)) {
    const start = match.index ?? 0;
    const fullMatch = match[0];
    const altText = match[1];
    const destinationRaw = match[2];

    rebuilt += markdown.slice(lastIndex, start);

    const { target, trailing } = splitMarkdownDestination(destinationRaw);
    const normalizedTarget =
      target.startsWith("<") && target.endsWith(">") ? target.slice(1, -1).trim() : target.trim();

    if (!normalizedTarget || isExternalAsset(normalizedTarget)) {
      rebuilt += fullMatch;
      lastIndex = start + fullMatch.length;
      continue;
    }

    const sourcePath = path.resolve(sourceDir, normalizedTarget);
    try {
      const sourceStat = await stat(sourcePath);
      if (!sourceStat.isFile()) {
        rebuilt += fullMatch;
        lastIndex = start + fullMatch.length;
        continue;
      }

      let publicPath = copied.get(sourcePath);
      if (!publicPath) {
        assetIndex += 1;
        const ext = path.extname(sourcePath) || ".bin";
        const fileName = `${String(assetIndex).padStart(2, "0")}${ext.toLowerCase()}`;
        const postUploadDir = path.join(UPLOADS_OUT_DIR, slug);
        await mkdir(postUploadDir, { recursive: true });
        await copyFile(sourcePath, path.join(postUploadDir, fileName));
        publicPath = `../assets/uploads/${encodeURIComponent(slug)}/${encodeURIComponent(fileName)}`;
        copied.set(sourcePath, publicPath);
      }

      rebuilt += `![${altText}](${publicPath}${trailing})`;
    } catch {
      rebuilt += fullMatch;
    }

    lastIndex = start + fullMatch.length;
  }

  rebuilt += markdown.slice(lastIndex);
  return rebuilt;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTagPillsWithPrefix(tags: string[], rootPrefix: string): string {
  return tags
    .map(
      (tag) =>
        `<a class="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs hover:bg-accent/20" href="${rootPrefix}/tags/${encodeURIComponent(tag)}.html">${escapeHtml(tag)}</a>`
    )
    .join("");
}

function renderLimitedTagPillsWithPrefix(tags: string[], rootPrefix: string, limit = 3): string {
  const visible = tags.slice(0, limit);
  const hiddenCount = Math.max(0, tags.length - visible.length);
  const pills = renderTagPillsWithPrefix(visible, rootPrefix);
  if (!hiddenCount) {
    return pills;
  }
  const hiddenLabel = escapeHtml(tags.slice(limit).join(", "));
  return `${pills}<span class="tag-overflow-tooltip px-2 py-0.5 rounded bg-border/30 text-subtle text-xs" data-tooltip="${hiddenLabel}" tabindex="0">+${hiddenCount}</span>`;
}

function renderProfileCard(): string {
  return `<aside id="profile" class="space-y-4 lg:col-span-1 order-2 lg:order-1">
      <section class="rounded-lg p-5 bg-muted-surface/50 border border-border/20 text-sm text-subtle lg:sticky lg:top-20 lg:self-start lg:max-h-[70vh] lg:overflow-auto">
        <h3 class="text-base font-semibold text-text">Luana7</h3>
        <p class="mt-2 leading-relaxed">C++ 개발자. 엠베디드/시스템 지향. Assembly와 같은 로우 레벨을 탐구하는 것을 좋아함.</p>

        <div class="mt-4 space-y-2">
          <a class="block hover:text-accent" href="https://github.com/qluana7" target="_blank" rel="noreferrer">GitHub - @qluana7</a>
          <a class="block hover:text-accent" href="https://luana7.notion.site/About-Me-8fec3d019a8a435c8e1516ea85116f68" target="_blank" rel="noreferrer">Notion - About Me</a>
        </div>

        <details class="mt-4 group">
          <summary class="cursor-pointer select-none text-xs text-subtle hover:text-accent">More links</summary>
          <div class="mt-3 space-y-2 text-xs leading-relaxed">
            <a class="block hover:text-accent" href="https://www.acmicpc.net/user/lukince" target="_blank" rel="noreferrer">Baekjoon - lukince</a>
            <a class="block hover:text-accent" href="https://www.acmicpc.net/user/cssembler" target="_blank" rel="noreferrer">Baekjoon - cssembler</a>
            <a class="block hover:text-accent" href="https://codeforces.com/profile/luana7" target="_blank" rel="noreferrer">Codeforces - luana7</a>
            <a class="block hover:text-accent" href="https://atcoder.jp/users/luana7" target="_blank" rel="noreferrer">atcoder - luana7</a>
          </div>
        </details>
      </section>
    </aside>`;
}

function renderLayout(title: string, body: string, rootPrefix: string): string {
  const engagementConfigScript = `<script>window.__ENGAGEMENT_CONFIG__={enabled:${
    ENGAGEMENT_CONFIG.enabled ? "true" : "false"
  },supabaseUrl:${JSON.stringify(ENGAGEMENT_CONFIG.supabaseUrl)},supabaseAnonKey:${JSON.stringify(
    ENGAGEMENT_CONFIG.supabaseAnonKey
  )}};</script>`;

  return `<!doctype html>
<html lang="ko" class="">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Fira+Code:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${rootPrefix}/assets/styles.css">
  ${engagementConfigScript}
  <script defer src="${rootPrefix}/assets/search.js"></script>
  <script defer src="${rootPrefix}/assets/pagination.js"></script>
  <script defer src="${rootPrefix}/assets/post.js"></script>
</head>
<body class="antialiased bg-bg text-text font-inter">
  <header class="sticky top-0 border-b border-border/40 bg-header/80 backdrop-blur-md z-10">
    <div class="max-w-5xl mx-auto px-4 py-4">
      <div class="flex items-center gap-6">
        <a class="text-lg font-semibold tracking-tight hover:text-accent" href="${rootPrefix}/index.html">Devlog</a>
        <nav class="flex items-center gap-4 text-sm">
          <a class="hover:text-accent" href="${rootPrefix}/index.html#posts">Posts</a>
        </nav>
        <div class="ml-auto">
          <button id="search-toggle" type="button" class="inline-flex items-center gap-2 rounded-md border border-border/40 px-2 py-1 text-xs text-subtle hover:text-accent hover:border-accent/50" aria-expanded="false" aria-controls="search-panel">
            <span aria-hidden="true">Search</span>
          </button>
        </div>
      </div>
    </div>
  </header>
  ${body}
  <footer class="border-t border-border/30 mt-10">
    <div class="max-w-5xl mx-auto px-4 py-6 text-sm text-subtle">Copyright © ${new Date().getFullYear()} qluana7. All rights reserved.</div>
  </footer>
</body>
</html>`;
}

function renderCommentsBlock(): string {
  if (
    GISCUS_CONFIG.enabled &&
    GISCUS_CONFIG.repo &&
    GISCUS_CONFIG.repoId &&
    GISCUS_CONFIG.category &&
    GISCUS_CONFIG.categoryId
  ) {
    return `<section class="mt-10 rounded-lg p-5 bg-header/30 border border-border/20">
      <h2 class="text-base font-semibold mb-4">Comments</h2>
      <script
        src="https://giscus.app/client.js"
        data-repo="${escapeHtml(GISCUS_CONFIG.repo)}"
        data-repo-id="${escapeHtml(GISCUS_CONFIG.repoId)}"
        data-category="${escapeHtml(GISCUS_CONFIG.category)}"
        data-category-id="${escapeHtml(GISCUS_CONFIG.categoryId)}"
        data-mapping="${escapeHtml(GISCUS_CONFIG.mapping)}"
        data-strict="${escapeHtml(GISCUS_CONFIG.strict)}"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="${escapeHtml(GISCUS_CONFIG.theme)}"
        data-lang="ko"
        data-loading="lazy"
        crossorigin="anonymous"
        async
      ></script>
    </section>`;
  }

  return `<section class="mt-10 rounded-lg p-5 bg-header/30 border border-border/20">
      <h2 class="text-base font-semibold mb-2">Comments</h2>
      <p class="text-sm text-subtle">Giscus 설정이 비어 있어 댓글 위젯이 비활성화 상태입니다. 설정값을 넣으면 자동으로 댓글/반응(좋아요)이 활성화됩니다.</p>
    </section>`;
}

function renderPostBody(post: Post, previousPost?: Post, nextPost?: Post): string {
  const navigation =
    previousPost || nextPost
      ? `<section class="mt-8 grid gap-4 sm:grid-cols-2">${
          previousPost
            ? `<a class="rounded-lg p-4 bg-header/40 border border-border/30 hover:border-accent/40" href="${escapeHtml(previousPost.slug)}.html"><p class="text-xs text-subtle">Previous</p><p class="mt-1 text-sm font-medium">${escapeHtml(previousPost.title)}</p><p class="mt-1 text-xs text-subtle">${escapeHtml(
                formatDate(previousPost.date)
              )}</p></a>`
            : '<div></div>'
        }${
          nextPost
            ? `<a class="rounded-lg p-4 bg-header/40 border border-border/30 hover:border-accent/40" href="${escapeHtml(nextPost.slug)}.html"><p class="text-xs text-subtle">Next</p><p class="mt-1 text-sm font-medium">${escapeHtml(nextPost.title)}</p><p class="mt-1 text-xs text-subtle">${escapeHtml(
                formatDate(nextPost.date)
              )}</p></a>`
            : ""
        }</section>`
      : "";

  return `<main class="max-w-6xl mx-auto px-4 py-8">
    <article class="rounded-lg p-6 bg-muted-surface/50 border border-border/20" data-post-slug="${escapeHtml(post.slug)}">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold tracking-tight">${escapeHtml(post.title)}</h1>
        <div class="mt-3 text-xs flex items-center gap-2 text-subtle">
          <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
          <span class="hidden sm:inline-flex items-center gap-1">
            <span>views</span>
            <span id="view-count">-</span>
          </span>
          <button id="like-button" type="button" class="post-like-button" aria-label="Toggle like">
            <span aria-hidden="true">❤</span>
            <span id="like-count">-</span>
          </button>
          <div class="ml-2 flex gap-2 flex-wrap">${renderTagPillsWithPrefix(post.tags, "..")}</div>
        </div>
      </div>
      <div class="prose prose-invert prose-pre:bg-code prose-pre:text-sm max-w-none">${post.html}</div>
      ${navigation}
      <a class="inline-block mt-8 text-sm hover:text-accent" href="../index.html"><- Back to posts</a>
      ${renderCommentsBlock()}
    </article>
  </main>`;
}

function renderPostCards(posts: Post[], prefix: string): string {
  return posts
    .map(
      (post) => `<article class="post-card">
        <h2 class="text-lg font-semibold"><a class="hover:text-accent" href="${prefix}/posts/${escapeHtml(post.slug)}.html">${escapeHtml(post.title)}</a></h2>
        <p class="mt-2 text-sm text-subtle">${escapeHtml(post.excerpt)}</p>
        <div class="mt-3 text-xs flex items-center gap-2 text-subtle">
          <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
          <div class="ml-2 flex gap-2 whitespace-nowrap">${renderLimitedTagPillsWithPrefix(post.tags, prefix)}</div>
        </div>
      </article>`
    )
    .join("\n");
}

function renderTagCloud(
  entries: [string, number][],
  rootPrefix: string,
  activeTag?: string
): string {
  if (!entries.length) {
    return '<div class="text-subtle">No tags yet</div>';
  }

  return entries
    .map(([tag, count]) => {
      const isActive = activeTag === tag;
      const className = isActive
        ? "px-2 py-0.5 rounded bg-accent text-header text-xs inline-flex items-center gap-2"
        : "px-2 py-0.5 rounded bg-accent/10 text-accent text-xs inline-flex items-center gap-2 hover:bg-accent/20";
      return `<a class="${className}" href="${rootPrefix}/tags/${encodeURIComponent(tag)}.html">${escapeHtml(tag)} <span class="text-[11px] ${
        isActive ? "text-header/80" : "text-subtle"
      }">(${count})</span></a>`;
    })
    .join("");
}

function renderSearchBox(): string {
  return `<section id="search-panel" class="hidden rounded-lg p-4 bg-muted-surface/60 border border-border/20 mb-6">
    <div class="flex items-center justify-between gap-3">
      <label class="block text-sm text-subtle" for="search-input">Search posts (title, excerpt, content, tags)</label>
      <button id="search-close" type="button" class="text-xs text-subtle hover:text-accent">Close</button>
    </div>
    <input id="search-input" type="search" placeholder="e.g. tsgo, markdown, 코드 블록 or /ts.+go/i" class="mt-2 w-full rounded-md border border-border/40 bg-header/40 px-3 py-2 text-sm outline-none focus:border-accent" />
    <p id="search-meta" class="mt-2 text-xs text-subtle"></p>
  </section>
  <section id="search-results" class="grid gap-4 hidden" aria-live="polite"></section>`;
}

function renderIndexBody(posts: Post[]): string {
  const tagCount = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
    }
  }

  const sortedTags = Array.from(tagCount.entries()).sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }
    return a[0].localeCompare(b[0]);
  });

  const cards = renderPostCards(posts, ".");
  const tags = renderTagCloud(sortedTags, ".");

  return `<main class="max-w-[88rem] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
    ${renderProfileCard()}
    <section id="posts" aria-label="Blog posts" class="lg:col-span-2 order-1 lg:order-2 lg:-ml-3 lg:pr-8 xl:pr-12">
      <div class="lg:max-w-[48rem] xl:max-w-[52rem]">
        ${renderSearchBox()}
        <section id="default-posts" class="grid gap-6" data-page-size="${POSTS_PER_PAGE}" data-pagination-base="index">${cards}</section>
        <nav id="post-pagination" class="mt-8 flex flex-wrap items-center gap-2" aria-label="Pagination"></nav>
      </div>
    </section>
    <aside id="tags" class="space-y-4 lg:col-span-1 order-3 lg:pl-8 xl:pl-12">
      <div class="custom-scroll rounded-lg p-5 bg-muted-surface/50 border border-border/20 text-sm text-subtle lg:sticky lg:top-20 lg:self-start lg:w-full lg:max-w-[18rem] lg:ml-auto lg:max-h-[46vh] lg:overflow-auto">
        <h4 class="font-medium mb-2">Tags</h4>
        <div class="flex flex-wrap gap-2 text-subtle">${tags}</div>
      </div>
    </aside>
  </main>`;
}

function renderTagPageBody(tag: string, posts: Post[], allTags: [string, number][]): string {
  const cards = renderPostCards(posts, "..");
  const tags = renderTagCloud(allTags, "..", tag);
  const tagBase = `tag:${encodeURIComponent(tag)}`;
  return `<main class="max-w-[88rem] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
    ${renderProfileCard()}
    <section class="lg:col-span-2 order-1 lg:order-2 lg:-ml-3 lg:pr-8 xl:pr-12">
      <div class="lg:max-w-[48rem] xl:max-w-[52rem]">
        <div class="mb-4 text-sm text-subtle"><a class="hover:text-accent" href="../index.html">Home</a> / Tag</div>
        <h1 class="text-2xl font-semibold tracking-tight mb-6">#${escapeHtml(tag)}</h1>
        <section id="tag-posts" class="grid gap-6" data-page-size="${POSTS_PER_PAGE}" data-pagination-base="${tagBase}">${cards}</section>
        <nav id="tag-pagination" class="mt-8 flex flex-wrap items-center gap-2" aria-label="Pagination"></nav>
      </div>
    </section>
    <aside class="space-y-4 lg:col-span-1 order-3 lg:pl-8 xl:pl-12">
      <div class="custom-scroll rounded-lg p-5 bg-muted-surface/50 border border-border/20 text-sm text-subtle lg:sticky lg:top-20 lg:self-start lg:w-full lg:max-w-[18rem] lg:ml-auto lg:max-h-[46vh] lg:overflow-auto">
        <h4 class="font-medium mb-2">All Tags</h4>
        <div class="flex flex-wrap gap-2 text-subtle">${tags}</div>
      </div>
    </aside>
  </main>`;
}

async function readPosts(): Promise<Post[]> {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(CONTENT_DIR, entry.name));

  const posts: Post[] = [];
  for (const filePath of markdownFiles) {
    const raw = await readFile(filePath, "utf8");
    const parsed = matter(raw);
    const title = assertString(parsed.data.title, "title");
    const slug = assertString(parsed.data.slug, "slug");
    const date = assertString(parsed.data.date, "date");
    const excerpt = assertString(parsed.data.excerpt, "excerpt");
    const tags = normalizeTags(parsed.data.tags);
    const markdownWithAssets = await rewriteMarkdownImages(parsed.content, slug, path.dirname(filePath));
    const html = await marked.parse(markdownWithAssets);
    const content = sanitizeForSearch(parsed.content);

    posts.push({
      title,
      slug,
      date,
      excerpt,
      tags,
      html,
      content
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

async function writePostPages(posts: Post[]): Promise<void> {
  await mkdir(POSTS_OUT_DIR, { recursive: true });
  await Promise.all(
    posts.map((post, index) => {
      const previousPost = index < posts.length - 1 ? posts[index + 1] : undefined;
      const nextPost = index > 0 ? posts[index - 1] : undefined;

      const html = renderLayout(post.title, renderPostBody(post, previousPost, nextPost), "..");
      const filePath = path.join(POSTS_OUT_DIR, `${post.slug}.html`);
      return writeFile(filePath, html, "utf8");
    })
  );
}

function collectSortedTags(posts: Post[]): [string, number][] {
  const tagCount = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(tagCount.entries()).sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }
    return a[0].localeCompare(b[0]);
  });
}

async function writeTagPages(posts: Post[]): Promise<void> {
  const sortedTags = collectSortedTags(posts);
  await mkdir(TAGS_OUT_DIR, { recursive: true });

  await Promise.all(
    sortedTags.map(async ([tag]) => {
      const taggedPosts = posts.filter((post) => post.tags.includes(tag));
      const html = renderLayout(`#${tag} posts`, renderTagPageBody(tag, taggedPosts, sortedTags), "..");
      const filePath = path.join(TAGS_OUT_DIR, `${encodeURIComponent(tag)}.html`);
      await writeFile(filePath, html, "utf8");
    })
  );
}

async function writeIndexPage(posts: Post[]): Promise<void> {
  const html = renderLayout("Devlog", renderIndexBody(posts), ".");
  await writeFile(path.join(SITE_DIR, "index.html"), html, "utf8");
}

async function writeFeedData(posts: Post[]): Promise<void> {
  const metadata = posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags,
    content: post.content
  }));

  await writeFile(path.join(SITE_DIR, "posts.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
}

async function writeSearchScript(): Promise<void> {
  await copyFile(path.join(ROOT, "src", "search-client.js"), path.join(SITE_DIR, "assets", "search.js"));
}

async function writePaginationScript(): Promise<void> {
  await copyFile(path.join(ROOT, "src", "pagination-client.js"), path.join(SITE_DIR, "assets", "pagination.js"));
}

async function writePostScript(): Promise<void> {
  await copyFile(path.join(ROOT, "src", "post-client.js"), path.join(SITE_DIR, "assets", "post.js"));
}

async function build(): Promise<void> {
  await rm(POSTS_OUT_DIR, { recursive: true, force: true });
  await rm(TAGS_OUT_DIR, { recursive: true, force: true });
  await rm(path.join(SITE_DIR, "pages"), { recursive: true, force: true });
  await rm(UPLOADS_OUT_DIR, { recursive: true, force: true });
  const posts = await readPosts();
  await writePostPages(posts);
  await writeTagPages(posts);
  await writeIndexPage(posts);
  await writeFeedData(posts);
  await writeSearchScript();
  await writePaginationScript();
  await writePostScript();
  console.log(`Generated ${posts.length} post pages, tags, index, and search data.`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
