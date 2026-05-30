---
title: 純飲 espresso：ristretto、normale、lungo
description: 三種比例的萃取邏輯與風味差異
order: 5
updated: 2026-05-29
progress: done
tags:
  - espresso
  - pure-espresso
sca: barista
---

## 三種純飲規格的核心差異

ristretto、normale、lungo 是用「液重對粉重的比例」來區分的三種純飲 espresso。粉量不變，液重不同，溶出來的可溶物組成也不同。

| 規格 | 比例（粉:液）| 18 g 對應液重 | 風味重心 |
|---|---|---|---|
| Ristretto | 1:1-1:1.5 | 18-27 g | 酸質、甜感、body 厚 |
| Normale | 1:2 | 36 g | 三段平衡 |
| Lungo | 1:3-1:4 | 54-72 g | 拉到苦段、liquid 變稀 |

時間都落在 25-30 秒區間。比例改變的是停泵時機，不是萃取時間本身。

## 為什麼比例改變風味

回顧〈[義式濃縮的科學定義](./01-what-is-espresso)〉裡提過的萃取三段：

- 前段（0-8 秒）：酸質、芳香化合物
- 中段（8-20 秒）：糖類、梅納反應產物
- 後段（20-30 秒）：苦味、單寧

**Ristretto** 大約在中段結束前停泵，前段的酸與中段的甜被收進來，後段的苦留在粉餅裡沒被溶出。所以 ristretto 不是「比較濃的 espresso」，更精確的說法是「截斷後段的 espresso」。

**Normale** 完整跑完三段，前中後段比例平衡。

**Lungo** 拉到後段並繼續萃取，把更多苦味與單寧溶出。但因為水量增加，整體濃度（TDS）反而下降。

## 萃取率與濃度

要把這三者講清楚，要分開看「萃取率（Extraction Yield）」與「濃度（TDS）」。

$$\text{萃取率} = \frac{\text{液重} \times \text{TDS}}{\text{粉重}} \times 100\%$$

| 規格 | TDS 典型值 | 萃取率典型值 |
|---|---|---|
| Ristretto | 11-13% | 16-19% |
| Normale | 8-10% | 18-22% |
| Lungo | 5-7% | 22-25% |

ristretto 的濃度高、但萃取率較低（很多可溶物還沒被取出）。lungo 的濃度低、但萃取率高（取得較完整）。normale 是兩者的中間值。

實測時可以用 <extraction-calc></extraction-calc> 算自己的萃取率。

## 三種規格適合的豆況

### Ristretto

- 偏深焙、苦感重的豆子，截斷後段可以避開苦
- 想凸顯甜感與 body
- 義式拼配豆常見的飲用方式

### Normale

- 一支新豆校正的起手式
- 大多數中淺焙到中焙的單品

### Lungo

- 偏淺焙、酸質明亮、後段不會太苦的單品
- 想取出更多複雜香氣
- 跟 Americano、Long Black 不同，lungo 是直接拉長萃取，不是事後加水

## 純飲評鑑會看什麼

SCA Barista Intermediate 的純飲品評通常從幾個維度：

| 維度 | 描述 |
|---|---|
| 香氣（Aroma）| 鼻前嗅與鼻後嗅的香氣強度與複雜度 |
| 平衡（Balance）| 酸、甜、苦的相對比例 |
| 甜感（Sweetness）| 中段釋放的糖類是否被表現出來 |
| Body | 黏稠感、油脂感、入口重量感 |
| Crema | 顏色、厚度、持久性、紋理 |
| 餘韻（Aftertaste）| 喝完後口腔殘留的風味與時長 |

這幾個維度跟比例直接相關。比例選錯，例如把適合 ristretto 的深焙豆做成 lungo，後段的苦會壓掉前面所有香氣，餘韻會變成單一的乾澀感。

## 比例調整的實務

校正跑穩 normale 之後，再用同一支豆子試 ristretto 與 lungo，這樣可以快速判斷豆子的甜感區間在哪。

範例記錄格式：

```
豆款：A 衣索比亞水洗
研磨：#8（不變）
粉量：18 g（不變）

Ristretto  18:27 / 28s   → 酸甜明亮、body 厚、餘韻短
Normale    18:36 / 27s   → 平衡、花香、餘韻中
Lungo      18:54 / 29s   → 香氣稀薄、後段苦感明顯
```

用這個方法可以找到「這支豆子最適合的比例」，後面做奶咖時就用同樣的比例做基底。

<extraction-timeline></extraction-timeline>

:::warning[Lungo 不等於 Americano]
Americano 是 espresso 加熱水，先萃取完成再加水。Lungo 是直接拉長萃取量，水從頭到尾都通過粉餅。兩者萃取率與風味組成不同，不能互換。詳細在〈[Americano、Long Black、Lungo 的差異](./07-black-coffee)〉。
:::

:::kuro
[Kuro 自己填：第一次比較同一支豆子三種比例時，發現了什麼風味差異]
:::
