import type { BadgeDefinition } from "./db-types";

let badgesCache: BadgeDefinition[] | null = null;

// Default badges for fallback
const DEFAULT_BADGES: BadgeDefinition[] = [
  {
    id: "first_step",
    name: "第一步",
    description: "完成第一次学习打卡",
    icon: "🎯",
    type: "milestone",
    condition: { type: "total_check_in", value: 1 },
    guide: { text: "完成任意学习后自动打卡", action: "去学习假名", link: "/kana" },
  },
  {
    id: "week_warrior",
    name: "周末战士",
    description: "连续打卡7天",
    icon: "🔥",
    type: "streak",
    condition: { type: "check_in_streak", value: 7 },
    guide: { text: "每天学习一次即可打卡", action: "开始今日学习", link: "/" },
  },
  {
    id: "kana_master",
    name: "假名达人",
    description: "掌握全部104个假名（熟练度≥3）",
    icon: "🏆",
    type: "mastery",
    condition: { type: "mastery_count", value: 104, itemType: "kana" },
    guide: { text: "在学习方案中反复练习假名提高熟练度", action: "开始五十音速成", link: "/study-plans" },
  },
  {
    id: "vocabulary_100",
    name: "词汇新星",
    description: "学习100个单词",
    icon: "⭐",
    type: "milestone",
    condition: { type: "item_count", value: 100, itemType: "word" },
    guide: { text: "在单词学习中选择假名范围开始学习", action: "去学习单词", link: "/words" },
  },
  {
    id: "plan_complete",
    name: "计划通",
    description: "完成一个学习方案",
    icon: "📜",
    type: "milestone",
    condition: { type: "plan_complete", value: 1 },
    guide: { text: "选择一个学习方案并完成所有阶段", action: "查看学习方案", link: "/study-plans" },
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
