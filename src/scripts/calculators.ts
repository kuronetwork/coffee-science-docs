/**
 * 互動計算機。
 *
 * 用 web components 註冊：
 *   - <extraction-calc>  萃取率計算機
 *   - <brew-ratio-calc>  沖煮比率計算機
 *
 * 使用方式：在 Markdown 直接寫
 *   <extraction-calc></extraction-calc>
 *
 * Hydration：DocLayout 在 client:visible 時 import 這隻檔案。
 */

const IDEAL_MIN = 18;
const IDEAL_MAX = 22;

function classify(yieldPct: number): {
  label: string;
  state: 'under' | 'ideal' | 'over' | 'invalid';
} {
  if (Number.isNaN(yieldPct) || yieldPct <= 0) {
    return { label: '請輸入完整參數', state: 'invalid' };
  }
  if (yieldPct < IDEAL_MIN) return { label: '萃取不足', state: 'under' };
  if (yieldPct > IDEAL_MAX) return { label: '過萃', state: 'over' };
  return { label: '理想範圍', state: 'ideal' };
}

const STYLE = `
:host {
  display: block;
  margin: var(--space-6, 1.5rem) 0;
  padding: var(--space-4, 1rem) var(--space-6, 1.5rem);
  background: var(--color-bg-subtle, #ECE7DA);
  border-radius: var(--radius-md, 6px);
  font-family: var(--font-sans, sans-serif);
}

.calc__title {
  margin: 0 0 var(--space-3, 0.75rem);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 500;
  color: var(--color-text, #1A1612);
  font-family: var(--font-mono, monospace);
  text-transform: lowercase;
  letter-spacing: 0.04em;
}

.calc__inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-3, 0.75rem);
  margin-bottom: var(--space-4, 1rem);
}

.calc__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 0.25rem);
}

.calc__label {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
  font-family: var(--font-mono, monospace);
}

.calc__input {
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

.calc__input:focus-visible {
  outline: 2px solid var(--color-accent, #7A3E1D);
  outline-offset: 1px;
  border-color: var(--color-accent, #7A3E1D);
}

.calc__result {
  display: flex;
  align-items: baseline;
  gap: var(--space-3, 0.75rem);
  flex-wrap: wrap;
  padding-top: var(--space-3, 0.75rem);
  border-top: 1px solid var(--color-border, #DDD6C5);
}

.calc__value {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xl, 1.375rem);
  font-weight: 500;
  color: var(--color-text, #1A1612);
}

.calc__state {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-muted, #5C5246);
}

.calc__state[data-state='ideal']   { color: var(--color-accent, #7A3E1D); }
.calc__state[data-state='under']   { color: var(--color-callout-warning-bar, #8C5A1C); }
.calc__state[data-state='over']    { color: var(--color-callout-warning-bar, #8C5A1C); }
.calc__state[data-state='invalid'] { color: var(--color-text-subtle, #8A7F6E); }
`;

class ExtractionCalc extends HTMLElement {
  private shadow: ShadowRoot;
  private dose = 18;
  private yieldWeight = 36;
  private tds = 9;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadow.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      const value = parseFloat(target.value);
      if (target.dataset.field === 'dose') this.dose = value;
      if (target.dataset.field === 'yield') this.yieldWeight = value;
      if (target.dataset.field === 'tds') this.tds = value;
      this.updateResult();
    });
  }

  private compute(): number {
    if (!this.dose || !this.yieldWeight || !this.tds) return NaN;
    return (this.yieldWeight * (this.tds / 100)) / this.dose * 100;
  }

  private updateResult() {
    const yieldPct = this.compute();
    const valueEl = this.shadow.querySelector('.calc__value');
    const stateEl = this.shadow.querySelector('.calc__state') as HTMLElement | null;
    const { label, state } = classify(yieldPct);
    if (valueEl) {
      valueEl.textContent = Number.isNaN(yieldPct)
        ? '萃取率 —'
        : `萃取率 ${yieldPct.toFixed(1)}%`;
    }
    if (stateEl) {
      stateEl.textContent = label;
      stateEl.dataset.state = state;
    }
  }

  private render() {
    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="calc__title">extraction yield calculator</p>
      <div class="calc__inputs">
        <div class="calc__field">
          <label class="calc__label" for="ec-dose">粉量 (g)</label>
          <input class="calc__input" id="ec-dose" data-field="dose"
                 type="number" inputmode="decimal" min="0" step="0.1" value="${this.dose}" />
        </div>
        <div class="calc__field">
          <label class="calc__label" for="ec-yield">液重 (g)</label>
          <input class="calc__input" id="ec-yield" data-field="yield"
                 type="number" inputmode="decimal" min="0" step="0.1" value="${this.yieldWeight}" />
        </div>
        <div class="calc__field">
          <label class="calc__label" for="ec-tds">TDS (%)</label>
          <input class="calc__input" id="ec-tds" data-field="tds"
                 type="number" inputmode="decimal" min="0" step="0.01" value="${this.tds}" />
        </div>
      </div>
      <div class="calc__result">
        <span class="calc__value"></span>
        <span class="calc__state"></span>
      </div>
    `;
    this.updateResult();
  }
}

class BrewRatioCalc extends HTMLElement {
  private shadow: ShadowRoot;
  private dose = 15;
  private ratio = 15;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadow.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      const value = parseFloat(target.value);
      if (target.dataset.field === 'dose') this.dose = value;
      if (target.dataset.field === 'ratio') this.ratio = value;
      this.updateResult();
    });
  }

  private compute(): number {
    if (!this.dose || !this.ratio) return NaN;
    return this.dose * this.ratio;
  }

  private updateResult() {
    const water = this.compute();
    const valueEl = this.shadow.querySelector('.calc__value');
    if (valueEl) {
      valueEl.textContent = Number.isNaN(water)
        ? '需要水量 —'
        : `需要水量 ${water.toFixed(0)} g`;
    }
  }

  private render() {
    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="calc__title">brew ratio calculator</p>
      <div class="calc__inputs">
        <div class="calc__field">
          <label class="calc__label" for="br-dose">粉量 (g)</label>
          <input class="calc__input" id="br-dose" data-field="dose"
                 type="number" inputmode="decimal" min="0" step="0.1" value="${this.dose}" />
        </div>
        <div class="calc__field">
          <label class="calc__label" for="br-ratio">比例 1 :</label>
          <input class="calc__input" id="br-ratio" data-field="ratio"
                 type="number" inputmode="decimal" min="1" step="0.5" value="${this.ratio}" />
        </div>
      </div>
      <div class="calc__result">
        <span class="calc__value"></span>
      </div>
    `;
    this.updateResult();
  }
}

if (typeof window !== 'undefined' && !customElements.get('extraction-calc')) {
  customElements.define('extraction-calc', ExtractionCalc);
}
if (typeof window !== 'undefined' && !customElements.get('brew-ratio-calc')) {
  customElements.define('brew-ratio-calc', BrewRatioCalc);
}
