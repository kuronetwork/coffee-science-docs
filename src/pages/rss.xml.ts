/**
 * RSS feed endpoint。
 *
 * 列出所有 progress: done 文章，按 updated desc 排序。
 * /rss.xml 由 Astro 在 build time 產出靜態 XML。
 */
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllDocs } from '../utils/content';
import { findSection } from '../content/sections';

export async function GET(context: APIContext) {
  const docs = await getAllDocs();
  const published = docs.filter((d) => d.data.progress !== 'drafting');

  const items = published
    .sort((a, b) => b.data.updated.getTime() - a.data.updated.getTime())
    .map((doc) => {
      const section = findSection(doc.collection);
      const sectionTitle = section?.title ?? doc.collection;
      return {
        title: doc.data.title,
        description: doc.data.description ?? `${sectionTitle}・${doc.data.title}`,
        link: `/${doc.collection}/${doc.id}`,
        pubDate: doc.data.updated,
        categories: [sectionTitle],
      };
    });

  return rss({
    title: 'Kuro Coffee Science Notes',
    description:
      'Kuro 的咖啡學習筆記。SCA Barista Foundation–Intermediate 範圍、萃取科學、感官評估、烘焙、義式咖啡。',
    site: context.site!,
    items,
    customData: '<language>zh-Hant</language>',
  });
}
