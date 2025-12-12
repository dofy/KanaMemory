export enum FYType {
  seion = 0,   // Seion (清音)
  dakuon = 1,  // Dakuon (濁音)
  yoon = 2,    // Yoon (拗音)
}

export enum LearningType {
  kana = "kana",       // Kana learning
  word = "word",       // Word learning
  phrase = "phrase",   // Phrase learning
}

// Learning mode for practice
export enum PracticeMode {
  learning = "learning",   // Learning mode: auto show hints and pronunciation
  memory = "memory",       // Memory mode: manual control hints and pronunciation
}

// Kana data interface for JSON structure (pure data)
export interface KanaItem {
  hiragana: string         // Hiragana (平假名)
  katakana: string         // Katakana (片假名)
  romaji: string           // Romaji
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
  hiragana: string        // Hiragana (without pitch)
  japanese: string        // Japanese (with kanji)
  romaji: string          // Romaji
  chinese: string         // Chinese translation
  pitch: string           // Pitch accent mark
}

// Extended interface with UI state
export interface WordObject extends WordItem {
  selected: boolean       // UI state: whether selected
}

// Phrase data interface for JSON structure (pure data)
export interface PhraseItem {
  japanese: string        // Japanese sentence (with kanji)
  hiragana: string        // Hiragana form
  romaji: string          // Romaji
  chinese: string         // Chinese translation
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
export type UnifiedDisplayMode = "mixed" | "kana" | "japanese"
