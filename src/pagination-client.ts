import { buildPageSeries, clampPage } from "./client-utils.js";

function readPageParam(): number {
  const params = new URLSearchParams(location.search);
  const raw = Number(params.get("page") || "1");
  return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
}

function updatePageParam(page: number): void {
  const url = new URL(location.href);
  if (page <= 1) {
    url.searchParams.delete("page");
  } else {
    url.searchParams.set("page", String(page));
  }
  history.replaceState(null, "", url.toString());
}

function renderControls(
  container: HTMLElement,
  currentPage: number,
  totalPages: number,
  onChange: (page: number) => void
): void {
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  const pages = buildPageSeries(totalPages, currentPage)
    .map((entry) => {
      if (entry === "ellipsis") {
        return '<span class="px-1 text-xs text-subtle/70 select-none" aria-hidden="true">…</span>';
      }
      return `<button type="button" data-page="${entry}" ${entry === currentPage ? 'aria-current="page"' : ""} class="pagination-button ${
        entry === currentPage ? "active" : ""
      }">${entry}</button>`;
    })
    .join("");

  const previous =
    currentPage > 1 ? '<button type="button" data-page="prev" class="pagination-button">Prev</button>' : "";
  const next =
    currentPage < totalPages ? '<button type="button" data-page="next" class="pagination-button">Next</button>' : "";

  container.innerHTML = previous + pages + next;
  for (const button of container.querySelectorAll<HTMLButtonElement>("[data-page]")) {
    button.addEventListener("click", () => {
      const action = button.dataset.page;
      if (action === "prev") {
        onChange(currentPage - 1);
      } else if (action === "next") {
        onChange(currentPage + 1);
      } else {
        onChange(Number(action || "1"));
      }
    });
  }
}

function setupBlockPagination(listId: string, navId: string): boolean {
  const list = document.getElementById(listId);
  const nav = document.getElementById(navId);
  if (!list || !nav) {
    return false;
  }

  const rawPageSize = Number(list.dataset.pageSize || "8");
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 8;
  const children = Array.from(list.children);
  const totalPages = Math.max(1, Math.ceil(children.length / pageSize));

  function applyPage(page: number, updateUrl = false): void {
    const clamped = clampPage(page, totalPages);
    const start = (clamped - 1) * pageSize;
    const end = start + pageSize;
    children.forEach((child, index) => {
      child.classList.toggle("hidden", index < start || index >= end);
    });
    if (updateUrl) {
      updatePageParam(clamped);
    } else if (page !== clamped) {
      updatePageParam(clamped);
    }
    renderControls(nav!, clamped, totalPages, (nextPage) => applyPage(nextPage, true));
  }

  applyPage(readPageParam());
  return true;
}

function setupPagination(): void {
  if (!setupBlockPagination("default-posts", "post-pagination")) {
    setupBlockPagination("tag-posts", "tag-pagination");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupPagination);
} else {
  setupPagination();
}
