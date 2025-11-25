import { HelpDialog } from "@/components/help-dialog";
import { KanaSelector } from "@/components/kana-selector";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  STANDARD_SHORTCUTS,
  useKeyboardShortcuts,
} from "@/hooks/use-keyboard-shortcuts";
import { DataLoader } from "@/lib/data-loader";
import { LocalStorage } from "@/lib/local-storage";
import { TTSService } from "@/lib/tts";
import { FYType, type DisplayMode, type MemoObject } from "@/lib/types";
import {
  BookMarked,
  Eye,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function KanaPage() {
  const [mounted, setMounted] = useState(false);
  const ttsServiceRef = useRef<TTSService | null>(null);

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
  const [displayMode, setDisplayMode] = useState<DisplayMode>("mixed");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [autoPlaySound, setAutoPlaySound] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadKanaData();

    if (!ttsServiceRef.current) {
      ttsServiceRef.current = new TTSService();
    }
  }, []);

  const loadKanaData = async () => {
    const savedData = LocalStorage.load<MemoObject[]>("kana_selectedData");
    const savedMode = LocalStorage.load<DisplayMode>("kana_displayType");
    const savedLearningMode = LocalStorage.load<boolean>("kana_learningMode");
    const savedAutoPlaySound = LocalStorage.load<boolean>("kana_autoPlaySound");

    // Always load fresh data from JSON to ensure correct data structure
    const data = await DataLoader.loadKanaData();

    // If there's saved data, merge the selection state
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

    if (savedMode) {
      setDisplayMode(savedMode);
    }

    if (savedLearningMode !== null) {
      setIsLearningMode(savedLearningMode);
    }

    if (savedAutoPlaySound !== null) {
      setAutoPlaySound(savedAutoPlaySound);
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
      isLearningMode &&
      autoPlaySound &&
      currentKana.displayText
    ) {
      playSound(currentKana.displayText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKana.displayText]);

  const playSound = (text: string) => {
    if (ttsServiceRef.current) {
      ttsServiceRef.current.speak(text).catch(() => {
        // TTS failed silently
      });
    }
  };

  const getRandomKana = () => {
    setShowRemind(isLearningMode);

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

    // Smart remind logic based on what's displayed
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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNext: getRandomKana,
    onShowHint: () => setShowRemind((prev) => !prev),
    onPlaySound: () =>
      currentKana.displayText && playSound(currentKana.displayText),
    onToggleSettings: () => setIsSettingsOpen((prev) => !prev),
    onToggleHelp: () => setIsHelpOpen((prev) => !prev),
    isStarted,
    isSettingsOpen,
    isHelpOpen,
  });

  const handleKanaSelectionChange = (updatedList: MemoObject[]) => {
    setKanaList(updatedList);
    LocalStorage.save("kana_selectedData", updatedList);
  };

  const handleStart = () => {
    setIsStarted(true);
    getRandomKana();
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
    LocalStorage.save("kana_displayType", mode);

    const modeNames: Record<DisplayMode, string> = {
      mixed: "混合",
      hiragana: "平假名",
      katakana: "片假名",
      romaji: "羅馬音",
      swap: "互換",
    };
    toast.success(`已切換至${modeNames[mode]}模式`);
  };

  const handleLearningModeChange = (isLearning: boolean) => {
    setIsLearningMode(isLearning);
    LocalStorage.save("kana_learningMode", isLearning);
    if (isStarted) {
      setShowRemind(isLearning);
    }

    const modeName = isLearning ? "學習模式" : "記憶模式";
    toast.success(`已切換至${modeName}`);
  };

  const handleAutoPlaySoundChange = (enabled: boolean) => {
    setAutoPlaySound(enabled);
    LocalStorage.save("kana_autoPlaySound", enabled);
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
                  {/* Learning Mode */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      練習模式
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant={isLearningMode ? "default" : "outline"}
                        onClick={() => handleLearningModeChange(true)}
                        className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
                      >
                        <BookMarked className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                        學習模式
                      </Button>
                      <Button
                        variant={!isLearningMode ? "default" : "outline"}
                        onClick={() => handleLearningModeChange(false)}
                        className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
                      >
                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                        記憶模式
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isLearningMode
                        ? "學習模式：自動顯示提示，適合初學者"
                        : "記憶模式：手動顯示提示，適合複習鞏固"}
                    </p>

                    {/* Auto Play Sound */}
                    {isLearningMode && (
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
                                顯示假名時自動朗讀
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

                  {/* Display Mode */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      顯示內容
                    </h3>
                    <div className="flex justify-between gap-2">
                      {[
                        { value: "mixed", label: "混合" },
                        { value: "hiragana", label: "平假名" },
                        { value: "katakana", label: "片假名" },
                        { value: "romaji", label: "羅馬音" },
                        { value: "swap", label: "互換" },
                      ].map((mode) => (
                        <Button
                          key={mode.value}
                          variant={
                            displayMode === mode.value ? "default" : "outline"
                          }
                          onClick={() =>
                            handleDisplayModeChange(mode.value as DisplayMode)
                          }
                          className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
                        >
                          {mode.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 假名选择 */}
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
          <Card className="flex-1 flex flex-col !border-0 rounded-none sm:rounded-lg overflow-hidden shadow-none">
            <CardContent className="flex-1 flex items-center justify-center p-4 sm:p-6">
              <div className="w-full space-y-8 sm:space-y-12">
                {!isStarted ? (
                  <div className="text-center space-y-4 sm:space-y-6">
                    <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-muted-foreground">
                      準備
                    </div>
                    <p className="text-base sm:text-lg text-muted-foreground">
                      已選擇: {seionCount + dakuonCount + yoonCount} 個假名
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
                      <div className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-bold font-kana">
                        {currentKana.displayText}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-14 w-14 sm:h-16 sm:w-16 rounded-full hover:bg-accent flex-shrink-0"
                        onClick={() => playSound(currentKana.displayText)}
                      >
                        <Volume2 className="h-7 w-7 sm:h-8 sm:w-8" />
                      </Button>
                    </div>

                    {showRemind && (
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
                disabled={seionCount + dakuonCount + yoonCount === 0}
              >
                開始
              </Button>
            ) : (
              <div className="flex gap-2 items-center max-w-2xl mx-auto">
                {!isLearningMode && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full flex-shrink-0"
                    onClick={() => setShowRemind(true)}
                    title="顯示提示"
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
