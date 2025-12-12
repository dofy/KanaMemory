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
import { Storage } from "@/lib/storage";
import { FYType, PracticeMode, type DisplayMode, type MemoObject } from "@/lib/types";
import {
  BookOpen,
  ListChecks,
  Lightbulb,
  Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const DISPLAY_MODES = [
  { value: "mixed" as const, label: "混合" },
  { value: "hiragana" as const, label: "平假名" },
  { value: "katakana" as const, label: "片假名" },
  { value: "romaji" as const, label: "羅馬音" },
  { value: "swap" as const, label: "互換" },
];

export default function KanaPage() {
  const [mounted, setMounted] = useState(false);
  const { speak } = useTTS();

  const {
    practiceMode,
    displayMode,
    autoPlaySound,
    setPracticeMode,
    setDisplayMode,
    setAutoPlaySound,
  } = usePracticeState<DisplayMode>({
    storagePrefix: "kana",
    defaultPracticeMode: PracticeMode.memory,
    defaultDisplayMode: "mixed",
  });

  const [kanaList, setKanaList] = useState<MemoObject[]>([]);
  const [displayKanaList, setDisplayKanaList] = useState<MemoObject[]>([]);
  const [usedKanaList, setUsedKanaList] = useState<MemoObject[]>([]);

  const [currentKana, setCurrentKana] = useState({
    romaji: "",
    displayText: "",
    remind: "",
  });

  const [isStarted, setIsStarted] = useState(false);
  const [showRemind, setShowRemind] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    loadKanaData();
  }, []);

  const loadKanaData = async () => {
    const savedData = await Storage.load<MemoObject[]>("kana_selectedData");
    const data = await DataLoader.loadKanaData();

    if (savedData && savedData.length > 0) {
      const savedSelectionMap = new Map(
        savedData.map((item) => [item.romaji, item.selected])
      );

      const mergedData = data.map((item) => ({
        ...item,
        selected: savedSelectionMap.get(item.romaji) ?? item.selected,
      }));

      setKanaList(mergedData);
    } else {
      setKanaList(data);
    }
  };

  const refreshDisplayData = () => {
    const selected = kanaList.filter((k) => k.selected);
    setDisplayKanaList(selected);
    setUsedKanaList([]);
  };

  useEffect(() => {
    if (kanaList.length > 0) {
      refreshDisplayData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanaList]);

  useEffect(() => {
    if (
      isStarted &&
      practiceMode === PracticeMode.learning &&
      autoPlaySound &&
      currentKana.displayText
    ) {
      speak(currentKana.displayText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKana.displayText]);

  const getRandomKana = () => {
    setShowRemind(practiceMode === PracticeMode.learning);

    if (displayKanaList.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * displayKanaList.length);
    const selectedKana = displayKanaList[randomIndex];

    let displayText = "";

    switch (displayMode) {
      case "mixed": {
        const rand = Math.round(Math.random());
        displayText =
          rand === 1 ? selectedKana.displayText : selectedKana.displayText2;
        break;
      }
      case "hiragana":
        displayText = selectedKana.displayText;
        break;
      case "katakana":
        displayText = selectedKana.displayText2;
        break;
      case "romaji":
        displayText = selectedKana.remind;
        break;
      case "swap": {
        const rand2 = Math.round(Math.random());
        displayText =
          rand2 === 1 ? selectedKana.displayText : selectedKana.displayText2;
        break;
      }
    }

    let remindText = "";
    if (displayText === selectedKana.displayText) {
      remindText = `${selectedKana.displayText2}  ${selectedKana.remind}`;
    } else if (displayText === selectedKana.displayText2) {
      remindText = `${selectedKana.displayText}  ${selectedKana.remind}`;
    } else if (displayText === selectedKana.remind) {
      remindText = `${selectedKana.displayText}  ${selectedKana.displayText2}`;
    }

    if (currentKana.displayText !== displayText) {
      setCurrentKana({
        romaji: selectedKana.romaji,
        displayText,
        remind: remindText,
      });

      if (displayKanaList.length > 1) {
        const newDisplay = [...displayKanaList];
        const removed = newDisplay.splice(randomIndex, 1);
        setDisplayKanaList(newDisplay);
        setUsedKanaList([...usedKanaList, ...removed]);
      }
    } else if (displayKanaList.length > 1) {
      getRandomKana();
    } else {
      setDisplayKanaList([...displayKanaList, ...usedKanaList]);
      setUsedKanaList([]);
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    getRandomKana();
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNext: getRandomKana,
    onToggleHint: () => setShowRemind((prev) => !prev),
    onPlaySound: () => currentKana.displayText && speak(currentKana.displayText),
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

  const handleKanaSelectionChange = (updatedList: MemoObject[]) => {
    setKanaList(updatedList);
    Storage.save("kana_selectedData", updatedList);
  };

  const getKanaType = (text: string): string => {
    if (!text) return "";
    if (/^[a-z]+$/i.test(text)) return "羅馬音";

    const firstChar = text.charCodeAt(0);
    if (firstChar >= 0x3040 && firstChar <= 0x309f) return "平假名";
    if (firstChar >= 0x30a0 && firstChar <= 0x30ff) return "片假名";

    return "";
  };

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    const modeNames: Record<DisplayMode, string> = {
      mixed: "混合",
      hiragana: "平假名",
      katakana: "片假名",
      romaji: "羅馬音",
      swap: "互換",
    };
    toast.success(`已切換至${modeNames[mode]}模式`);
  };

  const handlePracticeModeChange = (mode: PracticeMode) => {
    setPracticeMode(mode);
    if (isStarted) {
      setShowRemind(mode === PracticeMode.learning);
    }
    toast.success(mode === PracticeMode.learning ? "已切換至學習模式" : "已切換至記憶模式");
  };

  const handleAutoPlaySoundChange = (enabled: boolean) => {
    setAutoPlaySound(enabled);
    toast.success(enabled ? "已開啟自動發音" : "已關閉自動發音");
  };

  if (!mounted) return null;

  const seionCount = kanaList.filter(
    (k) => k.fyType === FYType.seion && k.selected
  ).length;
  const dakuonCount = kanaList.filter(
    (k) => k.fyType === FYType.dakuon && k.selected
  ).length;
  const yoonCount = kanaList.filter(
    (k) => k.fyType === FYType.yoon && k.selected
  ).length;
  const totalCount = seionCount + dakuonCount + yoonCount;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation
        showBackButton={true}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onHelpClick={() => setIsHelpOpen(true)}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-0 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl flex flex-col h-full sm:h-auto">
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
                    autoPlayLabel="顯示假名時自動朗讀"
                  />

                  {/* Display Mode Selector */}
                  <DisplayModeSelector
                    displayMode={displayMode || "mixed"}
                    modes={DISPLAY_MODES}
                    onChange={handleDisplayModeChange}
                  />

                  {/* Kana Selection */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      假名選擇
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      選擇您想要練習的假名類型和範圍。
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

          {/* Main Card */}
          <Card className="flex-1 flex flex-col !border-0 rounded-none sm:rounded-lg overflow-hidden shadow-none bg-transparent sm:bg-card">
            <CardContent className="flex-1 flex items-center justify-center p-3 sm:p-5 md:p-6">
              <div className="w-full space-y-8 sm:space-y-12">
                {!isStarted ? (
                  <div className="text-center space-y-4 sm:space-y-6">
                    <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-muted-foreground">
                      假名
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
                      <div>
                        <p className="text-sm text-muted-foreground">清音</p>
                        <p className="text-2xl font-bold">{seionCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">濁音</p>
                        <p className="text-2xl font-bold">{dakuonCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">拗音</p>
                        <p className="text-2xl font-bold">{yoonCount}</p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground max-w-md mx-auto">
                      <Lightbulb className="inline h-4 w-4 mr-1 mb-1" />
                      選擇假名類型和範圍，開始練習日語假名
                    </div>
                  </div>
                ) : (
                  <PracticeDisplay
                    content={
                      <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
                        <div className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-bold font-kana">
                          {currentKana.displayText}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-14 w-14 sm:h-16 sm:w-16 rounded-full hover:bg-accent flex-shrink-0"
                          onClick={() => speak(currentKana.displayText)}
                        >
                          <Volume2 className="h-7 w-7 sm:h-8 sm:w-8" />
                        </Button>
                      </div>
                    }
                    hint={
                      <div className="flex gap-3 sm:gap-4 animate-in fade-in px-4 sm:px-0">
                        <div className="flex-1 min-w-[120px] sm:min-w-[140px] rounded-lg border-2 bg-card px-4 py-3 sm:px-6 sm:py-4 text-center">
                          <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                            {getKanaType(currentKana.remind.split("  ")[0])}
                          </div>
                          <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-kana whitespace-nowrap">
                            {currentKana.remind.split("  ")[0]}
                          </div>
                        </div>
                        <div className="flex-1 min-w-[120px] sm:min-w-[140px] rounded-lg border-2 bg-card px-4 py-3 sm:px-6 sm:py-4 text-center">
                          <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                            {getKanaType(currentKana.remind.split("  ")[1])}
                          </div>
                          <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-kana whitespace-nowrap">
                            {currentKana.remind.split("  ")[1]}
                          </div>
                        </div>
                      </div>
                    }
                    showHint={showRemind}
                  />
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
                disabled={totalCount === 0}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                開始學習 ({totalCount} 個假名)
              </Button>
            ) : (
              <div className="flex gap-2 items-center max-w-2xl mx-auto">
                {practiceMode === PracticeMode.memory && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full flex-shrink-0"
                    onClick={() => setShowRemind((prev) => !prev)}
                    title="顯示/隱藏提示 (H)"
                  >
                    <Lightbulb className="h-5 w-5" />
                  </Button>
                )}
                <Button className="flex-1" size="lg" onClick={getRandomKana}>
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
    </div>
  );
}
