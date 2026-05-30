/**
 * BrewMethodCompare。
 *
 * 沖煮法比較表，horizontal scrolling。
 * 用法：在 Markdown 直接寫 <brew-method-compare></brew-method-compare>
 *
 * 資料 hardcode 在元件內，不從外部 JSON 讀取。
 */

interface MethodRow {
  name: string;
  grind: string;
  temp: string;
  ratio: string;
  time: string;
  notes: string;
}

const METHODS: MethodRow[] = [
  { name: 'Espresso',  grind: '細',     temp: '93°C',     ratio: '1:2',    time: '25–30 秒', notes: '濃縮、高甜感、crema' },
  { name: 'V60',       grind: '中細',   temp: '92°C',     ratio: '1:15',   time: '2:30–3:00', notes: '乾淨、明亮酸感' },
  { name: 'AeroPress', grind: '中細偏細', temp: '88–92°C', ratio: '1:12',   time: '1:30–2:00', notes: '低酸、圓潤、可調性高' },
  { name: '摩卡壺',    grind: '中細偏細', temp: '預熱水',  ratio: '填滿粉槽', time: '3–5 分鐘',  notes: '濃郁、略苦、無 crema' },
  { name: '法壓壺',    grind: '粗',     temp: '93°C',    ratio: '1:15',    time: '浸泡 4 分鐘', notes: '厚重、油脂感、有細粉' },
];

const HEADERS = ['方法', '研磨度', '水溫', '粉水比', '沖煮時間', '風味特性'];

const STYLE = `
:host {
  display: block;
  margin: var(--space-6, 1.5rem) 0;
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 0.875rem);
}

.scroll {
  overflow-x: auto;
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-md, 6px);
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
}

th, td {
  padding: var(--space-3, 0.75rem);
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--color-border, #DDD6C5);
  white-space: nowrap;
}

tbody tr:last-child td {
  border-bottom: 0;
}

th {
  font-weight: 500;
  background: var(--color-bg-subtle, #ECE7DA);
  color: var(--color-text, #1A1612);
}

th:first-child,
td:first-child {
  position: sticky;
  left: 0;
  background: var(--color-bg-elevated, #FFFFFF);
  z-index: 1;
  font-weight: 500;
  border-right: 1px solid var(--color-border, #DDD6C5);
}

th:first-child {
  background: var(--color-bg-subtle, #ECE7DA);
}

td {
  background: var(--color-bg-elevated, #FFFFFF);
}

td:last-child,
th:last-child {
  white-space: normal;
}
`;

class BrewMethodCompare extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const rows = METHODS.map(
      (m) => `
        <tr>
          <td>${m.name}</td>
          <td>${m.grind}</td>
          <td>${m.temp}</td>
          <td>${m.ratio}</td>
          <td>${m.time}</td>
          <td>${m.notes}</td>
        </tr>
      `,
    ).join('');

    const head = HEADERS.map((h) => `<th>${h}</th>`).join('');

    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <div class="scroll" role="region" aria-label="沖煮法比較表" tabindex="0">
        <table>
          <thead><tr>${head}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }
}

if (typeof window !== 'undefined' && !customElements.get('brew-method-compare')) {
  customElements.define('brew-method-compare', BrewMethodCompare);
}
