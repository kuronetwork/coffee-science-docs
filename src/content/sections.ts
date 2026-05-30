/**
 * 章節 metadata。
 *
 * 漢字編號用 `numeral`，前言/附錄沒有編號。
 * `order` 控制 sidebar / toc 的顯示順序。
 */

export type CollectionSlug =
  | 'getting-started'
  | 'bean-fundamentals'
  | 'roasting'
  | 'grinding'
  | 'brewing-science'
  | 'espresso'
  | 'filter-brewing'
  | 'sensory'
  | 'home-barista'
  | 'sca-certification'
  | 'reference';

export type Section = {
  slug: CollectionSlug;
  title: string;
  description: string;
  /** 漢字數字編號，null 表示前言/附錄不編號 */
  numeral: '一' | '二' | '三' | '四' | '五' | '六' | '七' | '八' | '九' | null;
  order: number;
};

export const sections: Section[] = [
  {
    slug: 'getting-started',
    numeral: null,
    order: 0,
    title: '前言',
    description: '為什麼做這個網站',
  },
  {
    slug: 'bean-fundamentals',
    numeral: '一',
    order: 1,
    title: '咖啡豆基礎',
    description: '從種子到生豆',
  },
  {
    slug: 'roasting',
    numeral: '二',
    order: 2,
    title: '烘焙',
    description: '梅納反應、烘焙曲線、瑕疵與排氣保存',
  },
  {
    slug: 'grinding',
    numeral: '三',
    order: 3,
    title: '磨豆',
    description: '研磨度怎麼決定杯中味道',
  },
  {
    slug: 'brewing-science',
    numeral: '四',
    order: 4,
    title: '萃取科學',
    description: '所有沖煮法的共通底層',
  },
  {
    slug: 'espresso',
    numeral: '五',
    order: 5,
    title: '義式咖啡',
    description: 'SCA Barista 學習筆記',
  },
  {
    slug: 'filter-brewing',
    numeral: '六',
    order: 6,
    title: '手沖與其他沖煮法',
    description: 'V60、AeroPress、摩卡壺入門',
  },
  {
    slug: 'sensory',
    numeral: '七',
    order: 7,
    title: '感官評估',
    description: '風味輪、觸感、tasting note',
  },
  {
    slug: 'home-barista',
    numeral: '八',
    order: 8,
    title: '居家日常操作',
    description: '設備維護與日常校正',
  },
  {
    slug: 'sca-certification',
    numeral: '九',
    order: 9,
    title: 'SCA 認證考試筆記',
    description: 'SCA 課程與考試心得',
  },
  {
    slug: 'reference',
    numeral: null,
    order: 10,
    title: '附錄',
    description: '術語對照表、外部資源參考',
  },
];

export function findSection(slug: string): Section | undefined {
  return sections.find((s) => s.slug === slug);
}

export function isValidCollectionSlug(slug: string): slug is CollectionSlug {
  return sections.some((s) => s.slug === slug);
}
