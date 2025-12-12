import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ProgressService } from "@/lib/progress-service";
import { BadgeManager } from "@/lib/badge-manager";
import type { BadgeDefinition } from "@/lib/db-types";

interface CheckInStats {
  kanaCount: number;
  wordCount: number;
  phraseCount: number;
  totalTime: number;
}

interface UseCheckInReturn {
  checkIn: (stats: CheckInStats) => Promise<void>;
  unlockedBadge: BadgeDefinition | null;
  showBadgeDialog: boolean;
  closeBadgeDialog: () => void;
  isCheckedInToday: boolean;
  checkTodayStatus: () => Promise<boolean>;
}

export function useCheckIn(): UseCheckInReturn {
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeDefinition | null>(null);
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const badgeQueueRef = useRef<BadgeDefinition[]>([]);

  // Subscribe to badge unlock events from BadgeManager
  useEffect(() => {
    const unsubscribe = BadgeManager.onBadgeUnlock((badge) => {
      // Queue badge for display
      badgeQueueRef.current.push(badge);

      // If no dialog is showing, show the first one
      if (!showBadgeDialog) {
        const nextBadge = badgeQueueRef.current.shift();
        if (nextBadge) {
          setTimeout(() => {
            setUnlockedBadge(nextBadge);
            setShowBadgeDialog(true);
          }, 500);
        }
      }
    });

    return unsubscribe;
  }, [showBadgeDialog]);

  const checkTodayStatus = useCallback(async (): Promise<boolean> => {
    const todayCheckIn = await ProgressService.getTodayCheckIn();
    const checked = !!todayCheckIn;
    setIsCheckedInToday(checked);
    return checked;
  }, []);

  const checkIn = useCallback(async (stats: CheckInStats) => {
    // Check if already checked in today
    const alreadyCheckedIn = await checkTodayStatus();

    // Perform check-in (will trigger BadgeManager.emit internally)
    await ProgressService.checkIn(stats);

    // Show toast only for first check-in of the day
    if (!alreadyCheckedIn) {
      toast.success("✅ 今日打卡成功！", {
        description: `學習了 ${stats.kanaCount + stats.wordCount + stats.phraseCount} 個項目`,
      });
      setIsCheckedInToday(true);
    }
  }, [checkTodayStatus]);

  const closeBadgeDialog = useCallback(() => {
    setShowBadgeDialog(false);
    setUnlockedBadge(null);

    // Show next badge in queue if any
    const nextBadge = badgeQueueRef.current.shift();
    if (nextBadge) {
      setTimeout(() => {
        setUnlockedBadge(nextBadge);
        setShowBadgeDialog(true);
      }, 300);
    }
  }, []);

  return {
    checkIn,
    unlockedBadge,
    showBadgeDialog,
    closeBadgeDialog,
    isCheckedInToday,
    checkTodayStatus,
  };
}

