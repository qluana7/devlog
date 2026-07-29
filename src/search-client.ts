import { buildPageSeries, clampPage, tagPathSegment } from "./client-utils.js";

type SearchPost = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
  content: string;
};

type RankedPost = {
  post: SearchPost;
  score: number;
};

type RegexQuery =
  | { kind: "regex"; source: string; flags: string }
  | { kind: "error"; error: string }
  | null;

const root = location.pathname.includes("/posts/") || location.pathname.includes("/tags/") ? ".." : ".";
const searchToggle = document.getElementById("search-toggle");
const searchPanel = document.getElementById("search-panel");
const searchClose = document.getElementById("search-close");
const searchInput = document.getElementById("search-input");
const searchMeta = document.getElementById("search-meta");
const searchResults = document.getElementById("search-results");
const defaultPosts = document.getElementById("default-posts");
const SEARCH_PAGE_SIZE = 30;
const REGEX_TIMEOUT_MS = 250;

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${year}.${month}.${day}`;
}

function parseRegexQuery(raw: string): RegexQuery {
  const match = raw.match(/^\/(.+)\/([dgimsuvy]*)$/);
  if (!match) {
    return null;
  }

  const source = match[1];
  const rawFlags = match[2] || "i";
  const flags = rawFlags.includes("i") ? rawFlags : `${rawFlags}i`;
  if (source.length > 120) {
    return { kind: "error", error: "Regex is too long. Keep it under 120 chars." };
  }

  try {
    new RegExp(source, flags);
    return { kind: "regex", source, flags };
  } catch {
    return { kind: "error", error: "Invalid regex syntax." };
  }
}

function isSearchPost(value: unknown): value is SearchPost {
  if (!value || typeof value !== "object") {
    return false;
  }
  const post = value as Partial<SearchPost>;
  return (
    typeof post.title === "string" &&
    typeof post.slug === "string" &&
    typeof post.date === "string" &&
    typeof post.excerpt === "string" &&
    typeof post.content === "string" &&
    Array.isArray(post.tags) &&
    post.tags.every((tag) => typeof tag === "string")
  );
}

function scoreTextPost(post: SearchPost, query: string): number {
  const normalizedQuery = query.toLowerCase();
  const title = post.title.toLowerCase();
  const excerpt = post.excerpt.toLowerCase();
  const content = post.content.toLowerCase();
  const tags = post.tags.join(" ").toLowerCase();

  let score = 0;
  if (title.includes(normalizedQuery)) score += 50;
  if (excerpt.includes(normalizedQuery)) score += 25;
  if (tags.includes(normalizedQuery)) score += 20;
  if (content.includes(normalizedQuery)) score += 10;

  for (const token of normalizedQuery.split(/\s+/).filter(Boolean)) {
    if (title.includes(token)) score += 8;
    if (excerpt.includes(token)) score += 5;
    if (tags.includes(token)) score += 4;
    if (content.includes(token)) score += 2;
  }
  return score;
}

function rankRegexPosts(posts: SearchPost[], source: string, flags: string): Promise<RankedPost[]> {
  if (typeof Worker === "undefined") {
    return Promise.reject(new Error("Regex search is not supported in this browser."));
  }

  const workerSource = `
self.onmessage = ({ data }) => {
  try {
    const regex = new RegExp(data.source, data.flags);
    const ranked = data.posts.map((post, index) => {
      const test = (value) => {
        const matched = regex.test(value);
        regex.lastIndex = 0;
        return matched;
      };
      let score = 0;
      if (test(post.title)) score += 60;
      if (test(post.excerpt)) score += 30;
      if (test(post.tags.join(" "))) score += 25;
      if (test(post.content)) score += 15;
      return { index, score };
    }).filter((entry) => entry.score > 0);
    self.postMessage({ ranked });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};`;

  const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
  const worker = new Worker(workerUrl);

  return new Promise((resolve, reject) => {
    const cleanup = (): void => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
    const timeout = globalThis.setTimeout(() => {
      cleanup();
      reject(new Error("Regex search timed out. Try a simpler expression."));
    }, REGEX_TIMEOUT_MS);

    worker.addEventListener("message", (event: MessageEvent) => {
      globalThis.clearTimeout(timeout);
      cleanup();
      const data = event.data as
        | { ranked: Array<{ index: number; score: number }>; error?: never }
        | { ranked?: never; error: string };
      if ("error" in data) {
        reject(new Error(data.error));
        return;
      }
      resolve(data.ranked.map(({ index, score }) => ({ post: posts[index], score })));
    });
    worker.addEventListener("error", () => {
      globalThis.clearTimeout(timeout);
      cleanup();
      reject(new Error("Regex search worker failed."));
    });
    worker.postMessage({ posts, source, flags });
  });
}

function renderLimitedSearchTags(tags: string[]): string {
  const visible = tags.slice(0, 3);
  const hiddenCount = Math.max(0, tags.length - visible.length);
  const pills = visible
    .map(
      (tag) =>
        `<a class="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs hover:bg-accent/20" href="${root}/tags/${tagPathSegment(
          tag
        )}.html">${escapeHtml(tag)}</a>`
    )
    .join("");
  if (!hiddenCount) {
    return pills;
  }
  const hiddenLabel = escapeHtml(tags.slice(3).join(", "));
  return `${pills}<span class="tag-overflow-tooltip px-2 py-0.5 rounded bg-border/30 text-subtle text-xs" data-tooltip="${hiddenLabel}" tabindex="0">+${hiddenCount}</span>`;
}

function highlightSnippet(text: string, query: string, regexMode: boolean): string {
  if (!text) {
    return "";
  }

  const normalizedQuery = query.trim();
  const matchIndex = regexMode ? -1 : text.toLowerCase().indexOf(normalizedQuery.toLowerCase());
  const start = matchIndex === -1 ? 0 : Math.max(0, matchIndex - 50);
  const end = Math.min(text.length, start + 180);
  const snippet = text.slice(start, end);
  let rendered = escapeHtml(snippet);

  if (matchIndex >= start && matchIndex < end) {
    const localIndex = matchIndex - start;
    const before = snippet.slice(0, localIndex);
    const match = snippet.slice(localIndex, localIndex + normalizedQuery.length);
    const after = snippet.slice(localIndex + normalizedQuery.length);
    rendered = `${escapeHtml(before)}<mark class="bg-accent/30 text-text px-1 rounded">${escapeHtml(
      match
    )}</mark>${escapeHtml(after)}`;
  }

  return `${start > 0 ? "... " : ""}${rendered}${end < text.length ? " ..." : ""}`;
}

function setPanelOpen(isOpen: boolean): void {
  if (!searchPanel || !searchToggle) {
    return;
  }
  searchPanel.classList.toggle("hidden", !isOpen);
  searchToggle.setAttribute("aria-expanded", String(isOpen));
  if (isOpen && searchInput instanceof HTMLInputElement) {
    searchInput.focus();
  }
}

function indexSearchUrl(): string {
  const url = new URL(`${root}/index.html`, location.href);
  url.searchParams.set("openSearch", "1");
  return url.toString();
}

function bindSearchShortcuts(): void {
  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) {
      return;
    }
    const target = event.target;
    const typingTarget =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLElement && target.isContentEditable);

    if ((event.key === "/" && !typingTarget) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
      event.preventDefault();
      if (searchPanel) {
        setPanelOpen(true);
      } else {
        location.href = indexSearchUrl();
      }
    }

    if (event.key === "Escape" && searchPanel && !searchPanel.classList.contains("hidden")) {
      setPanelOpen(false);
    }
  });
}

function syncSearchStateToUrl(query: string, searchPage: number): void {
  const url = new URL(location.href);
  if (query.trim()) {
    url.searchParams.set("q", query.trim());
    if (searchPage > 1) {
      url.searchParams.set("searchPage", String(searchPage));
    } else {
      url.searchParams.delete("searchPage");
    }
  } else {
    url.searchParams.delete("q");
    url.searchParams.delete("searchPage");
  }
  url.searchParams.delete("openSearch");
  history.replaceState(null, "", url.toString());
}

async function loadSearchPosts(): Promise<SearchPost[]> {
  const response = await fetch(`${root}/posts.json`);
  if (!response.ok) {
    throw new Error(`Could not load search data (${response.status}).`);
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isSearchPost)) {
    throw new Error("Search data has an invalid format.");
  }
  return data;
}

async function setupSearch(): Promise<void> {
  bindSearchShortcuts();
  searchToggle?.addEventListener("click", () => {
    if (!searchPanel) {
      location.href = indexSearchUrl();
      return;
    }
    setPanelOpen(searchPanel.classList.contains("hidden"));
  });
  searchClose?.addEventListener("click", () => setPanelOpen(false));

  if (
    !(searchInput instanceof HTMLInputElement) ||
    !searchResults ||
    !defaultPosts ||
    !searchMeta
  ) {
    return;
  }
  const inputElement = searchInput;
  const resultsElement = searchResults;
  const defaultPostsElement = defaultPosts;
  const metaElement = searchMeta;

  let posts: SearchPost[];
  try {
    posts = await loadSearchPosts();
  } catch (error) {
    metaElement.textContent = error instanceof Error ? error.message : "검색 데이터를 불러오지 못했습니다.";
    return;
  }

  let searchPage = 1;
  let currentRanked: RankedPost[] = [];
  let renderSequence = 0;

  function renderSearchPage(ranked: RankedPost[], query: string, regexMode: boolean): void {
    const totalPages = Math.max(1, Math.ceil(ranked.length / SEARCH_PAGE_SIZE));
    searchPage = clampPage(searchPage, totalPages);
    syncSearchStateToUrl(query, searchPage);
    const start = (searchPage - 1) * SEARCH_PAGE_SIZE;
    const current = ranked.slice(start, start + SEARCH_PAGE_SIZE);

    if (!current.length) {
      resultsElement.innerHTML =
        '<article class="post-card"><p class="text-sm text-subtle">검색 결과가 없습니다.</p></article>';
      return;
    }

    const pages =
      totalPages > 1
        ? `<nav class="mt-2 flex flex-wrap items-center gap-2" aria-label="검색 결과 페이지">
${searchPage > 1 ? '<button type="button" data-search-page="prev" class="pagination-button">Prev</button>' : ""}
${buildPageSeries(totalPages, searchPage)
  .map((entry) =>
    entry === "ellipsis"
      ? '<span class="px-1 text-xs text-subtle/70 select-none" aria-hidden="true">…</span>'
      : `<button type="button" data-search-page="${entry}" ${
          entry === searchPage ? 'aria-current="page"' : ""
        } class="pagination-button ${entry === searchPage ? "active" : ""}">${entry}</button>`
  )
  .join("")}
${searchPage < totalPages ? '<button type="button" data-search-page="next" class="pagination-button">Next</button>' : ""}
</nav>`
        : "";

    resultsElement.innerHTML =
      current
        .map(({ post }) => {
          const snippet = highlightSnippet(post.content || post.excerpt, query, regexMode);
          return `<article class="post-card">
<h2 class="text-lg font-semibold"><a class="hover:text-accent" href="${root}/posts/${encodeURIComponent(
            post.slug
          )}.html">${escapeHtml(post.title)}</a></h2>
<p class="mt-2 text-sm text-subtle">${escapeHtml(post.excerpt)}</p>
<p class="mt-2 text-sm text-subtle">${snippet}</p>
<div class="mt-3 text-xs flex items-center gap-2 text-subtle"><time datetime="${escapeHtml(
            post.date
          )}">${formatDate(post.date)}</time><div class="ml-2 flex gap-2 whitespace-nowrap">${renderLimitedSearchTags(
            post.tags
          )}</div></div>
</article>`;
        })
        .join("") + pages;

    for (const button of resultsElement.querySelectorAll<HTMLButtonElement>("[data-search-page]")) {
      button.addEventListener("click", () => {
        const action = button.dataset.searchPage;
        if (action === "prev") {
          searchPage -= 1;
        } else if (action === "next") {
          searchPage += 1;
        } else {
          searchPage = Number(action || "1");
        }
        renderSearchPage(currentRanked, query, regexMode);
      });
    }
  }

  async function renderResults(query: string, preservePage = false): Promise<void> {
    const sequence = ++renderSequence;
    const trimmed = query.trim();
    if (!trimmed) {
      syncSearchStateToUrl("", 1);
      defaultPostsElement.classList.remove("hidden");
      resultsElement.classList.add("hidden");
      metaElement.textContent = "";
      resultsElement.innerHTML = "";
      return;
    }

    const regexParsed = parseRegexQuery(trimmed);
    if (regexParsed?.kind === "error") {
      defaultPostsElement.classList.add("hidden");
      resultsElement.classList.remove("hidden");
      metaElement.textContent = regexParsed.error;
      resultsElement.innerHTML =
        '<article class="post-card"><p class="text-sm text-subtle">정규식 문법을 확인해주세요. 예: /ts.+go/i</p></article>';
      return;
    }

    let ranked: RankedPost[];
    const regexMode = regexParsed?.kind === "regex";
    try {
      ranked = regexParsed?.kind === "regex"
        ? await rankRegexPosts(posts, regexParsed.source, regexParsed.flags)
        : posts
            .map((post) => ({ post, score: scoreTextPost(post, trimmed) }))
            .filter((entry) => entry.score > 0);
    } catch (error) {
      if (sequence !== renderSequence) {
        return;
      }
      defaultPostsElement.classList.add("hidden");
      resultsElement.classList.remove("hidden");
      metaElement.textContent = error instanceof Error ? error.message : "정규식 검색에 실패했습니다.";
      resultsElement.innerHTML = "";
      return;
    }

    if (sequence !== renderSequence) {
      return;
    }
    ranked.sort((left, right) => right.score - left.score || right.post.date.localeCompare(left.post.date));
    currentRanked = ranked;
    if (!preservePage) {
      searchPage = 1;
    }

    defaultPostsElement.classList.add("hidden");
    resultsElement.classList.remove("hidden");
    metaElement.textContent = `${regexMode ? "[Regex] " : ""}'${trimmed}' 검색 결과: ${ranked.length}개`;
    renderSearchPage(ranked, trimmed, regexMode);
  }

  inputElement.addEventListener("input", () => {
    void renderResults(inputElement.value);
  });

  const params = new URLSearchParams(location.search);
  const initialQuery = params.get("q");
  const initialPage = Number(params.get("searchPage") || "1");
  searchPage = Number.isFinite(initialPage) && initialPage > 0 ? Math.floor(initialPage) : 1;
  if (params.get("openSearch") === "1") {
    setPanelOpen(true);
    const url = new URL(location.href);
    url.searchParams.delete("openSearch");
    history.replaceState(null, "", url.toString());
  }
  if (initialQuery) {
    setPanelOpen(true);
    inputElement.value = initialQuery;
    await renderResults(initialQuery, true);
  }
}

setupSearch().catch((error) => {
  console.error(error);
});
