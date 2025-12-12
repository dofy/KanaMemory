import type { BadgeDefinition } from "./db-types";

let badgesCache: BadgeDefinition[] | null = null;

// Default badges for fallback (Traditional Chinese)
const DEFAULT_BADGES: BadgeDefinition[] = [
  {
    id: "first_step",
    name: "第一步",
    description: "完成第一次學習打卡",
    icon: "🎯",
    type: "milestone",
    condition: { type: "total_check_in", value: 1 },
    guide: { text: "完成任意學習後自動打卡", action: "去學習假名", link: "/kana" },
  },
  {
    id: "week_warrior",
    name: "週末戰士",
    description: "連續打卡7天",
    icon: "🔥",
    type: "streak",
    condition: { type: "check_in_streak", value: 7 },
    guide: { text: "每天學習一次即可打卡", action: "開始今日學習", link: "/" },
  },
  {
    id: "kana_master",
    name: "假名達人",
    description: "掌握全部104個假名（熟練度≥3）",
    icon: "🏆",
    type: "mastery",
    condition: { type: "mastery_count", value: 104, itemType: "kana" },
    guide: { text: "在學習方案中反覆練習假名提高熟練度", action: "開始五十音速成", link: "/study-plans" },
  },
  {
    id: "vocabulary_100",
    name: "詞彙新星",
    description: "學習100個單詞",
    icon: "⭐",
    type: "milestone",
    condition: { type: "item_count", value: 100, itemType: "word" },
    guide: { text: "在單詞學習中選擇假名範圍開始學習", action: "去學習單詞", link: "/words" },
  },
  {
    id: "plan_complete",
    name: "計劃通",
    description: "完成一個學習方案",
    icon: "📜",
    type: "milestone",
    condition: { type: "plan_complete", value: 1 },
    guide: { text: "選擇一個學習方案並完成所有階段", action: "查看學習方案", link: "/study-plans" },
  },
];

export async function loadBadgeDefinitions(): Promise<BadgeDefinition[]> {
  if (badgesCache) {
    return badgesCache;
  }

  try {
    const response = await fetch("/dict/badges.json");
    if (!response.ok) {
      throw new Error(`Failed to load badges: ${response.statusText}`);
    }
    badgesCache = await response.json();
    return badgesCache!;
  } catch (error) {
    console.error("Error loading badges, using defaults:", error);
    badgesCache = DEFAULT_BADGES;
    return badgesCache;
  }
}

export function getBadgeDefinition(
  badges: BadgeDefinition[],
  id: string
): BadgeDefinition | undefined {
  return badges.find((b) => b.id === id);
}

export function clearBadgesCache(): void {
  badgesCache = null;
}

// For synchronous access (after loading)
export { DEFAULT_BADGES as BADGE_DEFINITIONS };
