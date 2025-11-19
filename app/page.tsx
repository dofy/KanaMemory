"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { KanaData } from "@/lib/kana-data";
import { LocalStorage } from "@/lib/local-storage";
import { TTSService } from "@/lib/tts";
import { FYType, type DisplayMode, type MemoObject } from "@/lib/types";
import {
  BookOpen,
  Brain,
  CheckSquare,
  Eye,
  Github,
  Keyboard,
  Lightbulb,
  ListChecks,
  Moon,
  Settings,
  Square,
  Sun,
  Volume2,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const ttsServiceRef = useRef<TTSService | null>(null);

  const [kanaList, setKanaList] = useState<MemoObject[]>([]);
  const [displayKanaList, setDisplayKanaList] = useState<MemoObject[]>([]);
  const [usedKanaList, setUsedKanaList] = useState<MemoObject[]>([]);

  const [currentKana, setCurrentKana] = useState({
    id: "",
    displayText: "",
    remind: "",
  });

  const [isStarted, setIsStarted] = useState(false);
  const [showRemind, setShowRemind] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("mixed");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [autoPlaySound, setAutoPlaySound] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadKanaData();

    if (!ttsServiceRef.current) {
      ttsServiceRef.current = new TTSService();
    }
  }, []);

  const loadKanaData = () => {
    const kd = new KanaData();
    const savedData = LocalStorage.load<MemoObject[]>("selectedData");
    const savedMode = LocalStorage.load<DisplayMode>("displayType");
    const savedLearningMode = LocalStorage.load<boolean>("learningMode");
    const savedAutoPlaySound = LocalStorage.load<boolean>("autoPlaySound");

    if (savedData) {
      setKanaList(savedData);
    } else {
      setKanaList(kd.getJP50());
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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "t":
        case "d":
          // Toggle theme
          setTheme(theme === "dark" ? "light" : "dark");
          break;
        case "s":
          // Toggle settings
          setIsSettingsOpen((prev) => !prev);
          break;
        case " ":
        case "arrowright":
        case "n":
          // Next kana (prevent when settings open)
          if (isStarted && !isSettingsOpen) {
            e.preventDefault();
            getRandomKana();
          }
          break;
        case "h":
        case "?":
          // Show/toggle hint
          if (isStarted && !isSettingsOpen) {
            setShowRemind((prev) => !prev);
          }
          break;
        case "p":
        case "v":
          // Play sound
          if (isStarted && currentKana.displayText && !isSettingsOpen) {
            playSound(currentKana.displayText);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, setTheme, isStarted, isSettingsOpen, currentKana.displayText]);

  const toggleKanaSelection = (id: string) => {
    const updated = kanaList.map((k) =>
      k.id === id ? { ...k, selected: !k.selected } : k
    );
    setKanaList(updated);
    LocalStorage.save("selectedData", updated);

    const selectedCount = updated.filter((k) => k.selected).length;
    toast.success(`已更新選擇，當前已選擇 ${selectedCount} 個假名`);
  };

  const selectKanasByType = (type: FYType, selected: boolean) => {
    const updated = kanaList.map((k) =>
      k.fyType === type ? { ...k, selected } : k
    );
    setKanaList(updated);
    LocalStorage.save("selectedData", updated);

    const typeName =
      type === FYType.seion ? "清音" : type === FYType.dakuon ? "濁音" : "拗音";
    const action = selected ? "全選" : "清空";
    toast.success(`已${action}${typeName}`);
  };

  const handleStart = () => {
    setIsStarted(true);
    getRandomKana();
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
      case "mixed":
        const rand = Math.round(Math.random());
        displayText =
          rand === 1 ? selectedKana.displayText : selectedKana.displayText2;
        break;
      case "hiragana":
        displayText = selectedKana.displayText;
        break;
      case "katakana":
        displayText = selectedKana.displayText2;
        break;
      case "romaji":
        displayText = selectedKana.remind;
        break;
      case "swap":
        const rand2 = Math.round(Math.random());
        displayText =
          rand2 === 1 ? selectedKana.displayText : selectedKana.displayText2;
        break;
    }

    // Smart remind logic based on what's displayed
    let remindText = "";
    if (displayText === selectedKana.displayText) {
      // Displaying Hiragana → show Katakana + Romaji
      remindText = `${selectedKana.displayText2}  ${selectedKana.remind}`;
    } else if (displayText === selectedKana.displayText2) {
      // Displaying Katakana → show Hiragana + Romaji
      remindText = `${selectedKana.displayText}  ${selectedKana.remind}`;
    } else if (displayText === selectedKana.remind) {
      // Displaying Romaji → show Hiragana + Katakana
      remindText = `${selectedKana.displayText}  ${selectedKana.displayText2}`;
    }

    if (currentKana.displayText !== displayText) {
      setCurrentKana({
        id: selectedKana.id,
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

  const playSound = (text: string) => {
    if (ttsServiceRef.current) {
      ttsServiceRef.current.speak(text).catch(() => {
        // TTS failed silently
      });
    }
  };

  const getKanaType = (text: string): string => {
    if (!text) return "";
    if (/^[a-z]+$/i.test(text)) return "羅馬音";

    const firstChar = text.charCodeAt(0);
    // Hiragana range: U+3040 - U+309F
    if (firstChar >= 0x3040 && firstChar <= 0x309f) return "平假名";
    // Katakana range: U+30A0 - U+30FF
    if (firstChar >= 0x30a0 && firstChar <= 0x30ff) return "片假名";

    return "";
  };

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    LocalStorage.save("displayType", mode);

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
    LocalStorage.save("learningMode", isLearning);
    if (isStarted) {
      setShowRemind(isLearning);
    }

    const modeName = isLearning ? "學習模式" : "記憶模式";
    toast.success(`已切換至${modeName}`);
  };

  const handleAutoPlaySoundChange = (enabled: boolean) => {
    setAutoPlaySound(enabled);
    LocalStorage.save("autoPlaySound", enabled);
    toast.success(enabled ? "已開啟自動發音" : "已關閉自動發音");
  };

  const goToGitHub = () => {
    window.open("https://github.com/dofy/KanaSyllabaryMemory", "_blank");
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
    <main className="min-h-screen flex flex-col sm:items-center sm:justify-center p-0 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl flex flex-col sm:block h-screen sm:h-auto sm:space-y-6">
        {/* Header */}
        <div className="relative px-4 pt-4 pb-3 sm:px-0 sm:pt-0 sm:pb-0 border-b sm:border-b-0">
          {/* Tool Buttons */}
          <div className="absolute top-4 right-4 sm:top-0 sm:right-0 flex gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
                <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b">
                  <SheetTitle className="text-lg sm:text-xl">設置</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 mb-4">
                  <div className="space-y-5 sm:space-y-6">
                    {/* Learning Mode */}
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        練習模式
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant={isLearningMode ? "default" : "outline"}
                          onClick={() => handleLearningModeChange(true)}
                          className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
                        >
                          <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                          學習模式
                        </Button>
                        <Button
                          variant={!isLearningMode ? "default" : "outline"}
                          onClick={() => handleLearningModeChange(false)}
                          className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
                        >
                          <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                          記憶模式
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isLearningMode
                          ? "學習模式：自動顯示提示，適合初學者"
                          : "記憶模式：手動顯示提示，適合複習鞏固"}
                      </p>

                      {/* Auto Play Sound - Sub-option for Learning Mode */}
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

                    {/* Kana Selection */}
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        批量操作
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border bg-card p-3 space-y-2">
                          <div className="text-xs font-medium text-center">
                            清音 {seionCount}/46
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="flex-1 h-8"
                              onClick={() =>
                                selectKanasByType(FYType.seion, true)
                              }
                              title="全選"
                            >
                              <CheckSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="flex-1 h-8"
                              onClick={() =>
                                selectKanasByType(FYType.seion, false)
                              }
                              title="清空"
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="rounded-lg border bg-card p-3 space-y-2">
                          <div className="text-xs font-medium text-center">
                            濁音 {dakuonCount}/25
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="flex-1 h-8"
                              onClick={() =>
                                selectKanasByType(FYType.dakuon, true)
                              }
                              title="全選"
                            >
                              <CheckSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="flex-1 h-8"
                              onClick={() =>
                                selectKanasByType(FYType.dakuon, false)
                              }
                              title="清空"
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="rounded-lg border bg-card p-3 space-y-2">
                          <div className="text-xs font-medium text-center">
                            拗音 {yoonCount}/33
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="flex-1 h-8"
                              onClick={() =>
                                selectKanasByType(FYType.yoon, true)
                              }
                              title="全選"
                            >
                              <CheckSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="flex-1 h-8"
                              onClick={() =>
                                selectKanasByType(FYType.yoon, false)
                              }
                              title="清空"
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Individual Kana Selection */}
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                        <ListChecks className="h-4 w-4" />
                        單個選擇
                      </h3>
                      <div className="space-y-4">
                        {/* 清音 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">
                              清音 ({seionCount}/46)
                            </h4>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                          <div className="grid grid-cols-5 gap-3 pt-1">
                            {kanaList
                              .filter((k) => k.fyType === FYType.seion)
                              .map((kana) => (
                                <div
                                  key={kana.id}
                                  className="flex items-center space-x-1.5 sm:space-x-2"
                                >
                                  <Checkbox
                                    id={kana.id}
                                    checked={kana.selected}
                                    onCheckedChange={() =>
                                      toggleKanaSelection(kana.id)
                                    }
                                    className="h-4 w-4"
                                  />
                                  <Label
                                    htmlFor={kana.id}
                                    className="text-sm sm:text-base cursor-pointer leading-tight"
                                  >
                                    {kana.displayText}
                                  </Label>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* 濁音 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">
                              濁音 ({dakuonCount}/25)
                            </h4>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                          <div className="grid grid-cols-5 gap-3 pt-1">
                            {kanaList
                              .filter((k) => k.fyType === FYType.dakuon)
                              .map((kana) => (
                                <div
                                  key={kana.id}
                                  className="flex items-center space-x-1.5 sm:space-x-2"
                                >
                                  <Checkbox
                                    id={kana.id}
                                    checked={kana.selected}
                                    onCheckedChange={() =>
                                      toggleKanaSelection(kana.id)
                                    }
                                    className="h-4 w-4"
                                  />
                                  <Label
                                    htmlFor={kana.id}
                                    className="text-sm sm:text-base cursor-pointer leading-tight"
                                  >
                                    {kana.displayText}
                                  </Label>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* 拗音 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">
                              拗音 ({yoonCount}/33)
                            </h4>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                          <div className="grid grid-cols-5 gap-3 pt-1">
                            {kanaList
                              .filter((k) => k.fyType === FYType.yoon)
                              .map((kana) => (
                                <div
                                  key={kana.id}
                                  className="flex items-center space-x-1.5 sm:space-x-2"
                                >
                                  <Checkbox
                                    id={kana.id}
                                    checked={kana.selected}
                                    onCheckedChange={() =>
                                      toggleKanaSelection(kana.id)
                                    }
                                    className="h-4 w-4"
                                  />
                                  <Label
                                    htmlFor={kana.id}
                                    className="text-sm sm:text-base cursor-pointer leading-tight"
                                  >
                                    {kana.displayText}
                                  </Label>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                        <Keyboard className="h-4 w-4" />
                        鍵盤快捷鍵
                      </h3>
                      <div className="rounded-lg border bg-card p-3 sm:p-4 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted rounded text-[10px] sm:text-xs font-mono">
                              T / D
                            </kbd>
                            <span className="text-muted-foreground">
                              切換主題
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted rounded text-[10px] sm:text-xs font-mono">
                              S
                            </kbd>
                            <span className="text-muted-foreground">
                              開關設置
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted rounded text-[10px] sm:text-xs font-mono">
                              Space
                            </kbd>
                            <span className="text-muted-foreground">
                              下一個
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted rounded text-[10px] sm:text-xs font-mono">
                              H / ?
                            </kbd>
                            <span className="text-muted-foreground">
                              顯示提示
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted rounded text-[10px] sm:text-xs font-mono">
                              P / V
                            </kbd>
                            <span className="text-muted-foreground">
                              播放發音
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10"
              onClick={goToGitHub}
            >
              <Github className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Title Section */}
          <div className="pr-20 sm:pr-24">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              假名記憶
            </h1>
          </div>
        </div>

        {/* Main Card */}
        <Card className="flex-1 flex flex-col border-0 sm:border-2 rounded-none sm:rounded-lg overflow-hidden sm:flex-initial">
          <CardContent className="flex-1 flex flex-col p-6 sm:p-8 md:p-12">
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 sm:space-y-8">
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
                  <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
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

            <div className="p-4 sm:px-0 sm:pb-0">
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
                <div className="flex gap-2 items-center">
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
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground/60 px-4 py-3 sm:px-2 sm:py-0 border-t sm:border-t-0">
          <p>
            Copyright © 2025 Powered by{" "}
            <a
              href="https://yahaha.net"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline underline-offset-2"
            >
              yahaha.net
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
