/**
 * Content Collections 的查詢輔助函式。
 *   - 自動過濾 draft: true
 *   - 同章節內按 frontmatter.order 升冪排序
 *   - 提供「上一篇 / 下一篇」與「最近更新」用的 helper
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { sections, type CollectionSlug } from '../content/sections';

export type AnyDoc = CollectionEntry<CollectionSlug>;

export async function getDocsBySection(slug: CollectionSlug): Promise<AnyDoc[]> {
  const docs = await getCollection(slug, ({ data }) => !data.draft);
  return docs.sort((a, b) => a.data.order - b.data.order);
}

/** 取得所有章節（按 sections.ts 的 order）的所有文章。 */
export async function getAllDocs(): Promise<AnyDoc[]> {
  const ordered = [...sections].sort((a, b) => a.order - b.order);
  const all: AnyDoc[] = [];
  for (const section of ordered) {
    const docs = await getDocsBySection(section.slug);
    all.push(...docs);
  }
  return all;
}

/** 同章節內的上一篇 / 下一篇。 */
export async function getSiblings(
  collection: CollectionSlug,
  currentSlug: string,
): Promise<{ prev: AnyDoc | null; next: AnyDoc | null }> {
  const docs = await getDocsBySection(collection);
  const idx = docs.findIndex((d) => d.id === currentSlug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? docs[idx - 1] : null,
    next: idx < docs.length - 1 ? docs[idx + 1] : null,
  };
}

/** 「最近寫的」：取最近更新的 N 篇（排除 drafting）。 */
export async function getRecentDocs(limit = 5): Promise<AnyDoc[]> {
  const all = await getAllDocs();
  return all
    .filter((d) => d.data.progress !== 'drafting')
    .sort((a, b) => b.data.updated.getTime() - a.data.updated.getTime())
    .slice(0, limit);
}

/** 計算章節進度：完成數 / 全部數，用於目錄顯示「2 / 5」 */
export async function getSectionProgress(
  slug: CollectionSlug,
): Promise<{ done: number; total: number }> {
  const docs = await getDocsBySection(slug);
  const done = docs.filter((d) => d.data.progress === 'done').length;
  return { done, total: docs.length };
}
