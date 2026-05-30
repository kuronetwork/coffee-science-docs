/**
 * WaterChemistry2D。
 *
 * 2D scatter plot：水的總硬度 GH × 鹼度 KH。
 *   - 視覺化 SCA 目標區
 *   - 5 個業界配方／自來水 preset 點
 *   - 自訂輸入：使用者輸入 GH / KH / pH，繪出自己的水
 *   - 點 preset 顯示詳情
 *
 * 用法：在 Markdown 直接寫
 *   <water-chemistry-2d></water-chemistry-2d>
 */

interface Preset {
  id: string;
  name: string;
  /** 總硬度 ppm CaCO3 */
  gh: number;
  /** 鹼度 ppm CaCO3 */
  kh: number;
  flavor: string;
  pairing: string;
}

const PRESETS: Preset[] = [
  {
    id: 'hendon',
    name: 'Hendon Recipe',
    gh: 50,
    kh: 40,
    flavor: '平衡乾淨，鎂為主提取香氣',
    pairing: '通用，特別適合精品淺烘',
  },
  {
    id: 'barista-hustle',
    name: 'Barista Hustle Recipe',
    gh: 80,
    kh: 60,
    flavor: '萃取力強，body 充足',
    pairing: '通用，適合 espresso',
  },
  {
    id: 'third-wave',
    name: 'Third Wave Water',
    gh: 30,
    kh: 65,
    flavor: '鎂含量略高，鹼度偏高',
    pairing: '偏向支援淺焙高酸豆',
  },
  {
    id: 'taipei-tap',
    name: '台北自來水（典型）',
    gh: 100,
    kh: 90,
    flavor: '鹼度偏高，會壓制酸感',
    pairing: '不建議直接使用，先過濾或重配',
  },
  {
    id: 'distilled',
    name: '蒸餾水',
    gh: 0,
    kh: 0,
    flavor: '萃取力極差，咖啡無力',
    pairing: '必須先礦化才能用',
  },
];

// SCA 目標區
const SCA_GH_MIN = 50;
const SCA_GH_MAX = 175;
const SCA_KH_MIN = 40;
const SCA_KH_MAX = 75;

const GH_AXIS_MAX = 250;
const KH_AXIS_MAX = 150;

const VB = 440;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 48;
const PLOT_LEFT = PAD_LEFT;
const PLOT_RIGHT = VB - PAD_RIGHT;
const PLOT_TOP = PAD_TOP;
const PLOT_BOTTOM = VB - PAD_BOTTOM;
const PLOT_W = PLOT_RIGHT - PLOT_LEFT;
const PLOT_H = PLOT_BOTTOM - PLOT_TOP;

function ghToX(gh: number): number {
  const c = Math.max(0, Math.min(GH_AXIS_MAX, gh));
  return PLOT_LEFT + (c / GH_AXIS_MAX) * PLOT_W;
}
function khToY(kh: number): number {
  const c = Math.max(0, Math.min(KH_AXIS_MAX, kh));
  return PLOT_BOTTOM - (c / KH_AXIS_MAX) * PLOT_H;
}

function distanceToSCA(gh: number, kh: number): number {
  // 點到 SCA 矩形最短距離（ppm）
  const dx =
    gh < SCA_GH_MIN ? SCA_GH_MIN - gh :
    gh > SCA_GH_MAX ? gh - SCA_GH_MAX : 0;
  const dy =
    kh < SCA_KH_MIN ? SCA_KH_MIN - kh :
    kh > SCA_KH_MAX ? kh - SCA_KH_MAX : 0;
  return Math.sqrt(dx * dx + dy * dy);
}

function inSCA(gh: number, kh: number): boolean {
  return gh >= SCA_GH_MIN && gh <= SCA_GH_MAX &&
         kh >= SCA_KH_MIN && kh <= SCA_KH_MAX;
}

const STYLE = `
:host {
  display: block;
  margin: var(--space-6, 1.5rem) 0;
  padding: var(--space-4, 1rem) var(--space-6, 1.5rem) var(--space-6, 1.5rem);
  background: var(--color-bg-subtle, #ECE7DA);
  border-radius: var(--radius-md, 6px);
  font-family: var(--font-sans, sans-serif);
}

.wc__title {
  margin: 0 0 var(--space-3, 0.75rem);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 500;
  font-family: var(--font-mono, monospace);
  text-transform: lowercase;
  letter-spacing: 0.04em;
  color: var(--color-text, #1A1612);
}

.wc__plot-wrap {
  display: flex;
  justify-content: center;
}

.wc__plot {
  width: 100%;
  max-width: 400px;
  height: auto;
  background: var(--color-bg, #FAF7F0);
  border-radius: var(--radius-md, 6px);
  display: block;
}

.wc__sca-zone {
  fill: var(--color-accent-soft, #C9A88C);
  fill-opacity: 0.30;
  stroke: var(--color-accent, #7A3E1D);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.wc__diagonal {
  stroke: var(--color-border-strong, #B8AC95);
  stroke-width: 1;
  stroke-dasharray: 4 3;
  fill: none;
}

.wc__axis {
  stroke: var(--color-text-muted, #5C5246);
  stroke-width: 1;
}

.wc__tick {
  stroke: var(--color-border-strong, #B8AC95);
  stroke-width: 1;
}

.wc__axis-label,
.wc__tick-label {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  fill: var(--color-text-muted, #5C5246);
}

.wc__zone-label {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  fill: var(--color-accent, #7A3E1D);
}

.wc__diag-label {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  fill: var(--color-text-subtle, #8A7F6E);
}

.wc__preset {
  fill: var(--color-accent-soft, #C9A88C);
  stroke: var(--color-bg, #FAF7F0);
  stroke-width: 1.5;
  cursor: pointer;
  transition: r var(--transition-fast, 120ms ease);
}

.wc__preset:hover {
  r: 7;
}

.wc__preset--active {
  fill: var(--color-accent, #7A3E1D);
  stroke: var(--color-accent, #7A3E1D);
  stroke-width: 3;
  stroke-opacity: 0.4;
}

.wc__preset-label {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  fill: var(--color-text-muted, #5C5246);
  pointer-events: none;
}

.wc__user-point {
  fill: var(--color-accent, #7A3E1D);
  stroke: var(--color-bg, #FAF7F0);
  stroke-width: 2;
  transition: cx 220ms ease, cy 220ms ease, opacity 180ms ease;
}

.wc__user-point[data-hidden='true'] { opacity: 0; }

.wc__inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3, 0.75rem);
  margin-top: var(--space-4, 1rem);
}

.wc__field { display: flex; flex-direction: column; gap: var(--space-1, 0.25rem); }

.wc__label {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
  font-family: var(--font-mono, monospace);
}

.wc__input {
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

.wc__input:focus-visible {
  outline: 2px solid var(--color-accent, #7A3E1D);
  outline-offset: 1px;
  border-color: var(--color-accent, #7A3E1D);
}

.wc__user-readout {
  margin-top: var(--space-3, 0.75rem);
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-muted, #5C5246);
  min-height: 1.4em;
}

.wc__user-readout[data-state='in']  { color: var(--color-accent, #7A3E1D); }
.wc__user-readout[data-state='out'] { color: var(--color-callout-warning-bar, #8C5A1C); }

.wc__detail {
  margin-top: var(--space-4, 1rem);
  padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
  background: var(--color-bg-elevated, #FFFFFF);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-md, 6px);
}

.wc__detail[hidden] { display: none; }

.wc__detail-name {
  margin: 0 0 var(--space-2, 0.5rem);
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-base, 1rem);
  font-weight: 500;
  color: var(--color-text, #1A1612);
}

.wc__detail-stats {
  margin: 0 0 var(--space-2, 0.5rem);
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
}

.wc__detail-row {
  margin: var(--space-1, 0.25rem) 0;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text, #1A1612);
  line-height: 1.6;
}

.wc__detail-row strong {
  font-weight: 500;
  color: var(--color-text-muted, #5C5246);
  margin-right: var(--space-2, 0.5rem);
}

@media (max-width: 640px) {
  :host {
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem) var(--space-4, 1rem);
  }
  .wc__plot { max-width: 280px; }
  .wc__inputs { grid-template-columns: 1fr; }
}
`;

class WaterChemistry2D extends HTMLElement {
  private shadow: ShadowRoot;
  private activePresetId: string | null = null;
  private userGh: number | null = null;
  private userKh: number | null = null;
  private userPh: number | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();

    this.shadow.addEventListener('click', (event) => {
      const t = event.target as Element;
      const dot = t.closest<SVGCircleElement>('[data-preset]');
      if (!dot) return;
      const id = dot.dataset.preset;
      if (!id) return;
      this.activePresetId = this.activePresetId === id ? null : id;
      this.updatePresets();
      this.updateDetail();
    });

    this.shadow.addEventListener('input', (event) => {
      const t = event.target as HTMLInputElement;
      const raw = t.value;
      const v = raw === '' ? NaN : parseFloat(raw);
      if (t.dataset.field === 'gh') this.userGh = Number.isFinite(v) ? v : null;
      if (t.dataset.field === 'kh') this.userKh = Number.isFinite(v) ? v : null;
      if (t.dataset.field === 'ph') this.userPh = Number.isFinite(v) ? v : null;
      this.updateUserPoint();
    });
  }

  private renderAxes(): string {
    const xTicks = [0, 50, 100, 150, 200, 250];
    const yTicks = [0, 50, 100, 150];

    const xLabels = xTicks.map((t) => {
      const x = ghToX(t);
      return `
        <line class="wc__tick" x1="${x}" y1="${PLOT_BOTTOM}" x2="${x}" y2="${PLOT_BOTTOM + 4}"/>
        <text class="wc__tick-label" x="${x}" y="${PLOT_BOTTOM + 16}" text-anchor="middle">${t}</text>
      `;
    }).join('');

    const yLabels = yTicks.map((t) => {
      const y = khToY(t);
      return `
        <line class="wc__tick" x1="${PLOT_LEFT - 4}" y1="${y}" x2="${PLOT_LEFT}" y2="${y}"/>
        <text class="wc__tick-label" x="${PLOT_LEFT - 8}" y="${y + 4}" text-anchor="end">${t}</text>
      `;
    }).join('');

    const xName = `<text class="wc__axis-label" x="${(PLOT_LEFT + PLOT_RIGHT) / 2}" y="${VB - 8}" text-anchor="middle">總硬度 GH (ppm CaCO₃)</text>`;
    const yName = `<text class="wc__axis-label" x="${PAD_LEFT - 44}" y="${(PLOT_TOP + PLOT_BOTTOM) / 2}" text-anchor="middle" transform="rotate(-90 ${PAD_LEFT - 44} ${(PLOT_TOP + PLOT_BOTTOM) / 2})">鹼度 KH (ppm CaCO₃)</text>`;

    const xAxis = `<line class="wc__axis" x1="${PLOT_LEFT}" y1="${PLOT_BOTTOM}" x2="${PLOT_RIGHT}" y2="${PLOT_BOTTOM}"/>`;
    const yAxis = `<line class="wc__axis" x1="${PLOT_LEFT}" y1="${PLOT_TOP}" x2="${PLOT_LEFT}" y2="${PLOT_BOTTOM}"/>`;

    return xLabels + yLabels + xName + yName + xAxis + yAxis;
  }

  private renderSCAZone(): string {
    const x = ghToX(SCA_GH_MIN);
    const y = khToY(SCA_KH_MAX);
    const w = ghToX(SCA_GH_MAX) - x;
    const h = khToY(SCA_KH_MIN) - y;
    return `
      <rect class="wc__sca-zone" x="${x}" y="${y}" width="${w}" height="${h}"/>
      <text class="wc__zone-label" x="${x + 4}" y="${y + 12}">SCA 目標區</text>
    `;
  }

  private renderDiagonal(): string {
    // GH = KH 線：從 (0,0) 到兩軸最大值較小者
    const maxVal = Math.min(GH_AXIS_MAX, KH_AXIS_MAX);
    const x1 = ghToX(0);
    const y1 = khToY(0);
    const x2 = ghToX(maxVal);
    const y2 = khToY(maxVal);
    const labelX = ghToX(maxVal * 0.7);
    const labelY = khToY(maxVal * 0.7) - 4;
    return `
      <line class="wc__diagonal" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
      <text class="wc__diag-label" x="${labelX}" y="${labelY}">GH = KH</text>
    `;
  }

  private renderPresets(): string {
    return PRESETS.map((p) => {
      const cx = ghToX(p.gh);
      const cy = khToY(p.kh);
      const isActive = this.activePresetId === p.id;
      const cls = isActive ? 'wc__preset wc__preset--active' : 'wc__preset';
      // 標籤位置：避開 SCA 區避免擋字。預設右上，蒸餾水放右側。
      let lx = cx + 8;
      let ly = cy - 8;
      let anchor: 'start' | 'end' = 'start';
      if (p.id === 'taipei-tap') { lx = cx - 8; anchor = 'end'; }
      if (p.id === 'distilled')  { lx = cx + 8; ly = cy + 14; }
      if (p.id === 'third-wave') { lx = cx - 8; anchor = 'end'; }
      return `
        <circle class="${cls}" data-preset="${p.id}"
                cx="${cx}" cy="${cy}" r="6"
                role="button" tabindex="0"
                aria-label="${p.name}: GH ${p.gh}, KH ${p.kh}"></circle>
        <text class="wc__preset-label" x="${lx}" y="${ly}" text-anchor="${anchor}">${p.name}</text>
      `;
    }).join('');
  }

  private updatePresets() {
    const dots = this.shadow.querySelectorAll<SVGCircleElement>('[data-preset]');
    dots.forEach((d) => {
      const isActive = d.dataset.preset === this.activePresetId;
      d.classList.toggle('wc__preset--active', isActive);
    });
  }

  private updateDetail() {
    const detail = this.shadow.querySelector<HTMLElement>('.wc__detail');
    if (!detail) return;
    if (!this.activePresetId) {
      detail.hidden = true;
      return;
    }
    const p = PRESETS.find((x) => x.id === this.activePresetId);
    if (!p) {
      detail.hidden = true;
      return;
    }
    detail.hidden = false;
    const name = detail.querySelector('.wc__detail-name');
    const stats = detail.querySelector('.wc__detail-stats');
    const flavor = detail.querySelector('.wc__detail-flavor');
    const pairing = detail.querySelector('.wc__detail-pairing');
    if (name)    name.textContent    = p.name;
    if (stats)   stats.textContent   = `GH ${p.gh} ppm　KH ${p.kh} ppm`;
    if (flavor)  flavor.innerHTML    = `<strong>風味預期</strong>${p.flavor}`;
    if (pairing) pairing.innerHTML   = `<strong>適合搭配</strong>${p.pairing}`;
  }

  private updateUserPoint() {
    const dot = this.shadow.querySelector<SVGCircleElement>('.wc__user-point');
    const readout = this.shadow.querySelector<HTMLElement>('.wc__user-readout');
    if (!dot || !readout) return;

    const hasGh = this.userGh !== null && this.userGh >= 0;
    const hasKh = this.userKh !== null && this.userKh !== undefined;

    if (!hasGh || !hasKh) {
      dot.dataset.hidden = 'true';
      readout.textContent = '輸入 GH / KH 看你的水落點';
      readout.dataset.state = '';
      return;
    }

    const gh = this.userGh as number;
    const kh = this.userKh as number;
    dot.dataset.hidden = 'false';
    dot.setAttribute('cx', String(ghToX(gh)));
    dot.setAttribute('cy', String(khToY(kh)));

    const ph = this.userPh;
    const phPart = ph !== null && Number.isFinite(ph) ? `　pH ${ph.toFixed(1)}` : '';

    if (inSCA(gh, kh)) {
      readout.textContent = `你的水：GH ${gh}　KH ${kh}${phPart}　落在 SCA 目標區內。`;
      readout.dataset.state = 'in';
    } else {
      const d = distanceToSCA(gh, kh);
      readout.textContent = `你的水：GH ${gh}　KH ${kh}${phPart}　距 SCA 目標區約 ${d.toFixed(0)} ppm。`;
      readout.dataset.state = 'out';
    }
  }

  private renderChart(): string {
    return `
      <div class="wc__plot-wrap">
        <svg class="wc__plot" viewBox="0 0 ${VB} ${VB}" role="img"
             aria-label="水化學 2D 圖：總硬度 GH 對 鹼度 KH">
          ${this.renderAxes()}
          ${this.renderSCAZone()}
          ${this.renderDiagonal()}
          ${this.renderPresets()}
          <circle class="wc__user-point" cx="0" cy="0" r="6" data-hidden="true"></circle>
        </svg>
      </div>
    `;
  }

  private render() {
    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="wc__title">water chemistry 2d</p>
      ${this.renderChart()}
      <div class="wc__inputs">
        <div class="wc__field">
          <label class="wc__label" for="wc-gh">總硬度 GH (ppm)</label>
          <input class="wc__input" id="wc-gh" data-field="gh"
                 type="number" inputmode="decimal" min="0" step="1" placeholder="例 68" />
        </div>
        <div class="wc__field">
          <label class="wc__label" for="wc-kh">鹼度 KH (ppm)</label>
          <input class="wc__input" id="wc-kh" data-field="kh"
                 type="number" inputmode="decimal" min="0" step="1" placeholder="例 40" />
        </div>
        <div class="wc__field">
          <label class="wc__label" for="wc-ph">pH（選填）</label>
          <input class="wc__input" id="wc-ph" data-field="ph"
                 type="number" inputmode="decimal" min="0" max="14" step="0.1" placeholder="例 7.0" />
        </div>
      </div>
      <p class="wc__user-readout">輸入 GH / KH 看你的水落點</p>
      <div class="wc__detail" hidden>
        <p class="wc__detail-name"></p>
        <p class="wc__detail-stats"></p>
        <p class="wc__detail-row wc__detail-flavor"></p>
        <p class="wc__detail-row wc__detail-pairing"></p>
      </div>
    `;
    this.updateUserPoint();
    this.updateDetail();
  }
}

if (typeof window !== 'undefined' && !customElements.get('water-chemistry-2d')) {
  customElements.define('water-chemistry-2d', WaterChemistry2D);
}
