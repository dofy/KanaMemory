# 假名記憶 Kana Memory

一個優雅的日語假名學習 Web 應用，支持平假名、片假名和羅馬音練習。

🌐 **在線體驗**: [kana.yahaha.net](https://kana.yahaha.net/)

## ✨ 主要功能

- **完整假名支持** - 清音 46 個、濁音 25 個、拗音 33 個（共 104 個）
- **多種顯示模式** - 混合 / 平假名 / 片假名 / 羅馬音 / 互換
- **雙重練習模式** - 學習模式（自動提示）/ 記憶模式（手動提示）
- **智能 TTS 發音** - 基於 Web Speech API 的免費日語朗讀
- **自動發音選項** - 學習模式下可開啟自動朗讀
- **鍵盤快捷鍵** - 支持快捷鍵操作，提升學習效率
- **主題模式** - 亮色 / 暗色 / 跟隨系統
- **響應式設計** - 完美適配手機、平板、桌面
- **數據持久化** - 自動保存所有學習偏好

## 🚀 快速开始

### 本地运行

```bash
# 克隆项目
git clone https://github.com/dofy/KanaSyllabaryMemory.git
cd KanaSyllabaryMemory

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 浏览器访问 http://localhost:3000
```

### 构建部署

```bash
# 构建生产版本
pnpm build

# 静态导出（用于 GitHub Pages）
pnpm export
```

## ⌨️ 鍵盤快捷鍵

| 快捷鍵    | 功能          |
| --------- | ------------- |
| `S`       | 開關設置      |
| `Space`   | 下一個假名    |
| `H` / `?` | 顯示/隱藏提示 |
| `P` / `V` | 播放發音      |

## 📖 使用說明

1. 點擊「設置」選擇要練習的假名和模式
2. 點擊「開始」開始練習
3. 學習模式：自動顯示提示和發音
4. 記憶模式：按 `H` 查看提示，按 `P` 播放發音
5. 按 `Space` 或點擊「下一個」繼續

## 💡 學習建議

- **初學者**: 從清音開始，使用學習模式 + 自動發音
- **進階者**: 使用記憶模式 + 互換模式，強化記憶
- **熟練者**: 使用羅馬音模式進行反向練習

## 🛠️ 技術棧

- **框架**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **語音**: Web Speech API
- **語言**: TypeScript
- **部署**: Vercel / GitHub Pages

## 📄 許可證

MIT License

---

Made with ❤️ by [Seven Yu](https://yahaha.net) | ⭐️ Star 支持一下！
