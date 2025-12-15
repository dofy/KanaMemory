# Kana Memory

簡潔、直觀的線上日語學習工具，提供：

- 假名（平假名 / 片假名）練習
- 按假名篩選的單詞練習
- 場景化句子練習與學習方案

線上體驗： https://kana.yahaha.net/

快速開始

```bash
git clone https://github.com/dofy/KanaSyllabaryMemory.git
cd KanaSyllabaryMemory
pnpm install
pnpm dev
```

生成社群預覽圖（若需要 PNG/WebP 版本）

```bash
# 安裝轉圖工具（本地執行）
pnpm add -D sharp

# 轉換 public/images/*.svg -> PNG + WebP
node scripts/convert-images.js
```

建置

```bash
pnpm build
pnpm preview
```

主要技術

- Vite + React + TypeScript
- Tailwind CSS
- IndexedDB（進度儲存）

貢獻

歡迎 Issue / PR。授權：GPL-3.0

鍵盤快捷鍵（常用）

- `Enter`: 開始學習
- `Space` / `N` / `→`: 下一個
- `←`: 上一個（學習模式）
- `H`: 顯示/隱藏提示
- `P` / `V`: 播放發音
- `X`: 標記「還不會」（學習方案學習頁）
- `Y`: 標記「已掌握」（學習方案學習頁）

社群預覽圖

1. 我在 `public/images/` 生成了 SVG 佔位圖（`og-image.svg`, `twitter-card.svg`），並提供 `scripts/convert-images.js` 轉成 PNG/WebP（建議在本機執行以產生最終 PNG）。
2. 若你需要我直接把 PNG 放入 repo，我也可以（但建議在本機用 `sharp` 產生以保證品質）。
