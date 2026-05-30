/**
 * ExtractionTimeline。
 *
 * Espresso 萃取階段拖曳器。0–35 秒時間軸，三個顏色階段：
 *   - 0–8s   前段（酸質、芳香）
 *   - 8–20s  中段（糖類、甜）
 *   - 20–30s 後段（苦味、單寧）
 *
 * 使用者可以拖曳 playhead，或點 ristretto / normale / lungo 預設按鈕。
 *
 * 用法：在 Markdown 直接寫
 *   <extraction-timeline></extraction-timeline>
 *
 * Hydration：DocLayout 在 client:visible 時 import 這隻檔案。
 */

interface Phase {
  id: 'early' | 'mid' | 'late';
  label: string;
  start: number;
  end: number;
  solutes: string;
  flavor: string;
  cut: string;
}

const PHASES: Phase[] = [
  {
    id: 'early',
    label: '前段',
    start: 0,
    end: 8,
    solutes: '酸質、芳香化合物、油脂',
    flavor: '明亮、果酸、油脂感最重',
    cut: 'ristretto（截斷後段）',
  },
  {
    id: 'mid',
    label: '中段',
    start: 8,
    end: 20,
    solutes: '糖類、梅納反應產物',
    flavor: '甜、平衡、巧克力與焦糖調',
    cut: 'normale（25-30 秒之間是 normale 標準）',
  },
  {
    id: 'late',
    label: '後段',
    start: 20,
    end: 30,
    solutes: '苦味化合物、單寧',
    flavor: '苦、乾澀、收斂感',
    cut: 'lungo（跨進 30 秒就到 lungo 區）',
  },
];

const MIN = 0;
const MAX = 35;

interface Preset {
  id: string;
  label: string;
  seconds: number;
}

const PRESETS: Preset[] = [
  { id: 'ristretto', label: 'Ristretto (12s)', seconds: 12 },
  { id: 'normale', label: 'Normale (27s)', seconds: 27 },
  { id: 'lungo', label: 'Lungo (35s)', seconds: 35 },
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

.timeline {
  position: relative;
  height: 56px;
  margin: var(--space-3, 0.75rem) 0 var(--space-2, 0.5rem);
}

.bar {
  position: absolute;
  inset: 12px 0 12px 0;
  background: var(--color-bg, #FAF7F0);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-md, 6px);
  display: flex;
  overflow: hidden;
}

.phase {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
  border-right: 1px solid var(--color-border, #DDD6C5);
}

.phase:last-child { border-right: none; }

.phase--early {
  background: color-mix(in srgb, var(--color-accent-soft, #C9A88C) 50%, var(--color-bg, #FAF7F0));
}

.phase--mid {
  background: color-mix(in srgb, var(--color-accent, #7A3E1D) 35%, var(--color-bg, #FAF7F0));
  color: var(--color-text, #1A1612);
}

.phase--late {
  background: color-mix(in srgb, var(--color-callout-warning-bar, #8C5A1C) 45%, var(--color-bg, #FAF7F0));
  color: var(--color-text, #1A1612);
}

.range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  margin: 0;
  cursor: pointer;
}

.range:focus-visible {
  outline: 2px solid var(--color-accent, #7A3E1D);
  outline-offset: 2px;
  border-radius: var(--radius-md, 6px);
}

/* 隱藏 native track，我們畫自己的 */
.range::-webkit-slider-runnable-track {
  background: transparent;
  height: 56px;
  border: none;
}
.range::-moz-range-track {
  background: transparent;
  height: 56px;
  border: none;
}

.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 4px;
  height: 56px;
  background: var(--color-text, #1A1612);
  border: none;
  border-radius: 2px;
  cursor: grab;
  box-shadow: 0 0 0 2px var(--color-bg-subtle, #ECE7DA);
}

.range::-webkit-slider-thumb:active { cursor: grabbing; }

.range::-moz-range-thumb {
  width: 4px;
  height: 56px;
  background: var(--color-text, #1A1612);
  border: none;
  border-radius: 2px;
  cursor: grab;
  box-shadow: 0 0 0 2px var(--color-bg-subtle, #ECE7DA);
}

.scale {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-subtle, #8A7F6E);
  padding: 0 2px;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  margin: var(--space-4, 1rem) 0;
}

.preset {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
  background: var(--color-bg, #FAF7F0);
  color: var(--color-text-muted, #5C5246);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-md, 6px);
  cursor: pointer;
  transition: background var(--transition-base, 180ms ease),
              color var(--transition-base, 180ms ease),
              border-color var(--transition-base, 180ms ease);
}

.preset:hover {
  border-color: var(--color-accent, #7A3E1D);
  color: var(--color-text, #1A1612);
}

.preset[aria-pressed='true'] {
  background: var(--color-accent, #7A3E1D);
  color: #FAF7F0;
  border-color: var(--color-accent, #7A3E1D);
}

.preset:focus-visible {
  outline: 2px solid var(--color-accent, #7A3E1D);
  outline-offset: 1px;
}

.panel {
  background: var(--color-bg-elevated, #FFFFFF);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-md, 6px);
  padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
}

.panel__row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: var(--space-3, 0.75rem);
  padding: var(--space-2, 0.5rem) 0;
  border-bottom: 1px solid var(--color-border, #DDD6C5);
}

.panel__row:last-child { border-bottom: none; }

.panel__label {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
  letter-spacing: 0.02em;
}

.panel__value {
  font-size: var(--font-size-sm, 0.875rem);
  line-height: 1.6;
  color: var(--color-text, #1A1612);
}

.panel__value--mono {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-base, 1rem);
  font-weight: 500;
}

@media (max-width: 640px) {
  .phase {
    font-size: 0.65rem;
  }
  .panel__row {
    grid-template-columns: 1fr;
    gap: var(--space-1, 0.25rem);
  }
}
`;

function phaseAt(seconds: number): Phase {
  if (seconds < 8) return PHASES[0];
  if (seconds < 20) return PHASES[1];
  return PHASES[2];
}

class ExtractionTimeline extends HTMLElement {
  private shadow: ShadowRoot;
  private seconds = 27;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    const range = this.shadow.querySelector<HTMLInputElement>('.range');
    range?.addEventListener('input', () => {
      this.seconds = Number.parseInt(range.value, 10);
      this.update();
    });

    this.shadow.addEventListener('click', (event) => {
      const target = (event.target as Element | null)?.closest('[data-preset]');
      if (!target) return;
      const id = target.getAttribute('data-preset');
      const preset = PRESETS.find((p) => p.id === id);
      if (!preset) return;
      this.seconds = preset.seconds;
      const r = this.shadow.querySelector<HTMLInputElement>('.range');
      if (r) r.value = String(preset.seconds);
      this.update();
    });
  }

  private update() {
    const phase = phaseAt(this.seconds);
    const sec = this.shadow.querySelector('.value-seconds');
    const sol = this.shadow.querySelector('.value-solutes');
    const fla = this.shadow.querySelector('.value-flavor');
    const cut = this.shadow.querySelector('.value-cut');
    if (sec) sec.textContent = `第 ${this.seconds} 秒（${phase.label}）`;
    if (sol) sol.textContent = phase.solutes;
    if (fla) fla.textContent = phase.flavor;
    if (cut) cut.textContent = phase.cut;

    const presets = this.shadow.querySelectorAll<HTMLButtonElement>('.preset');
    presets.forEach((btn) => {
      const id = btn.getAttribute('data-preset');
      const p = PRESETS.find((x) => x.id === id);
      const active = !!p && p.seconds === this.seconds;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  private render() {
    // 三段相對寬度（按時間：0-8, 8-20, 20-35）
    const totalRange = MAX - MIN; // 35
    const w1 = ((8 - 0) / totalRange) * 100;
    const w2 = ((20 - 8) / totalRange) * 100;
    const w3 = ((MAX - 20) / totalRange) * 100;

    const presets = PRESETS.map(
      (p) => `
        <button class="preset" type="button"
                data-preset="${p.id}"
                aria-pressed="false">${p.label}</button>
      `
    ).join('');

    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="title">extraction timeline</p>
      <div class="timeline">
        <div class="bar" aria-hidden="true">
          <div class="phase phase--early" style="width:${w1}%">前段 0-8s</div>
          <div class="phase phase--mid"   style="width:${w2}%">中段 8-20s</div>
          <div class="phase phase--late"  style="width:${w3}%">後段 20-35s</div>
        </div>
        <input class="range" type="range"
               min="${MIN}" max="${MAX}" step="1"
               value="${this.seconds}"
               aria-label="萃取秒數" />
      </div>
      <div class="scale">
        <span>${MIN}s</span>
        <span>10s</span>
        <span>20s</span>
        <span>30s</span>
        <span>${MAX}s</span>
      </div>
      <div class="presets" role="group" aria-label="預設停水時機">${presets}</div>
      <div class="panel" aria-live="polite">
        <div class="panel__row">
          <span class="panel__label">目前位置</span>
          <span class="panel__value panel__value--mono value-seconds"></span>
        </div>
        <div class="panel__row">
          <span class="panel__label">主要溶出</span>
          <span class="panel__value value-solutes"></span>
        </div>
        <div class="panel__row">
          <span class="panel__label">風味貢獻</span>
          <span class="panel__value value-flavor"></span>
        </div>
        <div class="panel__row">
          <span class="panel__label">此時若停水</span>
          <span class="panel__value value-cut"></span>
        </div>
      </div>
    `;
    this.update();
  }
}

if (typeof window !== 'undefined' && !customElements.get('extraction-timeline')) {
  customElements.define('extraction-timeline', ExtractionTimeline);
}
