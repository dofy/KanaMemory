import type { Badge } from "./db-types";
import { BadgeManager } from "./badge-manager";

/**
 * @deprecated Use BadgeManager directly instead.
 * This class is kept for backward compatibility.
 */
export class BadgeService {
  /**
   * @deprecated Use BadgeManager.emit() instead. Badge checking is now event-driven.
   */
  static async checkAndUnlockBadges(): Promise<string[]> {
    // Trigger badge check via manager (returns empty as results come via events)
    await BadgeManager.emit({ type: "practice:recorded" });
    return [];
  }

  static async getUnlockedBadges(): Promise<Badge[]> {
    return BadgeManager.getUnlockedBadges();
  }

  static async getStreak(): Promise<number> {
    return BadgeManager.getStreak();
  }
}
