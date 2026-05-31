/**
 * 產生 og-default.png（1200×630）。
 *
 * 一次性腳本，用 Astro 內建的 sharp 把 SVG render 成 PNG。
 * 執行：node scripts/generate-og.mjs
 *
 * 沒設計感的純文字 OG 圖，符合站內極簡風格。
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FAF7F0"/>

  <line x1="80" y1="120" x2="1120" y2="120" stroke="#CFC8B6" stroke-width="1"/>
  <line x1="80" y1="510" x2="1120" y2="510" stroke="#CFC8B6" stroke-width="1"/>

  <text x="80" y="100" font-family="-apple-system, 'Noto Sans TC', sans-serif" font-size="22" fill="#7A3E1D" font-weight="500" letter-spacing="2">KURO COFFEE SCIENCE NOTES</text>

  <text x="80" y="280" font-family="-apple-system, 'Noto Sans TC', sans-serif" font-size="80" fill="#1A1612" font-weight="500">咖啡科學學習筆記</text>

  <text x="80" y="380" font-family="-apple-system, 'Noto Sans TC', sans-serif" font-size="32" fill="#5C5247">SCA Barista Foundation 到 Intermediate</text>
  <text x="80" y="430" font-family="-apple-system, 'Noto Sans TC', sans-serif" font-size="32" fill="#5C5247">萃取科學・感官評估・烘焙・義式咖啡</text>

  <text x="80" y="555" font-family="-apple-system, 'Noto Sans TC', sans-serif" font-size="22" fill="#7A3E1D">coffee.kuronetwork.me</text>
  <text x="1120" y="555" font-family="-apple-system, 'Noto Sans TC', sans-serif" font-size="22" fill="#7A3E1D" text-anchor="end">by Kuro</text>
</svg>`;

// 找 sharp 模組（Astro 6 帶的）
const { default: sharp } = await import('sharp');

const outputPath = resolve(projectRoot, 'public/og-default.png');
await sharp(Buffer.from(svg))
  .png()
  .toFile(outputPath);

console.log(`og-default.png written to ${outputPath}`);
