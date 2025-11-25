# 数据结构规范

## 概述

本项目中所有JSON数据文件采用统一的命名规范，确保代码的一致性和可维护性。

## 命名规范

### 统一字段命名

所有数据文件使用以下统一的字段名：

| 字段名 | 说明 | 使用位置 |
|--------|------|----------|
| `id` | 唯一标识符 | 所有数据 |
| `hiragana` | 平假名 | 假名、单词 |
| `katakana` | 片假名 | 假名、单词 |
| `romaji` | 罗马音 | 假名、句子 |
| `kanji` | 汉字 | 单词 |
| `chinese` | 中文释义/翻译 | 单词、句子 |
| `japanese` | 日语句子 | 句子 |
| `type` | 类型标识 | 假名、句子 |
| `category` | 分类标识 | 句子 |

## 数据文件结构

### 1. 假名数据 (`public/dict/kana.json`)

**纯数据，不包含UI状态**

```json
{
  "seion": [
    {
      "id": "a",
      "hiragana": "あ",
      "katakana": "ア",
      "romaji": "a",
      "type": "seion"
    }
  ],
  "dakuon": [...],
  "yoon": [...]
}
```

**字段说明：**
- `id`: 假名的唯一标识（如 "a", "ka", "kya"）
- `hiragana`: 平假名字符
- `katakana`: 片假名字符
- `romaji`: 罗马音（如 "a", "ka", "kya"）
- `type`: 假名类型（"seion" | "dakuon" | "yoon"）

**移除的字段（现在由代码动态添加）：**
- ~~`fyType`~~ - 通过 JSON 结构分组已表达，无需重复存储
- ~~`selected`~~ - UI状态，不应在数据文件中
- ~~`labels`~~ - UI状态，不应在数据文件中
- ~~`displayText`~~ - 已统一为 `hiragana`
- ~~`displayText2`~~ - 已统一为 `katakana`
- ~~`remind`~~ - 已统一为 `romaji`

### 2. 单词数据 (`public/dict/words.json`)

```json
{
  "a": [
    {
      "hiragana": "あい①",
      "katakana": "アイ①",
      "kanji": "愛",
      "chinese": "爱，爱情"
    }
  ],
  "ka": [...],
  ...
}
```

**字段说明：**
- `hiragana`: 平假名拼写（含声调标记）
- `katakana`: 片假名拼写（含声调标记）
- `kanji`: 汉字写法
- `chinese`: 中文释义（多个释义用逗号分隔）

**说明：**
- 按假名行（a, ka, sa, ta等）分组
- 声调标记：①②③④⑤⑥⑦⑧⑨⓪
- 多个声调标记表示多种可能的读音（如"②⓪"）

### 3. 句子数据 (`public/dict/phrases.json`)

```json
{
  "daily": [
    {
      "id": "daily_001",
      "japanese": "おはようございます",
      "romaji": "ohayou gozaimasu",
      "chinese": "早上好",
      "category": "daily"
    }
  ],
  "travel": [...],
  ...
}
```

**字段说明：**
- `id`: 句子的唯一标识
- `japanese`: 日语句子（可含汉字）
- `romaji`: 罗马音拼写
- `chinese`: 中文翻译
- `category`: 所属分类（"daily" | "travel" | "dining" 等）

## TypeScript 类型定义

### 数据接口（JSON结构）

```typescript
// 假名数据项（JSON中的结构）
export interface KanaItem {
  id: string
  hiragana: string
  katakana: string
  romaji: string
  type: string
}

// 单词数据项
export interface WordObject {
  hiragana: string
  katakana: string
  kanji: string
  chinese: string
}

// 句子数据项
export interface PhraseObject {
  id: string
  japanese: string
  romaji: string
  chinese: string
  category: string
}
```

### UI 接口（包含状态）

```typescript
// 假名对象（带UI状态，用于组件）
export interface MemoObject extends KanaItem {
  fyType: FYType           // 从type计算得出
  selected: boolean        // UI状态：是否选中
  labels: string[]         // UI状态：自定义标签
  displayText: string      // 向后兼容：等同于 hiragana
  displayText2: string     // 向后兼容：等同于 katakana
  remind: string           // 向后兼容：等同于 romaji
}
```

## 数据加载流程

### DataLoader 职责

`DataLoader` 类负责：
1. 从 JSON 文件加载纯数据
2. 将纯数据转换为包含 UI 状态的对象
3. 缓存数据以提升性能

```typescript
// 加载假名数据时，自动添加UI状态
static async loadKanaData(): Promise<MemoObject[]> {
  const data: KanaDataJson = await fetch("/dict/kana.json").then(r => r.json());
  
  return [
    ...data.seion.map(item => ({
      ...item,
      fyType: 0,              // 清音
      selected: true,         // 默认选中
      labels: [],             // 空标签
      displayText: item.hiragana,    // 向后兼容
      displayText2: item.katakana,   // 向后兼容
      remind: item.romaji            // 向后兼容
    })),
    ...data.dakuon.map(item => ({ ...item, fyType: 1, selected: false, ... })),
    ...data.yoon.map(item => ({ ...item, fyType: 2, selected: false, ... }))
  ];
}
```

## 设计原则

### 1. 数据与状态分离

- **JSON 文件**：只包含纯数据，不包含 UI 状态
- **代码层**：在 `DataLoader` 中添加 UI 状态

**优点：**
- JSON 数据更简洁，易于维护
- UI 状态可以灵活调整，不影响数据文件
- 数据文件可以被其他工具复用

### 2. 命名一致性

- 所有数据使用统一的字段名
- 避免混用 `displayText`/`hiragana` 等不同名称
- 新增数据类型时遵循现有命名规范

### 3. 向后兼容

- `MemoObject` 保留旧字段名作为别名
- 组件可以继续使用 `displayText`、`displayText2`、`remind`
- 逐步迁移到新字段名（`hiragana`、`katakana`、`romaji`）

## 扩展指南

### 添加新的假名

编辑 `public/dict/kana.json`，在相应分组中添加：

```json
{
  "id": "new_kana",
  "hiragana": "新",
  "katakana": "新",
  "romaji": "shin",
  "type": "seion"
}
```

### 添加新的单词

编辑 `public/dict/words.json`，在相应假名行中添加：

```json
{
  "hiragana": "しんぶん⓪",
  "katakana": "シンブン⓪",
  "kanji": "新聞",
  "chinese": "报纸"
}
```

### 添加新的句子分类

编辑 `public/dict/phrases.json`，添加新分类：

```json
{
  "shopping": [
    {
      "id": "shopping_001",
      "japanese": "いくらですか",
      "romaji": "ikura desu ka",
      "chinese": "多少钱？",
      "category": "shopping"
    }
  ]
}
```

## 版本历史

### v2.1.0 (2025-11-25)

- ✅ 统一所有数据的字段命名规范
- ✅ 从 JSON 移除 UI 状态字段（`selected`, `labels`, `fyType`）
- ✅ 重命名字段：`displayText` → `hiragana`、`displayText2` → `katakana`、`remind` → `romaji`
- ✅ 保持向后兼容性，组件中保留旧字段名作为别名
- ✅ 更新 `DataLoader` 在加载时动态添加 UI 状态

### v2.0.0 (2025-11-24)

- 初始版本，创建 JSON 数据文件

