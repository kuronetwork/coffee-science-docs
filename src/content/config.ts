/**
 * Astro Content Collections schema。
 *
 * 進度標記用 frontmatter 的 `progress`，不是 `draft`：
 *   - drafting：在寫，會顯示在文章頁但有 inline tag
 *   - reviewing：校稿中
 *   - done：完成
 *
 * `draft: true` 的文章一律不會被渲染到 static 輸出。
 */
import { defineCollection, z } from 'astro:content';

const docSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  order: z.number(),
  updated: z.coerce.date(),
  draft: z.boolean().default(false),
  progress: z.enum(['drafting', 'reviewing', 'done']).default('drafting'),
  tags: z.array(z.string()).optional(),
  /** 對應的 SCA 模組，null 表示非 SCA 範圍 */
  sca: z
    .enum(['barista', 'brewing', 'sensory', 'roasting', 'green'])
    .nullable()
    .optional(),
});

export const collections = {
  'getting-started':   defineCollection({ type: 'content', schema: docSchema }),
  'bean-fundamentals': defineCollection({ type: 'content', schema: docSchema }),
  roasting:            defineCollection({ type: 'content', schema: docSchema }),
  grinding:            defineCollection({ type: 'content', schema: docSchema }),
  'brewing-science':   defineCollection({ type: 'content', schema: docSchema }),
  espresso:            defineCollection({ type: 'content', schema: docSchema }),
  'filter-brewing':    defineCollection({ type: 'content', schema: docSchema }),
  sensory:             defineCollection({ type: 'content', schema: docSchema }),
  'home-barista':      defineCollection({ type: 'content', schema: docSchema }),
  'sca-certification': defineCollection({ type: 'content', schema: docSchema }),
  reference:           defineCollection({ type: 'content', schema: docSchema }),
};

export type DocFrontmatter = z.infer<typeof docSchema>;
