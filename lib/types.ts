export enum FYType {
  seion = 0,   // 清音 (Seion)
  dakuon = 1,  // 浊音 (Dakuon)
  yoon = 2,    // 拗音 (Yoon)
}

export enum LearningType {
  kana = "kana",       // 假名学习
  word = "word",       // 单词学习
  phrase = "phrase",   // 句子学习
}

// Learning mode for practice
export enum PracticeMode {
  learning = "learning",   // 学习模式：自动显示提示和发音
  memory = "memory",       // 记忆模式：手动控制提示和发音
}

// Kana data interface for JSON structure (pure data)
export interface KanaItem {
  hiragana: string         // 平假名 (Hiragana)
  katakana: string         // 片假名 (Katakana)
  romaji: string           // 罗马音 (Romaji)
}

// Extended interface with UI state (used in components)
export interface MemoObject extends KanaItem {
  fyType: FYType           // Computed from category
  selected: boolean        // UI state: whether selected
  labels: string[]         // UI state: custom labels
  displayText: string      // Alias for hiragana (backward compatibility)
  displayText2: string     // Alias for katakana (backward compatibility)
  remind: string           // Alias for romaji (backward compatibility)
}

// Word data interface for JSON structure (pure data)
export interface WordItem {
  hiragana: string        // 平假名 (纯假名，不含声调)
  katakana: string        // 片假名 (纯假名，不含声调)
  romaji: string          // 罗马音
  kanji: string           // 汉字
  chinese: string         // 中文释义
  pitch: string           // 声调标记 (①②③④⑤⑥⑦⑧⑨⓪或组合)
}

// Extended interface with UI state
export interface WordObject extends WordItem {
  selected: boolean       // UI state: whether selected
}

// Phrase data interface for JSON structure (pure data)
export interface PhraseItem {
  japanese: string        // 日语句子（原始形式，含汉字）
  romaji: string          // 罗马音
  chinese: string         // 中文翻译
  category: string        // 分类 (greeting, daily, travel, dining)
}

// Extended interface with UI state
export interface PhraseObject extends PhraseItem {
  selected: boolean       // UI state: whether selected
}

export interface KanaDataJson {
  seion: KanaItem[]
  dakuon: KanaItem[]
  yoon: KanaItem[]
}

// Words data is now a flat array
export type WordsData = WordObject[]

export interface PhrasesData {
  [category: string]: PhraseObject[]  // category: greeting, daily, travel, dining
}

// Display modes for kana learning
export type DisplayMode = "mixed" | "hiragana" | "katakana" | "romaji" | "swap"

// Unified display mode for words and phrases
export type UnifiedDisplayMode = "mixed" | "kana" | "romaji"

