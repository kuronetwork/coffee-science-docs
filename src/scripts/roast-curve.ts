/**
 * RoastCurve。
 *
 * 互動烘焙曲線：
 *   - SVG 折線圖：X = 時間（0-14 min），Y = 豆溫（60-230°C）
 *   - 四個階段背景帶：charge / drying / Maillard / development
 *   - 四條虛線標記：turning point、yellowing、first crack、drop
 *   - 下方顯示 DTR 計算結果
 *   - Preset 切換：正常烘焙 / Underdeveloped / Baked / Scorched
 *
 * 用法：在 Markdown 直接寫
 *   <roast-curve></roast-curve>
 *
 * 設計取向：
 *   - 配色嚴格用 accent / accent-soft / bg-subtle，不引入第二色相
 *   - 曲線本身用 Catmull-Rom 轉 cubic bezier 平滑連接 anchor points
 *   - markers 不可拖曳，用 preset 切換以保持實作簡潔
 */

interface Anchor {
  /** 時間（分鐘） */
  t: number;
  /** 豆溫（°C） */
  T: number;
}

interface Preset {
  id: string;
  label: string;
  desc: string;
  /** 曲線 anchor points */
  points: Anchor[];
  turningPoint: number;
  yellowing: number;
  firstCrack: number;
  drop: number;
}

const PRESETS: Preset[] = [
  {
    id: 'normal',
    label: '正常烘焙',
    desc: 'DTR 約 21%，曲線平順，RoR 整體遞減。',
    points: [
      { t: 0, T: 210 },
      { t: 0.3, T: 160 },
      { t: 0.6, T: 120 },
      { t: 1.0, T: 95 },
      { t: 1.25, T: 90 },
      { t: 2, T: 100 },
      { t: 3, T: 120 },
      { t: 4, T: 140 },
      { t: 4.5, T: 150 },
      { t: 5.5, T: 170 },
      { t: 6.5, T: 188 },
      { t: 7.5, T: 200 },
      { t: 8.5, T: 207 },
      { t: 9.5, T: 210 },
    ],
    turningPoint: 1.25,
    yellowing: 4.5,
    firstCrack: 7.5,
    drop: 9.5,
  },
  {
    id: 'under',
    label: 'Underdeveloped',
    desc: '一爆才剛開始就下豆，內部發展不完整。',
    points: [
      { t: 0, T: 210 },
      { t: 0.3, T: 160 },
      { t: 0.6, T: 120 },
      { t: 1.0, T: 95 },
      { t: 1.25, T: 90 },
      { t: 2, T: 100 },
      { t: 3, T: 120 },
      { t: 4, T: 140 },
      { t: 4.5, T: 150 },
      { t: 5.5, T: 170 },
      { t: 6.5, T: 188 },
      { t: 7.5, T: 198 },
      { t: 7.9, T: 200 },
    ],
    turningPoint: 1.25,
    yellowing: 4.5,
    firstCrack: 7.5,
    drop: 7.9,
  },
  {
    id: 'baked',
    label: 'Baked',
    desc: '總時間過長、RoR 一路平緩沒下降，杯中紙板感。',
    points: [
      { t: 0, T: 210 },
      { t: 0.3, T: 165 },
      { t: 0.6, T: 118 },
      { t: 1.0, T: 95 },
      { t: 1.25, T: 90 },
      { t: 2, T: 102 },
      { t: 3, T: 122 },
      { t: 4.5, T: 145 },
      { t: 5.5, T: 152 },
      { t: 7, T: 168 },
      { t: 9, T: 184 },
      { t: 10.5, T: 194 },
      { t: 11, T: 200 },
      { t: 12.5, T: 207 },
      { t: 13.5, T: 210 },
    ],
    turningPoint: 1.25,
    yellowing: 5.5,
    firstCrack: 11,
    drop: 13.5,
  },
  {
    id: 'scorched',
    label: 'Scorched',
    desc: 'RoR 在第 2 分鐘出現上揚 spike，豆表面焦化。',
    points: [
      { t: 0, T: 220 },
      { t: 0.3, T: 175 },
      { t: 0.6, T: 130 },
      { t: 1.0, T: 100 },
      { t: 1.25, T: 95 },
      { t: 1.7, T: 118 },
      { t: 2, T: 145 },
      { t: 2.8, T: 165 },
      { t: 3.5, T: 175 },
      { t: 4.5, T: 188 },
      { t: 5.5, T: 195 },
      { t: 6.5, T: 200 },
      { t: 7.5, T: 208 },
      { t: 8, T: 210 },
    ],
    turningPoint: 1.25,
    yellowing: 4.5,
    firstCrack: 6.5,
    drop: 8,
  },
];

const T_MIN = 0;
const T_MAX = 14;
const TEMP_MIN = 60;
const TEMP_MAX = 230;

const VB_W = 540;
const VB_H = 320;
const PAD_LEFT = 48;
const PAD_RIGHT = 16;
const PAD_TOP = 20;
const PAD_BOTTOM = 44;
const PLOT_LEFT = PAD_LEFT;
const PLOT_RIGHT = VB_W - PAD_RIGHT;
const PLOT_TOP = PAD_TOP;
const PLOT_BOTTOM = VB_H - PAD_BOTTOM;
const PLOT_W = PLOT_RIGHT - PLOT_LEFT;
const PLOT_H = PLOT_BOTTOM - PLOT_TOP;

function timeToX(t: number): number {
  const c = Math.max(T_MIN, Math.min(T_MAX, t));
  return PLOT_LEFT + ((c - T_MIN) / (T_MAX - T_MIN)) * PLOT_W;
}

function tempToY(T: number): number {
  const c = Math.max(TEMP_MIN, Math.min(TEMP_MAX, T));
  return PLOT_BOTTOM - ((c - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * PLOT_H;
}

/**
 * Catmull-Rom 轉 cubic bezier，做出平滑曲線。
 */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function formatTime(min: number): string {
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

const STYLE = `
:host {
  display: block;
  margin: var(--space-6, 1.5rem) 0;
  padding: var(--space-4, 1rem) var(--space-6, 1.5rem) var(--space-6, 1.5rem);
  background: var(--color-bg-subtle, #ECE7DA);
  border-radius: var(--radius-md, 6px);
  font-family: var(--font-sans, sans-serif);
  color: var(--color-text, #1A1612);
}

.rc__title {
  margin: 0 0 var(--space-3, 0.75rem);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 500;
  font-family: var(--font-mono, monospace);
  text-transform: lowercase;
  letter-spacing: 0.04em;
}

.rc__presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  margin-bottom: var(--space-4, 1rem);
}

.rc__preset-btn {
  appearance: none;
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-md, 6px);
  background: var(--color-bg, #FAF7F0);
  color: var(--color-text-muted, #5C5246);
  cursor: pointer;
  transition: border-color 180ms ease, color 180ms ease, background 180ms ease;
}

.rc__preset-btn:hover {
  color: var(--color-accent, #7A3E1D);
  border-color: var(--color-accent-soft, #C9A88C);
}

.rc__preset-btn:focus-visible {
  outline: 2px solid var(--color-accent, #7A3E1D);
  outline-offset: 2px;
}

.rc__preset-btn[aria-pressed='true'] {
  background: var(--color-accent, #7A3E1D);
  border-color: var(--color-accent, #7A3E1D);
  color: var(--color-bg, #FAF7F0);
}

.rc__chart {
  width: 100%;
  max-width: 540px;
  height: auto;
  background: var(--color-bg, #FAF7F0);
  border-radius: var(--radius-md, 6px);
  display: block;
}

.rc__phase {
  stroke: none;
}

.rc__phase--charge {
  fill: color-mix(in srgb, var(--color-bg-subtle, #ECE7DA) 35%, var(--color-bg, #FAF7F0));
}
.rc__phase--drying {
  fill: color-mix(in srgb, var(--color-bg-subtle, #ECE7DA) 70%, var(--color-bg, #FAF7F0));
}
.rc__phase--maillard {
  fill: color-mix(in srgb, var(--color-accent-soft, #C9A88C) 35%, var(--color-bg, #FAF7F0));
}
.rc__phase--development {
  fill: color-mix(in srgb, var(--color-accent-soft, #C9A88C) 65%, var(--color-bg, #FAF7F0));
}

.rc__phase-label {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  fill: var(--color-text-subtle, #8A7F6E);
  text-anchor: middle;
  pointer-events: none;
  letter-spacing: 0.02em;
}

.rc__grid-line {
  stroke: var(--color-border, #DDD6C5);
  stroke-width: 0.5;
}

.rc__axis-label {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  fill: var(--color-text-muted, #5C5246);
}

.rc__axis-name {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  fill: var(--color-text-muted, #5C5246);
}

.rc__marker-line {
  stroke: var(--color-border-strong, #B8AC95);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.rc__marker-label {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  fill: var(--color-text-muted, #5C5246);
  text-anchor: middle;
}

.rc__curve {
  fill: none;
  stroke: var(--color-accent, #7A3E1D);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: d 220ms ease;
}

.rc__readout {
  margin-top: var(--space-4, 1rem);
  padding-top: var(--space-3, 0.75rem);
  border-top: 1px solid var(--color-border, #DDD6C5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.5rem);
}

.rc__formula {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
}

.rc__values {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-base, 1rem);
  color: var(--color-text, #1A1612);
}

.rc__values strong {
  color: var(--color-accent, #7A3E1D);
  font-weight: 500;
}

.rc__desc {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-muted, #5C5246);
}

@media (max-width: 640px) {
  :host {
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem) var(--space-4, 1rem);
  }
  .rc__phase-label { font-size: 9px; }
  .rc__marker-label { font-size: 10px; }
}
`;

class RoastCurve extends HTMLElement {
  private shadow: ShadowRoot;
  private currentId = 'normal';

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadow.addEventListener('click', (e) => {
      const btn = (e.target as Element | null)?.closest('[data-preset]');
      if (!btn) return;
      const id = btn.getAttribute('data-preset');
      if (!id || id === this.currentId) return;
      this.currentId = id;
      this.update();
    });
  }

  private get preset(): Preset {
    return PRESETS.find((p) => p.id === this.currentId) ?? PRESETS[0];
  }

  private renderStaticChrome(): string {
    // Y 軸刻度與格線
    const yTicks = [60, 100, 140, 180, 220];
    const yLabels = yTicks.map((T) => {
      const y = tempToY(T);
      return `
        <line class="rc__grid-line" x1="${PLOT_LEFT}" y1="${y}" x2="${PLOT_RIGHT}" y2="${y}"/>
        <text class="rc__axis-label" x="${PLOT_LEFT - 8}" y="${y + 4}" text-anchor="end">${T}°</text>
      `;
    }).join('');

    // X 軸刻度
    const xTicks = [0, 2, 4, 6, 8, 10, 12, 14];
    const xLabels = xTicks.map((t) => {
      const x = timeToX(t);
      return `
        <text class="rc__axis-label" x="${x}" y="${PLOT_BOTTOM + 16}" text-anchor="middle">${t}:00</text>
      `;
    }).join('');

    const xName = `<text class="rc__axis-name" x="${(PLOT_LEFT + PLOT_RIGHT) / 2}" y="${VB_H - 8}" text-anchor="middle">時間 (min)</text>`;
    const yName = `<text class="rc__axis-name" x="${PAD_LEFT - 36}" y="${(PLOT_TOP + PLOT_BOTTOM) / 2}" text-anchor="middle" transform="rotate(-90 ${PAD_LEFT - 36} ${(PLOT_TOP + PLOT_BOTTOM) / 2})">豆溫 (°C)</text>`;

    return `${yLabels}${xLabels}${xName}${yName}`;
  }

  private renderPhases(): string {
    const p = this.preset;
    const x0 = timeToX(0);
    const xTP = timeToX(p.turningPoint);
    const xYE = timeToX(p.yellowing);
    const xFC = timeToX(p.firstCrack);
    const xDR = timeToX(p.drop);

    const bands = [
      { cls: 'charge', x: x0, w: xTP - x0, name: 'charge' },
      { cls: 'drying', x: xTP, w: xYE - xTP, name: 'drying' },
      { cls: 'maillard', x: xYE, w: xFC - xYE, name: 'maillard' },
      { cls: 'development', x: xFC, w: xDR - xFC, name: 'development' },
    ];

    const rects = bands.map((b) =>
      `<rect class="rc__phase rc__phase--${b.cls}" x="${b.x}" y="${PLOT_TOP}" width="${b.w}" height="${PLOT_H}"/>`,
    ).join('');

    // 階段標籤（只標示寬度夠的 band）
    const labels = bands.filter((b) => b.w > 28).map((b) =>
      `<text class="rc__phase-label" x="${b.x + b.w / 2}" y="${PLOT_TOP + 14}">${b.name}</text>`,
    ).join('');

    return `${rects}${labels}`;
  }

  private renderMarkers(): string {
    const p = this.preset;
    const marks = [
      { t: p.turningPoint, label: `TP ${formatTime(p.turningPoint)}` },
      { t: p.yellowing, label: `黃化 ${formatTime(p.yellowing)}` },
      { t: p.firstCrack, label: `一爆 ${formatTime(p.firstCrack)}` },
      { t: p.drop, label: `下豆 ${formatTime(p.drop)}` },
    ];

    return marks.map((m, i) => {
      const x = timeToX(m.t);
      // 標籤交錯放上下，避免擁擠
      const labelY = i % 2 === 0 ? PLOT_TOP - 4 : PLOT_TOP - 4;
      return `
        <line class="rc__marker-line" x1="${x}" y1="${PLOT_TOP}" x2="${x}" y2="${PLOT_BOTTOM}"/>
        <text class="rc__marker-label" x="${x}" y="${labelY}">${m.label}</text>
      `;
    }).join('');
  }

  private renderCurve(): string {
    const points = this.preset.points.map((a) => ({
      x: timeToX(a.t),
      y: tempToY(a.T),
    }));
    const d = smoothPath(points);
    return `<path class="rc__curve" d="${d}"/>`;
  }

  private renderChart(): string {
    return `
      <svg class="rc__chart" viewBox="0 0 ${VB_W} ${VB_H}" role="img"
           aria-label="烘焙曲線：${this.preset.label}">
        ${this.renderPhases()}
        ${this.renderStaticChrome()}
        ${this.renderMarkers()}
        ${this.renderCurve()}
      </svg>
    `;
  }

  private renderReadout(): string {
    const p = this.preset;
    const total = p.drop;
    const dev = p.drop - p.firstCrack;
    const dtr = total > 0 ? (dev / total) * 100 : 0;
    return `
      <p class="rc__formula">DTR = (drop − first crack) ÷ total time × 100%</p>
      <p class="rc__values">
        <span>下豆 ${formatTime(p.drop)}</span>
        <span> ／ 一爆 ${formatTime(p.firstCrack)}</span>
        <span> ／ 發展期 ${formatTime(dev)}</span>
        <span> ／ <strong>DTR ${dtr.toFixed(1)}%</strong></span>
      </p>
      <p class="rc__desc">${p.desc}</p>
    `;
  }

  private renderPresets(): string {
    return PRESETS.map((p) => `
      <button class="rc__preset-btn" type="button"
              data-preset="${p.id}"
              aria-pressed="${p.id === this.currentId}">${p.label}</button>
    `).join('');
  }

  private update() {
    const presetWrap = this.shadow.querySelector('.rc__presets');
    if (presetWrap) presetWrap.innerHTML = this.renderPresets();
    const chartWrap = this.shadow.querySelector('.rc__chart-wrap');
    if (chartWrap) chartWrap.innerHTML = this.renderChart();
    const readout = this.shadow.querySelector('.rc__readout');
    if (readout) readout.innerHTML = this.renderReadout();
  }

  private render() {
    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="rc__title">roast curve · 烘焙曲線</p>
      <div class="rc__presets" role="group" aria-label="曲線預設">${this.renderPresets()}</div>
      <div class="rc__chart-wrap">${this.renderChart()}</div>
      <div class="rc__readout">${this.renderReadout()}</div>
    `;
  }
}

if (typeof window !== 'undefined' && !customElements.get('roast-curve')) {
  customElements.define('roast-curve', RoastCurve);
}
