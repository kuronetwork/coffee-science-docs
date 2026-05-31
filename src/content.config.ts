/**
 * Astro Content Collections schema（Content Layer API）。
 *
 * 進度標記用 frontmatter 的 `progress`，不是 `draft`：
 *   - drafting：在寫，會顯示在文章頁但有 inline tag
 *   - reviewing：校稿中
 *   - done：完成
 *
 * `draft: true` 的文章一律不會被渲染到 static 輸出。
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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

const makeCollection = (slug: string) =>
  defineCollection({
    loader: glob({ pattern: '*.md', base: `./src/content/${slug}` }),
    schema: docSchema,
  });

export const collections = {
  'getting-started':   makeCollection('getting-started'),
  'bean-fundamentals': makeCollection('bean-fundamentals'),
  roasting:            makeCollection('roasting'),
  grinding:            makeCollection('grinding'),
  'brewing-science':   makeCollection('brewing-science'),
  espresso:            makeCollection('espresso'),
  'filter-brewing':    makeCollection('filter-brewing'),
  sensory:             makeCollection('sensory'),
  'home-barista':      makeCollection('home-barista'),
  'sca-certification': makeCollection('sca-certification'),
  reference:           makeCollection('reference'),
};

export type DocFrontmatter = z.infer<typeof docSchema>;
