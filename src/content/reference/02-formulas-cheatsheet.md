---
title: 公式速查
description: 萃取率、TDS、粉水比、各沖煮法目標數值的計算與換算
order: 2
updated: 2026-05-29
progress: done
tags:
  - reference
  - formula
  - cheatsheet
sca: brewing
---

把全站會用到的公式集中放在這裡。每條公式附一個範例，懶得算可以直接套用。

數值範圍以 SCA 教材與 Scott Rao、James Hoffmann 的業界共識為準。有爭議的地方標出範圍，不給單一假精確值。

## 萃取率（Extraction Yield）

### 公式

$$\text{EY \%} = \frac{\text{液重(g)} \times \text{TDS \%}}{\text{粉重(g)}} \times 100$$

### 範例

espresso：18 g 粉、36 g 液、TDS 9%。

$$\text{EY} = \frac{36 \times 0.09}{18} \times 100 = 18\%$$

V60：15 g 粉、225 g 液、TDS 1.35%。

$$\text{EY} = \frac{225 \times 0.0135}{15} \times 100 = 20.25\%$$

### SCA Golden Cup 區間

- **TDS：** 1.15–1.45%（filter）
- **EY：** 18–22%

低於 18% 通常萃取不足（尖酸、鹹澀、薄）；高於 22% 通常過萃（苦澀、乾、空）。義式 espresso 因濃度與器具不同，TDS 一般在 7–12%，EY 仍以 18–22% 為理想，但實務上 16–24% 都還在合理範圍。

## TDS 換算

### 重量百分比與 ppm 互換

$$\text{TDS ppm} = \text{TDS \%} \times 10000$$

例：TDS 1.35% = 13500 ppm。

### 折光儀（Refractometer）讀值

VST 與 Atago 折光儀直接讀 TDS %。讀數時要：

1. 樣本溫度與儀器同溫（差 5°C 以內）
2. 樣本過濾紙過濾，去掉 crema 油脂與懸浮物
3. 連續讀三次取平均

espresso 的 TDS 量測誤差大，建議過濾後再讀。

## 粉水比（Brew Ratio）

### 公式

$$\text{Ratio} = \text{粉重} : \text{水重}$$

espresso 比例慣例用「粉:液重」（不是注水量）；手沖用「粉:總注水量」。兩者語境不同，看到比例先確認上下文。

### 換算範例

#### 想煮 2 杯 V60，每杯 200 ml，1:15

總水量 400 g，反推粉量：

$$\text{粉量} = \frac{400}{15} \approx 26.7 \text{ g}$$

#### 想煮一杯 espresso，1:2，目標液重 36 g

$$\text{粉量} = \frac{36}{2} = 18 \text{ g}$$

#### 想煮一杯 ristretto 1:1.5，粉量 18 g

$$\text{液重} = 18 \times 1.5 = 27 \text{ g}$$

## 沖煮溫度與目標數值對照

各沖煮法常見起手式：

| 沖煮法 | 粉水比 | 水溫 | 研磨度 | 目標時間 |
|---|---|---|---|---|
| Espresso（normale）| 1:2 | 92–94°C | 極細 | 25–30s |
| Espresso（ristretto）| 1:1–1:1.5 | 92–94°C | 極細 | 22–28s |
| Espresso（lungo）| 1:3 | 92–94°C | 極細 | 30–40s |
| V60 | 1:15–1:17 | 90–94°C | 中細 | 2:30–3:30 |
| Kalita Wave | 1:15–1:16 | 90–93°C | 中 | 3:00–4:00 |
| Chemex | 1:15–1:17 | 92–96°C | 中粗 | 4:00–5:00 |
| AeroPress（正置）| 1:12–1:16 | 85–92°C | 中細 | 1:30–2:30 |
| French Press | 1:15–1:17 | 92–96°C | 粗 | 4:00 |
| Moka Pot | 約 1:7（粉槽填滿）| 預熱水 | 中細偏細 | 3–5 分鐘 |
| Cupping | 1:18.18（8.25g/150ml）| 93°C | 中粗 | 4 分鐘浸泡 |

數值依 SCA Brewing 模組與 Scott Rao《Coffee Roaster's Companion》、Hoffmann《World Atlas of Coffee》整合。實際以豆況、烘焙度、器具微調。

## 燒水量估算

### 手沖實際所需熱水

$$\text{所需熱水} = \text{目標水量} + \text{濾紙吸水量} + \text{粉吸水量}$$

- 濾紙吸水量：V60 01 號約 5–8 g，02 號約 8–12 g
- 粉吸水量：每 1 g 粉約吸 2–3 g 水

範例：15 g 粉、目標 225 g 注水。

$$\text{熱水量} = 225 + 8 + 15 \times 2 \approx 263 \text{ g}$$

加上預熱濾杯與分享壺的水，建議燒 350 g 起跳。

## 奶咖容量配比

SCA 標準奶咖配比（雙份 espresso 為基準，奶量計算到杯緣）：

| 飲品 | espresso | 蒸奶總量 | 奶泡厚度 | 杯量 |
|---|---|---|---|---|
| Espresso | 36 g | — | — | 60–90 ml 杯 |
| Cortado | 36 g | 60 ml | 約 0.5 cm | 100 ml |
| Flat White | 36 g | 110 ml | 約 0.5 cm | 150–160 ml |
| Cappuccino | 36 g | 120 ml | 約 1 cm | 150–180 ml |
| Latte | 36 g | 200 ml | 約 0.5 cm | 220–280 ml |
| Mocha | 36 g | 200 ml + 巧克力醬 20–30 g | 0.5–1 cm | 250 ml |

奶量為近似值，依杯型微調。SCA Barista Foundation 評核以杯緣下 1 cm 為標準液面。

## 烘焙度與沖煮溫度建議

依烘焙度大致對應的沖煮溫度起點：

| 烘焙度 | Agtron Whole Bean | 沖煮水溫起點 |
|---|---|---|
| 極淺烘 | 75–95 | 94–96°C |
| 淺烘 | 65–75 | 92–94°C |
| 中烘 | 55–65 | 90–92°C |
| 中深烘 | 45–55 | 88–91°C |
| 深烘 | 30–45 | 85–88°C |

淺烘質地緊密、可溶物難釋放，要高溫；深烘質地疏鬆、易過萃，要低溫。Agtron 數值越低烘焙越深。

## 萃取率反推研磨方向

杯中味道對應的調整方向（先確認粉餅均勻、無 channeling 的前提下）：

| 杯中症狀 | 推測 EY | 調整方向 |
|---|---|---|
| 尖酸、鹹、薄、water-like | < 18% | 研磨調細、提高水溫、延長時間 |
| 平衡、有甜、餘韻清楚 | 18–22% | 維持 |
| 苦、乾、澀、空 | > 22% | 研磨調粗、降低水溫、縮短比例 |

每次只動一個變因，記錄差異再決定下一步。

## DTR（Development Time Ratio）

烘焙曲線速查：

$$\text{DTR \%} = \frac{\text{first crack 到下豆時間}}{\text{總烘焙時間}} \times 100$$

業界常見參考區間：

- 手沖烘焙：DTR 17–22%
- 義式烘焙：DTR 22–28%

範例：總時間 10 分鐘、first crack 在 8 分鐘出現、10 分鐘下豆。

$$\text{DTR} = \frac{2}{10} \times 100 = 20\%$$

DTR 不是越高越好，要看豆種、烘焙度與目標風味，這裡只是給一個對照範圍。

:::tip[隨身用版]
平常開豆只會用到萃取率、粉水比、沖煮溫度三條公式。其他列在這裡是備查，遇到再回來抄。
:::

:::kuro
[Kuro 自己填：哪幾條公式平常真的會在沖煮時用到，哪些只是學科考試用的]
:::
