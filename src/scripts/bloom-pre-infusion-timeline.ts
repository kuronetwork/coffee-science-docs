/**
 * BloomPreInfusionTimeline。
 *
 * 跨沖煮法的 bloom / pre-infusion 時序比較。
 *   - 上方 5 個 tab 切換沖煮法
 *   - 中間 SVG 時間軸顯示各階段、標記關鍵時刻
 *   - 下方 3-4 行該方法的悶蒸／預浸邏輯說明
 *
 * 用法：在 Markdown 直接寫
 *   <bloom-pre-infusion-timeline></bloom-pre-infusion-timeline>
 */

type PhaseKind = 'setup' | 'wait' | 'extract';

interface Phase {
  /** 開始秒數 */
  start: number;
  /** 結束秒數 */
  end: number;
  /** 階段名稱 */
  label: string;
  kind: PhaseKind;
}

interface Marker {
  /** 秒數位置 */
  at: number;
  label: string;
}

interface MethodSpec {
  id: string;
  name: string;
  /** 總秒數 */
  total: number;
  phases: Phase[];
  markers: Marker[];
  notes: string[];
}

const METHODS: MethodSpec[] = [
  {
    id: 'v60',
    name: 'V60',
    total: 180,
    phases: [
      { start: 0,   end: 30,  label: 'bloom 注水 30g', kind: 'setup' },
      { start: 30,  end: 90,  label: '主萃取注水',     kind: 'extract' },
      { start: 90,  end: 180, label: '流出',          kind: 'wait' },
    ],
    markers: [
      { at: 0,   label: '首次注水' },
      { at: 30,  label: 'bloom 結束' },
      { at: 90,  label: '注水結束' },
    ],
    notes: [
      'bloom 用 1:2（粉:水）比例的水量',
      '看到粉床膨脹、停止冒泡才進主注水',
      'bloom 不夠粉沒潤濕、bloom 太久粉床塌陷',
    ],
  },
  {
    id: 'aeropress',
    name: 'AeroPress',
    total: 120,
    phases: [
      { start: 0,  end: 10,  label: '注水',  kind: 'setup' },
      { start: 10, end: 90,  label: '浸泡',  kind: 'wait' },
      { start: 90, end: 120, label: '壓出',  kind: 'extract' },
    ],
    markers: [
      { at: 0,   label: '注水開始' },
      { at: 10,  label: '浸泡開始' },
      { at: 90,  label: '開始下壓' },
    ],
    notes: [
      '正置法為主，沒有獨立 bloom 階段',
      '短時間浸泡 + 微壓力過濾的混合機制',
      '攪拌可以取代 bloom 的潤濕功能',
    ],
  },
  {
    id: 'espresso',
    name: 'Espresso',
    total: 30,
    phases: [
      { start: 0, end: 8,  label: 'pre-infusion (2-4 bar)', kind: 'setup' },
      { start: 8, end: 30, label: '9 bar 主萃取',           kind: 'extract' },
    ],
    markers: [
      { at: 0,  label: '注水開始' },
      { at: 8,  label: '9 bar 開始' },
      { at: 30, label: '停止萃取' },
    ],
    notes: [
      'pre-infusion 5-10 秒，避免高壓直接擊穿粉餅',
      'E61 沖煮頭有自然機械預浸',
      '沒 PID 的機器 ramp-up 也有 1-3 秒緩衝',
    ],
  },
  {
    id: 'french-press',
    name: 'French Press',
    total: 240,
    phases: [
      { start: 0,  end: 30,  label: '注水 + 攪拌', kind: 'setup' },
      { start: 30, end: 240, label: '浸泡',       kind: 'wait' },
    ],
    markers: [
      { at: 0,   label: '注水開始' },
      { at: 30,  label: '攪拌結束' },
      { at: 240, label: '下壓濾網' },
    ],
    notes: [
      '沒有 bloom 概念，水粉一次接觸',
      '4 分鐘是 SCA 杯測標準時間',
      '結束後緩慢下壓濾網，避免擾動細粉',
    ],
  },
  {
    id: 'moka',
    name: 'Moka Pot',
    total: 240,
    phases: [
      { start: 0,   end: 120, label: '加熱',   kind: 'setup' },
      { start: 120, end: 210, label: '萃取',   kind: 'extract' },
      { start: 210, end: 240, label: '後段',   kind: 'wait' },
    ],
    markers: [
      { at: 0,   label: '開火' },
      { at: 120, label: '蒸汽推水' },
      { at: 210, label: '聲音變大' },
      { at: 240, label: '離火' },
    ],
    notes: [
      '沒有獨立 bloom，蒸氣壓推水的瞬間就是萃取',
      '聽到「嘶嘶」聲變大就要離火，避免後段苦味',
      '離火後可拿濕毛巾包下壺降溫，截斷萃取',
    ],
  },
];

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

const VB_W = 600;
const VB_H = 130;
const PAD_LEFT = 16;
const PAD_RIGHT = 16;
const TIMELINE_TOP = 56;
const TIMELINE_HEIGHT = 36;
const MARKER_TOP = 36;
const MARKER_BOTTOM = TIMELINE_TOP + TIMELINE_HEIGHT + 4;
const TIME_AXIS_Y = TIMELINE_TOP + TIMELINE_HEIGHT + 22;

const STYLE = `
:host {
  display: block;
  margin: var(--space-6, 1.5rem) 0;
  padding: var(--space-4, 1rem) var(--space-6, 1.5rem) var(--space-6, 1.5rem);
  background: var(--color-bg-subtle, #ECE7DA);
  border-radius: var(--radius-md, 6px);
  font-family: var(--font-sans, sans-serif);
}

.bpi__title {
  margin: 0 0 var(--space-3, 0.75rem);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 500;
  font-family: var(--font-mono, monospace);
  text-transform: lowercase;
  letter-spacing: 0.04em;
  color: var(--color-text, #1A1612);
}

.bpi__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  margin-bottom: var(--space-4, 1rem);
}

.bpi__tab {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
  background: var(--color-bg, #FAF7F0);
  color: var(--color-text-muted, #5C5246);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-md, 6px);
  cursor: pointer;
  transition: background var(--transition-fast, 120ms ease),
              color var(--transition-fast, 120ms ease),
              border-color var(--transition-fast, 120ms ease);
}

.bpi__tab:hover {
  color: var(--color-accent, #7A3E1D);
  border-color: var(--color-border-strong, #B8AC95);
}

.bpi__tab[aria-selected='true'] {
  background: var(--color-accent, #7A3E1D);
  color: var(--color-bg, #FAF7F0);
  border-color: var(--color-accent, #7A3E1D);
}

.bpi__tab:focus-visible {
  outline: 2px solid var(--color-accent, #7A3E1D);
  outline-offset: 2px;
}

.bpi__chart {
  width: 100%;
  height: auto;
  background: var(--color-bg, #FAF7F0);
  border-radius: var(--radius-md, 6px);
  display: block;
}

.bpi__phase--setup   { fill: var(--color-bg-subtle, #ECE7DA); }
.bpi__phase--wait    { fill: var(--color-accent-soft, #C9A88C); fill-opacity: 0.55; }
.bpi__phase--extract { fill: var(--color-accent-soft, #C9A88C); }

.bpi__phase-stroke {
  stroke: var(--color-border, #DDD6C5);
  stroke-width: 1;
}

.bpi__phase-label {
  font-family: var(--font-sans, sans-serif);
  font-size: 11px;
  fill: var(--color-text, #1A1612);
  text-anchor: middle;
  pointer-events: none;
}

.bpi__marker-line {
  stroke: var(--color-text-muted, #5C5246);
  stroke-width: 1.2;
}

.bpi__marker-label {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  fill: var(--color-text-muted, #5C5246);
  text-anchor: middle;
  pointer-events: none;
}

.bpi__time-tick {
  stroke: var(--color-border-strong, #B8AC95);
  stroke-width: 1;
}

.bpi__time-label {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  fill: var(--color-text-subtle, #8A7F6E);
  text-anchor: middle;
}

.bpi__total {
  margin: var(--space-3, 0.75rem) 0 var(--space-2, 0.5rem);
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
}

.bpi__notes {
  margin: 0;
  padding: 0 0 0 var(--space-4, 1rem);
  list-style: disc;
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.5rem);
}

.bpi__notes li {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text, #1A1612);
}

@media (max-width: 640px) {
  :host {
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem) var(--space-4, 1rem);
  }
  .bpi__tab {
    flex: 1 1 calc(50% - var(--space-2, 0.5rem));
    text-align: center;
  }
}
`;

class BloomPreInfusionTimeline extends HTMLElement {
  private shadow: ShadowRoot;
  private activeId: string = METHODS[0].id;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadow.addEventListener('click', (event) => {
      const t = event.target as HTMLElement;
      const tab = t.closest<HTMLButtonElement>('.bpi__tab');
      if (!tab) return;
      const id = tab.dataset.method;
      if (!id || id === this.activeId) return;
      this.activeId = id;
      this.update();
    });
  }

  private getActive(): MethodSpec {
    return METHODS.find((m) => m.id === this.activeId) ?? METHODS[0];
  }

  private secondsToX(secs: number, total: number): number {
    const w = VB_W - PAD_LEFT - PAD_RIGHT;
    return PAD_LEFT + (secs / total) * w;
  }

  private renderTimeAxis(total: number): string {
    // tick interval：總時間 ≤ 60s 用 10s，≤ 180s 用 30s，其他用 60s
    let step = 60;
    if (total <= 60) step = 10;
    else if (total <= 180) step = 30;

    const ticks: string[] = [];
    for (let s = 0; s <= total; s += step) {
      const x = this.secondsToX(s, total);
      ticks.push(
        `<line class="bpi__time-tick" x1="${x}" y1="${MARKER_BOTTOM + 24}" x2="${x}" y2="${MARKER_BOTTOM + 28}"/>`,
      );
      ticks.push(
        `<text class="bpi__time-label" x="${x}" y="${TIME_AXIS_Y + 16}">${fmtTime(s)}</text>`,
      );
    }
    // 確保最後一個刻度有出現
    if (total % step !== 0) {
      const x = this.secondsToX(total, total);
      ticks.push(
        `<line class="bpi__time-tick" x1="${x}" y1="${MARKER_BOTTOM + 24}" x2="${x}" y2="${MARKER_BOTTOM + 28}"/>`,
      );
      ticks.push(
        `<text class="bpi__time-label" x="${x}" y="${TIME_AXIS_Y + 16}">${fmtTime(total)}</text>`,
      );
    }
    return ticks.join('');
  }

  private renderChart(method: MethodSpec): string {
    const { total, phases, markers } = method;

    const phaseRects = phases.map((p) => {
      const x = this.secondsToX(p.start, total);
      const w = this.secondsToX(p.end, total) - x;
      const cx = x + w / 2;
      const labelY = TIMELINE_TOP + TIMELINE_HEIGHT / 2 + 4;
      // 階段太窄就不顯示文字
      const showLabel = w >= 80;
      const text = showLabel
        ? `<text class="bpi__phase-label" x="${cx}" y="${labelY}">${p.label}</text>`
        : '';
      return `
        <rect class="bpi__phase--${p.kind} bpi__phase-stroke"
              x="${x}" y="${TIMELINE_TOP}" width="${w}" height="${TIMELINE_HEIGHT}"/>
        ${text}
      `;
    }).join('');

    const markerEls = markers.map((m, i) => {
      const x = this.secondsToX(m.at, total);
      // 多個 marker 標籤交替上下放置避免重疊
      const yLabel = i % 2 === 0 ? MARKER_TOP - 4 : MARKER_TOP - 18;
      // 邊緣對齊文字錨點
      let anchor = 'middle';
      if (m.at === 0) anchor = 'start';
      else if (m.at === total) anchor = 'end';
      return `
        <line class="bpi__marker-line"
              x1="${x}" y1="${MARKER_TOP}" x2="${x}" y2="${MARKER_BOTTOM + 14}"/>
        <text class="bpi__marker-label" x="${x}" y="${yLabel}" text-anchor="${anchor}">${m.label}</text>
      `;
    }).join('');

    return `
      <svg class="bpi__chart" viewBox="0 0 ${VB_W} ${VB_H}" role="img"
           aria-label="${method.name} 沖煮時序">
        ${phaseRects}
        ${markerEls}
        ${this.renderTimeAxis(total)}
      </svg>
    `;
  }

  private update() {
    const method = this.getActive();
    // 更新 tab 狀態
    const tabs = this.shadow.querySelectorAll<HTMLButtonElement>('.bpi__tab');
    tabs.forEach((t) => {
      const selected = t.dataset.method === this.activeId;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.tabIndex = selected ? 0 : -1;
    });

    const chartHost = this.shadow.querySelector('.bpi__chart-host');
    if (chartHost) chartHost.innerHTML = this.renderChart(method);

    const totalEl = this.shadow.querySelector('.bpi__total');
    if (totalEl) totalEl.textContent = `總時間 ${fmtTime(method.total)}`;

    const notesEl = this.shadow.querySelector('.bpi__notes');
    if (notesEl) {
      notesEl.innerHTML = method.notes.map((n) => `<li>${n}</li>`).join('');
    }
  }

  private render() {
    const tabs = METHODS.map((m) => {
      const selected = m.id === this.activeId;
      return `
        <button class="bpi__tab" type="button"
                role="tab" data-method="${m.id}"
                aria-selected="${selected ? 'true' : 'false'}"
                tabindex="${selected ? 0 : -1}">${m.name}</button>
      `;
    }).join('');

    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="bpi__title">bloom / pre-infusion timeline</p>
      <div class="bpi__tabs" role="tablist" aria-label="沖煮法切換">
        ${tabs}
      </div>
      <div class="bpi__chart-host"></div>
      <p class="bpi__total"></p>
      <ul class="bpi__notes"></ul>
    `;
    this.update();
  }
}

if (typeof window !== 'undefined' && !customElements.get('bloom-pre-infusion-timeline')) {
  customElements.define('bloom-pre-infusion-timeline', BloomPreInfusionTimeline);
}
