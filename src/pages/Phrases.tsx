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
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { HelpDialog } from "@/components/help-dialog";
import { PracticeModeSelector } from "@/components/practice-mode-selector";
import { DisplayModeSelector } from "@/components/display-mode-selector";
import {
  useKeyboardShortcuts,
  STANDARD_SHORTCUTS,
} from "@/hooks/use-keyboard-shortcuts";
import { usePracticeState } from "@/hooks/use-practice-state";
import { useTTS } from "@/hooks/use-tts";
import { DataLoader } from "@/lib/data-loader";
import { LocalStorage } from "@/lib/local-storage";
import {
  PracticeMode,
  type PhraseObject,
  type UnifiedDisplayMode,
} from "@/lib/types";
import { BookOpen, Lightbulb, Volume2, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CATEGORY_NAMES = {
  greeting: "問候語",
  daily: "日常用語",
  travel: "旅行用語",
  dining: "飲食用語",
};

const DISPLAY_MODES = [
  { value: "mixed" as const, label: "混合" },
  { value: "kana" as const, label: "假名" },
  { value: "japanese" as const, label: "日文" },
];

export default function PhrasesPage() {
  const [mounted, setMounted] = useState(false);
  const { speak } = useTTS();

  const {
    practiceMode,
    displayMode,
    autoPlaySound,
    setPracticeMode,
    setDisplayMode,
    setAutoPlaySound,
  } = usePracticeState<UnifiedDisplayMode>({
    storagePrefix: "phrases",
    defaultPracticeMode: PracticeMode.memory,
    defaultDisplayMode: "mixed",
  });

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [mixedModeDisplay, setMixedModeDisplay] = useState<"kana" | "japanese">(
    "kana"
  );

  useEffect(() => {
    setMounted(true);
    loadPhrasesData();
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
      toast.error("載入句子資料失敗");
    }
  };

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
      toast.error("至少需要選擇一個場景分類");
      return;
    }

    setSelectedCategories(updated);
    LocalStorage.save("phrases_selectedCategories", Array.from(updated));
    updateDisplayPhrases(updated);
  };

  const handleStart = () => {
    if (displayPhrases.length === 0) {
      toast.error("請至少選擇一個場景分類");
      return;
    }

    setUsedPhrases([]);
    setIsStarted(true);
    getNextPhrase();
  };

  const getNextPhrase = () => {
    setShowHint(practiceMode === PracticeMode.learning);

    const currentDisplayMode = displayMode || "mixed";

    if (currentDisplayMode === "mixed") {
      setMixedModeDisplay(Math.random() > 0.5 ? "kana" : "japanese");
    }

    if (displayPhrases.length === 0) {
      if (usedPhrases.length > 0) {
        setDisplayPhrases(usedPhrases);
        setUsedPhrases([]);
        return;
      }
      toast.info("沒有更多句子了");
      return;
    }

    const randomIndex = Math.floor(Math.random() * displayPhrases.length);
    const selected = displayPhrases[randomIndex];

    const displayText = getDisplayText(selected, currentDisplayMode);
    const hintText = getHintText(selected, currentDisplayMode);

    setCurrentPhrase({
      phrase: selected,
      displayText,
      hint: hintText,
    });

    setDisplayPhrases((prev) => prev.filter((_, i) => i !== randomIndex));
    setUsedPhrases((prev) => [...prev, selected]);
  };

  const getDisplayText = (
    phrase: PhraseObject,
    mode: UnifiedDisplayMode
  ): string => {
    switch (mode) {
      case "mixed":
        if (mixedModeDisplay === "kana") {
          return phrase.hiragana;
        } else {
          return phrase.japanese;
        }
      case "kana":
        return phrase.hiragana;
      case "japanese":
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
        if (mixedModeDisplay === "kana") {
          return `${phrase.japanese}\n${phrase.romaji}\n${phrase.chinese}`;
        } else {
          return `${phrase.hiragana}\n${phrase.romaji}\n${phrase.chinese}`;
        }
      case "kana":
        return `${phrase.japanese}\n${phrase.romaji}\n${phrase.chinese}`;
      case "japanese":
        return `${phrase.hiragana}\n${phrase.romaji}\n${phrase.chinese}`;
      default:
        return "";
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
  };

  const handlePronounce = async () => {
    if (currentPhrase.phrase) {
      await speak(currentPhrase.phrase.hiragana);
    }
  };

  const handlePracticeModeChange = (mode: PracticeMode) => {
    setPracticeMode(mode);
    toast.success(
      mode === PracticeMode.learning ? "已切換至學習模式" : "已切換至記憶模式"
    );
  };

  const handleDisplayModeChange = (mode: UnifiedDisplayMode) => {
    setDisplayMode(mode);
    const modeNames = { mixed: "混合", kana: "假名", japanese: "日文" };
    toast.success(`已切換至${modeNames[mode]}模式`);
  };

  const handleAutoPlaySoundChange = (enabled: boolean) => {
    setAutoPlaySound(enabled);
    toast.success(enabled ? "已開啟自動發音" : "已關閉自動發音");
  };

  // Auto play sound effect
  useEffect(() => {
    if (
      isStarted &&
      practiceMode === PracticeMode.learning &&
      autoPlaySound &&
      currentPhrase.phrase?.hiragana
    ) {
      const timer = setTimeout(() => {
        if (currentPhrase.phrase) {
          speak(currentPhrase.phrase.hiragana);
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

                    <div className="space-y-3 max-w-md mx-auto">
                      <p className="text-sm text-muted-foreground">
                        選擇場景分類（可多選）
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

                    <div className="text-sm text-muted-foreground max-w-md mx-auto">
                      <Lightbulb className="inline h-4 w-4 mr-1 mb-1" />
                      選擇感興趣的場景，開始學習實用日語句子
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
                          <div className="text-xl sm:text-2xl md:text-3xl text-foreground whitespace-pre-line leading-relaxed">
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

      {/* Settings Sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-lg sm:text-xl">設置</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 mb-4">
            <div className="space-y-5 sm:space-y-6">
              {/* Practice Mode Selector */}
              <PracticeModeSelector
                practiceMode={practiceMode}
                autoPlaySound={autoPlaySound}
                onPracticeModeChange={handlePracticeModeChange}
                onAutoPlaySoundChange={handleAutoPlaySoundChange}
                autoPlayLabel="切換句子時自動朗讀"
              />

              {/* Display Mode Selector */}
              <DisplayModeSelector
                displayMode={displayMode || "mixed"}
                modes={DISPLAY_MODES}
                onChange={handleDisplayModeChange}
              />

              {/* Category Selection */}
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
