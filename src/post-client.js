async function sha256Hex(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hashBuffer);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function getPostContext() {
  const article = document.querySelector('article[data-post-slug]');
  if (!(article instanceof HTMLElement)) return null;
  const slug = article.dataset.postSlug;
  if (!slug) return null;
  return { article, slug };
}

function getVisitorId() {
  const key = 'dev-blog:visitor-id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const random =
    (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`);
  localStorage.setItem(key, random);
  return random;
}

function fallbackLocalEngagement(slug, likeButton, likeCount, viewCount) {
  const today = new Date().toISOString().slice(0, 10);
  const viewedTodayKey = `dev-blog:viewed:${slug}:${today}`;
  const viewCountKey = `dev-blog:view-count:${slug}`;

  if (localStorage.getItem(viewedTodayKey) !== '1') {
    const current = Number(localStorage.getItem(viewCountKey) || '0');
    localStorage.setItem(viewCountKey, String(current + 1));
    localStorage.setItem(viewedTodayKey, '1');
  }

  viewCount.textContent = localStorage.getItem(viewCountKey) || '1';

  const key = `dev-blog:like:${slug}`;
  const liked = localStorage.getItem(key) === '1';
  likeButton.classList.toggle('active', liked);
  likeCount.textContent = liked ? '1' : '0';

  likeButton.addEventListener('click', () => {
    const currentlyLiked = localStorage.getItem(key) === '1';
    if (currentlyLiked) {
      localStorage.setItem(key, '0');
      likeButton.classList.remove('active');
      likeCount.textContent = '0';
      return;
    }

    localStorage.setItem(key, '1');
    likeButton.classList.add('active');
    likeCount.textContent = '1';
  });
}

async function supabaseRequest(config, endpoint, method, body) {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${endpoint}`, {
    method,
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${config.supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${text}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function fetchLikeAggregate(config, slug) {
  const rows = await supabaseRequest(config, `post_like_aggregates?slug=eq.${encodeURIComponent(slug)}&select=like_count`, 'GET');
  if (Array.isArray(rows) && rows.length > 0) {
    return Number(rows[0].like_count ?? 0);
  }
  return 0;
}

async function fetchViewAggregate(config, slug) {
  const rows = await supabaseRequest(config, `post_view_aggregates?slug=eq.${encodeURIComponent(slug)}&select=view_count`, 'GET');
  if (Array.isArray(rows) && rows.length > 0) {
    return Number(rows[0].view_count ?? 0);
  }
  return 0;
}

async function ensureView(config, slug, visitorHash) {
  const today = new Date().toISOString().slice(0, 10);
  const existing = await supabaseRequest(
    config,
    `post_views?slug=eq.${encodeURIComponent(slug)}&visitor_hash=eq.${encodeURIComponent(visitorHash)}&viewed_on=eq.${today}&select=id&limit=1`,
    'GET'
  );

  if (Array.isArray(existing) && existing.length > 0) {
    return false;
  }

  await supabaseRequest(config, 'post_views', 'POST', { slug, visitor_hash: visitorHash, viewed_on: today });
  return true;
}

async function ensureLikeState(config, slug, visitorHash) {
  const rows = await supabaseRequest(
    config,
    `post_likes?slug=eq.${encodeURIComponent(slug)}&visitor_hash=eq.${encodeURIComponent(visitorHash)}&select=id,active&limit=1`,
    'GET'
  );
  if (Array.isArray(rows) && rows.length > 0) {
    return { id: rows[0].id, active: Boolean(rows[0].active) };
  }

  const created = await supabaseRequest(config, 'post_likes', 'POST', {
    slug,
    visitor_hash: visitorHash,
    active: false
  });
  if (Array.isArray(created) && created.length > 0) {
    return { id: created[0].id, active: Boolean(created[0].active) };
  }
  throw new Error('Could not initialize like row');
}

async function updateLikeState(config, id, active) {
  await supabaseRequest(config, `post_likes?id=eq.${id}`, 'PATCH', { active });
}

async function setupEngagement() {
  const context = getPostContext();
  const likeButton = document.getElementById('like-button');
  const likeCount = document.getElementById('like-count');
  const viewCount = document.getElementById('view-count');
  if (!context || !(likeButton instanceof HTMLButtonElement) || !likeCount || !viewCount) return;

  const config = globalThis.__ENGAGEMENT_CONFIG__;
  if (!config || !config.enabled || !config.supabaseUrl || !config.supabaseAnonKey) {
    fallbackLocalEngagement(context.slug, likeButton, likeCount, viewCount);
    return;
  }

  try {
    const visitorId = getVisitorId();
    const visitorHash = await sha256Hex(visitorId);

    await ensureView(config, context.slug, visitorHash);
    const views = await fetchViewAggregate(config, context.slug);
    viewCount.textContent = String(views);

    const likeState = await ensureLikeState(config, context.slug, visitorHash);
    likeButton.classList.toggle('active', likeState.active);

    const likes = await fetchLikeAggregate(config, context.slug);
    likeCount.textContent = String(likes);

    let current = likeState;
    likeButton.addEventListener('click', async () => {
      likeButton.disabled = true;
      try {
        const nextActive = !current.active;
        await updateLikeState(config, current.id, nextActive);
        current = { ...current, active: nextActive };
        likeButton.classList.toggle('active', current.active);
        const updatedLikes = await fetchLikeAggregate(config, context.slug);
        likeCount.textContent = String(updatedLikes);
      } finally {
        likeButton.disabled = false;
      }
    });
  } catch {
    fallbackLocalEngagement(context.slug, likeButton, likeCount, viewCount);
  }
}

function setupCodeCopyButtons() {
  const blocks = document.querySelectorAll('article pre > code');
  if (!blocks.length) return;

  for (const code of blocks) {
    const pre = code.parentElement;
    if (!pre) continue;

    if (pre.classList.contains('code-copy-ready')) continue;
    pre.classList.add('code-copy-ready');

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Copy code');
    button.setAttribute('title', 'Copy code');
    button.className = 'code-copy-button';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4"><path fill="currentColor" d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1Zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H10V7h9v14Z"/></svg>';

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent || '');
        button.classList.add('copied');
        button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4"><path fill="currentColor" d="M9.55 18.7 3.8 12.95l1.4-1.4 4.35 4.35 9.25-9.25 1.4 1.4Z"/></svg>';
        setTimeout(() => {
          button.classList.remove('copied');
          button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4"><path fill="currentColor" d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1Zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H10V7h9v14Z"/></svg>';
        }, 1400);
      } catch {
        button.classList.add('failed');
        button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4"><path fill="currentColor" d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6Z"/></svg>';
        setTimeout(() => {
          button.classList.remove('failed');
          button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4"><path fill="currentColor" d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1Zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H10V7h9v14Z"/></svg>';
        }, 1400);
      }
    });

    pre.appendChild(button);
  }
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupCodeCopyButtons();
    setupEngagement();
  });
} else {
  setupCodeCopyButtons();
  setupEngagement();
}
