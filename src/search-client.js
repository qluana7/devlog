const root = location.pathname.includes('/posts/') || location.pathname.includes('/tags/') ? '..' : '.';
const searchToggle = document.getElementById('search-toggle');
const searchPanel = document.getElementById('search-panel');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');
const searchMeta = document.getElementById('search-meta');
const searchResults = document.getElementById('search-results');
const defaultPosts = document.getElementById('default-posts');

const PAGE_SIZE = 30;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(isoDate) {
  const date = new Date(isoDate + 'T00:00:00Z');
  if (Number.isNaN(date.getTime())) return isoDate;
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return y + '.' + m + '.' + d;
}

function parseRegexQuery(raw) {
  const match = raw.match(/^\/(.+)\/([dgimsuvy]*)$/);
  if (!match) return null;

  const pattern = match[1];
  const flags = match[2] || 'i';
  if (pattern.length > 120) {
    return { error: 'Regex is too long. Keep it under 120 chars.' };
  }

  try {
    return { regex: new RegExp(pattern, flags.includes('i') ? flags : flags + 'i') };
  } catch {
    return { error: 'Invalid regex syntax.' };
  }
}

function scoreTextPost(post, query) {
  const q = query.toLowerCase();
  const title = post.title.toLowerCase();
  const excerpt = post.excerpt.toLowerCase();
  const content = post.content.toLowerCase();
  const tags = post.tags.join(' ').toLowerCase();

  let score = 0;
  if (title.includes(q)) score += 50;
  if (excerpt.includes(q)) score += 25;
  if (tags.includes(q)) score += 20;
  if (content.includes(q)) score += 10;

  const allTokens = q.split(/\s+/).filter(Boolean);
  for (const token of allTokens) {
    if (title.includes(token)) score += 8;
    if (excerpt.includes(token)) score += 5;
    if (tags.includes(token)) score += 4;
    if (content.includes(token)) score += 2;
  }
  return score;
}

function scoreRegexPost(post, regex) {
  const titleHit = regex.test(post.title);
  regex.lastIndex = 0;
  const excerptHit = regex.test(post.excerpt);
  regex.lastIndex = 0;
  const contentHit = regex.test(post.content);
  regex.lastIndex = 0;
  const tagsHit = regex.test(post.tags.join(' '));
  regex.lastIndex = 0;

  let score = 0;
  if (titleHit) score += 60;
  if (excerptHit) score += 30;
  if (tagsHit) score += 25;
  if (contentHit) score += 15;
  return score;
}

function renderLimitedSearchTags(tags) {
  const visible = (tags || []).slice(0, 3);
  const hiddenCount = Math.max(0, (tags || []).length - visible.length);
  const pills = visible
    .map((tag) => '<a class="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs hover:bg-accent/20" href="' + root + '/tags/' + encodeURIComponent(tag) + '.html">' + escapeHtml(tag) + '</a>')
    .join('');
  if (!hiddenCount) return pills;
  const hiddenLabel = escapeHtml((tags || []).slice(3).join(', '));
  return pills + '<span class="tag-overflow-tooltip px-2 py-0.5 rounded bg-border/30 text-subtle text-xs" data-tooltip="' + hiddenLabel + '" tabindex="0">+' + hiddenCount + '</span>';
}

function highlightSnippet(text, query, regexMode) {
  if (!text) return '';
  const source = String(text);
  const q = query.trim();
  if (!q || regexMode) return escapeHtml(source.slice(0, 180));

  const lower = source.toLowerCase();
  const index = lower.indexOf(q.toLowerCase());
  const start = index === -1 ? 0 : Math.max(0, index - 50);
  const end = Math.min(source.length, start + 180);
  let snippet = source.slice(start, end);
  const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp('(' + safeQ + ')', 'ig');
  snippet = escapeHtml(snippet).replace(regex, '<mark class="bg-accent/30 text-text px-1 rounded">$1</mark>');
  return (start > 0 ? '... ' : '') + snippet + (end < source.length ? ' ...' : '');
}

function setPanelOpen(isOpen) {
  if (!searchPanel || !searchToggle) return;
  searchPanel.classList.toggle('hidden', !isOpen);
  searchToggle.setAttribute('aria-expanded', String(isOpen));
  if (isOpen && searchInput) searchInput.focus();
}

function bindSearchShortcuts() {
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented) return;
    const target = event.target;
    const typingTarget =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLElement && target.isContentEditable);

    if ((event.key === '/' && !typingTarget) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
      event.preventDefault();
      if (searchPanel) {
        setPanelOpen(true);
        if (searchInput) searchInput.focus();
      } else {
        const url = new URL(root + '/index.html', location.href);
        url.searchParams.set('openSearch', '1');
        location.href = url.toString();
      }
    }

    if (event.key === 'Escape' && searchPanel && !searchPanel.classList.contains('hidden')) {
      setPanelOpen(false);
    }
  });
}

function syncSearchStateToUrl(query, page) {
  const url = new URL(location.href);
  if (query.trim()) {
    url.searchParams.set('q', query.trim());
    if (page > 1) {
      url.searchParams.set('page', String(page));
    } else {
      url.searchParams.delete('page');
    }
  } else {
    url.searchParams.delete('q');
    url.searchParams.delete('page');
  }
  history.replaceState(null, '', url.toString());
}

function buildPageSeries(totalPages, currentPage) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const page = sorted[i];
    const prev = sorted[i - 1];
    if (prev && page - prev > 1) {
      result.push('ellipsis');
    }
    result.push(page);
  }

  return result;
}

async function setupSearch() {
  bindSearchShortcuts();
  if (searchToggle) {
    searchToggle.addEventListener('click', () => {
      if (!searchPanel) {
        location.href = root + '/index.html';
        return;
      }
      setPanelOpen(searchPanel.classList.contains('hidden'));
    });
  }

  if (searchClose) {
    searchClose.addEventListener('click', () => setPanelOpen(false));
  }

  if (!searchInput || !searchResults || !defaultPosts || !searchMeta) return;

  const response = await fetch(root + '/posts.json');
  const posts = await response.json();
  let searchPage = 1;
  let currentRanked = [];

  function renderSearchPage(ranked, query, regexMode) {
    const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE));
    if (searchPage > totalPages) searchPage = totalPages;
    syncSearchStateToUrl(query, searchPage);
    const start = (searchPage - 1) * PAGE_SIZE;
    const current = ranked.slice(start, start + PAGE_SIZE);

    if (!current.length) {
      searchResults.innerHTML = '<article class="post-card"><p class="text-sm text-subtle">검색 결과가 없습니다.</p></article>';
      return;
    }

    const pages = totalPages > 1
      ? '<nav class="mt-2 flex flex-wrap items-center gap-2">'
        + (searchPage > 1
          ? '<button type="button" data-search-page="prev" class="px-2 py-1 rounded border border-border/30 text-xs text-subtle hover:text-accent hover:border-accent/40">Prev</button>'
          : '<span class="px-2 py-1 rounded border border-border/20 text-xs text-subtle/30 opacity-0 select-none" aria-hidden="true">Prev</span>')
        + buildPageSeries(totalPages, searchPage)
          .map((entry) => {
            if (entry === 'ellipsis') {
              return '<span class="px-1 text-xs text-subtle/70 select-none" aria-hidden="true">…</span>';
            }
            return '<button type="button" data-search-page="' + entry + '" class="px-2 py-1 rounded border text-xs '
              + (entry === searchPage ? 'bg-accent text-header border-accent' : 'border-border/30 text-subtle hover:text-accent hover:border-accent/40')
              + '">' + entry + '</button>';
          })
          .join('')
        + (searchPage < totalPages
          ? '<button type="button" data-search-page="next" class="px-2 py-1 rounded border border-border/30 text-xs text-subtle hover:text-accent hover:border-accent/40">Next</button>'
          : '<span class="px-2 py-1 rounded border border-border/20 text-xs text-subtle/30 opacity-0 select-none" aria-hidden="true">Next</span>')
        + '</nav>'
      : '';

    searchResults.innerHTML = current
      .map(({ post }) => {
        const snippet = highlightSnippet(post.content || post.excerpt, query, regexMode);
        const tags = renderLimitedSearchTags(post.tags || []);
        return '<article class="post-card">'
          + '<h2 class="text-lg font-semibold"><a class="hover:text-accent" href="' + root + '/posts/' + encodeURIComponent(post.slug) + '.html">' + escapeHtml(post.title) + '</a></h2>'
          + '<p class="mt-2 text-sm text-subtle">' + escapeHtml(post.excerpt) + '</p>'
          + '<p class="mt-2 text-sm text-subtle">' + snippet + '</p>'
          + '<div class="mt-3 text-xs flex items-center gap-2 text-subtle"><time datetime="' + escapeHtml(post.date) + '">' + formatDate(post.date) + '</time><div class="ml-2 flex gap-2 whitespace-nowrap">' + tags + '</div></div>'
          + '</article>';
      })
      .join('')
      + pages;

    for (const button of searchResults.querySelectorAll('[data-search-page]')) {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-search-page');
        if (action === 'prev') {
          searchPage = Math.max(1, searchPage - 1);
        } else if (action === 'next') {
          searchPage += 1;
        } else {
          searchPage = Number(action || '1');
        }
        renderSearchPage(currentRanked, query, regexMode);
      });
    }
  }

  function renderResults(query, options = {}) {
    const preservePage = options.preservePage === true;
    const trimmed = query.trim();
    syncSearchStateToUrl(trimmed, preservePage ? searchPage : 1);
    if (!trimmed) {
      defaultPosts.classList.remove('hidden');
      searchResults.classList.add('hidden');
      searchMeta.textContent = '';
      searchResults.innerHTML = '';
      return;
    }

    const regexParsed = parseRegexQuery(trimmed);
    const regexMode = Boolean(regexParsed && regexParsed.regex);
    if (regexParsed && regexParsed.error) {
      defaultPosts.classList.add('hidden');
      searchResults.classList.remove('hidden');
      searchMeta.textContent = regexParsed.error;
      searchResults.innerHTML = '<article class="post-card"><p class="text-sm text-subtle">정규식 문법을 확인해주세요. 예: /ts.+go/i</p></article>';
      return;
    }

    const ranked = posts
      .map((post) => {
        const score = regexMode ? scoreRegexPost(post, regexParsed.regex) : scoreTextPost(post, trimmed);
        return { post, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date));

    currentRanked = ranked;
    if (!preservePage) {
      searchPage = 1;
    }

    defaultPosts.classList.add('hidden');
    searchResults.classList.remove('hidden');
    searchMeta.textContent = (regexMode ? '[Regex] ' : '') + '\'' + trimmed + '\' 검색 결과: ' + ranked.length + '개';

    renderSearchPage(ranked, trimmed, regexMode);
  }

  searchInput.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    renderResults(target.value);
  });

  const params = new URLSearchParams(location.search);
  const initialQ = params.get('q');
  const initialPage = Number(params.get('page') || '1');
  searchPage = Number.isFinite(initialPage) && initialPage > 0 ? Math.floor(initialPage) : 1;
  const openSearch = params.get('openSearch') === '1';
  if (openSearch) {
    setPanelOpen(true);
    if (searchInput) searchInput.focus();
  }
  if (initialQ) {
    setPanelOpen(true);
    searchInput.value = initialQ;
    renderResults(initialQ, { preservePage: true });
  }
}

setupSearch().catch((error) => {
  console.error(error);
});
