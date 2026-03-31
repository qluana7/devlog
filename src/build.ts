import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

type PostMeta = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
};

type Post = PostMeta & {
  html: string;
};

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "posts");
const SITE_DIR = path.join(ROOT, "site");
const POSTS_OUT_DIR = path.join(SITE_DIR, "posts");

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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTagPills(tags: string[]): string {
  return tags
    .map(
      (tag) =>
        `<span class="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs">${escapeHtml(tag)}</span>`
    )
    .join("");
}

function renderLayout(title: string, body: string, rootPrefix: string): string {
  return `<!doctype html>
<html lang="ko" class="">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Fira+Code:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${rootPrefix}/assets/styles.css">
</head>
<body class="antialiased bg-bg text-text font-inter">
  <header class="sticky top-0 border-b border-border/40 bg-header/80 backdrop-blur-md z-10">
    <div class="max-w-5xl mx-auto px-4 py-4">
      <div class="flex items-center gap-6">
        <a class="text-lg font-semibold tracking-tight hover:text-accent" href="${rootPrefix}/index.html">Luana7</a>
        <nav class="hidden md:flex gap-4 text-sm">
          <a class="hover:text-accent" href="${rootPrefix}/index.html#posts">Posts</a>
          <a class="hover:text-accent" href="${rootPrefix}/index.html#tags">Tags</a>
        </nav>
      </div>
    </div>
  </header>
  ${body}
  <footer class="border-t border-border/30 mt-10">
    <div class="max-w-5xl mx-auto px-4 py-6 text-sm text-subtle">Built with TypeScript 7 tsgo</div>
  </footer>
</body>
</html>`;
}

function renderPostBody(post: Post): string {
  return `<main class="max-w-5xl mx-auto px-4 py-8">
    <article class="rounded-lg p-6 bg-muted-surface/50 border border-border/20">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold tracking-tight">${escapeHtml(post.title)}</h1>
        <div class="mt-3 text-xs flex items-center gap-2 text-subtle">
          <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
          <div class="ml-2 flex gap-2 flex-wrap">${renderTagPills(post.tags)}</div>
        </div>
      </div>
      <div class="prose prose-invert prose-pre:bg-code prose-pre:text-sm max-w-none">${post.html}</div>
      <a class="inline-block mt-8 text-sm hover:text-accent" href="../index.html"><- Back to posts</a>
    </article>
  </main>`;
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

  const cards = posts
    .map(
      (post) => `<article class="post-card">
        <h2 class="text-lg font-semibold"><a class="hover:text-accent" href="posts/${escapeHtml(post.slug)}.html">${escapeHtml(post.title)}</a></h2>
        <p class="mt-2 text-sm text-subtle">${escapeHtml(post.excerpt)}</p>
        <div class="mt-3 text-xs flex items-center gap-2 text-subtle">
          <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
          <div class="ml-2 flex gap-2 flex-wrap">${renderTagPills(post.tags)}</div>
        </div>
      </article>`
    )
    .join("\n");

  const tags = sortedTags.length
    ? sortedTags
        .map(
          ([tag, count]) =>
            `<span class="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs inline-flex items-center gap-2">${escapeHtml(tag)} <span class="text-subtle text-[11px]">(${count})</span></span>`
        )
        .join("")
    : '<div class="text-subtle">No tags yet</div>';

  return `<main class="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
    <section id="posts" aria-label="Blog posts" class="lg:col-span-2 grid gap-6">${cards}
    </section>
    <aside id="tags" class="space-y-4 lg:col-span-1">
      <div class="rounded-lg p-5 bg-muted-surface/50 border border-border/20 text-sm text-subtle lg:sticky lg:top-20 lg:self-start lg:max-h-[70vh] lg:overflow-auto">
        <h4 class="font-medium mb-2">Tags</h4>
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
    const html = await marked.parse(parsed.content);

    posts.push({
      title,
      slug,
      date,
      excerpt,
      tags,
      html
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

async function writePostPages(posts: Post[]): Promise<void> {
  await mkdir(POSTS_OUT_DIR, { recursive: true });
  await Promise.all(
    posts.map((post) => {
      const html = renderLayout(post.title, renderPostBody(post), "..");
      const filePath = path.join(POSTS_OUT_DIR, `${post.slug}.html`);
      return writeFile(filePath, html, "utf8");
    })
  );
}

async function writeIndexPage(posts: Post[]): Promise<void> {
  const html = renderLayout("Luana7's Blog", renderIndexBody(posts), ".");
  await writeFile(path.join(SITE_DIR, "index.html"), html, "utf8");
}

async function writeFeedData(posts: Post[]): Promise<void> {
  const metadata: PostMeta[] = posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags
  }));

  await writeFile(path.join(SITE_DIR, "posts.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
}

async function build(): Promise<void> {
  await rm(POSTS_OUT_DIR, { recursive: true, force: true });
  const posts = await readPosts();
  await writePostPages(posts);
  await writeIndexPage(posts);
  await writeFeedData(posts);
  console.log(`Generated ${posts.length} post pages and index.`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
