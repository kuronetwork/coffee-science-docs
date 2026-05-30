/**
 * ControlChart。
 *
 * 互動 SCA Brewing Control Chart：
 *   - 三個輸入：粉重、液重、TDS
 *   - SVG 九宮格 + 即時落點
 *   - 中央 Golden Cup（EY 18-22%、TDS 1.15-1.45%）以 accent-soft 標出
 *   - 下方一行診斷文字
 *
 * 用法：在 Markdown 直接寫
 *   <control-chart></control-chart>
 *
 * 注意：此圖以 SCA filter 區段為主（EY 14-26%、TDS 0.8-1.6%）。
 * 義式落點（TDS 8-12%）會超出範圍。
 */

const EY_MIN = 14;
const EY_MAX = 26;
const EY_IDEAL_MIN = 18;
const EY_IDEAL_MAX = 22;

const TDS_MIN = 0.8;
const TDS_MAX = 1.6;
const TDS_IDEAL_MIN = 1.15;
const TDS_IDEAL_MAX = 1.45;

const VB_W = 480;
const VB_H = 360;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 20;
const PAD_BOTTOM = 48;
const PLOT_LEFT = PAD_LEFT;
const PLOT_RIGHT = VB_W - PAD_RIGHT;
const PLOT_TOP = PAD_TOP;
const PLOT_BOTTOM = VB_H - PAD_BOTTOM;
const PLOT_W = PLOT_RIGHT - PLOT_LEFT;
const PLOT_H = PLOT_BOTTOM - PLOT_TOP;

function eyToX(ey: number): number {
  const c = Math.max(EY_MIN, Math.min(EY_MAX, ey));
  return PLOT_LEFT + ((c - EY_MIN) / (EY_MAX - EY_MIN)) * PLOT_W;
}
function tdsToY(tds: number): number {
  const c = Math.max(TDS_MIN, Math.min(TDS_MAX, tds));
  // Y 軸從上到下：高 TDS 在上
  return PLOT_BOTTOM - ((c - TDS_MIN) / (TDS_MAX - TDS_MIN)) * PLOT_H;
}

type EyBand = 'under' | 'ideal' | 'over';
type TdsBand = 'weak' | 'ideal' | 'strong';

function eyBand(ey: number): EyBand {
  if (ey < EY_IDEAL_MIN) return 'under';
  if (ey > EY_IDEAL_MAX) return 'over';
  return 'ideal';
}
function tdsBand(tds: number): TdsBand {
  if (tds < TDS_IDEAL_MIN) return 'weak';
  if (tds > TDS_IDEAL_MAX) return 'strong';
  return 'ideal';
}

const DIAGNOSIS: Record<TdsBand, Record<EyBand, string>> = {
  strong: {
    under: '濃但欠萃，可能是粉太多或時間太短。',
    ideal: '濃且飽滿，萃取率對但粉水比偏緊。',
    over: '濃且過萃，可能是粉太細或時間太長。',
  },
  ideal: {
    under: '濃度剛好但欠萃，研磨可以調細。',
    ideal: 'Golden Cup：濃度與萃取率都在理想範圍。',
    over: '濃度剛好但過萃，研磨可以調粗。',
  },
  weak: {
    under: '又稀又淡，可能是粉量不夠或研磨太粗。',
    ideal: '清淡但平衡，可以縮短粉水比讓濃度上來。',
    over: '稀且過萃，研磨太細又粉太少。',
  },
};

const STYLE = `
:host {
  display: block;
  margin: var(--space-6, 1.5rem) 0;
  padding: var(--space-4, 1rem) var(--space-6, 1.5rem) var(--space-6, 1.5rem);
  background: var(--color-bg-subtle, #ECE7DA);
  border-radius: var(--radius-md, 6px);
  font-family: var(--font-sans, sans-serif);
}

.cc__title {
  margin: 0 0 var(--space-3, 0.75rem);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 500;
  font-family: var(--font-mono, monospace);
  text-transform: lowercase;
  letter-spacing: 0.04em;
  color: var(--color-text, #1A1612);
}

.cc__inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-3, 0.75rem);
  margin-bottom: var(--space-4, 1rem);
}

.cc__field { display: flex; flex-direction: column; gap: var(--space-1, 0.25rem); }

.cc__label {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
  font-family: var(--font-mono, monospace);
}

.cc__input {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-base, 1rem);
  padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-md, 6px);
  background: var(--color-bg, #FAF7F0);
  color: var(--color-text, #1A1612);
  width: 100%;
  box-sizing: border-box;
}

.cc__input:focus-visible {
  outline: 2px solid var(--color-accent, #7A3E1D);
  outline-offset: 1px;
  border-color: var(--color-accent, #7A3E1D);
}

.cc__chart {
  width: 100%;
  max-width: 480px;
  height: auto;
  background: var(--color-bg, #FAF7F0);
  border-radius: var(--radius-md, 6px);
  display: block;
}

.cc__cell {
  fill: var(--color-bg-subtle, #ECE7DA);
  stroke: var(--color-border, #DDD6C5);
  stroke-width: 1;
  transition: fill var(--transition-base, 180ms ease);
}

.cc__cell--golden {
  fill: var(--color-accent-soft, #C9A88C);
  stroke: var(--color-accent, #7A3E1D);
  stroke-width: 1.5;
}

.cc__cell--axis {
  /* 中央十字（理想 EY 帶或理想 TDS 帶，但非 Golden Cup） */
  fill: color-mix(in srgb, var(--color-accent-soft, #C9A88C) 35%, var(--color-bg, #FAF7F0));
}

.cc__cell--active {
  stroke: var(--color-accent, #7A3E1D);
  stroke-width: 2;
}

.cc__axis-label {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  fill: var(--color-text-muted, #5C5246);
}

.cc__cell-label {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  fill: var(--color-text-subtle, #8A7F6E);
  text-anchor: middle;
  pointer-events: none;
}

.cc__cell-label--golden {
  fill: var(--color-accent, #7A3E1D);
  font-weight: 500;
}

.cc__marker {
  fill: var(--color-accent, #7A3E1D);
  stroke: var(--color-bg, #FAF7F0);
  stroke-width: 2;
  transition: cx 220ms ease, cy 220ms ease, opacity 180ms ease;
}
.cc__marker--off { opacity: 0.3; }

.cc__readout {
  margin-top: var(--space-4, 1rem);
  padding-top: var(--space-3, 0.75rem);
  border-top: 1px solid var(--color-border, #DDD6C5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.5rem);
}

.cc__value {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-lg, 1.125rem);
  color: var(--color-text, #1A1612);
}

.cc__diag {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-muted, #5C5246);
}

.cc__diag[data-state='golden'] { color: var(--color-accent, #7A3E1D); }
.cc__diag[data-state='off']    { color: var(--color-text-subtle, #8A7F6E); }
`;

class ControlChart extends HTMLElement {
  private shadow: ShadowRoot;
  private dose = 18;
  private waterWeight = 270; // 1:15 起手式，落點預期在 Golden Cup 附近
  private tds = 1.30;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadow.addEventListener('input', (event) => {
      const t = event.target as HTMLInputElement;
      const v = parseFloat(t.value);
      if (!Number.isFinite(v)) return;
      if (t.dataset.field === 'dose') this.dose = v;
      if (t.dataset.field === 'water') this.waterWeight = v;
      if (t.dataset.field === 'tds') this.tds = v;
      this.update();
    });
  }

  private computeEy(): number {
    if (!this.dose || !this.waterWeight || !this.tds) return NaN;
    return ((this.waterWeight * (this.tds / 100)) / this.dose) * 100;
  }

  private update() {
    const ey = this.computeEy();
    const validTds = Number.isFinite(this.tds) && this.tds > 0;
    const validEy = Number.isFinite(ey) && ey > 0;

    // 落點
    const marker = this.shadow.querySelector('.cc__marker') as SVGCircleElement | null;
    if (marker) {
      if (validEy && validTds) {
        marker.setAttribute('cx', String(eyToX(ey)));
        marker.setAttribute('cy', String(tdsToY(this.tds)));
        const onChart =
          ey >= EY_MIN && ey <= EY_MAX &&
          this.tds >= TDS_MIN && this.tds <= TDS_MAX;
        marker.classList.toggle('cc__marker--off', !onChart);
      } else {
        marker.classList.add('cc__marker--off');
      }
    }

    // 高亮所在格
    const cells = this.shadow.querySelectorAll<SVGRectElement>('.cc__cell');
    cells.forEach((c) => c.classList.remove('cc__cell--active'));
    if (validEy && validTds &&
        ey >= EY_MIN && ey <= EY_MAX &&
        this.tds >= TDS_MIN && this.tds <= TDS_MAX) {
      const eb = eyBand(ey);
      const tb = tdsBand(this.tds);
      const target = this.shadow.querySelector<SVGRectElement>(
        `[data-cell="${tb}-${eb}"]`,
      );
      if (target) target.classList.add('cc__cell--active');
    }

    const valueEl = this.shadow.querySelector('.cc__value');
    const diagEl = this.shadow.querySelector('.cc__diag') as HTMLElement | null;

    if (valueEl) {
      valueEl.textContent = validEy && validTds
        ? `萃取率 ${ey.toFixed(1)}% ／ TDS ${this.tds.toFixed(2)}%`
        : '請輸入完整參數';
    }
    if (diagEl) {
      if (!validEy || !validTds) {
        diagEl.textContent = '—';
        diagEl.dataset.state = 'off';
        return;
      }
      const onChart =
        ey >= EY_MIN && ey <= EY_MAX &&
        this.tds >= TDS_MIN && this.tds <= TDS_MAX;
      if (!onChart) {
        diagEl.textContent = '落點超出 SCA filter 範圍（EY 14-26%、TDS 0.8-1.6%）。義式請改參考 espresso 圖表。';
        diagEl.dataset.state = 'off';
        return;
      }
      const eb = eyBand(ey);
      const tb = tdsBand(this.tds);
      diagEl.textContent = DIAGNOSIS[tb][eb];
      diagEl.dataset.state = (eb === 'ideal' && tb === 'ideal') ? 'golden' : 'normal';
    }
  }

  private renderChart(): string {
    const xUnderEnd = eyToX(EY_IDEAL_MIN);
    const xIdealEnd = eyToX(EY_IDEAL_MAX);
    const yWeakStart = tdsToY(TDS_IDEAL_MIN);  // 偏下
    const yIdealStart = tdsToY(TDS_IDEAL_MAX); // 偏上

    const cols: { x: number; w: number; ey: EyBand }[] = [
      { x: PLOT_LEFT, w: xUnderEnd - PLOT_LEFT, ey: 'under' },
      { x: xUnderEnd, w: xIdealEnd - xUnderEnd, ey: 'ideal' },
      { x: xIdealEnd, w: PLOT_RIGHT - xIdealEnd, ey: 'over' },
    ];
    const rows: { y: number; h: number; tds: TdsBand }[] = [
      { y: PLOT_TOP, h: yIdealStart - PLOT_TOP, tds: 'strong' },
      { y: yIdealStart, h: yWeakStart - yIdealStart, tds: 'ideal' },
      { y: yWeakStart, h: PLOT_BOTTOM - yWeakStart, tds: 'weak' },
    ];

    const cells: string[] = [];
    for (const row of rows) {
      for (const col of cols) {
        const isGolden = row.tds === 'ideal' && col.ey === 'ideal';
        const isAxis = (row.tds === 'ideal' || col.ey === 'ideal') && !isGolden;
        const cls = isGolden
          ? 'cc__cell cc__cell--golden'
          : isAxis
          ? 'cc__cell cc__cell--axis'
          : 'cc__cell';
        cells.push(
          `<rect class="${cls}" data-cell="${row.tds}-${col.ey}"
                 x="${col.x}" y="${row.y}" width="${col.w}" height="${row.h}"/>`,
        );
      }
    }

    // Golden Cup 標籤
    const cxC = (xUnderEnd + xIdealEnd) / 2;
    const cyC = (yIdealStart + yWeakStart) / 2;
    cells.push(
      `<text class="cc__cell-label cc__cell-label--golden" x="${cxC}" y="${cyC + 4}">Golden Cup</text>`,
    );

    // 軸刻度
    const xTicks = [14, 18, 22, 26];
    const xLabels = xTicks.map((t) => {
      const x = eyToX(t);
      return `<text class="cc__axis-label" x="${x}" y="${PLOT_BOTTOM + 16}" text-anchor="middle">${t}%</text>`;
    }).join('');

    const yTicks = [0.8, 1.15, 1.45, 1.6];
    const yLabels = yTicks.map((t) => {
      const y = tdsToY(t);
      return `<text class="cc__axis-label" x="${PLOT_LEFT - 8}" y="${y + 4}" text-anchor="end">${t.toFixed(2)}%</text>`;
    }).join('');

    const xName = `<text class="cc__axis-label" x="${(PLOT_LEFT + PLOT_RIGHT) / 2}" y="${VB_H - 8}" text-anchor="middle">萃取率 extraction yield</text>`;
    const yName = `<text class="cc__axis-label" x="${PAD_LEFT - 44}" y="${(PLOT_TOP + PLOT_BOTTOM) / 2}" text-anchor="middle" transform="rotate(-90 ${PAD_LEFT - 44} ${(PLOT_TOP + PLOT_BOTTOM) / 2})">濃度 TDS</text>`;

    const ey0 = this.computeEy();
    const cx0 = Number.isFinite(ey0) ? eyToX(ey0) : eyToX(EY_IDEAL_MIN);
    const cy0 = Number.isFinite(this.tds) ? tdsToY(this.tds) : tdsToY(TDS_IDEAL_MIN);

    return `
      <svg class="cc__chart" viewBox="0 0 ${VB_W} ${VB_H}" role="img" aria-label="SCA Brewing Control Chart">
        ${cells.join('')}
        ${xLabels}
        ${yLabels}
        ${xName}
        ${yName}
        <circle class="cc__marker" cx="${cx0}" cy="${cy0}" r="6"/>
      </svg>
    `;
  }

  private render() {
    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="cc__title">brewing control chart</p>
      <div class="cc__inputs">
        <div class="cc__field">
          <label class="cc__label" for="cc-dose">粉重 (g)</label>
          <input class="cc__input" id="cc-dose" data-field="dose"
                 type="number" inputmode="decimal" min="0" step="0.1" value="${this.dose}" />
        </div>
        <div class="cc__field">
          <label class="cc__label" for="cc-water">液重 (g)</label>
          <input class="cc__input" id="cc-water" data-field="water"
                 type="number" inputmode="decimal" min="0" step="1" value="${this.waterWeight}" />
        </div>
        <div class="cc__field">
          <label class="cc__label" for="cc-tds">TDS (%)</label>
          <input class="cc__input" id="cc-tds" data-field="tds"
                 type="number" inputmode="decimal" min="0" step="0.01" value="${this.tds}" />
        </div>
      </div>
      ${this.renderChart()}
      <div class="cc__readout">
        <span class="cc__value"></span>
        <span class="cc__diag"></span>
      </div>
    `;
    this.update();
  }
}

if (typeof window !== 'undefined' && !customElements.get('control-chart')) {
  customElements.define('control-chart', ControlChart);
}
