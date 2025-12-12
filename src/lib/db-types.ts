// Database-related type definitions

export interface UserSettings {
  key: string;
  value: unknown;
  updatedAt: number;
}

export interface LearningProgress {
  id: string; // `${type}_${itemId}`
  type: "kana" | "word" | "phrase";
  itemId: string; // romaji for kana, unique identifier for words/phrases
  correctCount: number;
  wrongCount: number;
  masteryLevel: number; // 0-5 proficiency level
  lastPracticed: number; // timestamp
  createdAt: number; // timestamp
}

export interface CheckInRecord {
  date: string; // YYYY-MM-DD
  timestamp: number;
  stats: {
    kanaCount: number;
    wordCount: number;
    phraseCount: number;
    totalTime: number; // learning duration in seconds
  };
}

export type BadgeType = "streak" | "mastery" | "milestone";

export interface Badge {
  id: string;
  type: BadgeType;
  unlockedAt: number;
  metadata: Record<string, unknown>;
}

export interface TestRecordDetail {
  itemId: string;
  correct: boolean;
  userAnswer?: string;
}

export interface TestRecord {
  id: string;
  type: "kana" | "word" | "phrase";
  score: number;
  totalQuestions: number;
  timestamp: number;
  duration: number; // test duration in seconds
  details: TestRecordDetail[];
}

// Dictionary data types for IndexedDB storage
export interface DictKanaItem {
  hiragana: string; // Primary key (unique for each kana)
  katakana: string;
  romaji: string;
  type: "seion" | "dakuon" | "yoon";
}

export interface DictWordItem {
  id: string; // Primary key (generated from index)
  hiragana: string;
  japanese: string;
  romaji: string;
  chinese: string;
  pitch: string;
}

export interface DictPhraseItem {
  id: string; // Primary key (generated from category + index)
  category: string;
  japanese: string;
  hiragana: string;
  romaji: string;
  chinese: string;
}

// Data version metadata
export interface DataVersion {
  key: string; // 'kana' | 'words' | 'phrases'
  version: string;
  updatedAt: number;
}
