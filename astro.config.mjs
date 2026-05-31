import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCallout from './plugins/remark-callout.mjs';
import remarkPangu from './plugins/remark-pangu.mjs';

// 切換為 true 時，網站發佈到自訂網域 coffee.kuronetwork.me
// 切換為 false 時，發佈到 GitHub Pages 的子路徑 https://kuronetwork.github.io/coffee-science-docs
const useCustomDomain = true;

export default defineConfig({
  site: useCustomDomain
    ? 'https://coffee.kuronetwork.me'
    : 'https://kuronetwork.github.io',
  base: useCustomDomain ? undefined : '/coffee-science-docs',
  trailingSlash: 'ignore',

  integrations: [sitemap()],

  markdown: {
    processor: unified({
      remarkPlugins: [remarkDirective, remarkCallout, remarkMath, remarkPangu],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },

  build: {
    assets: 'assets',
  },

  image: {
    domains: [],
  },
});
