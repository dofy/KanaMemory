// Database-related type definitions

// ========== User Settings ==========
export interface UserSettings {
  key: string;
  value: unknown;
  updatedAt: number;
}

// ========== Learning Progress ==========
export interface LearningProgress {
  id: string; // `${type}_${itemId}`
  type: "kana" | "word" | "phrase";
  itemId: string;
  correctCount: number;
  wrongCount: number;
  masteryLevel: number; // 0-5 proficiency level
  lastPracticed: number;
  createdAt: number;
}

// ========== Check-in ==========
export interface CheckInRecord {
  date: string; // YYYY-MM-DD
  timestamp: number;
  stats: {
    kanaCount: number;
    wordCount: number;
    phraseCount: number;
    totalTime: number; // seconds
  };
}

// ========== Badges ==========
export type BadgeType = "streak" | "mastery" | "milestone" | "special";

export type BadgeConditionType =
  | "check_in_streak"
  | "total_check_in"
  | "mastery_count"
  | "plan_complete"
  | "item_count"
  | "perfect_test";

export interface BadgeCondition {
  type: BadgeConditionType;
  value: number;
  itemType?: "kana" | "word" | "phrase";
}

export interface BadgeGuide {
  text: string;      // Hint text
  action: string;    // Button text
  link: string;      // Navigation link
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: BadgeType;
  condition: BadgeCondition;
  guide?: BadgeGuide;
  secret?: boolean;
}

export interface Badge {
  id: string;
  type: BadgeType;
  unlockedAt: number;
  metadata: Record<string, unknown>;
}

// ========== Test Records ==========
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
  duration: number;
  details: TestRecordDetail[];
}

// ========== Study Plans ==========
export interface StudyStage {
  id: string;
  name: string;
  type: "kana" | "word" | "phrase";
  targetItems?: string[]; // Item IDs for kana
  category?: string; // Category for phrases
  targetCount?: number; // Target count for words/phrases
  requiredMastery: number; // 1-5
  completed: boolean;
}

export interface StudyPlanDefinition {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedDays: number;
  stages: Omit<StudyStage, "completed">[];
}

export interface StudyPlan {
  id: string;
  planId: string; // Reference to StudyPlanDefinition
  name: string;
  currentStage: number;
  stages: StudyStage[];
  startedAt: number;
  completedAt?: number;
}

// ========== Dictionary Data ==========
export interface DictKanaItem {
  hiragana: string;
  katakana: string;
  romaji: string;
  type: "seion" | "dakuon" | "yoon";
}

export interface DictWordItem {
  id: string;
  hiragana: string;
  japanese: string;
  romaji: string;
  chinese: string;
  pitch: string;
}

export interface DictPhraseItem {
  id: string;
  category: string;
  japanese: string;
  hiragana: string;
  romaji: string;
  chinese: string;
}

export interface DataVersion {
  key: string;
  version: string;
  updatedAt: number;
}
