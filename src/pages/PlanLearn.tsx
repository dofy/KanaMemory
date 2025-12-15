import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Volume2,
  RotateCcw,
} from "lucide-react";
import { db, type StudyPlan } from "@/lib/db";
import { ProgressService } from "@/lib/progress-service";
import { DataLoader } from "@/lib/data-loader";
import type { StudyStage } from "@/lib/db-types";
import { toast } from "sonner";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useCheckIn } from "@/hooks/use-checkin";
import { BadgeUnlockDialog } from "@/components/badge-unlock-dialog";

interface LearnItem {
  id: string;
  primary: string;
  secondary: string;
  reading: string;
}

interface ProgressStats {
  learned: number;
  mastered: number;
}

export default function PlanLearnPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [currentStage, setCurrentStage] = useState<StudyStage | null>(null);
  const [items, setItems] = useState<LearnItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    learned: 0,
    mastered: 0,
  });
  const [loading, setLoading] = useState(true);
  const learnedCountRef = useRef(0);
  const { checkIn, unlockedBadge, showBadgeDialog, closeBadgeDialog } =
    useCheckIn();

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    if (!planId) return;

    const planData = await db.studyPlans.get(planId);
    if (!planData) {
      toast.error("未找到學習方案");
      navigate("/study-plans");
      return;
    }

    setPlan(planData);
    const stage = planData.stages[planData.currentStage];
    setCurrentStage(stage);

    if (stage) {
      await loadStageItems(stage);
    }

    setLoading(false);
  };

  const loadStageItems = async (stage: StudyStage) => {
    const learnItems: LearnItem[] = [];

    if (stage.type === "kana" && stage.targetItems) {
      const kanaData = await DataLoader.loadKanaData();
      for (const targetHiragana of stage.targetItems) {
        const item = kanaData.find((k) => k.hiragana === targetHiragana);
        if (item) {
          learnItems.push({
            id: item.hiragana,
            primary: item.hiragana,
            secondary: item.katakana,
            reading: item.romaji,
          });
        }
      }
    } else if (stage.type === "phrase" && stage.category) {
      const phrasesData = await DataLoader.loadPhrasesData();
      const categoryPhrases = phrasesData[stage.category] || [];
      const limit = stage.targetCount || categoryPhrases.length;

      for (let i = 0; i < Math.min(limit, categoryPhrases.length); i++) {
        const phrase = categoryPhrases[i];
        learnItems.push({
          id: `${stage.category}_${i}`,
          primary: phrase.japanese,
          secondary: phrase.chinese,
          reading: phrase.hiragana,
        });
      }
    }

    setItems(learnItems);
    setCurrentIndex(0);
    setShowAnswer(false);

    await updateProgressStats(stage, learnItems);
  };

  const updateProgressStats = async (
    stage: StudyStage,
    learnItems: LearnItem[]
  ) => {
    let learned = 0;
    let mastered = 0;
    for (const item of learnItems) {
      const progress = await db.learningProgress.get(
        `${stage.type}_${item.id}`
      );
      if (progress) {
        learned++;
        if (progress.masteryLevel >= stage.requiredMastery) {
          mastered++;
        }
      }
    }
    setProgressStats({ learned, mastered });
  };

  const handleAnswer = async (correct: boolean) => {
    if (!currentStage || items.length === 0) return;

    const currentItem = items[currentIndex];
    await ProgressService.recordPractice(
      currentStage.type,
      currentItem.id,
      correct
    );

    learnedCountRef.current += 1;

    if (learnedCountRef.current >= 5) {
      await checkIn({
        kanaCount: currentStage.type === "kana" ? learnedCountRef.current : 0,
        wordCount: currentStage.type === "word" ? learnedCountRef.current : 0,
        phraseCount:
          currentStage.type === "phrase" ? learnedCountRef.current : 0,
        totalTime: 0,
      });
      learnedCountRef.current = 0;
    }

    await updateProgressStats(currentStage, items);

    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      if (progressStats.learned + 1 >= items.length && plan) {
        await ProgressService.updatePlanProgress(
          plan.id,
          plan.currentStage,
          true
        );

        await checkIn({
          kanaCount: currentStage.type === "kana" ? items.length : 0,
          wordCount: currentStage.type === "word" ? items.length : 0,
          phraseCount: currentStage.type === "phrase" ? items.length : 0,
          totalTime: 0,
        });

        toast.success(`🎉 階段「${currentStage.name}」已完成！`);
        await loadPlan();
      } else {
        toast.info("已完成一輪，繼續練習以提高熟練度");
        setCurrentIndex(0);
        setShowAnswer(false);
      }
    }
  };

  const speak = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Keyboard shortcuts: 支援下一個 / 顯示提示 / 播放音頻
  useKeyboardShortcuts({
    onNext: () => {
      if (items.length === 0) return;
      if (!showAnswer) {
        setShowAnswer(true);
      } else {
        handleNext();
      }
    },
    onPrev: () => {
      if (items.length === 0) return;
      handlePrev();
    },
    onMarkIncorrect: () => {
      if (!showAnswer) return;
      handleAnswer(false);
    },
    onMarkCorrect: () => {
      if (!showAnswer) return;
      handleAnswer(true);
    },
    onToggleHint: () => {
      if (items.length === 0) return;
      setShowAnswer((s) => !s);
    },
    onPlaySound: () => {
      if (items.length === 0) return;
      speak(currentItem.primary);
    },
    isStarted: items.length > 0,
    isSettingsOpen: false,
    isDialogOpen: showBadgeDialog,
  });

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">載入中...</div>
      </div>
    );
  }

  if (!plan || !currentStage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation showBackButton />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">方案已完成或不存在</p>
          <Button className="mt-4" onClick={() => navigate("/study-plans")}>
            返回學習方案
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const completedStages = plan.stages.filter((s) => s.completed).length;
  const overallProgress = Math.round(
    ((completedStages + progressStats.learned / items.length) /
      plan.stages.length) *
      100
  );
  const stageProgress = Math.round(
    (progressStats.learned / items.length) * 100
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation
        showBackButton
        customTitle={plan.name}
        backPath="/study-plans"
      />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Plan Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              方案進度：階段 {plan.currentStage + 1} / {plan.stages.length}
            </span>
            <span className="text-sm font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Stage Info */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{currentStage.name}</CardTitle>
              <Badge variant="outline">
                {currentStage.type === "kana" ? "假名" : "句子"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>
                已學習：{progressStats.learned} / {items.length}
              </span>
              <span className="text-muted-foreground">
                已掌握：{progressStats.mastered}
              </span>
            </div>
            <Progress value={stageProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* Learning Card */}
        {currentItem && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {items.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => speak(currentItem.primary)}
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                </div>

                <div
                  className="text-6xl mb-4 cursor-pointer"
                  onClick={() => speak(currentItem.primary)}
                >
                  {currentItem.primary}
                </div>

                {showAnswer ? (
                  <div className="space-y-2">
                    <div className="text-2xl text-muted-foreground">
                      {currentItem.secondary}
                    </div>
                    <div className="text-xl text-primary">
                      {currentItem.reading}
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowAnswer(true)}
                    className="mt-4"
                  >
                    顯示答案
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        {showAnswer && (
          <div className="flex gap-4 mb-6">
            <Button
              variant="outline"
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
              onClick={() => handleAnswer(false)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              還不會
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              onClick={() => handleAnswer(true)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              已掌握
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一個
          </Button>
          <Button
            variant="ghost"
            onClick={handleNext}
            disabled={currentIndex === items.length - 1}
          >
            下一個
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </main>

      <Footer />

      <BadgeUnlockDialog
        badge={unlockedBadge}
        open={showBadgeDialog}
        onClose={closeBadgeDialog}
      />
    </div>
  );
}
