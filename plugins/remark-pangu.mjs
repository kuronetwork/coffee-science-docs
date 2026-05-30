/**
 * remark-pangu
 *
 * 在 build time 對所有 markdown text node 套 pangu spacing，
 * 處理中英文之間的微空格。
 *
 * 不去動 inline code、code block、URL、HTML 屬性，
 * 只處理 type: 'text' 的節點。
 *
 * pangu 7.x 用 NodePangu 類別與 spacingText 方法（同步、純字串）。
 */
import { visit } from 'unist-util-visit';
import { NodePangu } from 'pangu';

const pangu = new NodePangu();

export default function remarkPangu() {
  return (tree) => {
    visit(tree, 'text', (node) => {
      if (typeof node.value === 'string' && node.value.length > 0) {
        node.value = pangu.spacingText(node.value);
      }
    });
  };
}
