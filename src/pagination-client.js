function readPageParam() {
  const params = new URLSearchParams(location.search);
  const raw = Number(params.get('page') || '1');
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.floor(raw);
}

function updatePageParam(page) {
  const url = new URL(location.href);
  if (page <= 1) {
    url.searchParams.delete('page');
  } else {
    url.searchParams.set('page', String(page));
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

function renderControls(container, currentPage, totalPages, onChange) {
  if (!container) return;
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const compactPages = buildPageSeries(totalPages, currentPage)
    .map((entry) => {
      if (entry === 'ellipsis') {
        return '<span class="px-1 text-xs text-subtle/70 select-none" aria-hidden="true">…</span>';
      }

      const active = entry === currentPage;
      return `<button type="button" data-page="${entry}" class="px-2 py-1 rounded border text-xs ${
        active
          ? 'bg-accent text-header border-accent'
          : 'border-border/30 text-subtle hover:text-accent hover:border-accent/40'
      }">${entry}</button>`;
    })
    .join('');

  const prev =
    currentPage > 1
      ? '<button type="button" data-page="prev" class="px-2 py-1 rounded border border-border/30 text-xs text-subtle hover:text-accent hover:border-accent/40">Prev</button>'
      : '<span class="px-2 py-1 rounded border border-border/20 text-xs text-subtle/30 opacity-0 select-none" aria-hidden="true">Prev</span>';
  const next =
    currentPage < totalPages
      ? '<button type="button" data-page="next" class="px-2 py-1 rounded border border-border/30 text-xs text-subtle hover:text-accent hover:border-accent/40">Next</button>'
      : '<span class="px-2 py-1 rounded border border-border/20 text-xs text-subtle/30 opacity-0 select-none" aria-hidden="true">Next</span>';

  container.innerHTML = prev + compactPages + next;
  for (const button of container.querySelectorAll('[data-page]')) {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-page');
      if (action === 'prev') {
        onChange(Math.max(1, currentPage - 1));
      } else if (action === 'next') {
        onChange(Math.min(totalPages, currentPage + 1));
      } else {
        onChange(Number(action || '1'));
      }
    });
  }
}

function setupBlockPagination(listId, navId) {
  const list = document.getElementById(listId);
  const nav = document.getElementById(navId);
  if (!list || !nav) return false;

  const pageSize = Number(list.getAttribute('data-page-size') || '8');
  const children = Array.from(list.children);
  const totalPages = Math.max(1, Math.ceil(children.length / pageSize));
  if (totalPages <= 1) {
    nav.innerHTML = '';
    return true;
  }

  function applyPage(page) {
    const clamped = Math.min(totalPages, Math.max(1, page));
    const start = (clamped - 1) * pageSize;
    const end = start + pageSize;
    children.forEach((child, index) => {
      child.classList.toggle('hidden', index < start || index >= end);
    });
    renderControls(nav, clamped, totalPages, (nextPage) => {
      updatePageParam(nextPage);
      applyPage(nextPage);
    });
  }

  applyPage(readPageParam());
  return true;
}

function setupPagination() {
  const hasIndex = setupBlockPagination('default-posts', 'post-pagination');
  if (!hasIndex) {
    setupBlockPagination('tag-posts', 'tag-pagination');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPagination);
} else {
  setupPagination();
}
