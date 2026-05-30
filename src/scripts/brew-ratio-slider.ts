/**
 * BrewRatioSlider。
 *
 * 視覺化粉水比互動：
 *   - 粉量 slider（10-25 g）
 *   - 比例 slider（1:1.5 到 1:18）
 *   - 兩個並排容器，高度依比例縮放（粉小、液大）
 *   - 即時顯示液重、總重、建議沖煮法分類
 *
 * 用法：在 Markdown 直接寫
 *   <brew-ratio-slider></brew-ratio-slider>
 *
 * 與 <brew-ratio-calc>（純計算）、<brew-ratio-visualizer>（橫向 bar + preset）
 * 互補：本元件用兩個垂直容器讓粉量與液量的「體感」差異更直觀。
 */

const DOSE_MIN = 10;
const DOSE_MAX = 25;
const RATIO_MIN = 1.5;
const RATIO_MAX = 18;

function suggestMethod(ratio: number): string {
  if (ratio < 2.0) return 'Espresso · Ristretto 區段';
  if (ratio <= 3.0) return 'Espresso · Normale / Lungo 區段';
  if (ratio < 12) return '中間帶（少見：濃手沖、Moka、AeroPress 高粉版）';
  if (ratio <= 14) return 'AeroPress / 加強型手沖';
  if (ratio <= 17) return 'V60 / 手沖（SCA Golden Cup 1:15-1:18）';
  return '稀手沖（接近上限）';
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

.brs__title {
  margin: 0 0 var(--space-3, 0.75rem);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 500;
  font-family: var(--font-mono, monospace);
  text-transform: lowercase;
  letter-spacing: 0.04em;
  color: var(--color-text, #1A1612);
}

.brs__sliders {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4, 1rem);
  margin-bottom: var(--space-4, 1rem);
}

.brs__slider-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.5rem);
}

.brs__slider-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
}

.brs__slider-value {
  color: var(--color-text, #1A1612);
  font-size: var(--font-size-sm, 0.875rem);
}

.brs__slider {
  appearance: none;
  -webkit-appearance: none;
  height: 4px;
  background: var(--color-border, #DDD6C5);
  border-radius: 999px;
  outline: none;
  cursor: pointer;
  margin: 0;
  width: 100%;
}
.brs__slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--color-accent, #7A3E1D);
  border: 2px solid var(--color-bg, #FAF7F0);
  cursor: pointer;
  box-shadow: 0 0 0 1px var(--color-border-strong, #B8AC95);
}
.brs__slider::-moz-range-thumb {
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--color-accent, #7A3E1D);
  border: 2px solid var(--color-bg, #FAF7F0);
  cursor: pointer;
  box-shadow: 0 0 0 1px var(--color-border-strong, #B8AC95);
}
.brs__slider:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent, #7A3E1D) 30%, transparent);
}

.brs__visual {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4, 1rem);
  align-items: end;
  height: 200px;
  margin-bottom: var(--space-4, 1rem);
  padding: 0 var(--space-2, 0.5rem);
}

.brs__bin {
  width: 100%;
  position: relative;
  border-radius: var(--radius-sm, 4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: var(--space-2, 0.5rem);
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  transition: height 200ms ease;
  box-sizing: border-box;
  overflow: hidden;
}

.brs__bin--dose {
  background: var(--color-accent, #7A3E1D);
  color: var(--color-bg, #FAF7F0);
}

.brs__bin--water {
  background: var(--color-bg, #FAF7F0);
  border: 1px solid var(--color-border-strong, #B8AC95);
  color: var(--color-text, #1A1612);
}

.brs__bin-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
}

.brs__bin-amount {
  font-size: var(--font-size-base, 1rem);
  font-weight: 500;
}

.brs__readout {
  padding-top: var(--space-3, 0.75rem);
  border-top: 1px solid var(--color-border, #DDD6C5);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-3, 0.75rem);
  margin-bottom: var(--space-3, 0.75rem);
}

.brs__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brs__stat-label {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
  letter-spacing: 0.02em;
}

.brs__stat-value {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-lg, 1.125rem);
  color: var(--color-text, #1A1612);
}

.brs__suggestion {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-accent, #7A3E1D);
  font-family: var(--font-sans, sans-serif);
}

@media (max-width: 480px) {
  .brs__visual { height: 160px; }
}
`;

class BrewRatioSlider extends HTMLElement {
  private shadow: ShadowRoot;
  private dose = 18;
  private ratio = 15;

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
      if (t.dataset.field === 'dose') {
        this.dose = Math.max(DOSE_MIN, Math.min(DOSE_MAX, v));
      }
      if (t.dataset.field === 'ratio') {
        this.ratio = Math.max(RATIO_MIN, Math.min(RATIO_MAX, v));
      }
      this.update();
    });
  }

  private update() {
    const water = this.dose * this.ratio;
    const total = this.dose + water;

    // 視覺：兩柱共用 200px / 160px 視窗。
    // 用「(1, ratio)」做相對高度，但留地板 8% 確保 ristretto 仍看得到水柱。
    const minFrac = 0.08;
    let dosePct = 1 / (1 + this.ratio);
    let waterPct = this.ratio / (1 + this.ratio);
    // 先依比例縮放到 92% 區間，再加 8% 底
    const range = 1 - minFrac;
    dosePct = minFrac + dosePct * range;
    waterPct = minFrac + waterPct * range;
    // 視 ratio 大時，dose 會被壓得太小，所以用 max(minFrac, 實際比例) 後正規化
    const sum = dosePct + waterPct;
    dosePct = (dosePct / sum) * 100;
    waterPct = (waterPct / sum) * 100;

    const doseBin = this.shadow.querySelector('.brs__bin--dose') as HTMLElement | null;
    const waterBin = this.shadow.querySelector('.brs__bin--water') as HTMLElement | null;
    if (doseBin) doseBin.style.height = `${dosePct.toFixed(2)}%`;
    if (waterBin) waterBin.style.height = `${waterPct.toFixed(2)}%`;

    const setText = (sel: string, value: string) => {
      const el = this.shadow.querySelector(sel);
      if (el) el.textContent = value;
    };

    setText('.brs__dose-amount', `${this.dose.toFixed(0)} g`);
    setText('.brs__water-amount', `${water.toFixed(0)} g`);

    setText('.brs__slider-value--dose', `${this.dose.toFixed(0)} g`);
    setText('.brs__slider-value--ratio', `1 : ${this.ratio.toFixed(1)}`);

    setText('.brs__stat--dose .brs__stat-value', `${this.dose.toFixed(0)} g`);
    setText('.brs__stat--water .brs__stat-value', `${water.toFixed(0)} g`);
    setText('.brs__stat--total .brs__stat-value', `${total.toFixed(0)} g`);
    setText('.brs__stat--ratio .brs__stat-value', `1 : ${this.ratio.toFixed(1)}`);
    setText('.brs__suggestion', suggestMethod(this.ratio));
  }

  private render() {
    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="brs__title">brew ratio slider</p>

      <div class="brs__sliders">
        <div class="brs__slider-row">
          <div class="brs__slider-head">
            <span>粉量 dose</span>
            <span class="brs__slider-value brs__slider-value--dose"></span>
          </div>
          <input class="brs__slider" data-field="dose" type="range"
                 min="${DOSE_MIN}" max="${DOSE_MAX}" step="0.5" value="${this.dose}"
                 aria-label="粉量 (g)" />
        </div>
        <div class="brs__slider-row">
          <div class="brs__slider-head">
            <span>粉水比 ratio</span>
            <span class="brs__slider-value brs__slider-value--ratio"></span>
          </div>
          <input class="brs__slider" data-field="ratio" type="range"
                 min="${RATIO_MIN}" max="${RATIO_MAX}" step="0.1" value="${this.ratio}"
                 aria-label="粉水比" />
        </div>
      </div>

      <div class="brs__visual" aria-hidden="true">
        <div class="brs__bin brs__bin--dose">
          <div class="brs__bin-label">
            <span>粉</span>
            <span class="brs__bin-amount brs__dose-amount"></span>
          </div>
        </div>
        <div class="brs__bin brs__bin--water">
          <div class="brs__bin-label">
            <span>液</span>
            <span class="brs__bin-amount brs__water-amount"></span>
          </div>
        </div>
      </div>

      <div class="brs__readout">
        <div class="brs__stat brs__stat--dose">
          <span class="brs__stat-label">粉量</span>
          <span class="brs__stat-value"></span>
        </div>
        <div class="brs__stat brs__stat--water">
          <span class="brs__stat-label">液重</span>
          <span class="brs__stat-value"></span>
        </div>
        <div class="brs__stat brs__stat--total">
          <span class="brs__stat-label">總重</span>
          <span class="brs__stat-value"></span>
        </div>
        <div class="brs__stat brs__stat--ratio">
          <span class="brs__stat-label">比例</span>
          <span class="brs__stat-value"></span>
        </div>
      </div>
      <p class="brs__suggestion"></p>
    `;
    this.update();
  }
}

if (typeof window !== 'undefined' && !customElements.get('brew-ratio-slider')) {
  customElements.define('brew-ratio-slider', BrewRatioSlider);
}
