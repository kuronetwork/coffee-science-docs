/**
 * RoastLevelSlider。
 *
 * 互動烘焙度視覺化：
 *   - Range slider，數值 30-95（Agtron whole bean，越低越深）
 *   - 即時更新：豆色 preview、烘焙度標籤、體積膨脹/失水率/油光、
 *     酸質/苦味/body 三條 bar
 *   - 下方標出手沖適合區間（65-85）與義式適合區間（45-65）
 *
 * 用法：在 Markdown 直接寫
 *   <roast-level-slider></roast-level-slider>
 *
 * 設計取向：
 *   - 配色：豆色用暖色 HSL 內插（hue 30-22°、由亮 tan 到深棕近黑）
 *   - 不引入綠 / 藍 / 紅
 *   - 強度條沿用 accent / bg-subtle 兩色
 */

const A_MIN = 30;
const A_MAX = 95;

interface LevelInfo {
  label: string;
  /** 手沖區間（Agtron 65-85）/ 義式區間（45-65） */
  zone: 'extra-light' | 'light' | 'medium' | 'medium-dark' | 'dark' | 'extra-dark';
}

function classifyLevel(a: number): LevelInfo {
  if (a >= 85) return { label: '極淺', zone: 'extra-light' };
  if (a >= 75) return { label: '淺', zone: 'light' };
  if (a >= 65) return { label: '中', zone: 'medium' };
  if (a >= 55) return { label: '中深', zone: 'medium-dark' };
  if (a >= 45) return { label: '深', zone: 'dark' };
  return { label: '極深', zone: 'extra-dark' };
}

/** Agtron 線性映射到 0-1 進度（高 = 淺 = 0、低 = 深 = 1） */
function darkness(a: number): number {
  const c = Math.max(A_MIN, Math.min(A_MAX, a));
  return (A_MAX - c) / (A_MAX - A_MIN);
}

/**
 * 由 Agtron 算出豆色（HSL）。
 * 淺：HSL(34, 45%, 70%) 接近 tan #D6BB97
 * 中：HSL(28, 45%, 38%) 接近中棕 #8B5A30
 * 深：HSL(24, 30%, 14%) 接近黑棕 #2E2014
 *
 * 用三段線性內插，避免兩端過於暗淡。
 */
function beanColor(a: number): string {
  const d = darkness(a); // 0=淺、1=深
  // 兩段：0-0.6 淺到中、0.6-1 中到深
  let h: number, s: number, l: number;
  if (d <= 0.6) {
    const k = d / 0.6;
    h = 34 + (28 - 34) * k;
    s = 45 + (45 - 45) * k;
    l = 70 + (38 - 70) * k;
  } else {
    const k = (d - 0.6) / 0.4;
    h = 28 + (24 - 28) * k;
    s = 45 + (30 - 45) * k;
    l = 38 + (14 - 38) * k;
  }
  return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;
}

/** 體積膨脹（淺 +50% → 深 +100%） */
function volumeExpansion(a: number): number {
  return 50 + darkness(a) * 50;
}

/** 失水率（淺 11% → 深 17%） */
function waterLoss(a: number): number {
  return 11 + darkness(a) * 6;
}

/** 表面油光等級 */
function oilLevel(a: number): string {
  if (a >= 65) return '無';
  if (a >= 55) return '微微';
  if (a >= 45) return '可見';
  if (a >= 38) return '明顯';
  return '油亮';
}

/** 三條 bar 的填滿百分比（0-100）。整理自 SCA Sensory 趨勢與業界共識。 */
function attributes(a: number): { acidity: number; bitterness: number; body: number } {
  const d = darkness(a); // 0=極淺、1=極深
  // 酸質：淺烘高、深烘低（不到 0 也不到 100）。曲線略帶鈍化
  const acidity = Math.max(15, 92 - d * 75);
  // 苦味：與酸相反，深烘高
  const bitterness = Math.max(15, 18 + d * 70);
  // body：中段以後逐步上升，再到極深略下滑（焦烤反而 body 變空）
  let body: number;
  if (d <= 0.7) {
    body = 30 + (d / 0.7) * 55; // 30 → 85
  } else {
    body = 85 - ((d - 0.7) / 0.3) * 12; // 85 → 73
  }
  return { acidity, bitterness, body };
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

.rls__title {
  margin: 0 0 var(--space-3, 0.75rem);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 500;
  font-family: var(--font-mono, monospace);
  text-transform: lowercase;
  letter-spacing: 0.04em;
}

.rls__top {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: var(--space-4, 1rem);
  align-items: center;
  margin-bottom: var(--space-4, 1rem);
}

.rls__bean {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #C9A88C;
  border: 1px solid var(--color-border-strong, #B8AC95);
  box-shadow: inset -6px -8px 14px rgba(0, 0, 0, 0.18),
              inset 4px 4px 8px rgba(255, 255, 255, 0.12);
  transition: background 220ms ease;
}

.rls__head {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 0.25rem);
}

.rls__agtron {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
  letter-spacing: 0.02em;
}

.rls__level {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-xl, 1.375rem);
  color: var(--color-text, #1A1612);
  font-weight: 500;
}

.rls__level-en {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-subtle, #8A7F6E);
}

.rls__slider-wrap {
  position: relative;
  margin: var(--space-3, 0.75rem) 0 var(--space-4, 1rem);
  padding-bottom: var(--space-6, 1.5rem);
}

.rls__slider {
  appearance: none;
  -webkit-appearance: none;
  height: 4px;
  background: var(--color-border, #DDD6C5);
  border-radius: 999px;
  outline: none;
  cursor: pointer;
  margin: 0;
  width: 100%;
  position: relative;
  z-index: 2;
}

.rls__slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--color-accent, #7A3E1D);
  border: 2px solid var(--color-bg, #FAF7F0);
  cursor: pointer;
  box-shadow: 0 0 0 1px var(--color-border-strong, #B8AC95);
}

.rls__slider::-moz-range-thumb {
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--color-accent, #7A3E1D);
  border: 2px solid var(--color-bg, #FAF7F0);
  cursor: pointer;
  box-shadow: 0 0 0 1px var(--color-border-strong, #B8AC95);
}

.rls__slider:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent, #7A3E1D) 30%, transparent);
}

.rls__zones {
  position: absolute;
  left: 0;
  right: 0;
  top: 14px;
  height: 18px;
  pointer-events: none;
}

.rls__zone {
  position: absolute;
  top: 6px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-accent-soft, #C9A88C) 65%, transparent);
}

.rls__zone-label {
  position: absolute;
  top: 14px;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--color-text-muted, #5C5246);
  white-space: nowrap;
  transform: translateX(-50%);
}

.rls__scale {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-subtle, #8A7F6E);
  margin-top: var(--space-1, 0.25rem);
}

.rls__attrs {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2, 0.5rem);
  padding-top: var(--space-3, 0.75rem);
  border-top: 1px solid var(--color-border, #DDD6C5);
  margin-bottom: var(--space-4, 1rem);
}

.rls__attr-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: center;
  gap: var(--space-3, 0.75rem);
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
}

.rls__attr-label {
  text-align: right;
}

.rls__attr-value {
  color: var(--color-text, #1A1612);
}

.rls__bars {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2, 0.5rem);
  padding-top: var(--space-3, 0.75rem);
  border-top: 1px solid var(--color-border, #DDD6C5);
}

.rls__bar-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) 40px;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
}

.rls__bar-label {
  text-align: right;
}

.rls__bar-track {
  position: relative;
  height: 6px;
  background: var(--color-bg, #FAF7F0);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: 999px;
  overflow: hidden;
}

.rls__bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--color-accent, #7A3E1D);
  border-radius: 999px;
  transition: width 220ms ease;
}

.rls__bar-num {
  text-align: right;
  color: var(--color-text-subtle, #8A7F6E);
}

@media (max-width: 640px) {
  .rls__top {
    grid-template-columns: 72px minmax(0, 1fr);
    gap: var(--space-3, 0.75rem);
  }
  .rls__bean { width: 72px; height: 72px; }
  .rls__attr-row,
  .rls__bar-row {
    grid-template-columns: 72px minmax(0, 1fr) 40px;
  }
  .rls__attr-row { grid-template-columns: 72px minmax(0, 1fr); }
}
`;

class RoastLevelSlider extends HTMLElement {
  private shadow: ShadowRoot;
  private agtron = 70;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadow.addEventListener('input', (e) => {
      const t = e.target as HTMLInputElement;
      if (t.dataset.field !== 'agtron') return;
      const v = parseFloat(t.value);
      if (!Number.isFinite(v)) return;
      this.agtron = Math.max(A_MIN, Math.min(A_MAX, v));
      this.update();
    });
  }

  /** Agtron 值對應到 slider track 的 % 位置（左 = 深 = A_MIN） */
  private agtronPercent(a: number): number {
    return ((a - A_MIN) / (A_MAX - A_MIN)) * 100;
  }

  private update() {
    const a = this.agtron;
    const info = classifyLevel(a);
    const attrs = attributes(a);

    const setText = (sel: string, value: string) => {
      const el = this.shadow.querySelector(sel);
      if (el) el.textContent = value;
    };

    const setStyle = (sel: string, prop: string, value: string) => {
      const el = this.shadow.querySelector(sel) as HTMLElement | null;
      if (el) el.style.setProperty(prop, value);
    };

    setStyle('.rls__bean', 'background', beanColor(a));
    setText('.rls__agtron', `Agtron #${a.toFixed(0)}`);
    setText('.rls__level', info.label);
    setText('.rls__level-en', `${info.zone.replace('-', ' ')}`);

    setText('.rls__attr--volume .rls__attr-value', `約 +${volumeExpansion(a).toFixed(0)}%`);
    setText('.rls__attr--water .rls__attr-value', `約 ${waterLoss(a).toFixed(1)}%`);
    setText('.rls__attr--oil .rls__attr-value', oilLevel(a));

    const bars: { sel: string; v: number }[] = [
      { sel: '.rls__bar--acidity', v: attrs.acidity },
      { sel: '.rls__bar--bitterness', v: attrs.bitterness },
      { sel: '.rls__bar--body', v: attrs.body },
    ];
    for (const b of bars) {
      setStyle(`${b.sel} .rls__bar-fill`, 'width', `${b.v.toFixed(0)}%`);
      setText(`${b.sel} .rls__bar-num`, `${b.v.toFixed(0)}`);
    }
  }

  private renderZones(): string {
    // 手沖適合 65-85、義式適合 45-65
    const filterLeft = this.agtronPercent(65);
    const filterRight = this.agtronPercent(85);
    const espLeft = this.agtronPercent(45);
    const espRight = this.agtronPercent(65);

    return `
      <div class="rls__zones" aria-hidden="true">
        <div class="rls__zone" style="left: ${espLeft}%; width: ${(espRight - espLeft).toFixed(2)}%"></div>
        <div class="rls__zone" style="left: ${filterLeft}%; width: ${(filterRight - filterLeft).toFixed(2)}%"></div>
        <span class="rls__zone-label" style="left: ${((espLeft + espRight) / 2).toFixed(2)}%">義式適合</span>
        <span class="rls__zone-label" style="left: ${((filterLeft + filterRight) / 2).toFixed(2)}%">手沖適合</span>
      </div>
    `;
  }

  private render() {
    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="rls__title">roast level · 烘焙度</p>

      <div class="rls__top">
        <div class="rls__bean" aria-hidden="true"></div>
        <div class="rls__head">
          <span class="rls__agtron"></span>
          <span class="rls__level"></span>
          <span class="rls__level-en"></span>
        </div>
      </div>

      <div class="rls__slider-wrap">
        <input class="rls__slider" type="range"
               data-field="agtron"
               min="${A_MIN}" max="${A_MAX}" step="1" value="${this.agtron}"
               aria-label="Agtron 烘焙度數值（30-95，越低越深）" />
        ${this.renderZones()}
        <div class="rls__scale">
          <span>#${A_MIN}（深）</span>
          <span>#${A_MAX}（淺）</span>
        </div>
      </div>

      <div class="rls__attrs">
        <div class="rls__attr-row rls__attr--volume">
          <span class="rls__attr-label">體積膨脹</span>
          <span class="rls__attr-value"></span>
        </div>
        <div class="rls__attr-row rls__attr--water">
          <span class="rls__attr-label">失水率</span>
          <span class="rls__attr-value"></span>
        </div>
        <div class="rls__attr-row rls__attr--oil">
          <span class="rls__attr-label">表面油光</span>
          <span class="rls__attr-value"></span>
        </div>
      </div>

      <div class="rls__bars">
        <div class="rls__bar-row rls__bar--acidity">
          <span class="rls__bar-label">酸質 acidity</span>
          <span class="rls__bar-track"><span class="rls__bar-fill"></span></span>
          <span class="rls__bar-num"></span>
        </div>
        <div class="rls__bar-row rls__bar--bitterness">
          <span class="rls__bar-label">苦味 bitterness</span>
          <span class="rls__bar-track"><span class="rls__bar-fill"></span></span>
          <span class="rls__bar-num"></span>
        </div>
        <div class="rls__bar-row rls__bar--body">
          <span class="rls__bar-label">body</span>
          <span class="rls__bar-track"><span class="rls__bar-fill"></span></span>
          <span class="rls__bar-num"></span>
        </div>
      </div>
    `;
    this.update();
  }
}

if (typeof window !== 'undefined' && !customElements.get('roast-level-slider')) {
  customElements.define('roast-level-slider', RoastLevelSlider);
}
