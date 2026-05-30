/**
 * BrewRatioVisualizer。
 *
 * 互動粉水比視覺化：
 *   - 5 個 preset：espresso / ristretto / V60 / AeroPress / lungo
 *   - 兩條水平 bar：粉（固定 1 單位）vs 液（依比例縮放）
 *   - slider 範圍 1.0–20.0
 *   - 顯示 1 : X 與粉 18g → 液 X g 範例
 *   - 落點落在哪個範圍（義式 / 手沖 / 過稀）的小註解
 *
 * 用法：在 Markdown 直接寫
 *   <brew-ratio-visualizer></brew-ratio-visualizer>
 *
 * Hydration：DocLayout 在 client:visible 時 import 這隻檔案。
 */

interface Preset {
  id: string;
  label: string;
  ratio: number;
}

const PRESETS: Preset[] = [
  { id: 'ristretto', label: 'Ristretto 1:1.5', ratio: 1.5 },
  { id: 'espresso', label: 'Espresso 1:2', ratio: 2.0 },
  { id: 'lungo', label: 'Lungo 1:3', ratio: 3.0 },
  { id: 'aeropress', label: 'AeroPress 1:12', ratio: 12.0 },
  { id: 'v60', label: 'V60 1:15', ratio: 15.0 },
];

const DEMO_DOSE = 18; // g

function rangeLabel(ratio: number): { name: string; tone: 'normal' | 'over' } {
  if (ratio < 1.5) return { name: '比 ristretto 還緊，幾乎是純濃縮', tone: 'normal' };
  if (ratio <= 2) return { name: '義式 ristretto / normale 區間', tone: 'normal' };
  if (ratio <= 3) return { name: '義式 normale / lungo 區間', tone: 'normal' };
  if (ratio < 10) return { name: '中間帶（不常見：濃手沖或稀義式）', tone: 'normal' };
  if (ratio <= 14) return { name: '加強型手沖 / AeroPress 區間', tone: 'normal' };
  if (ratio <= 18) return { name: '標準手沖區間（SCA Golden Cup 1:15–1:18）', tone: 'normal' };
  return { name: '過稀，可能會欠味', tone: 'over' };
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

.brv__title {
  margin: 0 0 var(--space-3, 0.75rem);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 500;
  color: var(--color-text, #1A1612);
  font-family: var(--font-mono, monospace);
  text-transform: lowercase;
  letter-spacing: 0.04em;
}

.brv__presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  margin-bottom: var(--space-4, 1rem);
}

.brv__preset {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: 999px;
  background: var(--color-bg, #FAF7F0);
  color: var(--color-text-muted, #5C5246);
  cursor: pointer;
  transition: background-color var(--transition-fast, 120ms ease),
              color var(--transition-fast, 120ms ease),
              border-color var(--transition-fast, 120ms ease);
}

.brv__preset:hover {
  color: var(--color-accent, #7A3E1D);
  border-color: var(--color-accent-soft, #C9A88C);
}

.brv__preset[aria-pressed='true'] {
  background: var(--color-bg-elevated, #FFFFFF);
  color: var(--color-text, #1A1612);
  border-color: var(--color-border-strong, #B8AC95);
}

.brv__bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.5rem);
  margin-bottom: var(--space-4, 1rem);
}

.brv__bar-row {
  display: grid;
  grid-template-columns: 56px 1fr;
  align-items: center;
  gap: var(--space-3, 0.75rem);
}

.brv__bar-label {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
  text-align: right;
}

.brv__bar-track {
  position: relative;
  width: 100%;
  height: 32px;
  background: var(--color-bg, #FAF7F0);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-sm, 4px);
  overflow: hidden;
}

.brv__bar-fill {
  height: 100%;
  transition: width 200ms ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: var(--space-2, 0.5rem);
  box-sizing: border-box;
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-bg, #FAF7F0);
  white-space: nowrap;
}

.brv__bar-fill--dose {
  background: var(--color-accent, #7A3E1D);
}

.brv__bar-fill--water {
  background: var(--color-accent-soft, #C9A88C);
  color: var(--color-text, #1A1612);
}

.brv__slider-row {
  display: flex;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  margin-bottom: var(--space-3, 0.75rem);
}

.brv__slider {
  flex: 1;
  appearance: none;
  -webkit-appearance: none;
  height: 4px;
  background: var(--color-border, #DDD6C5);
  border-radius: 999px;
  outline: none;
  cursor: pointer;
  margin: 0;
}

.brv__slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-accent, #7A3E1D);
  border: 2px solid var(--color-bg, #FAF7F0);
  cursor: pointer;
  box-shadow: 0 0 0 1px var(--color-border-strong, #B8AC95);
}

.brv__slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-accent, #7A3E1D);
  border: 2px solid var(--color-bg, #FAF7F0);
  cursor: pointer;
  box-shadow: 0 0 0 1px var(--color-border-strong, #B8AC95);
}

.brv__slider:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent, #7A3E1D) 30%, transparent);
}

.brv__slider:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent, #7A3E1D) 30%, transparent);
}

.brv__readout {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3, 0.75rem);
  flex-wrap: wrap;
  padding-top: var(--space-3, 0.75rem);
  border-top: 1px solid var(--color-border, #DDD6C5);
}

.brv__value {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-2xl, 1.75rem);
  font-weight: 500;
  color: var(--color-text, #1A1612);
  letter-spacing: 0.02em;
}

.brv__example {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-muted, #5C5246);
}

.brv__range {
  margin-top: var(--space-2, 0.5rem);
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-muted, #5C5246);
}

.brv__range[data-tone='over'] {
  color: var(--color-callout-warning-bar, #8C5A1C);
}

@media (max-width: 480px) {
  .brv__bar-track { height: 24px; }
  .brv__value { font-size: var(--font-size-xl, 1.375rem); }
  .brv__bar-row { grid-template-columns: 40px 1fr; }
}
`;

class BrewRatioVisualizer extends HTMLElement {
  private shadow: ShadowRoot;
  private ratio = 2.0;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();

    this.shadow.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.classList.contains('brv__slider')) {
        const value = parseFloat(target.value);
        if (Number.isFinite(value)) {
          this.ratio = Math.max(1.0, Math.min(20.0, value));
          this.update();
        }
      }
    });

    this.shadow.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest(
        '.brv__preset',
      ) as HTMLButtonElement | null;
      if (!target) return;
      const ratio = parseFloat(target.dataset.ratio ?? '');
      if (Number.isFinite(ratio)) {
        this.ratio = ratio;
        const slider = this.shadow.querySelector(
          '.brv__slider',
        ) as HTMLInputElement | null;
        if (slider) slider.value = String(ratio);
        this.update();
      }
    });
  }

  private update() {
    const r = this.ratio;
    const dosePct = (1 / (1 + r)) * 100;
    const waterPct = (r / (1 + r)) * 100;

    const doseFill = this.shadow.querySelector(
      '.brv__bar-fill--dose',
    ) as HTMLElement | null;
    const waterFill = this.shadow.querySelector(
      '.brv__bar-fill--water',
    ) as HTMLElement | null;
    if (doseFill) doseFill.style.width = `${dosePct.toFixed(2)}%`;
    if (waterFill) waterFill.style.width = `${waterPct.toFixed(2)}%`;

    const valueEl = this.shadow.querySelector('.brv__value');
    if (valueEl) valueEl.textContent = `1 : ${r.toFixed(1)}`;

    const exampleEl = this.shadow.querySelector('.brv__example');
    if (exampleEl) {
      const water = DEMO_DOSE * r;
      exampleEl.textContent = `粉 ${DEMO_DOSE}g → 液 ${water.toFixed(1)}g`;
    }

    const rangeEl = this.shadow.querySelector('.brv__range') as HTMLElement | null;
    if (rangeEl) {
      const { name, tone } = rangeLabel(r);
      rangeEl.textContent = name;
      rangeEl.dataset.tone = tone;
    }

    // 更新 preset 啟動狀態
    const buttons = this.shadow.querySelectorAll<HTMLButtonElement>('.brv__preset');
    buttons.forEach((btn) => {
      const btnRatio = parseFloat(btn.dataset.ratio ?? '');
      const active = Math.abs(btnRatio - r) < 0.05;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  private render() {
    const presetButtons = PRESETS.map(
      (p) =>
        `<button type="button" class="brv__preset" data-ratio="${p.ratio}" aria-pressed="false">${p.label}</button>`,
    ).join('');

    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="brv__title">brew ratio visualizer</p>

      <div class="brv__presets" role="group" aria-label="常見粉水比">
        ${presetButtons}
      </div>

      <div class="brv__bars" aria-hidden="true">
        <div class="brv__bar-row">
          <span class="brv__bar-label">粉</span>
          <div class="brv__bar-track">
            <div class="brv__bar-fill brv__bar-fill--dose"></div>
          </div>
        </div>
        <div class="brv__bar-row">
          <span class="brv__bar-label">液</span>
          <div class="brv__bar-track">
            <div class="brv__bar-fill brv__bar-fill--water"></div>
          </div>
        </div>
      </div>

      <div class="brv__slider-row">
        <input class="brv__slider" type="range" min="1" max="20" step="0.1"
               value="${this.ratio}" aria-label="粉水比" />
      </div>

      <div class="brv__readout">
        <span class="brv__value"></span>
        <span class="brv__example"></span>
      </div>
      <p class="brv__range"></p>
    `;
    this.update();
  }
}

if (typeof window !== 'undefined' && !customElements.get('brew-ratio-visualizer')) {
  customElements.define('brew-ratio-visualizer', BrewRatioVisualizer);
}
