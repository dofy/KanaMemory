import { db, type LearningProgress, type StudyPlan } from "./db";
import type { StudyPlanDefinition, StudyStage } from "./db-types";
import { BadgeManager } from "./badge-manager";

export class ProgressService {
  // Record a practice result and update mastery level
  static async recordPractice(
    type: "kana" | "word" | "phrase",
    itemId: string,
    correct: boolean
  ): Promise<LearningProgress> {
    const id = `${type}_${itemId}`;
    const existing = await db.learningProgress.get(id);
    const now = Date.now();

    let progress: LearningProgress;

    if (existing) {
      const correctCount = existing.correctCount + (correct ? 1 : 0);
      const wrongCount = existing.wrongCount + (correct ? 0 : 1);
      const total = correctCount + wrongCount;
      const accuracy = correctCount / total;

      // Mastery calculation: accuracy * practice count factor (max at 10 practices)
      const practiceFactor = Math.min(total, 10) / 10;
      const masteryLevel = Math.min(5, Math.floor(accuracy * 5 * practiceFactor));

      progress = {
        ...existing,
        correctCount,
        wrongCount,
        masteryLevel,
        lastPracticed: now,
      };

      await db.learningProgress.put(progress);
    } else {
      progress = {
        id,
        type,
        itemId,
        correctCount: correct ? 1 : 0,
        wrongCount: correct ? 0 : 1,
        masteryLevel: correct ? 1 : 0,
        lastPracticed: now,
        createdAt: now,
      };

      await db.learningProgress.add(progress);
    }

    // Emit event for badge manager
    BadgeManager.emit({ type: "practice:recorded", data: { type, itemId, correct } });

    return progress;
  }

  // Daily check-in
  static async checkIn(stats: {
    kanaCount: number;
    wordCount: number;
    phraseCount: number;
    totalTime: number;
  }): Promise<void> {
    const today = new Date().toISOString().split("T")[0];

    await db.checkIn.put({
      date: today,
      timestamp: Date.now(),
      stats,
    });

    // Emit event for badge manager
    BadgeManager.emit({ type: "checkin:completed", data: stats });
  }

  // Get today's check-in status
  static async getTodayCheckIn() {
    const today = new Date().toISOString().split("T")[0];
    return db.checkIn.get(today);
  }

  // Get learning stats
  static async getStats() {
    const [kanaProgress, wordProgress, phraseProgress, checkIns, badges] =
      await Promise.all([
        db.learningProgress.where("type").equals("kana").toArray(),
        db.learningProgress.where("type").equals("word").toArray(),
        db.learningProgress.where("type").equals("phrase").toArray(),
        db.checkIn.count(),
        db.badges.count(),
      ]);

    const kanaMastered = kanaProgress.filter((p) => p.masteryLevel >= 3).length;
    const wordsMastered = wordProgress.filter((p) => p.masteryLevel >= 3).length;
    const phrasesMastered = phraseProgress.filter((p) => p.masteryLevel >= 3).length;

    return {
      kana: { total: kanaProgress.length, mastered: kanaMastered },
      words: { total: wordProgress.length, mastered: wordsMastered },
      phrases: { total: phraseProgress.length, mastered: phrasesMastered },
      checkIns,
      badges,
      streak: await BadgeManager.getStreak(),
    };
  }

  // Start a study plan
  static async startPlan(definition: StudyPlanDefinition): Promise<StudyPlan> {
    const now = Date.now();
    const plan: StudyPlan = {
      id: `plan_${now}`,
      planId: definition.id,
      name: definition.name,
      currentStage: 0,
      stages: definition.stages.map((s) => ({ ...s, completed: false })),
      startedAt: now,
    };

    await db.studyPlans.add(plan);
    return plan;
  }

  // Update plan progress
  static async updatePlanProgress(
    planId: string,
    stageIndex: number,
    completed: boolean
  ): Promise<StudyPlan | undefined> {
    const plan = await db.studyPlans.get(planId);
    if (!plan) return undefined;

    plan.stages[stageIndex].completed = completed;

    // Check if all stages completed
    const allCompleted = plan.stages.every((s) => s.completed);
    if (allCompleted) {
      plan.completedAt = Date.now();
    }

    // Move to next uncompleted stage
    if (completed) {
      const nextIndex = plan.stages.findIndex(
        (s, i) => i > stageIndex && !s.completed
      );
      plan.currentStage = nextIndex >= 0 ? nextIndex : plan.stages.length;
    }

    await db.studyPlans.put(plan);

    // Emit event for badge manager
    if (allCompleted) {
      BadgeManager.emit({ type: "plan:completed", data: { planId } });
    } else {
      BadgeManager.emit({ type: "plan:updated", data: { planId, stageIndex } });
    }

    return plan;
  }

  // Get active plans
  static async getActivePlans(): Promise<StudyPlan[]> {
    return db.studyPlans.filter((p) => !p.completedAt).toArray();
  }

  // Get completed plans
  static async getCompletedPlans(): Promise<StudyPlan[]> {
    return db.studyPlans.filter((p) => p.completedAt !== undefined).toArray();
  }

  // Check if stage requirements are met
  static async checkStageProgress(stage: StudyStage): Promise<{
    current: number;
    required: number;
    completed: boolean;
  }> {
    let targetItems: string[] = [];

    if (stage.targetItems) {
      targetItems = stage.targetItems;
    } else if (stage.category && stage.targetCount) {
      // For phrase stages, get items from category
      const phrases = await db.phrases
        .where("category")
        .equals(stage.category)
        .limit(stage.targetCount)
        .toArray();
      targetItems = phrases.map((p) => p.id);
    }

    const masteredCount = await db.learningProgress
      .where("type")
      .equals(stage.type)
      .filter(
        (p) =>
          targetItems.includes(p.itemId) &&
          p.masteryLevel >= stage.requiredMastery
      )
      .count();

    return {
      current: masteredCount,
      required: targetItems.length,
      completed: masteredCount >= targetItems.length,
    };
  }
}

