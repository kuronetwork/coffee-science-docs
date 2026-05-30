/**
 * CherryAnatomy。
 *
 * 互動式咖啡櫻桃剖面圖。同心橢圓 6 層，hover/tap 任一層
 * 右側顯示中英名稱與一行說明。
 *
 * 用法：在 Markdown 直接寫
 *   <cherry-anatomy></cherry-anatomy>
 *
 * 設計：
 *   - 配色嚴格在暖色盤內（accent / accent-soft / bg-subtle 系列）
 *   - 不使用綠 / 藍 / 紅
 *   - 6 層由外到內透明度遞增，與圓心種子明度分明
 */

interface Layer {
  id: string;
  cn: string;
  en: string;
  desc: string;
  rx: number;
  ry: number;
  /** accent 色階：1 = 最深，6 = 最淺 */
  tone: 1 | 2 | 3 | 4 | 5 | 6;
}

const CX = 130;
const CY = 130;

// 由外到內 6 層
const LAYERS: Layer[] = [
  {
    id: 'exocarp',
    cn: '外果皮',
    en: 'Exocarp / Outer Skin',
    desc: '最外層的果皮，成熟時多為紅色或黃色，主要功能是保護果實。',
    rx: 110, ry: 130, tone: 1,
  },
  {
    id: 'pulp',
    cn: '果肉',
    en: 'Mesocarp / Pulp',
    desc: '甜甜的果肉，含糖量約 13–20%，富含果膠與有機酸。',
    rx: 92, ry: 110, tone: 2,
  },
  {
    id: 'mucilage',
    cn: '果膠',
    en: 'Mucilage',
    desc: '黏稠透明的膠質層，緊貼羊皮紙。處理法的關鍵舞台。',
    rx: 74, ry: 90, tone: 3,
  },
  {
    id: 'parchment',
    cn: '內果皮（羊皮紙）',
    en: 'Endocarp / Parchment',
    desc: '保護種子的硬殼，乾燥後像紙一樣脆，貿易上的「帶殼豆」狀態。',
    rx: 58, ry: 72, tone: 4,
  },
  {
    id: 'silverskin',
    cn: '銀皮',
    en: 'Silver Skin',
    desc: '緊貼種子的薄皮，烘焙時會變成 chaff 銀皮屑被氣流帶出。',
    rx: 42, ry: 54, tone: 5,
  },
  {
    id: 'seed',
    cn: '種子（咖啡豆）',
    en: 'Seed / Bean',
    desc: '我們烘焙的部分。儲存蛋白質、脂質、糖分、咖啡因、綠原酸。',
    rx: 28, ry: 38, tone: 6,
  },
];

const STYLE = `
:host {
  display: block;
  margin: var(--space-6, 1.5rem) 0;
  padding: var(--space-4, 1rem) var(--space-6, 1.5rem);
  background: var(--color-bg-subtle, #ECE7DA);
  border-radius: var(--radius-md, 6px);
  font-family: var(--font-sans, sans-serif);
  color: var(--color-text, #1A1612);
}

.title {
  margin: 0 0 var(--space-3, 0.75rem);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 500;
  font-family: var(--font-mono, monospace);
  text-transform: lowercase;
  letter-spacing: 0.04em;
}

.wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-6, 1.5rem);
  align-items: start;
}

.svg-wrap {
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
}

svg { width: 100%; height: auto; display: block; overflow: visible; }

.layer { cursor: pointer; outline: none; }

/* 6 層暖色階：外深內淺。
   全部用 accent / accent-soft 的不同濃度，不引入新色相。 */
.layer--t1 .layer__shape { fill: var(--color-accent, #7A3E1D); }
.layer--t2 .layer__shape { fill: color-mix(in srgb, var(--color-accent, #7A3E1D) 75%, var(--color-bg, #FAF7F0)); }
.layer--t3 .layer__shape { fill: color-mix(in srgb, var(--color-accent-soft, #C9A88C) 90%, var(--color-bg, #FAF7F0)); }
.layer--t4 .layer__shape { fill: color-mix(in srgb, var(--color-accent-soft, #C9A88C) 60%, var(--color-bg, #FAF7F0)); }
.layer--t5 .layer__shape { fill: color-mix(in srgb, var(--color-accent-soft, #C9A88C) 30%, var(--color-bg, #FAF7F0)); }
.layer--t6 .layer__shape { fill: var(--color-bg-elevated, #FFFFFF); }

.layer__shape {
  stroke: var(--color-border-strong, #B8AC95);
  stroke-width: 0.75;
  transition: stroke var(--transition-base, 180ms ease),
              stroke-width var(--transition-base, 180ms ease),
              filter var(--transition-base, 180ms ease);
}

.layer:not(.is-active) .layer__shape { filter: saturate(0.85); }

.layer.is-active .layer__shape,
.layer:hover .layer__shape,
.layer:focus-visible .layer__shape {
  stroke: var(--color-accent, #7A3E1D);
  stroke-width: 2;
  filter: saturate(1);
}

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
}

.panel__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 0.25rem);
  padding-bottom: var(--space-3, 0.75rem);
  border-bottom: 1px solid var(--color-border, #DDD6C5);
}

.panel__title {
  margin: 0;
  font-family: var(--font-serif, serif);
  font-size: var(--font-size-xl, 1.375rem);
  font-weight: 500;
  color: var(--color-text, #1A1612);
}

.panel__english {
  margin: 0;
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
  letter-spacing: 0.02em;
}

.panel__desc {
  margin: 0;
  font-size: var(--font-size-sm, 0.875rem);
  line-height: 1.7;
  color: var(--color-text, #1A1612);
}

.panel__hint {
  margin: 0;
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-subtle, #8A7F6E);
}

@media (max-width: 640px) {
  .wrap {
    grid-template-columns: 1fr;
    gap: var(--space-4, 1rem);
  }
  .svg-wrap { max-width: 240px; }
}
`;

class CherryAnatomy extends HTMLElement {
  private shadow: ShadowRoot;
  private activeIndex = 5; // 預設選中種子

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    const onSelect = (e: Event) => this.handleSelect(e);
    this.shadow.addEventListener('click', onSelect);
    this.shadow.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleSelect(e);
      }
    });
    // hover 也算選中（桌面）
    this.shadow.addEventListener('mouseover', (e) => {
      const t = (e.target as Element | null)?.closest('[data-layer]');
      if (!t) return;
      const i = Number.parseInt(t.getAttribute('data-layer') ?? '', 10);
      if (!Number.isNaN(i) && i !== this.activeIndex) {
        this.activeIndex = i;
        this.update();
      }
    });
  }

  private handleSelect(event: Event) {
    const t = (event.target as Element | null)?.closest('[data-layer]');
    if (!t) return;
    const i = Number.parseInt(t.getAttribute('data-layer') ?? '', 10);
    if (Number.isNaN(i) || i === this.activeIndex) return;
    this.activeIndex = i;
    this.update();
  }

  private renderSvg(): string {
    const groups = LAYERS.map((layer, i) => {
      const active = i === this.activeIndex;
      return `
        <g class="layer layer--t${layer.tone} ${active ? 'is-active' : ''}"
           data-layer="${i}" role="button" tabindex="0"
           aria-label="第 ${i + 1} 層：${layer.cn}">
          <ellipse class="layer__shape"
                   cx="${CX}" cy="${CY}" rx="${layer.rx}" ry="${layer.ry}" />
        </g>
      `;
    }).join('');

    return `
      <svg viewBox="0 0 260 260" role="img" aria-label="咖啡櫻桃剖面圖">
        ${groups}
      </svg>
    `;
  }

  private renderPanel(): string {
    const layer = LAYERS[this.activeIndex];
    return `
      <div class="panel" aria-live="polite">
        <div class="panel__header">
          <h3 class="panel__title">${layer.cn}</h3>
          <p class="panel__english">${layer.en}</p>
        </div>
        <p class="panel__desc">${layer.desc}</p>
        <p class="panel__hint">點擊或滑入其他層查看說明</p>
      </div>
    `;
  }

  private update() {
    const svgWrap = this.shadow.querySelector('.svg-wrap');
    const panel = this.shadow.querySelector('.panel-wrap');
    if (svgWrap) svgWrap.innerHTML = this.renderSvg();
    if (panel) panel.innerHTML = this.renderPanel();
  }

  private render() {
    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="title">coffee cherry anatomy</p>
      <div class="wrap">
        <div class="svg-wrap">${this.renderSvg()}</div>
        <div class="panel-wrap">${this.renderPanel()}</div>
      </div>
    `;
  }
}

if (typeof window !== 'undefined' && !customElements.get('cherry-anatomy')) {
  customElements.define('cherry-anatomy', CherryAnatomy);
}
