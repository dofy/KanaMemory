import { db } from "./db";
import type { BadgeCondition, Badge, BadgeDefinition } from "./db-types";
import { loadBadgeDefinitions } from "./badge-definitions";

type BadgeEventType =
  | "practice:recorded"
  | "checkin:completed"
  | "plan:updated"
  | "plan:completed";

interface BadgeEvent {
  type: BadgeEventType;
  data?: any;
}

type BadgeUnlockCallback = (badge: BadgeDefinition) => void;

class BadgeManagerClass {
  private listeners: Set<BadgeUnlockCallback> = new Set();
  private checkingLock = false;
  private pendingCheck = false;

  // Subscribe to badge unlock events
  onBadgeUnlock(callback: BadgeUnlockCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Emit event and trigger badge check
  async emit(event: BadgeEvent): Promise<void> {
    // Debounce: if already checking, mark pending
    if (this.checkingLock) {
      this.pendingCheck = true;
      return;
    }

    await this.checkBadges();
  }

  // Check all badges and notify listeners
  private async checkBadges(): Promise<void> {
    this.checkingLock = true;

    try {
      const newlyUnlocked = await this.checkAndUnlockBadges();

      // Notify listeners for each newly unlocked badge
      if (newlyUnlocked.length > 0) {
        const definitions = await loadBadgeDefinitions();
        for (const badgeId of newlyUnlocked) {
          const def = definitions.find((d) => d.id === badgeId);
          if (def) {
            this.listeners.forEach((cb) => cb(def));
          }
        }
      }
    } finally {
      this.checkingLock = false;

      // If there was a pending check, run it
      if (this.pendingCheck) {
        this.pendingCheck = false;
        await this.checkBadges();
      }
    }
  }

  // Core badge checking logic
  private async checkAndUnlockBadges(): Promise<string[]> {
    const newlyUnlocked: string[] = [];
    const [definitions, existingBadges] = await Promise.all([
      loadBadgeDefinitions(),
      db.badges.toArray(),
    ]);
    const existingIds = new Set(existingBadges.map((b) => b.id));

    for (const def of definitions) {
      if (existingIds.has(def.id)) continue;

      const isUnlocked = await this.checkCondition(def.condition);
      if (isUnlocked) {
        await db.badges.add({
          id: def.id,
          type: def.type,
          unlockedAt: Date.now(),
          metadata: {},
        });
        newlyUnlocked.push(def.id);
      }
    }

    return newlyUnlocked;
  }

  private async checkCondition(condition: BadgeCondition): Promise<boolean> {
    switch (condition.type) {
      case "total_check_in": {
        const count = await db.checkIn.count();
        return count >= condition.value;
      }

      case "check_in_streak": {
        const streak = await this.calculateStreak();
        return streak >= condition.value;
      }

      case "mastery_count": {
        if (!condition.itemType) return false;
        const items = await db.learningProgress
          .where("type")
          .equals(condition.itemType)
          .filter((item) => item.masteryLevel >= 3)
          .count();
        return items >= condition.value;
      }

      case "item_count": {
        if (!condition.itemType) return false;
        const items = await db.learningProgress
          .where("type")
          .equals(condition.itemType)
          .count();
        return items >= condition.value;
      }

      case "plan_complete": {
        const completed = await db.studyPlans
          .filter((p) => p.completedAt !== undefined)
          .count();
        return completed >= condition.value;
      }

      case "perfect_test": {
        const perfectTests = await db.testRecords
          .filter((t) => t.score === t.totalQuestions)
          .count();
        return perfectTests >= condition.value;
      }

      default:
        return false;
    }
  }

  private async calculateStreak(): Promise<number> {
    const records = await db.checkIn.orderBy("date").reverse().toArray();
    if (records.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    let expectedDate = today;

    for (const record of records) {
      if (record.date === expectedDate) {
        streak++;
        const d = new Date(expectedDate);
        d.setDate(d.getDate() - 1);
        expectedDate = d.toISOString().split("T")[0];
      } else if (record.date < expectedDate) {
        break;
      }
    }

    return streak;
  }

  // Public read methods
  async getUnlockedBadges(): Promise<Badge[]> {
    return db.badges.toArray();
  }

  async getStreak(): Promise<number> {
    return this.calculateStreak();
  }
}

// Singleton instance
export const BadgeManager = new BadgeManagerClass();

