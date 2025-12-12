import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BadgeService } from "@/lib/badge-service";
import { ProgressService } from "@/lib/progress-service";
import { loadBadgeDefinitions } from "@/lib/badge-definitions";
import { BadgeShowDialog } from "@/components/badge-show-dialog";
import type { Badge, BadgeDefinition } from "@/lib/db-types";
import { Award, Lock, Flame, Trophy, Star, Target, ScrollText, ArrowRight } from "lucide-react";

const BADGE_ICONS: Record<string, React.ReactNode> = {
  first_step: <Target className="h-8 w-8" />,
  week_warrior: <Flame className="h-8 w-8" />,
  kana_master: <Trophy className="h-8 w-8" />,
  vocabulary_100: <Star className="h-8 w-8" />,
  plan_complete: <ScrollText className="h-8 w-8" />,
};

export default function BadgesPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [badgeDefinitions, setBadgeDefinitions] = useState<BadgeDefinition[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [selectedBadgeDate, setSelectedBadgeDate] = useState<string>("");
  const [showDialog, setShowDialog] = useState(false);
  const [stats, setStats] = useState<{
    kana: { total: number; mastered: number };
    words: { total: number; mastered: number };
    phrases: { total: number; mastered: number };
    checkIns: number;
    badges: number;
    streak: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    const [definitions, badges, statsData] = await Promise.all([
      loadBadgeDefinitions(),
      BadgeService.getUnlockedBadges(),
      ProgressService.getStats(),
    ]);
    setBadgeDefinitions(definitions);
    setUnlockedBadges(badges);
    setStats(statsData);
  };

  const isUnlocked = (badgeId: string) => {
    return unlockedBadges.some((b) => b.id === badgeId);
  };

  const getUnlockDate = (badgeId: string) => {
    const badge = unlockedBadges.find((b) => b.id === badgeId);
    if (!badge) return null;
    return new Date(badge.unlockedAt).toLocaleDateString("zh-TW");
  };

  const handleBadgeClick = (def: BadgeDefinition) => {
    const unlockDate = getUnlockDate(def.id);
    if (unlockDate) {
      setSelectedBadge(def);
      setSelectedBadgeDate(unlockDate);
      setShowDialog(true);
    }
  };

  const getBadgeProgress = (def: BadgeDefinition): number => {
    if (!stats) return 0;

    switch (def.condition.type) {
      case "total_check_in":
        return Math.min(100, (stats.checkIns / def.condition.value) * 100);
      case "check_in_streak":
        return Math.min(100, (stats.streak / def.condition.value) * 100);
      case "mastery_count":
        if (def.condition.itemType === "kana") {
          return Math.min(100, (stats.kana.mastered / def.condition.value) * 100);
        }
        return 0;
      case "item_count":
        if (def.condition.itemType === "word") {
          return Math.min(100, (stats.words.total / def.condition.value) * 100);
        }
        return 0;
      case "plan_complete":
        return 0;
      default:
        return 0;
    }
  };

  const getProgressText = (def: BadgeDefinition): string => {
    if (!stats) return "";

    switch (def.condition.type) {
      case "total_check_in":
        return `${stats.checkIns} / ${def.condition.value} 天`;
      case "check_in_streak":
        return `${stats.streak} / ${def.condition.value} 天連續`;
      case "mastery_count":
        if (def.condition.itemType === "kana") {
          return `${stats.kana.mastered} / ${def.condition.value} 個`;
        }
        return "";
      case "item_count":
        if (def.condition.itemType === "word") {
          return `${stats.words.total} / ${def.condition.value} 個`;
        }
        return "";
      default:
        return "";
    }
  };

  if (!mounted) return null;

  const unlockedCount = unlockedBadges.length;
  const totalCount = badgeDefinitions.length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      <Navigation showBackButton />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Award className="h-16 w-16 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2">成就勳章</h2>
          <p className="text-muted-foreground">
            已解鎖 {unlockedCount} / {totalCount} 個勳章
          </p>
          <div className="max-w-xs mx-auto mt-4">
            <Progress value={totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0} />
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
            <Card className="transition-all hover:shadow-lg">
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold">{stats.streak}</p>
                <p className="text-sm text-muted-foreground">連續打卡</p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-lg">
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold">{stats.checkIns}</p>
                <p className="text-sm text-muted-foreground">總打卡天數</p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-lg">
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold">{stats.kana.mastered}</p>
                <p className="text-sm text-muted-foreground">掌握假名</p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-lg">
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold">{stats.words.total}</p>
                <p className="text-sm text-muted-foreground">學習單詞</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {badgeDefinitions.map((def) => {
            const unlocked = isUnlocked(def.id);
            const unlockDate = getUnlockDate(def.id);
            const progress = getBadgeProgress(def);
            const progressText = getProgressText(def);

            return (
              <Card
                key={def.id}
                className={`transition-all ${
                  unlocked
                    ? "border-yellow-500/50 bg-yellow-500/5 cursor-pointer hover:shadow-lg hover:shadow-yellow-500/20"
                    : "opacity-80 hover:opacity-100"
                }`}
                onClick={() => unlocked && handleBadgeClick(def)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        unlocked
                          ? "bg-yellow-500/20 text-yellow-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {unlocked ? (
                        BADGE_ICONS[def.id] || <Award className="h-8 w-8" />
                      ) : (
                        <Lock className="h-8 w-8" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-2xl">{def.icon}</span>
                        {def.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {def.description}
                  </p>

                  {unlocked ? (
                    <p className="text-xs text-green-600">
                      ✓ 於 {unlockDate} 解鎖 · 點擊查看
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>進度</span>
                          <span>{progressText || `${Math.round(progress)}%`}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Guide */}
                      {def.guide && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">
                            💡 {def.guide.text}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => navigate(def.guide!.link)}
                          >
                            {def.guide.action}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer />

      <BadgeShowDialog
        badge={selectedBadge}
        unlockDate={selectedBadgeDate}
        open={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </div>
  );
}
