/**
 * FlavorWheel。
 *
 * 兩層同心環互動風味盤：
 *   - 內環：9 個大類（簡化版 SCA 風味輪頂層分類）
 *   - 外環：每個大類底下 2-4 個 Lexicon 風的具體描述詞
 *   - 點擊任一段（內或外）右側顯示中英對照與一段 Lexicon 風描述
 *
 * 注意：這不是 SCA Flavor Wheel 的完整重製版。SCA 風味輪有上百個
 * 描述詞與授權限制，這裡取頂層 9 大類加部分常見子項做教學用途。
 *
 * 用法：在 Markdown 直接寫
 *   <flavor-wheel></flavor-wheel>
 */

interface Leaf {
  cn: string;
  en: string;
  desc: string;
}

interface Category {
  id: string;
  cn: string;
  en: string;
  /** 頂層描述（點擊內環時顯示） */
  desc: string;
  /** 用 0-8 的索引選色：對應 9 大類各自的色階 */
  tone: number;
  children: Leaf[];
}

const CATEGORIES: Category[] = [
  {
    id: 'floral',
    cn: '花香',
    en: 'Floral',
    tone: 0,
    desc: '輕盈、芳香，像走過花圃時鼻腔聞到的氣息。常出現在淺烘、衣索比亞與巴拿馬 Geisha。',
    children: [
      { cn: '白花', en: 'White flowers', desc: '茉莉、橙花、忍冬一類的清雅花香，帶輕微甜感。' },
      { cn: '玫瑰', en: 'Rose', desc: '較濃郁的玫瑰花瓣與紅茶調，帶一點蜜感。' },
      { cn: '茶香', en: 'Tea-like', desc: '紅茶、烏龍、洋甘菊的氣味，乾淨而柔和。' },
    ],
  },
  {
    id: 'fruity',
    cn: '果香',
    en: 'Fruity',
    tone: 1,
    desc: '從清亮到濃郁的水果氣息，常見於日曬處理與淺中焙的非洲、中美洲豆。',
    children: [
      { cn: '莓果', en: 'Berry', desc: '草莓、藍莓、黑莓的酸甜氣息。常見於日曬衣索比亞與肯亞。' },
      { cn: '柑橘', en: 'Citrus', desc: '檸檬、葡萄柚、橘子的明亮酸感與皮油氣息。' },
      { cn: '核果', en: 'Stone fruit', desc: '桃子、杏桃、李子的圓潤甜酸，常見於水洗中美洲。' },
      { cn: '熱帶水果', en: 'Tropical', desc: '芒果、鳳梨、百香果的多汁感。多出現在處理特殊或厭氧豆。' },
    ],
  },
  {
    id: 'sour',
    cn: '酸/發酵',
    en: 'Sour / Fermented',
    tone: 2,
    desc: '從清爽果酸到熟成發酵風味。少量是處理法特色，過量就成為缺陷。',
    children: [
      { cn: '果酸', en: 'Fruit acid', desc: '蘋果酸、檸檬酸的乾淨刺激感，溫度下降後特別明顯。' },
      { cn: '酒香', en: 'Winey', desc: '紅酒、白酒的發酵果香。常出現在厭氧或酒桶處理。' },
      { cn: '醋酸', en: 'Acetic', desc: '醋的尖銳氣味。少量增添複雜度，過量是過度發酵的訊號。' },
    ],
  },
  {
    id: 'sweet',
    cn: '甜',
    en: 'Sweet',
    tone: 3,
    desc: '糖類焦糖化與蜂蜜般的甜感，是中焙以下烘焙的標誌。',
    children: [
      { cn: '焦糖', en: 'Caramel', desc: '加熱糖漿至琥珀色時的焦糖香，帶微苦底。' },
      { cn: '紅糖', en: 'Brown sugar', desc: '紅糖、黑糖的醇厚甜感，帶輕微糖蜜香。' },
      { cn: '香草', en: 'Vanilla', desc: '香草莢、奶油、烘焙糕點的圓潤香甜。' },
    ],
  },
  {
    id: 'cocoa',
    cn: '巧克力 / 堅果',
    en: 'Cocoa / Nutty',
    tone: 4,
    desc: '可可與堅果的乾燥香氣。中焙商業豆與巴西、瓜地馬拉常見。',
    children: [
      { cn: '黑巧克力', en: 'Dark chocolate', desc: '70% 以上苦甜巧克力，帶輕微焙烤感。' },
      { cn: '可可粉', en: 'Cocoa', desc: '無糖可可粉的乾燥氣息，比黑巧克力更乾、更粉感。' },
      { cn: '杏仁/榛果', en: 'Almond / Hazelnut', desc: '烘烤過的杏仁、榛果香，乾爽帶油脂感。' },
    ],
  },
  {
    id: 'roasted',
    cn: '烘焙',
    en: 'Roasted',
    tone: 5,
    desc: '梅納反應與焦糖化後段的烘烤調性。中深焙以後逐漸主導。',
    children: [
      { cn: '烤麵包', en: 'Toast / Cereal', desc: '烤吐司、烘焙穀物的麥香與烘烤甜。' },
      { cn: '煙燻', en: 'Smoky', desc: '煙、灰、焦的氣味。深焙才會清楚出現。' },
      { cn: '烤堅果', en: 'Roasted nuts', desc: '深烘的堅果香，比中焙的堅果更焦、更乾。' },
    ],
  },
  {
    id: 'spices',
    cn: '香料',
    en: 'Spices',
    tone: 6,
    desc: '溫暖的乾燥香料調，常見於印尼、葉門與部分中深焙豆。',
    children: [
      { cn: '肉桂', en: 'Cinnamon', desc: '肉桂棒的甜暖香氣。' },
      { cn: '丁香', en: 'Clove', desc: '丁香的尖銳辛香，帶微微麻舌感。' },
      { cn: '胡椒', en: 'Pepper', desc: '黑胡椒、白胡椒的乾辛味。' },
    ],
  },
  {
    id: 'earthy',
    cn: '土壤 / 木質',
    en: 'Earthy / Woody',
    tone: 7,
    desc: '木質與土壤調。少量是陳年豆與部分產區的個性，過量是缺陷。',
    children: [
      { cn: '木質', en: 'Woody', desc: '雪松、檀香、舊木箱的乾燥氣息。' },
      { cn: '土味', en: 'Earthy', desc: '濕泥土、菇蕈的氣息。少量複雜，過量是過度發酵或保存不良。' },
      { cn: '草本', en: 'Vegetative', desc: '青草、青椒、生豆感。常見於萃取或烘焙不足。' },
    ],
  },
  {
    id: 'defects',
    cn: '瑕疵',
    en: 'Defects',
    tone: 8,
    desc: '不該出現的氣味。發現這些通常是處理、儲存或烘焙環節出問題。',
    children: [
      { cn: '化學', en: 'Chemical', desc: '氯、橡膠、消毒水的尖銳氣味。多源自水質或設備殘留。' },
      { cn: '紙味', en: 'Papery / Stale', desc: '紙箱、舊雜誌的乾澀氣息。多為氧化或受潮的訊號。' },
      { cn: '酸臭', en: 'Sour / Rotten', desc: '酸臭、餿味、爛水果。處理過程感染或發酵失控。' },
    ],
  },
];

// === SVG 幾何 ===
const CX = 200;
const CY = 200;
const R_INNER = 56;   // 中心圓
const R_MID = 120;    // 內環外緣 / 外環內緣
const R_OUTER = 178;  // 外環外緣
const VB = 400;

const CAT_COUNT = CATEGORIES.length; // 9
const CAT_DEG = 360 / CAT_COUNT;     // 40

/** 12 點為 0、順時針為正 → SVG 座標 */
function polar(deg: number, r: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function wedgePath(startDeg: number, endDeg: number, rIn: number, rOut: number): string {
  const a = polar(startDeg, rOut);
  const b = polar(endDeg, rOut);
  const c = polar(endDeg, rIn);
  const d = polar(startDeg, rIn);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${a.x.toFixed(2)} ${a.y.toFixed(2)}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`,
    `L ${c.x.toFixed(2)} ${c.y.toFixed(2)}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${d.x.toFixed(2)} ${d.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

/** 環上的曲線文字錨點 */
function wedgeCenter(startDeg: number, endDeg: number, r: number): { x: number; y: number; rotate: number } {
  const mid = (startDeg + endDeg) / 2;
  const p = polar(mid, r);
  // 把文字旋轉成「徑向」角度，從圓心向外指
  let rotate = mid;
  // 左半邊翻轉避免倒立
  if (mid > 180) rotate = mid - 180;
  return { x: p.x, y: p.y, rotate: rotate - 90 };
}

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
  color: var(--color-text, #1A1612);
}

.wrap {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: var(--space-6, 1.5rem);
  align-items: start;
}

.svg-wrap {
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
}

svg { width: 100%; height: auto; display: block; }

.seg {
  cursor: pointer;
  outline: none;
  transition: opacity var(--transition-base, 180ms ease);
}

.seg__shape {
  stroke: var(--color-bg-subtle, #ECE7DA);
  stroke-width: 1;
  transition: stroke var(--transition-base, 180ms ease),
              opacity var(--transition-base, 180ms ease);
}

/* 9 個色調：用 accent 與 accent-soft 的不同濃度。
   視為一個調色盤，深色到淺色都對應 accent 系列，
   不引入新色相。深淺差異夠用來分辨九類，不致干擾整體調色。*/
.seg--t0 .seg__shape { fill: color-mix(in srgb, var(--color-accent, #7A3E1D) 95%, transparent); }
.seg--t1 .seg__shape { fill: color-mix(in srgb, var(--color-accent, #7A3E1D) 80%, transparent); }
.seg--t2 .seg__shape { fill: color-mix(in srgb, var(--color-accent, #7A3E1D) 65%, transparent); }
.seg--t3 .seg__shape { fill: color-mix(in srgb, var(--color-accent, #7A3E1D) 52%, transparent); }
.seg--t4 .seg__shape { fill: color-mix(in srgb, var(--color-accent, #7A3E1D) 40%, transparent); }
.seg--t5 .seg__shape { fill: color-mix(in srgb, var(--color-accent-soft, #C9A88C) 90%, transparent); }
.seg--t6 .seg__shape { fill: color-mix(in srgb, var(--color-accent-soft, #C9A88C) 70%, transparent); }
.seg--t7 .seg__shape { fill: color-mix(in srgb, var(--color-accent-soft, #C9A88C) 50%, transparent); }
.seg--t8 .seg__shape { fill: color-mix(in srgb, var(--color-accent-soft, #C9A88C) 30%, transparent); }

.seg--leaf .seg__shape {
  /* 外環稍微更淡，避免兩環視覺競爭 */
  opacity: 0.85;
}

.seg:not(.is-active) .seg__shape {
  opacity: 0.55;
}
.seg.is-active .seg__shape,
.seg:hover .seg__shape,
.seg:focus-visible .seg__shape {
  opacity: 1;
  stroke: var(--color-bg-elevated, #FFFFFF);
  stroke-width: 1.5;
}

.seg__label {
  font-family: var(--font-sans, sans-serif);
  font-size: 11px;
  fill: var(--color-text, #1A1612);
  pointer-events: none;
  text-anchor: middle;
  dominant-baseline: middle;
  paint-order: stroke;
  stroke: rgba(255,255,255,0.5);
  stroke-width: 0.6;
}

.seg__label--leaf {
  font-size: 9.5px;
  fill: var(--color-text-muted, #5C5246);
}

.center__hint {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  fill: var(--color-text-muted, #5C5246);
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
}

.center__name {
  font-family: var(--font-serif, serif);
  font-size: 13px;
  font-weight: 500;
  fill: var(--color-text, #1A1612);
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
}

.panel__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 0.25rem);
  padding-bottom: var(--space-3, 0.75rem);
  border-bottom: 1px solid var(--color-border, #DDD6C5);
}

.panel__breadcrumb {
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-subtle, #8A7F6E);
  letter-spacing: 0.02em;
}

.panel__title {
  margin: 0;
  font-family: var(--font-serif, serif);
  font-size: var(--font-size-xl, 1.375rem);
  font-weight: 500;
  color: var(--color-text, #1A1612);
}

.panel__english {
  margin: 0;
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #5C5246);
  letter-spacing: 0.02em;
}

.panel__desc {
  margin: 0;
  font-size: var(--font-size-sm, 0.875rem);
  line-height: 1.7;
  color: var(--color-text, #1A1612);
}

.panel__placeholder {
  margin: 0;
  font-size: var(--font-size-sm, 0.875rem);
  line-height: 1.7;
  color: var(--color-text-muted, #5C5246);
}

@media (max-width: 640px) {
  .wrap {
    grid-template-columns: 1fr;
    gap: var(--space-4, 1rem);
  }
  .svg-wrap { max-width: 320px; }
}
`;

type Selection =
  | { kind: 'cat'; catIdx: number }
  | { kind: 'leaf'; catIdx: number; leafIdx: number }
  | null;

class FlavorWheel extends HTMLElement {
  private shadow: ShadowRoot;
  private selection: Selection = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadow.addEventListener('click', (e) => this.handleSelect(e));
    this.shadow.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleSelect(e);
      }
    });
  }

  private handleSelect(event: Event) {
    const el = (event.target as Element | null)?.closest('[data-sel]');
    if (!el) return;
    const sel = el.getAttribute('data-sel') ?? '';
    const parts = sel.split(':');
    if (parts[0] === 'cat') {
      const i = Number.parseInt(parts[1], 10);
      if (!Number.isNaN(i)) this.selection = { kind: 'cat', catIdx: i };
    } else if (parts[0] === 'leaf') {
      const ci = Number.parseInt(parts[1], 10);
      const li = Number.parseInt(parts[2], 10);
      if (!Number.isNaN(ci) && !Number.isNaN(li)) {
        this.selection = { kind: 'leaf', catIdx: ci, leafIdx: li };
      }
    }
    this.update();
  }

  private isActive(catIdx: number, leafIdx?: number): boolean {
    if (!this.selection) return false;
    if (this.selection.kind === 'cat') {
      return this.selection.catIdx === catIdx && leafIdx === undefined;
    }
    if (this.selection.kind === 'leaf') {
      if (leafIdx === undefined) return false;
      return this.selection.catIdx === catIdx && this.selection.leafIdx === leafIdx;
    }
    return false;
  }

  private renderSvg(): string {
    const inner: string[] = [];
    const outer: string[] = [];

    CATEGORIES.forEach((cat, ci) => {
      const startDeg = ci * CAT_DEG;
      const endDeg = startDeg + CAT_DEG;

      // 內環：類別
      const innerPath = wedgePath(startDeg, endDeg, R_INNER, R_MID);
      const innerLabel = wedgeCenter(startDeg, endDeg, (R_INNER + R_MID) / 2);
      const innerActive = this.isActive(ci);
      inner.push(`
        <g class="seg seg--t${cat.tone} ${innerActive ? 'is-active' : ''}"
           data-sel="cat:${ci}" role="button" tabindex="0"
           aria-label="${cat.cn} ${cat.en}">
          <path class="seg__shape" d="${innerPath}" />
          <text class="seg__label" x="${innerLabel.x.toFixed(2)}" y="${innerLabel.y.toFixed(2)}"
                transform="rotate(${innerLabel.rotate.toFixed(2)} ${innerLabel.x.toFixed(2)} ${innerLabel.y.toFixed(2)})">${cat.cn}</text>
        </g>
      `);

      // 外環：每個 leaf
      const leafCount = cat.children.length;
      const leafDeg = CAT_DEG / leafCount;
      cat.children.forEach((leaf, li) => {
        const ls = startDeg + li * leafDeg;
        const le = ls + leafDeg;
        const path = wedgePath(ls, le, R_MID, R_OUTER);
        const lc = wedgeCenter(ls, le, (R_MID + R_OUTER) / 2);
        const active = this.isActive(ci, li);
        outer.push(`
          <g class="seg seg--leaf seg--t${cat.tone} ${active ? 'is-active' : ''}"
             data-sel="leaf:${ci}:${li}" role="button" tabindex="0"
             aria-label="${leaf.cn} ${leaf.en}">
            <path class="seg__shape" d="${path}" />
            <text class="seg__label seg__label--leaf"
                  x="${lc.x.toFixed(2)}" y="${lc.y.toFixed(2)}"
                  transform="rotate(${lc.rotate.toFixed(2)} ${lc.x.toFixed(2)} ${lc.y.toFixed(2)})">${leaf.cn}</text>
          </g>
        `);
      });
    });

    return `
      <svg viewBox="0 0 ${VB} ${VB}" role="img" aria-label="簡化版 SCA 風味盤">
        ${inner.join('')}
        ${outer.join('')}
        ${this.renderCenter()}
      </svg>
    `;
  }

  private renderCenter(): string {
    if (!this.selection) {
      return `
        <text class="center__hint" x="${CX}" y="${CY - 6}">點擊任一段</text>
        <text class="center__hint" x="${CX}" y="${CY + 8}">查看 Lexicon 描述</text>
      `;
    }
    if (this.selection.kind === 'cat') {
      const cat = CATEGORIES[this.selection.catIdx];
      return `
        <text class="center__name" x="${CX}" y="${CY - 6}">${cat.cn}</text>
        <text class="center__hint" x="${CX}" y="${CY + 12}">${cat.en}</text>
      `;
    }
    const cat = CATEGORIES[this.selection.catIdx];
    const leaf = cat.children[this.selection.leafIdx];
    return `
      <text class="center__name" x="${CX}" y="${CY - 6}">${leaf.cn}</text>
      <text class="center__hint" x="${CX}" y="${CY + 12}">${leaf.en}</text>
    `;
  }

  private renderPanel(): string {
    if (!this.selection) {
      return `
        <div class="panel" aria-live="polite">
          <p class="panel__placeholder">先從內環選一個大類，再從外環挑具體描述。沒概念時停在大類就好，硬挑外圈反而失準。</p>
        </div>
      `;
    }
    if (this.selection.kind === 'cat') {
      const cat = CATEGORIES[this.selection.catIdx];
      return `
        <div class="panel" aria-live="polite">
          <div class="panel__header">
            <span class="panel__breadcrumb">大類 · category</span>
            <h3 class="panel__title">${cat.cn}</h3>
            <p class="panel__english">${cat.en}</p>
          </div>
          <p class="panel__desc">${cat.desc}</p>
        </div>
      `;
    }
    const cat = CATEGORIES[this.selection.catIdx];
    const leaf = cat.children[this.selection.leafIdx];
    return `
      <div class="panel" aria-live="polite">
        <div class="panel__header">
          <span class="panel__breadcrumb">${cat.cn} / ${cat.en}</span>
          <h3 class="panel__title">${leaf.cn}</h3>
          <p class="panel__english">${leaf.en}</p>
        </div>
        <p class="panel__desc">${leaf.desc}</p>
      </div>
    `;
  }

  private update() {
    const svgWrap = this.shadow.querySelector('.svg-wrap');
    const panel = this.shadow.querySelector('.panel-wrap');
    if (svgWrap) svgWrap.innerHTML = this.renderSvg();
    if (panel) panel.innerHTML = this.renderPanel();
  }

  private render() {
    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="title">simplified flavor wheel</p>
      <div class="wrap">
        <div class="svg-wrap">${this.renderSvg()}</div>
        <div class="panel-wrap">${this.renderPanel()}</div>
      </div>
    `;
  }
}

if (typeof window !== 'undefined' && !customElements.get('flavor-wheel')) {
  customElements.define('flavor-wheel', FlavorWheel);
}
