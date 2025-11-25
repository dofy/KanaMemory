import { HelpDialog } from "@/components/help-dialog";
import { KanaSelector } from "@/components/kana-selector";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PracticeModeSelector } from "@/components/practice-mode-selector";
import { DisplayModeSelector } from "@/components/display-mode-selector";
import { PracticeDisplay } from "@/components/practice-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  STANDARD_SHORTCUTS,
  useKeyboardShortcuts,
} from "@/hooks/use-keyboard-shortcuts";
import { usePracticeState } from "@/hooks/use-practice-state";
import { useTTS } from "@/hooks/use-tts";
import { DataLoader } from "@/lib/data-loader";
import { LocalStorage } from "@/lib/local-storage";
import {
  PracticeMode,
  type MemoObject,
  type UnifiedDisplayMode,
  type WordObject,
} from "@/lib/types";
import {
  BookOpen,
  Filter,
  Lightbulb,
  Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const DISPLAY_MODES = [
  { value: "mixed" as const, label: "混合" },
  { value: "kana" as const, label: "假名" },
  { value: "japanese" as const, label: "日文" },
];

export default function WordsPage() {
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
    storagePrefix: "words",
    defaultPracticeMode: PracticeMode.memory,
    defaultDisplayMode: "mixed",
  });

  const [allWords, setAllWords] = useState<WordObject[]>([]);
  const [kanaList, setKanaList] = useState<MemoObject[]>([]);
  const [displayWords, setDisplayWords] = useState<WordObject[]>([]);
  const [usedWords, setUsedWords] = useState<WordObject[]>([]);

  const [currentWord, setCurrentWord] = useState<{
    word: WordObject | null;
    displayText: string;
    hint: string;
  }>({
    word: null,
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
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const wordsData = await DataLoader.loadWordsData();
      setAllWords(wordsData);

      const kanaData = await DataLoader.loadKanaData();
      const savedKanaSelections = LocalStorage.load<string[]>(
        "words_kana_selections"
      );

      const initializedKanaList = kanaData.map((k) => ({
        ...k,
        selected: savedKanaSelections
          ? savedKanaSelections.includes(k.romaji)
          : k.selected,
      }));

      setKanaList(initializedKanaList);
      updateDisplayWords(wordsData, initializedKanaList);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("載入資料失敗");
    }
  };

  const updateDisplayWords = (words: WordObject[], kanas: MemoObject[]) => {
    const selectedKanas = kanas.filter((k) => k.selected);

    if (selectedKanas.length === 0) {
      setDisplayWords([]);
      return;
    }

    const selectedHiraganas = selectedKanas
      .map((k) => k.hiragana)
      .sort((a, b) => b.length - a.length);

    const matched = words.filter((word) => {
      const cleanHiragana = word.hiragana.replace(/[①②③④⑤⑥⑦⑧⑨⓪]/g, "");

      for (const kana of selectedHiraganas) {
        if (cleanHiragana.includes(kana)) {
          return true;
        }
      }
      return false;
    });

    setDisplayWords(matched);
    setUsedWords([]);
  };

  const handleKanaSelectionChange = (updatedKanaList: MemoObject[]) => {
    setKanaList(updatedKanaList);
    updateDisplayWords(allWords, updatedKanaList);

    const selectedRomaji = updatedKanaList
      .filter((k) => k.selected)
      .map((k) => k.romaji);
    LocalStorage.save("words_kana_selections", selectedRomaji);
  };

  const handleStart = () => {
    if (displayWords.length === 0) {
      toast.error("請至少選擇一個假名，且確保有匹配的單詞");
      return;
    }

    setUsedWords([]);
    setIsStarted(true);
    getNextWord();
  };

  const getNextWord = () => {
    setShowHint(practiceMode === PracticeMode.learning);

    const currentDisplayMode = displayMode || "mixed";

    if (currentDisplayMode === "mixed") {
      setMixedModeDisplay(Math.random() > 0.5 ? "kana" : "japanese");
    }

    if (displayWords.length === 0) {
      if (usedWords.length > 0) {
        setDisplayWords(usedWords);
        setUsedWords([]);
        return;
      }
      toast.info("沒有更多單詞了");
      return;
    }

    const randomIndex = Math.floor(Math.random() * displayWords.length);
    const selected = displayWords[randomIndex];

    const displayText = getDisplayText(selected, currentDisplayMode);
    const hintText = getHintText(selected, currentDisplayMode);

    setCurrentWord({
      word: selected,
      displayText,
      hint: hintText,
    });

    setDisplayWords((prev) => prev.filter((_, i) => i !== randomIndex));
    setUsedWords((prev) => [...prev, selected]);
  };

  const getDisplayText = (
    word: WordObject,
    mode: UnifiedDisplayMode
  ): string => {
    switch (mode) {
      case "mixed":
        if (mixedModeDisplay === "kana") {
          return word.hiragana;
        } else {
          return word.japanese;
        }
      case "kana":
        return word.hiragana;
      case "japanese":
        return word.japanese;
      default:
        return word.chinese;
    }
  };

  const getHintText = (word: WordObject, mode: UnifiedDisplayMode): string => {
    switch (mode) {
      case "mixed":
        if (mixedModeDisplay === "kana") {
          return `${word.japanese}\n${word.romaji}\n${word.chinese}`;
        } else {
          return `${word.hiragana}\n${word.romaji}\n${word.chinese}`;
        }
      case "kana":
        return `${word.japanese}\n${word.romaji}\n${word.chinese}`;
      case "japanese":
        return `${word.hiragana}\n${word.romaji}\n${word.chinese}`;
      default:
        return "";
    }
  };

  const handleToggleHint = () => {
    setShowHint((prev) => !prev);
  };

  const handlePronounce = async () => {
    if (currentWord.word) {
      await speak(currentWord.word.hiragana);
    }
  };

  const handlePracticeModeChange = (mode: PracticeMode) => {
    setPracticeMode(mode);
    toast.success(mode === PracticeMode.learning ? "已切換至學習模式" : "已切換至記憶模式");
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
      currentWord.word?.hiragana
    ) {
      const timer = setTimeout(() => {
        if (currentWord.word) {
          speak(currentWord.word.hiragana);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord.word?.hiragana, isStarted, practiceMode, autoPlaySound]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNext: getNextWord,
    onToggleHint: handleToggleHint,
    onPlaySound: handlePronounce,
    onStart: handleStart,
    onGoHome: () => navigate("/"),
    onGoKana: () => navigate("/kana"),
    onGoWords: () => navigate("/words"),
    onGoPhrases: () => navigate("/phrases"),
    onToggleSettings: () => setIsSettingsOpen((prev) => !prev),
    onToggleHelp: () => setIsHelpOpen((prev) => !prev),
    isStarted,
    isSettingsOpen,
    isHelpOpen,
  });

  const selectedKanaCount = kanaList.filter((k) => k.selected).length;
  const matchedWordCount = displayWords.length + usedWords.length;

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
          <Card className="flex-1 flex flex-col !border-0 rounded-none sm:rounded-lg overflow-hidden shadow-none bg-transparent sm:bg-card">
            <CardContent className="flex-1 flex items-center justify-center p-3 sm:p-5 md:p-6">
              <div className="w-full space-y-8 sm:space-y-12">
                {!isStarted ? (
                  <div className="text-center space-y-4 sm:space-y-6 w-full">
                    <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-muted-foreground">
                      單詞
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          已選假名
                        </p>
                        <p className="text-2xl font-bold">
                          {selectedKanaCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          關聯單詞
                        </p>
                        <p className="text-2xl font-bold">{matchedWordCount}</p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground max-w-md mx-auto">
                      <Lightbulb className="inline h-4 w-4 mr-1 mb-1" />
                      選擇已掌握的假名，系統會篩選包含這些假名的單詞
                    </div>
                  </div>
                ) : (
                  <>
                    <PracticeDisplay
                      content={
                        <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
                          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground text-center font-kana">
                            <span className="whitespace-pre-line">
                              {currentWord.displayText}
                              {currentWord.word && currentWord.word.pitch && (
                                <sup className="text-2xl text-muted-foreground ml-1 font-normal">
                                  {currentWord.word.pitch}
                                </sup>
                              )}
                            </span>
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
                      }
                      hint={
                        currentWord.hint && (
                          <div className="flex gap-3 sm:gap-4 animate-in fade-in px-4 sm:px-0 w-full justify-center">
                            <div className="rounded-lg border-2 bg-card px-4 py-3 sm:px-6 sm:py-4 text-center max-w-md">
                              <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                                提示
                              </div>
                              <div className="text-xl sm:text-2xl md:text-3xl text-foreground whitespace-pre-line leading-relaxed">
                                {currentWord.hint}
                              </div>
                            </div>
                          </div>
                        )
                      }
                      showHint={showHint && !!currentWord.hint}
                    />
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
                title="開始學習 (Enter)"
                disabled={matchedWordCount === 0}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                開始學習 ({matchedWordCount} 個單詞)
              </Button>
            ) : (
              <div className="flex gap-2 items-center max-w-2xl mx-auto">
                {practiceMode === PracticeMode.memory && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full flex-shrink-0"
                    onClick={handleToggleHint}
                    title="顯示/隱藏提示 (H)"
                  >
                    <Lightbulb className="h-5 w-5" />
                  </Button>
                )}
                <Button className="flex-1" size="lg" onClick={getNextWord}>
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
                autoPlayLabel="切換單詞時自動朗讀"
              />

              {/* Display Mode Selector */}
              <DisplayModeSelector
                displayMode={displayMode || "mixed"}
                modes={DISPLAY_MODES}
                onChange={handleDisplayModeChange}
              />

              {/* Kana Range Selection */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    假名範圍
                  </h3>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    關聯:{" "}
                    <span className="font-bold text-foreground">
                      {matchedWordCount}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  選擇您已掌握的假名，系統將為您提供包含這些假名的單詞進行練習。
                </p>
                <KanaSelector
                  kanaList={kanaList}
                  onSelectionChange={handleKanaSelectionChange}
                />
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
