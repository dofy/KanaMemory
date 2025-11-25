"use client";

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
import { Navigation } from "@/components/navigation";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { KanaSelector } from "@/components/kana-selector";
import { DataLoader } from "@/lib/data-loader";
import { LocalStorage } from "@/lib/local-storage";
import { TTSService } from "@/lib/tts";
import {
  PracticeMode,
  type WordObject,
  type UnifiedDisplayMode,
  type MemoObject,
} from "@/lib/types";
import {
  BookOpen,
  Brain,
  Eye,
  Filter,
  Lightbulb,
  Volume2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function WordsPage() {
  const [mounted, setMounted] = useState(false);
  const ttsServiceRef = useRef<TTSService | null>(null);

  const [allWords, setAllWords] = useState<WordObject[]>([]);
  const [kanaList, setKanaList] = useState<MemoObject[]>([]); // 假名选择列表
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
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(
    PracticeMode.memory
  );
  const [displayMode, setDisplayMode] = useState<UnifiedDisplayMode>("mixed");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoPlaySound, setAutoPlaySound] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
    loadSettings();

    if (!ttsServiceRef.current) {
      ttsServiceRef.current = new TTSService();
    }
  }, []);

  const loadData = async () => {
    try {
      // 加载单词数据
      const wordsData = await DataLoader.loadWordsData();
      setAllWords(wordsData);

      // 加载假名数据（用于选择器）
      const kanaData = await DataLoader.loadKanaData();
      const savedKanaSelections = LocalStorage.load<string[]>("words_kana_selections");
      
      // 应用保存的假名选择
      const initializedKanaList = kanaData.map(k => ({
        ...k,
        selected: savedKanaSelections ? savedKanaSelections.includes(k.romaji) : k.romaji.startsWith('a') // 默认选中a行
      }));
      
      setKanaList(initializedKanaList);
      updateDisplayWords(wordsData, initializedKanaList);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("加载数据失败");
    }
  };

  const loadSettings = () => {
    const savedPracticeMode = LocalStorage.load<PracticeMode>("words_practiceMode");
    const savedDisplayMode = LocalStorage.load<UnifiedDisplayMode>("words_displayMode");
    const savedAutoPlaySound = LocalStorage.load<boolean>("words_autoPlaySound");

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

  // 核心筛选逻辑：根据选中的假名筛选单词
  const updateDisplayWords = (words: WordObject[], kanas: MemoObject[]) => {
    const selectedKanas = kanas.filter(k => k.selected);
    
    if (selectedKanas.length === 0) {
      setDisplayWords([]);
      return;
    }

    // 提取选中的假名字符（平假名）
    const selectedChars = new Set(selectedKanas.map(k => k.hiragana));

    // 筛选逻辑：单词的假名中是否包含任意一个选中的假名
    // 优化：如果单词的所有假名都在选中列表中，则匹配度更高（可选）
    // 目前逻辑：只要包含选中的假名，就纳入学习池
    const matched = words.filter(word => {
      // 移除声调标记
      const cleanHiragana = word.hiragana.replace(/[①②③④⑤⑥⑦⑧⑨⓪]/g, '');
      
      // 检查单词中的每个字符
      for (const char of cleanHiragana) {
        if (selectedChars.has(char)) {
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
    
    // 保存选择
    const selectedRomaji = updatedKanaList
      .filter(k => k.selected)
      .map(k => k.romaji);
    LocalStorage.save("words_kana_selections", selectedRomaji);
  };

  const handleStart = () => {
    if (displayWords.length === 0) {
      toast.error("请至少选择一个假名，且确保有匹配的单词");
      return;
    }
    
    setUsedWords([]);
    setIsStarted(true);
    getNextWord();
  };

  const getNextWord = () => {
    setShowHint(practiceMode === PracticeMode.learning);

    // 混合模式：随机选择显示假名或日文
    if (displayMode === "mixed") {
      setMixedModeDisplay(Math.random() > 0.5 ? "kana" : "japanese");
    }

    if (displayWords.length === 0) {
      if (usedWords.length > 0) {
        setDisplayWords(usedWords);
        setUsedWords([]);
        return;
      }
      toast.info("没有更多单词了");
      return;
    }

    const randomIndex = Math.floor(Math.random() * displayWords.length);
    const selected = displayWords[randomIndex];

    const displayText = getDisplayText(selected, displayMode);
    const hintText = getHintText(selected, displayMode);

    setCurrentWord({
      word: selected,
      displayText,
      hint: hintText,
    });

    setDisplayWords(prev => prev.filter((_, i) => i !== randomIndex));
    setUsedWords(prev => [...prev, selected]);
  };

  // 用于混合模式的随机选择
  const [mixedModeDisplay, setMixedModeDisplay] = useState<"kana" | "japanese">("kana");

  const getDisplayText = (word: WordObject, mode: UnifiedDisplayMode): string => {
    switch (mode) {
      case "mixed":
        // 混合模式：随机显示假名或日文
        if (mixedModeDisplay === "kana") {
          return word.hiragana;
        } else {
          return word.japanese;
        }
      case "kana":
        // 假名模式：显示假名
        return word.hiragana;
      case "japanese":
        // 日文模式：显示日文
        return word.japanese;
      default:
        return word.chinese;
    }
  };

  const getHintText = (word: WordObject, mode: UnifiedDisplayMode): string => {
    switch (mode) {
      case "mixed":
        // 混合模式：提示显示其他信息
        if (mixedModeDisplay === "kana") {
          return `${word.japanese}\n${word.romaji}\n${word.chinese}`;
        } else {
          return `${word.hiragana}\n${word.romaji}\n${word.chinese}`;
        }
      case "kana":
        // 假名模式：提示显示日文、罗马音、中文
        return `${word.japanese}\n${word.romaji}\n${word.chinese}`;
      case "japanese":
        // 日文模式：提示显示假名、罗马音、中文
        return `${word.hiragana}\n${word.romaji}\n${word.chinese}`;
      default:
        return "";
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
  };

  const handlePronounce = async () => {
    if (currentWord.word && ttsServiceRef.current) {
      try {
        // 优先发音假名
        await ttsServiceRef.current.speak(currentWord.word.hiragana);
      } catch (error) {
        console.error("TTS error:", error);
      }
    }
  };

  const handlePracticeModeChange = (mode: PracticeMode) => {
    setPracticeMode(mode);
    LocalStorage.save("words_practiceMode", mode);
  };

  const handleDisplayModeChange = (mode: UnifiedDisplayMode) => {
    setDisplayMode(mode);
    LocalStorage.save("words_displayMode", mode);
  };

  const handleAutoPlaySoundChange = (enabled: boolean) => {
    setAutoPlaySound(enabled);
    LocalStorage.save("words_autoPlaySound", enabled);
  };

  // 自动发音：当切换到新单词时自动发音
  useEffect(() => {
    if (
      isStarted &&
      practiceMode === PracticeMode.learning &&
      autoPlaySound &&
      currentWord.word?.hiragana
    ) {
      const timer = setTimeout(() => {
        if (ttsServiceRef.current && currentWord.word) {
          ttsServiceRef.current.speak(currentWord.word.hiragana).catch(() => {
            // TTS failed silently
          });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentWord.word?.hiragana, isStarted, practiceMode, autoPlaySound]);

  // 键盘快捷键
  useEffect(() => {
    if (!isStarted || isSettingsOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        getNextWord();
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
  }, [isStarted, isSettingsOpen, currentWord]);

  const selectedKanaCount = kanaList.filter(k => k.selected).length;
  const matchedWordCount = displayWords.length + usedWords.length;

  const keyboardShortcuts = [
    { key: "Space", description: "下一个" },
    { key: "H", description: "提示" },
    { key: "P", description: "发音" },
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
                    <h2 className="text-2xl font-bold">单词学习</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">已选假名</p>
                      <p className="text-2xl font-bold">{selectedKanaCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">关联单词</p>
                      <p className="text-2xl font-bold">{matchedWordCount}</p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    <Lightbulb className="inline h-4 w-4 mr-1 mb-1 text-blue-500" />
                    提示：选择基础假名，系统会自动筛选出包含这些假名的单词进行学习。
                  </div>

                  <Button
                    onClick={handleStart}
                    className="w-full"
                    size="lg"
                    disabled={matchedWordCount === 0}
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    开始学习 ({matchedWordCount} 个单词)
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
                  <div className="text-6xl font-bold min-h-[200px] flex items-center justify-center text-foreground">
                    <span className="whitespace-pre-line">
                      {currentWord.displayText}
                      {currentWord.word && currentWord.word.pitch && (
                        <sup className="text-2xl text-muted-foreground ml-1 font-normal">
                          {currentWord.word.pitch}
                        </sup>
                      )}
                    </span>
                  </div>

                  {/* 提示内容 - 明显的视觉区分 */}
                  {showHint && currentWord.hint && (
                    <div className="space-y-3 pt-4 border-t border-dashed border-muted-foreground/30">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">
                        提示
                      </div>
                      <div className="text-2xl sm:text-3xl text-muted-foreground whitespace-pre-line leading-relaxed">
                        {currentWord.hint}
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
              <Button className="flex-1 max-w-xs" size="lg" onClick={getNextWord}>
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
                            切換單詞時自動朗讀
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

              {/* 假名范围选择 */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    假名範圍
                  </h3>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    關聯: <span className="font-bold text-foreground">{matchedWordCount}</span>
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

              {/* 键盘快捷键 */}
              <KeyboardShortcuts shortcuts={keyboardShortcuts} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
