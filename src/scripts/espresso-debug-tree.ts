/**
 * EspressoDebugTree。
 *
 * 義式風味調整決策樹。使用者點選一個症狀，下方卡片顯示
 *   - 可能原因
 *   - 建議調整
 *   - 下一杯測試什麼
 *
 * 用法：在 Markdown 直接寫
 *   <espresso-debug-tree></espresso-debug-tree>
 *
 * Hydration：DocLayout 在 client:visible 時 import 這隻檔案。
 */

interface Symptom {
  id: string;
  label: string;
  causes: string[];
  fixes: string[];
  next: string;
}

const SYMPTOMS: Symptom[] = [
  {
    id: 'too-fast',
    label: '萃取時間 < 20 秒',
    causes: ['粉量太少', '研磨太粗', 'tamping 不實', '通道效應（channeling）'],
    fixes: ['確認粉量 18 g', '研磨調細 1-2 格', '重做 puck prep'],
    next: '確認研磨刻度後跑一杯，時間應該回到 25-30 秒區間',
  },
  {
    id: 'too-slow',
    label: '萃取時間 > 35 秒',
    causes: ['研磨太細', '粉量太多', 'tamping 過重'],
    fixes: ['研磨調粗 1-2 格', '確認粉量沒爆碗', '力道改為約 15 lb'],
    next: '跑一杯，時間應落在 25-30 秒',
  },
  {
    id: 'sour',
    label: '時間正常但偏酸',
    causes: ['萃取仍可能不足', '豆子太新（< 7 天）', '水溫太低', '比例太短'],
    fixes: ['比例從 1:2 拉到 1:2.2', '水溫升 1°C', '確認養豆 7 天以上'],
    next: '一次只動一個變因，比較變化',
  },
  {
    id: 'bitter',
    label: '時間正常但偏苦',
    causes: ['萃取過度', '水溫太高', '烘焙度本身偏深'],
    fixes: ['比例從 1:2 縮到 1:1.8', '水溫降 1°C', '研磨調粗 1 格'],
    next: '縮短比例優先試',
  },
  {
    id: 'crema-thin',
    label: 'crema 偏淡、薄',
    causes: ['豆子過老（> 6 週）', '萃取不足', '水壓不足'],
    fixes: ['換新豆', '研磨調細', '檢查機器水壓'],
    next: '先換豆，這個變因影響最大',
  },
  {
    id: 'crema-dark',
    label: 'crema 偏深、油亮',
    causes: ['豆子烘焙度深', '水溫過高', '萃取過度'],
    fixes: ['水溫降 1-2°C', '改 1:2 起手', '換較淺豆'],
    next: '降溫優先',
  },
  {
    id: 'channeling',
    label: '中央 / 邊緣 / 雙噴 channeling',
    causes: ['通道效應，puck prep 出問題'],
    fixes: ['重做 WDT', '撥邊徹底', 'tamping 確認水平'],
    next: '不要直接調研磨，先解決粉餅均勻度',
  },
  {
    id: 'flat',
    label: '平淡無風味',
    causes: ['豆子氧化', '機器溫度不穩', '嚴重通道效應'],
    fixes: ['換新豆', '機器預熱 15 分鐘', '重做 puck prep'],
    next: '從最大變因（豆子）開始排除',
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

.prompt {
  margin: 0 0 var(--space-3, 0.75rem);
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-muted, #5C5246);
}

.options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-2, 0.5rem);
  margin-bottom: var(--space-4, 1rem);
}

.option {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 0.875rem);
  text-align: left;
  padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
  background: var(--color-bg, #FAF7F0);
  color: var(--color-text-muted, #5C5246);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-md, 6px);
  cursor: pointer;
  transition: background var(--transition-base, 180ms ease),
              color var(--transition-base, 180ms ease),
              border-color var(--transition-base, 180ms ease);
  line-height: 1.5;
}

.option:hover {
  border-color: var(--color-accent, #7A3E1D);
  color: var(--color-text, #1A1612);
}

.option[aria-pressed='true'] {
  background: var(--color-accent, #7A3E1D);
  color: #FAF7F0;
  border-color: var(--color-accent, #7A3E1D);
}

.option:focus-visible {
  outline: 2px solid var(--color-accent, #7A3E1D);
  outline-offset: 1px;
}

.card {
  background: var(--color-bg-elevated, #FFFFFF);
  border: 1px solid var(--color-border, #DDD6C5);
  border-radius: var(--radius-md, 6px);
  padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
}

.card__placeholder {
  margin: 0;
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-subtle, #8A7F6E);
  text-align: center;
  padding: var(--space-4, 1rem) 0;
}

.card__symptom {
  margin: 0 0 var(--space-3, 0.75rem);
  font-size: var(--font-size-base, 1rem);
  font-weight: 500;
  color: var(--color-text, #1A1612);
  padding-bottom: var(--space-2, 0.5rem);
  border-bottom: 1px solid var(--color-border, #DDD6C5);
}

.card__section {
  margin: 0 0 var(--space-3, 0.75rem);
}

.card__section:last-child {
  margin-bottom: 0;
}

.card__heading {
  margin: 0 0 var(--space-2, 0.5rem);
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-xs, 0.75rem);
  font-weight: 500;
  color: var(--color-text, #1A1612);
  letter-spacing: 0.04em;
}

.card__list {
  margin: 0;
  padding-left: 1.4em;
  font-size: var(--font-size-sm, 0.875rem);
  line-height: 1.7;
  color: var(--color-text-muted, #5C5246);
}

.card__list li {
  margin-bottom: var(--space-1, 0.25rem);
}

.card__next {
  margin: 0;
  font-size: var(--font-size-sm, 0.875rem);
  line-height: 1.7;
  color: var(--color-text-muted, #5C5246);
}

@media (max-width: 640px) {
  .options {
    grid-template-columns: 1fr;
  }
}
`;

class EspressoDebugTree extends HTMLElement {
  private shadow: ShadowRoot;
  private selected: string | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadow.addEventListener('click', (event) => {
      const target = (event.target as Element | null)?.closest('[data-symptom]');
      if (!target) return;
      const next = target.getAttribute('data-symptom');
      if (!next || next === this.selected) return;
      this.selected = next;
      this.update();
    });
  }

  private current(): Symptom | null {
    return SYMPTOMS.find((s) => s.id === this.selected) ?? null;
  }

  private renderCard(): string {
    const s = this.current();
    if (!s) {
      return `<p class="card__placeholder">選一個症狀開始</p>`;
    }
    const causes = s.causes.map((c) => `<li>${c}</li>`).join('');
    const fixes = s.fixes.map((f) => `<li>${f}</li>`).join('');
    return `
      <h4 class="card__symptom">${s.label}</h4>
      <div class="card__section">
        <p class="card__heading">可能原因</p>
        <ul class="card__list">${causes}</ul>
      </div>
      <div class="card__section">
        <p class="card__heading">建議調整</p>
        <ol class="card__list">${fixes}</ol>
      </div>
      <div class="card__section">
        <p class="card__heading">下一杯測試什麼</p>
        <p class="card__next">${s.next}</p>
      </div>
    `;
  }

  private update() {
    const card = this.shadow.querySelector('.card');
    if (card) card.innerHTML = this.renderCard();
    const buttons = this.shadow.querySelectorAll<HTMLButtonElement>('.option');
    buttons.forEach((btn) => {
      const active = btn.getAttribute('data-symptom') === this.selected;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  private render() {
    const options = SYMPTOMS.map(
      (s) => `
        <button class="option" type="button"
                data-symptom="${s.id}"
                aria-pressed="false">${s.label}</button>
      `
    ).join('');

    this.shadow.innerHTML = `
      <style>${STYLE}</style>
      <p class="title">espresso debug tree</p>
      <p class="prompt">我觀察到的症狀是…</p>
      <div class="options" role="group" aria-label="症狀選擇">${options}</div>
      <div class="card" aria-live="polite">${this.renderCard()}</div>
    `;
  }
}

if (typeof window !== 'undefined' && !customElements.get('espresso-debug-tree')) {
  customElements.define('espresso-debug-tree', EspressoDebugTree);
}
