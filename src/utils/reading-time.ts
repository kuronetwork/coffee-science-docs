/**
 * CJK-aware reading time。
 * 中文 350 字/分鐘，英文 220 字/分鐘。
 */

/** 中日韓統一表意文字範圍（含擴充 A） */
const CJK_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf]/g;

const CJK_CHARS_PER_MINUTE = 350;
const EN_WORDS_PER_MINUTE = 220;

export function readingTime(text: string): number {
  const cjkChars = (text.match(CJK_REGEX) ?? []).length;
  const stripped = text.replace(CJK_REGEX, ' ');
  const enWords = stripped.split(/\s+/).filter(Boolean).length;

  const minutes = cjkChars / CJK_CHARS_PER_MINUTE + enWords / EN_WORDS_PER_MINUTE;
  return Math.max(1, Math.round(minutes));
}
