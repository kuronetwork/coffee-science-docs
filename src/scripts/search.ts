/**
 * SearchBox modal。
 *
 * Pagefind JS API：build 後 `dist/pagefind/pagefind.js` 才存在，
 * dev 模式不會運作（會優雅降級顯示「目前是 dev 模式」）。
 *
 * 鍵盤行為：
 *   - ⌘K / Ctrl+K：開啟
 *   - Esc：關閉
 *   - 方向鍵：選擇結果
 *   - Enter：跳到選中的結果
 */

type PagefindResult = {
  id: string;
  data: () => Promise<{
    url: string;
    excerpt: string;
    meta: { title?: string };
  }>;
};

type PagefindAPI = {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
};

const TRIGGER_SELECTOR = '[data-search-trigger]';

let pagefindPromise: Promise<PagefindAPI | null> | null = null;
let searchTimer: number | null = null;
let activeIndex = 0;
let lastResults: { url: string; title: string; excerpt: string }[] = [];

async function loadPagefind(): Promise<PagefindAPI | null> {
  if (pagefindPromise) return pagefindPromise;

  pagefindPromise = (async () => {
    try {
      // base path 在 import.meta.env.BASE_URL 上
      const base = (import.meta as any).env?.BASE_URL ?? '/';
      const cleanBase = base.replace(/\/$/, '');
      const url = `${cleanBase}/pagefind/pagefind.js`;
      const mod = await import(/* @vite-ignore */ url);
      return mod as PagefindAPI;
    } catch {
      return null;
    }
  })();

  return pagefindPromise;
}

function buildModal(): HTMLDivElement {
  const modal = document.createElement('div');
  modal.className = 'search-modal';
  modal.dataset.searchModal = '';
  modal.innerHTML = `
    <div class="search-modal__backdrop" data-search-backdrop></div>
    <div class="search-modal__panel" role="dialog" aria-modal="true" aria-labelledby="search-modal-title">
      <h2 id="search-modal-title" class="sr-only">搜尋</h2>
      <input
        type="search"
        class="search-modal__input"
        placeholder="搜尋筆記內容…"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        data-search-input
      />
      <div class="search-modal__results" data-search-results>
        <p class="search-modal__hint">輸入關鍵字開始搜尋。中文支援以單字 / 短句為主。</p>
      </div>
      <p class="search-modal__footer">
        <kbd>↑</kbd> <kbd>↓</kbd> 選擇　<kbd>Enter</kbd> 開啟　<kbd>Esc</kbd> 關閉
      </p>
    </div>
  `;
  return modal;
}

function injectStyles() {
  if (document.getElementById('search-modal-styles')) return;
  const style = document.createElement('style');
  style.id = 'search-modal-styles';
  style.textContent = `
    .search-modal {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 12vh;
    }
    .search-modal__backdrop {
      position: absolute;
      inset: 0;
      background: rgba(20, 17, 13, 0.4);
      cursor: pointer;
    }
    .search-modal__panel {
      position: relative;
      width: min(600px, 92vw);
      max-height: 70vh;
      display: flex;
      flex-direction: column;
      background: var(--color-bg-elevated);
      border: var(--border-thin);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-overlay);
    }
    .search-modal__input {
      width: 100%;
      box-sizing: border-box;
      padding: var(--space-3) var(--space-4);
      font-size: var(--font-size-base);
      font-family: var(--font-sans);
      color: var(--color-text);
      background: transparent;
      border: 0;
      border-bottom: var(--border-thin);
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      outline: none;
    }
    .search-modal__results {
      overflow-y: auto;
      padding: var(--space-2) 0;
    }
    .search-modal__hint,
    .search-modal__empty {
      padding: var(--space-4);
      margin: 0;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }
    .search-modal__result {
      display: block;
      padding: var(--space-3) var(--space-4);
      border-left: 2px solid transparent;
      color: var(--color-text);
      text-decoration: none;
      transition: background var(--transition-fast),
                  border-color var(--transition-fast);
    }
    .search-modal__result[data-active='true'] {
      background: var(--color-bg-subtle);
      border-left-color: var(--color-accent);
    }
    .search-modal__result-title {
      display: block;
      font-weight: 500;
      font-size: var(--font-size-base);
      color: var(--color-text);
      margin-bottom: var(--space-1);
    }
    .search-modal__result-excerpt {
      display: block;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      line-height: 1.6;
    }
    .search-modal__result-excerpt mark {
      background: var(--color-accent-soft);
      color: inherit;
      padding: 0 0.1em;
      border-radius: 2px;
    }
    .search-modal__footer {
      margin: 0;
      padding: var(--space-2) var(--space-4);
      border-top: var(--border-thin);
      font-family: var(--font-mono);
      font-size: var(--font-size-xs);
      color: var(--color-text-subtle);
    }
    .search-modal__footer kbd {
      display: inline-block;
      padding: 0 0.35em;
      border: var(--border-thin);
      border-radius: var(--radius-sm);
      margin: 0 0.15em;
    }
  `;
  document.head.appendChild(style);
}

function getModal(): HTMLDivElement | null {
  return document.querySelector<HTMLDivElement>('[data-search-modal]');
}

function openSearch() {
  injectStyles();

  let modal = getModal();
  if (!modal) {
    modal = buildModal();
    document.body.appendChild(modal);
    bindEvents(modal);
  }

  modal.style.display = 'flex';
  const input = modal.querySelector<HTMLInputElement>('[data-search-input]');
  input?.focus();
  loadPagefind();
}

function closeSearch() {
  const modal = getModal();
  if (modal) modal.style.display = 'none';
  // 把焦點還給觸發器
  document.querySelector<HTMLButtonElement>(TRIGGER_SELECTOR)?.focus();
}

function setActive(index: number) {
  const modal = getModal();
  if (!modal) return;
  const results = modal.querySelectorAll<HTMLAnchorElement>('[data-search-result]');
  if (results.length === 0) return;
  activeIndex = ((index % results.length) + results.length) % results.length;
  results.forEach((el, i) => {
    if (i === activeIndex) {
      el.dataset.active = 'true';
      el.scrollIntoView({ block: 'nearest' });
    } else {
      delete el.dataset.active;
    }
  });
}

function renderResults(items: typeof lastResults, query: string) {
  const modal = getModal();
  if (!modal) return;
  const container = modal.querySelector<HTMLElement>('[data-search-results]');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<p class="search-modal__empty">沒有找到「${query}」的相關筆記。</p>`;
    return;
  }

  container.innerHTML = items
    .map(
      (item, i) => `
        <a class="search-modal__result"
           href="${item.url}"
           data-search-result
           data-index="${i}"
           ${i === 0 ? 'data-active="true"' : ''}>
          <span class="search-modal__result-title">${item.title}</span>
          <span class="search-modal__result-excerpt">${item.excerpt}</span>
        </a>
      `,
    )
    .join('');
  activeIndex = 0;
}

function showHint(html: string) {
  const modal = getModal();
  if (!modal) return;
  const container = modal.querySelector<HTMLElement>('[data-search-results]');
  if (container) {
    container.innerHTML = `<p class="search-modal__hint">${html}</p>`;
  }
}

async function performSearch(query: string) {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    lastResults = [];
    showHint('輸入關鍵字開始搜尋。中文支援以單字 / 短句為主。');
    return;
  }

  const pagefind = await loadPagefind();
  if (!pagefind) {
    showHint(
      '目前是 dev 模式，搜尋索引只在 <code>pnpm build</code> 後才會產生。' +
        '<br>建好後在 <code>pnpm preview</code> 可以實測。',
    );
    return;
  }

  try {
    const { results } = await pagefind.search(trimmed);
    const top = await Promise.all(results.slice(0, 10).map((r) => r.data()));
    lastResults = top.map((d) => ({
      url: d.url,
      title: d.meta.title ?? d.url,
      excerpt: d.excerpt,
    }));
    renderResults(lastResults, trimmed);
  } catch (err) {
    showHint('搜尋出錯了，重新整理一下試試。');
  }
}

function bindEvents(modal: HTMLDivElement) {
  const input = modal.querySelector<HTMLInputElement>('[data-search-input]');
  const backdrop = modal.querySelector<HTMLElement>('[data-search-backdrop]');

  input?.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value;
    if (searchTimer !== null) window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => performSearch(value), 120);
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(activeIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(activeIndex - 1);
    } else if (e.key === 'Enter') {
      const active = modal.querySelector<HTMLAnchorElement>(
        '[data-search-result][data-active="true"]',
      );
      if (active) {
        e.preventDefault();
        active.click();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
    }
  });

  backdrop?.addEventListener('click', closeSearch);
}

function bindGlobalShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  document.querySelectorAll<HTMLButtonElement>(TRIGGER_SELECTOR).forEach((btn) => {
    btn.disabled = false;
    btn.removeAttribute('aria-label');
    btn.setAttribute('aria-label', '開啟搜尋（⌘K）');
    btn.addEventListener('click', openSearch);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindGlobalShortcuts, { once: true });
} else {
  bindGlobalShortcuts();
}
