import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { HelpDialog } from "@/components/help-dialog";
import {
  useKeyboardShortcuts,
  STANDARD_SHORTCUTS,
} from "@/hooks/use-keyboard-shortcuts";
import { DataLoader } from "@/lib/data-loader";
import { LocalStorage } from "@/lib/local-storage";
import { TTSService } from "@/lib/tts";
import {
  PracticeMode,
  type PhraseObject,
  type UnifiedDisplayMode,
} from "@/lib/types";
import {
  BookOpen,
  GraduationCap,
  BookMarked,
  Sparkles,
  Eye,
  Lightbulb,
  Volume2,
  Layers,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CATEGORY_NAMES = {
  greeting: "问候语",
  daily: "日常用语",
  travel: "旅行用语",
  dining: "饮食用语",
};

export default function PhrasesPage() {
  const [mounted, setMounted] = useState(false);
  const ttsServiceRef = useRef<TTSService | null>(null);

  const [allPhrases, setAllPhrases] = useState<Record<string, PhraseObject[]>>(
    {}
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(["greeting"])
  );
  const [displayPhrases, setDisplayPhrases] = useState<PhraseObject[]>([]);
  const [usedPhrases, setUsedPhrases] = useState<PhraseObject[]>([]);

  const [currentPhrase, setCurrentPhrase] = useState<{
    phrase: PhraseObject | null;
    displayText: string;
    hint: string;
  }>({
    phrase: null,
    displayText: "",
    hint: "",
  });

  const [isStarted, setIsStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(
    PracticeMode.memory
  );
  const [displayMode, setDisplayMode] = useState<UnifiedDisplayMode>("mixed");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [autoPlaySound, setAutoPlaySound] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadPhrasesData();
    loadSettings();

    if (!ttsServiceRef.current) {
      ttsServiceRef.current = new TTSService();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPhrasesData = async () => {
    try {
      const phrasesData = await DataLoader.loadPhrasesData();
      setAllPhrases(phrasesData);

      const savedCategories = LocalStorage.load<string[]>(
        "phrases_selectedCategories"
      );
      if (savedCategories && savedCategories.length > 0) {
        setSelectedCategories(new Set(savedCategories));
        updateDisplayPhrases(new Set(savedCategories), phrasesData);
      } else {
        updateDisplayPhrases(new Set(["greeting"]), phrasesData);
      }
    } catch (error) {
      console.error("Failed to load phrases data:", error);
      toast.error("加载句子数据失败");
    }
  };

  const loadSettings = () => {
    const savedPracticeMode = LocalStorage.load<PracticeMode>(
      "phrases_practiceMode"
    );
    const savedDisplayMode = LocalStorage.load<UnifiedDisplayMode>(
      "phrases_displayMode"
    );
    const savedAutoPlaySound = LocalStorage.load<boolean>(
      "phrases_autoPlaySound"
    );

    if (savedPracticeMode) {
      setPracticeMode(savedPracticeMode);
    }
    if (savedDisplayMode) {
      setDisplayMode(savedDisplayMode);
    }
    if (savedAutoPlaySound !== null) {
      setAutoPlaySound(savedAutoPlaySound);
    }
  };

  // 更新显示的句子池：合并所有选中分类的句子
  const updateDisplayPhrases = (
    categories: Set<string>,
    phrases: Record<string, PhraseObject[]> = allPhrases
  ) => {
    const allSelectedPhrases: PhraseObject[] = [];

    categories.forEach((category) => {
      if (phrases[category]) {
        allSelectedPhrases.push(...phrases[category]);
      }
    });

    setDisplayPhrases([...allSelectedPhrases]);
    setUsedPhrases([]);
  };

  const handleCategoryToggle = (category: string) => {
    const updated = new Set(selectedCategories);
    if (updated.has(category)) {
      updated.delete(category);
    } else {
      updated.add(category);
    }

    if (updated.size === 0) {
      toast.error("至少需要选择一个场景分类");
      return;
    }

    setSelectedCategories(updated);
    LocalStorage.save("phrases_selectedCategories", Array.from(updated));
    updateDisplayPhrases(updated);
  };

  const handleStart = () => {
    if (displayPhrases.length === 0) {
      toast.error("请至少选择一个场景分类");
      return;
    }

    setUsedPhrases([]);
    setIsStarted(true);
    getNextPhrase();
  };

  const getNextPhrase = () => {
    setShowHint(practiceMode === PracticeMode.learning);

    // 混合模式：随机选择显示假名或日文
    if (displayMode === "mixed") {
      setMixedModeDisplay(Math.random() > 0.5 ? "kana" : "japanese");
    }

    if (displayPhrases.length === 0) {
      if (usedPhrases.length > 0) {
        setDisplayPhrases(usedPhrases);
        setUsedPhrases([]);
        return;
      }
      toast.info("没有更多句子了");
      return;
    }

    const randomIndex = Math.floor(Math.random() * displayPhrases.length);
    const selected = displayPhrases[randomIndex];

    const displayText = getDisplayText(selected, displayMode);
    const hintText = getHintText(selected, displayMode);

    setCurrentPhrase({
      phrase: selected,
      displayText,
      hint: hintText,
    });

    setDisplayPhrases((prev) => prev.filter((_, i) => i !== randomIndex));
    setUsedPhrases((prev) => [...prev, selected]);
  };

  // 用于混合模式的随机选择
  const [mixedModeDisplay, setMixedModeDisplay] = useState<"kana" | "japanese">(
    "kana"
  );

  const getDisplayText = (
    phrase: PhraseObject,
    mode: UnifiedDisplayMode
  ): string => {
    switch (mode) {
      case "mixed":
        // 混合模式：随机显示假名或日文
        if (mixedModeDisplay === "kana") {
          return phrase.hiragana;
        } else {
          return phrase.japanese;
        }
      case "kana":
        // 假名模式：显示假名
        return phrase.hiragana;
      case "japanese":
        // 日文模式：显示日文
        return phrase.japanese;
      default:
        return phrase.chinese;
    }
  };

  const getHintText = (
    phrase: PhraseObject,
    mode: UnifiedDisplayMode
  ): string => {
    switch (mode) {
      case "mixed":
        // 混合模式：提示显示其他信息
        if (mixedModeDisplay === "kana") {
          return `${phrase.japanese}\n${phrase.romaji}\n${phrase.chinese}`;
        } else {
          return `${phrase.hiragana}\n${phrase.romaji}\n${phrase.chinese}`;
        }
      case "kana":
        // 假名模式：提示显示日文、罗马音、中文
        return `${phrase.japanese}\n${phrase.romaji}\n${phrase.chinese}`;
      case "japanese":
        // 日文模式：提示显示假名、罗马音、中文
        return `${phrase.hiragana}\n${phrase.romaji}\n${phrase.chinese}`;
      default:
        return "";
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
  };

  const handlePronounce = async () => {
    if (currentPhrase.phrase && ttsServiceRef.current) {
      try {
        // 使用纯假名进行发音，更准确
        await ttsServiceRef.current.speak(currentPhrase.phrase.hiragana);
      } catch (error) {
        console.error("TTS error:", error);
      }
    }
  };

  const handlePracticeModeChange = (mode: PracticeMode) => {
    setPracticeMode(mode);
    LocalStorage.save("phrases_practiceMode", mode);
  };

  const handleDisplayModeChange = (mode: UnifiedDisplayMode) => {
    setDisplayMode(mode);
    LocalStorage.save("phrases_displayMode", mode);
  };

  const handleAutoPlaySoundChange = (enabled: boolean) => {
    setAutoPlaySound(enabled);
    LocalStorage.save("phrases_autoPlaySound", enabled);
  };

  // 自动发音：当切换到新句子时自动发音
  useEffect(() => {
    if (
      isStarted &&
      practiceMode === PracticeMode.learning &&
      autoPlaySound &&
      currentPhrase.phrase?.hiragana
    ) {
      const timer = setTimeout(() => {
        if (ttsServiceRef.current && currentPhrase.phrase) {
          ttsServiceRef.current
            .speak(currentPhrase.phrase.hiragana)
            .catch(() => {
              // TTS failed silently
            });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhrase.phrase?.hiragana, isStarted, practiceMode, autoPlaySound]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNext: getNextPhrase,
    onShowHint: handleShowHint,
    onPlaySound: handlePronounce,
    onToggleSettings: () => setIsSettingsOpen((prev) => !prev),
    onToggleHelp: () => setIsHelpOpen((prev) => !prev),
    isStarted,
    isSettingsOpen,
    isHelpOpen,
  });

  const totalPhraseCount = displayPhrases.length + usedPhrases.length;

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation
        showBackButton
        onSettingsClick={() => setIsSettingsOpen(true)}
        onHelpClick={() => setIsHelpOpen(true)}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-0 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl flex flex-col h-full sm:h-auto">
          <Card className="flex-1 flex flex-col !border-0 rounded-none sm:rounded-lg overflow-hidden shadow-none">
            <CardContent className="flex-1 flex items-center justify-center p-4 sm:p-6">
              <div className="w-full space-y-8 sm:space-y-12">
                {!isStarted ? (
                  <div className="text-center space-y-4 sm:space-y-6 w-full">
                    <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-muted-foreground">
                      句子
                    </div>

                    <div className="space-y-3 max-w-md mx-auto">
                      <p className="text-sm text-muted-foreground">
                        場景分類（可多選）
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(CATEGORY_NAMES).map(([key, name]) => {
                          const categoryPhrases = allPhrases[key] || [];
                          const count = categoryPhrases.length;
                          return (
                            <div
                              key={key}
                              className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                              onClick={() => handleCategoryToggle(key)}
                            >
                              <Checkbox
                                checked={selectedCategories.has(key)}
                                onCheckedChange={() =>
                                  handleCategoryToggle(key)
                                }
                              />
                              <Label className="cursor-pointer flex-1">
                                <div className="font-medium">{name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {count} 個句子
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          已選分類
                        </p>
                        <p className="text-2xl font-bold">
                          {selectedCategories.size}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          總句子數
                        </p>
                        <p className="text-2xl font-bold">{totalPhraseCount}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
                      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-center leading-relaxed whitespace-pre-line font-kana px-4">
                        {currentPhrase.displayText}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-14 w-14 sm:h-16 sm:w-16 rounded-full hover:bg-accent flex-shrink-0"
                        onClick={handlePronounce}
                        title="發音"
                      >
                        <Volume2 className="h-7 w-7 sm:h-8 sm:w-8" />
                      </Button>
                    </div>

                    {showHint && currentPhrase.hint && (
                      <div className="flex gap-3 sm:gap-4 animate-in fade-in px-4 sm:px-0 w-full justify-center">
                        <div className="rounded-lg border-2 bg-card px-4 py-3 sm:px-6 sm:py-4 text-center max-w-md">
                          <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                            提示
                          </div>
                          <div className="text-xl sm:text-2xl text-foreground whitespace-pre-line leading-relaxed">
                            {currentPhrase.hint}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Fixed at bottom on mobile */}
          <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-background border-t sm:static sm:border-0 sm:p-0 sm:mt-4 z-10">
            {!isStarted ? (
              <Button
                className="w-full"
                size="lg"
                onClick={handleStart}
                disabled={totalPhraseCount === 0}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                開始學習 ({totalPhraseCount} 個句子)
              </Button>
            ) : (
              <div className="flex gap-2 items-center max-w-2xl mx-auto">
                {practiceMode === PracticeMode.memory && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full flex-shrink-0"
                    onClick={handleShowHint}
                    title="顯示提示"
                  >
                    <Lightbulb className="h-5 w-5" />
                  </Button>
                )}
                <Button className="flex-1" size="lg" onClick={getNextPhrase}>
                  下一個
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="hidden sm:block">
        <Footer />
      </div>

      {/* 设置面板 */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-lg sm:text-xl">設置</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 mb-4">
            <div className="space-y-5 sm:space-y-6">
              {/* 学习模式 */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  練習模式
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant={
                      practiceMode === PracticeMode.learning
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      handlePracticeModeChange(PracticeMode.learning)
                    }
                    className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
                  >
                    <BookMarked className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                    學習模式
                  </Button>
                  <Button
                    variant={
                      practiceMode === PracticeMode.memory
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      handlePracticeModeChange(PracticeMode.memory)
                    }
                    className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                    記憶模式
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {practiceMode === PracticeMode.learning
                    ? "學習模式：自動顯示提示，適合初學者"
                    : "記憶模式：手動控制提示和發音，適合複習鞏固"}
                </p>

                {/* Auto Play Sound - Sub-option for Learning Mode */}
                {practiceMode === PracticeMode.learning && (
                  <div className="ml-3 sm:ml-4 mt-3 pl-3 sm:pl-4 border-l-2 border-primary/30">
                    <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-md bg-muted/50">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Volume2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor="autoPlaySound"
                            className="text-xs sm:text-sm font-medium cursor-pointer block"
                          >
                            自動發音
                          </Label>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                            切換句子時自動朗讀
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="autoPlaySound"
                        checked={autoPlaySound}
                        onCheckedChange={handleAutoPlaySoundChange}
                        className="flex-shrink-0 scale-90"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 显示内容 */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  顯示內容
                </h3>
                <div className="flex justify-between gap-2">
                  {[
                    { value: "mixed", label: "混合" },
                    { value: "kana", label: "假名" },
                    { value: "japanese", label: "日文" },
                  ].map((mode) => (
                    <Button
                      key={mode.value}
                      variant={
                        displayMode === mode.value ? "default" : "outline"
                      }
                      onClick={() =>
                        handleDisplayModeChange(
                          mode.value as UnifiedDisplayMode
                        )
                      }
                      className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
                    >
                      {mode.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 场景分类选择 */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  場景分類
                </h3>
                <div className="space-y-2">
                  {Object.entries(CATEGORY_NAMES).map(([key, name]) => {
                    const categoryPhrases = allPhrases[key] || [];
                    const count = categoryPhrases.length;
                    return (
                      <div
                        key={key}
                        className="flex items-center space-x-2 p-2 sm:p-3 border rounded hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleCategoryToggle(key)}
                      >
                        <Checkbox
                          checked={selectedCategories.has(key)}
                          onCheckedChange={() => handleCategoryToggle(key)}
                          className="h-4 w-4"
                        />
                        <Label className="cursor-pointer flex-1 text-sm sm:text-base">
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-muted-foreground">
                            {count} 個句子
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Help Dialog */}
      <HelpDialog
        open={isHelpOpen}
        onOpenChange={setIsHelpOpen}
        shortcuts={STANDARD_SHORTCUTS}
      />
    </div>
  );
}
