/**
 * ControlChartMap。
 *
 * 靜態九宮格示意圖：濃度（縱軸）× 萃取率（橫軸）。
 * 四角是常見問題杯、中央是理想區。純視覺、不互動。
 *
 * 跟 <control-chart>（可輸入數字落點的互動版）互補：
 * 這個是「概念地圖」，control-chart 是「實際落點計算」。
 *
 * 用法：在 Markdown 直接寫
 *   <control-chart-map></control-chart-map>
 *
 * Hydration：DocLayout 偵測到 tag 時 import 這隻檔案。
 */

interface Cell {
  title: string;
  note: string;
  /** grid 位置 */
  col: 1 | 2 | 3;
  row: 1 | 2 | 3;
  ideal?: boolean;
}

const CELLS: Cell[] = [
  { title: '濃但萃取不足', note: '強烈的酸', col: 1, row: 1 },
  { title: '濃且過萃', note: '苦、澀、咬喉', col: 3, row: 1 },
  { title: '理想區', note: '平衡 · 甜 · 乾淨', col: 2, row: 2, ideal: true },
  { title: '淡且萃取不足', note: '淡又尖酸', col: 1, row: 3 },
  { title: '淡且過萃', note: '苦、空洞、無甜', col: 3, row: 3 },
];

const STYLE = `
:host {
  display: block;
  margin: var(--space-6, 1.5rem) 0;
  padding: var(--space-6, 1.5rem);
  background: var(--color-bg-subtle, #ECE7DA);
  border-radius: var(--radius-md, 6px);
  font-family: var(--font-sans, sans-serif);
}

.ccm__title {
  margin: 0 0 var(--space-4, 1rem);
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 500;
  text-transform: lowercase;
  letter-spacing: 0.04em;
  color: var(--color-text, #1A1612);
}

/* 圖區：左側縱軸標籤 + 主格線 */
.ccm__plot {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-2, 0.5rem);
}

.ccm__yaxis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding: var(--space-2, 0.5rem) 0;
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
  white-space: nowrap;
}

.ccm__grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: var(--space-3, 0.75rem);
  border-left: 1px solid var(--color-border-strong, #B8AC95);
  border-bottom: 1px solid var(--color-border-strong, #B8AC95);
  padding: var(--space-3, 0.75rem);
  min-height: 320px;
}

.ccm__cell {
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-sm, 4px);
  background: var(--color-bg, #FAF7F0);
  padding: var(--space-3, 0.75rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: var(--space-1, 0.25rem);
}

.ccm__cell--ideal {
  border-color: var(--color-accent, #7A3E1D);
  border-width: 2px;
  background: var(--color-bg-elevated, #FFFFFF);
}

.ccm__cell-title {
  font-size: var(--font-size-base, 1rem);
  font-weight: 500;
  color: var(--color-text, #1A1612);
}

.ccm__cell--ideal .ccm__cell-title {
  color: var(--color-accent, #7A3E1D);
}

.ccm__cell-note {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
}

/* 橫軸標籤 */
.ccm__xaxis {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-2, 0.5rem);
  padding-left: calc(2.5em + var(--space-2, 0.5rem));
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
}

.ccm__read {
  margin: var(--space-4, 1rem) 0 0;
  padding-top: var(--space-3, 0.75rem);
  border-top: 1px solid var(--color-border, #DDD6C5);
  font-size: var(--font-size-sm, 0.875rem);
  line-height: 1.7;
  color: var(--color-text-muted, #5C5246);
}

.ccm__read strong {
  color: var(--color-text, #1A1612);
}

@media (max-width: 480px) {
  .ccm__grid { min-height: 260px; gap: var(--space-2, 0.5rem); padding: var(--space-2, 0.5rem); }
  .ccm__cell { padding: var(--space-2, 0.5rem); }
  .ccm__cell-title { font-size: var(--font-size-sm, 0.875rem); }
}
`;

class ControlChartMap extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  private render() {
    const cells = CELLS.map(
      (c) =>
        `<div class="ccm__cell${c.ideal ? ' ccm__cell--ideal' : ''}" style="grid-column:${c.col};grid-row:${c.row};">
          <span class="ccm__cell-title">${c.title}</span>
          <span class="ccm__cell-note">${c.note}</span>
        </div>`,
    ).join('');

    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="ccm__title">brewing control chart 地圖</p>
      <div class="ccm__plot">
        <div class="ccm__yaxis" aria-hidden="true">
          <span>濃<br/>TDS 高</span>
          <span>淡<br/>TDS 低</span>
        </div>
        <div class="ccm__grid" role="img"
             aria-label="濃度與萃取率的九宮格：縱軸是濃淡、橫軸是萃取不足到過萃，中央是理想區">
          ${cells}
        </div>
      </div>
      <div class="ccm__xaxis" aria-hidden="true">
        <span>萃取不足 · EY 低</span>
        <span>過萃 · EY 高</span>
      </div>
      <p class="ccm__read">
        讀法一句話：<strong>上下看濃淡、左右看萃夠沒</strong>。先把這杯標進某一格，再決定動哪個旋鈕。
        想上下移動（改濃度）就動粉水比與水量；想左右移動（改萃取）就動研磨、時間、水溫、擾流。
      </p>
    `;
  }
}

if (typeof window !== 'undefined' && !customElements.get('control-chart-map')) {
  customElements.define('control-chart-map', ControlChartMap);
}
