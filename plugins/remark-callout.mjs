/**
 * remark-callout
 *
 * 把 remark-directive 抓到的 `:::note`、`:::warning`、`:::tip`、`:::kuro`
 * 容器型 directive 轉成帶有 class / data 屬性的 <aside>，
 * 由 typography.css 套用 callout 樣式。
 *
 * 使用方式：
 *   :::note 標題（選填）
 *   內文⋯⋯
 *   :::
 *
 *   :::kuro
 *   （不寫標題會用「Kuro 的實作筆記」預設標題）
 *   :::
 *
 * 規則：
 *   - 標題寫在 directive 名稱後面
 *   - kuro 沒帶標題時，會用「Kuro 的實作筆記」當預設
 *   - 不支援 inline 或 leaf directive，僅 container directive
 *   - **Placeholder 偵測**：如果 :::kuro 內容只有 `[Kuro 自己填...]` 之類的占位文字，
 *     整個節點會被移除，不會渲染到網站上。等到 Kuro 真的寫了內容才會自動顯示。
 */
import { visit } from 'unist-util-visit';

const ALLOWED_TYPES = new Set(['note', 'warning', 'tip', 'kuro']);

const DEFAULT_TITLES = {
  note: '備註',
  warning: '注意',
  tip: '小技巧',
  kuro: 'Kuro 的實作筆記',
};

/**
 * 判斷一段內容是否「只剩占位文字」。
 * 規則：移除掉所有 [Kuro 自己填...] 風格的占位後，剩下的純文字若為空白就算是 placeholder。
 */
function isPlaceholder(node) {
  // 收集所有 text node 的內容
  const texts = [];
  function collect(n) {
    if (!n) return;
    if (n.type === 'text' && typeof n.value === 'string') {
      texts.push(n.value);
    }
    if (Array.isArray(n.children)) {
      n.children.forEach(collect);
    }
  }
  collect(node);

  const combined = texts.join('').trim();
  if (combined.length === 0) return true;

  // 移除 [Kuro 自己填...] 之類的 placeholder 標記
  // 支援：[Kuro 自己填], [Kuro 自己填：xxx], [Kuro 自己填一段...]
  const stripped = combined
    .replace(/\[\s*Kuro\s*自己填[^\]]*\]/g, '')
    .replace(/\[\s*待補[^\]]*\]/g, '')
    .replace(/（\s*待補\s*）/g, '')
    .replace(/\(\s*待補\s*\)/g, '')
    .trim();

  return stripped.length === 0;
}

export default function remarkCallout() {
  return (tree, file) => {
    // 第一輪：找出要移除的 placeholder kuro 節點
    const toRemove = new Set();

    visit(tree, (node, index, parent) => {
      if (
        node.type === 'containerDirective' &&
        node.name === 'kuro' &&
        isPlaceholder(node)
      ) {
        toRemove.add(node);
      }
    });

    // 從 parent 的 children 中真的移除
    if (toRemove.size > 0) {
      visit(tree, (node) => {
        if (Array.isArray(node.children)) {
          node.children = node.children.filter((c) => !toRemove.has(c));
        }
      });
    }

    // 第二輪：把不是 callout 名稱的 directive 轉回純文字
    // 這個關鍵步驟避免 1:15、1:18 之類的比例被 remark-directive 當成 textDirective 吃掉
    visit(tree, (node) => {
      if (Array.isArray(node.children)) {
        node.children = node.children.flatMap((child) => {
          if (
            (child.type === 'textDirective' || child.type === 'leafDirective') &&
            !ALLOWED_TYPES.has(child.name)
          ) {
            // 把這個 directive 還原成純文字
            const prefix = child.type === 'leafDirective' ? '::' : ':';
            const text = `${prefix}${child.name}`;
            // 如果有 children（label 或 inline content），把它們的 text 內容也接上去
            const inner = (child.children ?? [])
              .map((c) => (c.type === 'text' ? c.value : ''))
              .join('');
            return [{ type: 'text', value: text + inner }];
          }
          return [child];
        });
      }
    });

    // 第三輪：把剩下的 callout 轉成 aside
    visit(tree, (node) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        if (!ALLOWED_TYPES.has(node.name)) return;

        if (node.type !== 'containerDirective') {
          file.message(
            `Callout :::${node.name} 必須是 container directive（用 ::: 包起來）`,
            node,
          );
          return;
        }

        const data = node.data ?? (node.data = {});
        // directive label：可能是 [{ type: 'paragraph', data: { directiveLabel: true }, children: [...] }]
        const labelNode = node.children.find(
          (child) => child.data && child.data.directiveLabel,
        );

        let title = DEFAULT_TITLES[node.name] || node.name;
        if (labelNode && labelNode.children && labelNode.children.length > 0) {
          // 取第一個 text node 當標題
          const textChild = labelNode.children.find((c) => c.type === 'text');
          if (textChild && textChild.value) {
            title = textChild.value.trim();
          }
          // 從 children 中移除 label，避免出現在內文
          node.children = node.children.filter((c) => c !== labelNode);
        }

        // 改寫 hast 結構
        data.hName = 'aside';
        data.hProperties = {
          class: 'callout',
          'data-callout': node.name,
          role: 'note',
        };

        // 在最前面插入標題節點
        const titleNode = {
          type: 'paragraph',
          data: {
            hName: 'p',
            hProperties: { class: 'callout__title' },
          },
          children: [{ type: 'text', value: title }],
        };
        node.children.unshift(titleNode);
      }
    });
  };
}
