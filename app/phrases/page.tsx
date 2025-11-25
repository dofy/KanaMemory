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
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Navigation } from "@/components/navigation";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
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
  Brain,
  Eye,
  Lightbulb,
  Settings,
  Volume2,
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

  const [allPhrases, setAllPhrases] = useState<Record<string, PhraseObject[]>>({});
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(["greeting"]));
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
  const [autoPlaySound, setAutoPlaySound] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadPhrasesData();
    loadSettings();

    if (!ttsServiceRef.current) {
      ttsServiceRef.current = new TTSService();
    }
  }, []);

  const loadPhrasesData = async () => {
    try {
      const phrasesData = await DataLoader.loadPhrasesData();
      setAllPhrases(phrasesData);
      
      const savedCategories = LocalStorage.load<string[]>("phrases_selectedCategories");
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
    const savedPracticeMode = LocalStorage.load<PracticeMode>("phrases_practiceMode");
    const savedDisplayMode = LocalStorage.load<UnifiedDisplayMode>("phrases_displayMode");
    const savedAutoPlaySound = LocalStorage.load<boolean>("phrases_autoPlaySound");

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
  const updateDisplayPhrases = (categories: Set<string>, phrases: Record<string, PhraseObject[]> = allPhrases) => {
    const allSelectedPhrases: PhraseObject[] = [];
    
    categories.forEach(category => {
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

    setDisplayPhrases(prev => prev.filter((_, i) => i !== randomIndex));
    setUsedPhrases(prev => [...prev, selected]);
  };

  // 用于混合模式的随机选择
  const [mixedModeDisplay, setMixedModeDisplay] = useState<"kana" | "japanese">("kana");

  const getDisplayText = (phrase: PhraseObject, mode: UnifiedDisplayMode): string => {
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

  const getHintText = (phrase: PhraseObject, mode: UnifiedDisplayMode): string => {
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
          ttsServiceRef.current.speak(currentPhrase.phrase.hiragana).catch(() => {
            // TTS failed silently
          });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPhrase.phrase?.hiragana, isStarted, practiceMode, autoPlaySound]);

  // 键盘快捷键
  useEffect(() => {
    if (!isStarted || isSettingsOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        getNextPhrase();
      } else if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        handleShowHint();
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        handlePronounce();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isStarted, isSettingsOpen, currentPhrase]);

  const totalPhraseCount = displayPhrases.length + usedPhrases.length;

  const keyboardShortcuts = [
    { key: "Space", description: "下一個" },
    { key: "H", description: "提示" },
    { key: "P", description: "發音" },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation
        showBackButton
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">
        {!isStarted ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">句子学习</h2>
                  </div>

                  {/* 场景分类选择（多选） */}
                  <div className="space-y-2">
                    <Label>场景分类（可多选）</Label>
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
                              onCheckedChange={() => handleCategoryToggle(key)}
                            />
                            <Label className="cursor-pointer flex-1">
                              <div className="font-medium">{name}</div>
                              <div className="text-sm text-muted-foreground">
                                {count} 个句子
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">已选分类</p>
                      <p className="text-2xl font-bold">{selectedCategories.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">总句子数</p>
                      <p className="text-2xl font-bold">{totalPhraseCount}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleStart}
                    className="w-full"
                    size="lg"
                    disabled={totalPhraseCount === 0}
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    开始学习 ({totalPhraseCount} 个句子)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="min-h-[400px] flex items-center justify-center">
              <CardContent className="pt-6 w-full">
                <div className="text-center space-y-6">
                  {/* 显示内容 - 主要内容区域 */}
                  <div className="text-5xl sm:text-6xl font-bold min-h-[200px] flex items-center justify-center whitespace-pre-line text-foreground leading-relaxed px-4">
                    {currentPhrase.displayText}
                  </div>

                  {/* 提示内容 - 明显的视觉区分 */}
                  {showHint && currentPhrase.hint && (
                    <div className="space-y-3 pt-4 border-t border-dashed border-muted-foreground/30 px-4">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">
                        提示
                      </div>
                      <div className="text-xl sm:text-2xl text-muted-foreground whitespace-pre-line leading-relaxed">
                        {currentPhrase.hint}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 items-center justify-center">
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
              <Button className="flex-1 max-w-xs" size="lg" onClick={getNextPhrase}>
                下一個
              </Button>
              {practiceMode === PracticeMode.memory && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full flex-shrink-0"
                  onClick={handlePronounce}
                  title="發音"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </main>

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
                  <Brain className="h-4 w-4" />
                  練習模式
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant={practiceMode === PracticeMode.learning ? "default" : "outline"}
                    onClick={() => handlePracticeModeChange(PracticeMode.learning)}
                    className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
                  >
                    <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                    學習模式
                  </Button>
                  <Button
                    variant={practiceMode === PracticeMode.memory ? "default" : "outline"}
                    onClick={() => handlePracticeModeChange(PracticeMode.memory)}
                    className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
                  >
                    <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
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
                        handleDisplayModeChange(mode.value as UnifiedDisplayMode)
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
                  <Settings className="h-4 w-4" />
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

              {/* 键盘快捷键 */}
              <KeyboardShortcuts shortcuts={keyboardShortcuts} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
