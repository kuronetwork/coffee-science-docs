/**
 * ChannelingFlow。
 *
 * 通道效應視覺診斷器。左邊粉餅剖面（從上往下看的水流路徑），
 * 右邊無底把手底面視角（出水點分布）。四種模式切換：
 *   - even      均勻萃取
 *   - edge      邊緣 channeling
 *   - center    中央 channeling
 *   - twin      雙噴 channeling
 *
 * 用法：在 Markdown 直接寫
 *   <channeling-flow></channeling-flow>
 *
 * Hydration：DocLayout 在 client:visible 時 import 這隻檔案。
 */

type Mode = 'even' | 'edge' | 'center' | 'twin';

interface ModeMeta {
  id: Mode;
  label: string;
  diagnostic: string;
}

const MODES: ModeMeta[] = [
  {
    id: 'even',
    label: '均勻萃取',
    diagnostic: '均勻萃取：理想狀態，多點同時出水、流速穩定',
  },
  {
    id: 'edge',
    label: '邊緣 channeling',
    diagnostic: '邊緣 channeling：撥邊不徹底或粉餅與粉碗側壁有縫',
  },
  {
    id: 'center',
    label: '中央 channeling',
    diagnostic: '中央 channeling：WDT 沒撥到中心、中央密度過低',
  },
  {
    id: 'twin',
    label: '雙噴 channeling',
    diagnostic: '雙噴 channeling：tamping 不平、粉餅一邊高一邊低',
  },
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

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  margin-bottom: var(--space-4, 1rem);
}

.tab {
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

.tab:hover {
  border-color: var(--color-accent, #7A3E1D);
  color: var(--color-text, #1A1612);
}

.tab[aria-pressed='true'] {
  background: var(--color-accent, #7A3E1D);
  color: #FAF7F0;
  border-color: var(--color-accent, #7A3E1D);
}

.tab:focus-visible {
  outline: 2px solid var(--color-accent, #7A3E1D);
  outline-offset: 1px;
}

.views {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-4, 1rem);
  align-items: start;
}

.view {
  background: var(--color-bg, #FAF7F0);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-md, 6px);
  padding: var(--space-3, 0.75rem);
}

.view__caption {
  margin: 0 0 var(--space-2, 0.5rem);
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
  text-align: center;
}

svg { width: 100%; height: auto; display: block; overflow: visible; }

.puck {
  fill: var(--color-bg-subtle, #ECE7DA);
  stroke: var(--color-border-strong, #B8AC95);
  stroke-width: 1;
}

.basket {
  fill: none;
  stroke: var(--color-border-strong, #B8AC95);
  stroke-width: 1.5;
}

.flow-good {
  stroke: var(--color-accent, #7A3E1D);
  fill: var(--color-accent, #7A3E1D);
}

.flow-bad {
  stroke: var(--color-callout-warning-bar, #8C5A1C);
  fill: var(--color-callout-warning-bar, #8C5A1C);
}

.stream-good {
  stroke: var(--color-accent, #7A3E1D);
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
}

.stream-bad {
  stroke: var(--color-callout-warning-bar, #8C5A1C);
  stroke-width: 3;
  fill: none;
  stroke-linecap: round;
}

.dot-good { fill: var(--color-accent, #7A3E1D); }
.dot-bad  { fill: var(--color-callout-warning-bar, #8C5A1C); }

@keyframes flow-down {
  0%   { transform: translateY(0); opacity: 0.2; }
  30%  { opacity: 1; }
  100% { transform: translateY(36px); opacity: 0; }
}

.arrow {
  transform-origin: center;
  animation: flow-down 1.6s ease-in infinite;
}

@media (prefers-reduced-motion: reduce) {
  .arrow { animation: none; }
}

.diagnostic {
  margin: var(--space-4, 1rem) 0 0;
  padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
  background: var(--color-bg, #FAF7F0);
  border-left: 3px solid var(--color-accent, #7A3E1D);
  border-radius: var(--radius-md, 6px);
  font-size: var(--font-size-sm, 0.875rem);
  line-height: 1.7;
  color: var(--color-text, #1A1612);
}

.diagnostic[data-tone='bad'] {
  border-left-color: var(--color-callout-warning-bar, #8C5A1C);
}

@media (max-width: 640px) {
  .views {
    grid-template-columns: 1fr;
  }
}
`;

// 箭頭符號（指向下方）
function arrow(x: number, y: number, tone: 'good' | 'bad', delay = 0): string {
  const cls = tone === 'good' ? 'flow-good' : 'flow-bad';
  // path 指向下方：頂端是線、底部是三角形
  return `
    <g class="arrow ${cls}" style="animation-delay:${delay}ms">
      <line x1="${x}" y1="${y}" x2="${x}" y2="${y + 18}" stroke-width="1.5" />
      <polygon points="${x - 3},${y + 14} ${x + 3},${y + 14} ${x},${y + 22}" stroke="none" />
    </g>
  `;
}

// 彎曲的箭頭（給通道效應用）：從 (sx, sy) 經控制點彎到 (ex, ey)
function curvedArrow(sx: number, sy: number, ex: number, ey: number, tone: 'good' | 'bad'): string {
  const cls = tone === 'good' ? 'flow-good' : 'flow-bad';
  const cx = (sx + ex) / 2;
  const cy = sy + 8;
  return `
    <g class="arrow ${cls}">
      <path d="M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}" fill="none" stroke-width="1.5" />
      <polygon points="${ex - 3},${ey - 4} ${ex + 3},${ey - 4} ${ex},${ey + 3}" stroke="none" />
    </g>
  `;
}

function renderTopView(mode: Mode): string {
  // 粉餅剖面：從上往下看，矩形粉餅。中央深色底，箭頭指向下方
  // 容器：viewBox 0 0 200 160
  // 粉餅範圍：x 30~170, y 40~120

  const puck = `
    <rect class="puck" x="30" y="40" width="140" height="80" rx="2" />
    <text x="100" y="30" text-anchor="middle"
          font-family="var(--font-mono, monospace)"
          font-size="9"
          fill="var(--color-text-subtle, #8A7F6E)">水流路徑（俯視）</text>
  `;

  let arrows = '';
  if (mode === 'even') {
    // 6 個均勻向下的箭頭
    const xs = [50, 70, 90, 110, 130, 150];
    arrows = xs.map((x, i) => arrow(x, 60, 'good', i * 100)).join('');
  } else if (mode === 'edge') {
    // 多數箭頭往左邊聚集（彎曲）
    arrows = [
      curvedArrow(70, 55, 45, 110, 'bad'),
      curvedArrow(90, 55, 50, 110, 'bad'),
      curvedArrow(110, 55, 55, 110, 'bad'),
      arrow(140, 60, 'bad', 100),
      arrow(155, 60, 'bad', 200),
    ].join('');
  } else if (mode === 'center') {
    // 箭頭從邊緣向中央聚集
    arrows = [
      curvedArrow(50, 55, 95, 110, 'bad'),
      curvedArrow(70, 55, 98, 110, 'bad'),
      arrow(100, 60, 'bad', 0),
      curvedArrow(130, 55, 102, 110, 'bad'),
      curvedArrow(150, 55, 105, 110, 'bad'),
    ].join('');
  } else {
    // twin：左右兩邊各一束聚集
    arrows = [
      curvedArrow(45, 55, 60, 110, 'bad'),
      curvedArrow(65, 55, 62, 110, 'bad'),
      curvedArrow(135, 55, 138, 110, 'bad'),
      curvedArrow(155, 55, 140, 110, 'bad'),
    ].join('');
  }

  return `
    <svg viewBox="0 0 200 160" role="img" aria-label="粉餅剖面水流圖">
      ${puck}
      ${arrows}
    </svg>
  `;
}

function renderBottomView(mode: Mode): string {
  // 無底把手底部視角：圓形粉碗底部
  // 中央在 (100, 80)，半徑 55
  const cx = 100;
  const cy = 80;
  const r = 55;

  const basket = `
    <circle class="basket" cx="${cx}" cy="${cy}" r="${r}" />
    <text x="${cx}" y="20" text-anchor="middle"
          font-family="var(--font-mono, monospace)"
          font-size="9"
          fill="var(--color-text-subtle, #8A7F6E)">出水點（底面）</text>
  `;

  let streams = '';

  if (mode === 'even') {
    // 6 個均勻分布的出水點，向下匯聚成單股
    const points: Array<[number, number]> = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(angle) * r * 0.55;
      const py = cy + Math.sin(angle) * r * 0.55;
      points.push([px, py]);
    }
    streams = points
      .map(([px, py], i) => `
        <line class="stream-good" x1="${px}" y1="${py}" x2="${cx}" y2="${cy + 60}"
              stroke-width="1" opacity="0.55" />
        <circle class="dot-good" cx="${px}" cy="${py}" r="2.5" style="animation-delay:${i * 80}ms" />
      `)
      .join('');
    // 中央匯聚的單股
    streams += `
      <line class="stream-good" x1="${cx}" y1="${cy + 60}" x2="${cx}" y2="${cy + 78}" />
    `;
  } else if (mode === 'edge') {
    // 一個明亮的出水點在邊緣
    const px = cx - r * 0.85;
    const py = cy - r * 0.2;
    streams = `
      <circle class="dot-bad" cx="${px}" cy="${py}" r="3.5" />
      <path class="stream-bad" d="M ${px} ${py} Q ${px - 4} ${cy + 30} ${px - 6} ${cy + 70}" />
    `;
  } else if (mode === 'center') {
    // 中央單一強烈噴流
    streams = `
      <circle class="dot-bad" cx="${cx}" cy="${cy}" r="4" />
      <line class="stream-bad" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + 78}" />
    `;
  } else {
    // twin：左右各一股
    const lx = cx - r * 0.45;
    const rx = cx + r * 0.45;
    streams = `
      <circle class="dot-bad" cx="${lx}" cy="${cy}" r="3.5" />
      <line class="stream-bad" x1="${lx}" y1="${cy}" x2="${lx - 4}" y2="${cy + 78}" />
      <circle class="dot-bad" cx="${rx}" cy="${cy}" r="3.5" />
      <line class="stream-bad" x1="${rx}" y1="${cy}" x2="${rx + 4}" y2="${cy + 78}" />
    `;
  }

  return `
    <svg viewBox="0 0 200 170" role="img" aria-label="無底把手出水視角">
      ${basket}
      ${streams}
    </svg>
  `;
}

class ChannelingFlow extends HTMLElement {
  private shadow: ShadowRoot;
  private mode: Mode = 'even';

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadow.addEventListener('click', (event) => {
      const target = (event.target as Element | null)?.closest('[data-mode]');
      if (!target) return;
      const next = target.getAttribute('data-mode') as Mode | null;
      if (!next || next === this.mode) return;
      this.mode = next;
      this.update();
    });
  }

  private current(): ModeMeta {
    return MODES.find((m) => m.id === this.mode) ?? MODES[0];
  }

  private update() {
    const top = this.shadow.querySelector('.view--top');
    const bottom = this.shadow.querySelector('.view--bottom');
    const diag = this.shadow.querySelector('.diagnostic') as HTMLElement | null;
    const tabs = this.shadow.querySelectorAll<HTMLButtonElement>('.tab');

    if (top) top.innerHTML = `
      <p class="view__caption">粉餅內部水流</p>
      ${renderTopView(this.mode)}
    `;
    if (bottom) bottom.innerHTML = `
      <p class="view__caption">無底把手底面</p>
      ${renderBottomView(this.mode)}
    `;
    const meta = this.current();
    if (diag) {
      diag.textContent = meta.diagnostic;
      diag.dataset.tone = this.mode === 'even' ? 'good' : 'bad';
    }
    tabs.forEach((tab) => {
      const active = tab.getAttribute('data-mode') === this.mode;
      tab.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  private render() {
    const tabs = MODES.map(
      (m) => `
        <button class="tab" type="button"
                data-mode="${m.id}"
                aria-pressed="${m.id === this.mode}">${m.label}</button>
      `
    ).join('');

    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="title">channeling visualizer</p>
      <div class="tabs" role="group" aria-label="通道效應模式切換">${tabs}</div>
      <div class="views">
        <div class="view view--top">
          <p class="view__caption">粉餅內部水流</p>
          ${renderTopView(this.mode)}
        </div>
        <div class="view view--bottom">
          <p class="view__caption">無底把手底面</p>
          ${renderBottomView(this.mode)}
        </div>
      </div>
      <p class="diagnostic" data-tone="good" aria-live="polite"></p>
    `;
    this.update();
  }
}

if (typeof window !== 'undefined' && !customElements.get('channeling-flow')) {
  customElements.define('channeling-flow', ChannelingFlow);
}
