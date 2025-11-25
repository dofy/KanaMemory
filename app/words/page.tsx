"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Navigation } from "@/components/navigation";
import { ThemeSettings } from "@/components/theme-settings";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { DataLoader } from "@/lib/data-loader";
import { LocalStorage } from "@/lib/local-storage";
import { TTSService } from "@/lib/tts";
import {
  PracticeMode,
  type WordObject,
  type UnifiedDisplayMode,
} from "@/lib/types";
import {
  BookOpen,
  Brain,
  Eye,
  Filter,
  Lightbulb,
  Settings,
  Volume2,
  CheckSquare,
  Square,
  Minimize2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function WordsPage() {
  const [mounted, setMounted] = useState(false);
  const ttsServiceRef = useRef<TTSService | null>(null);

  const [allWords, setAllWords] = useState<WordObject[]>([]);
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
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
    loadWordsData();
    loadSettings();

    if (!ttsServiceRef.current) {
      ttsServiceRef.current = new TTSService();
    }
  }, []);

  const loadWordsData = async () => {
    try {
      const wordsData = await DataLoader.loadWordsData();
      const savedSelections = LocalStorage.load<Record<string, boolean>>("words_selections");
      
      // 应用保存的选择状态
      if (savedSelections) {
        wordsData.forEach((word, index) => {
          const key = `${word.hiragana}_${word.katakana}_${word.kanji}`;
          if (savedSelections[key] !== undefined) {
            word.selected = savedSelections[key];
          }
        });
      }
      
      setAllWords(wordsData);
      updateDisplayWords(wordsData);
    } catch (error) {
      console.error("Failed to load words data:", error);
      toast.error("加载单词数据失败");
    }
  };

  const loadSettings = () => {
    const savedPracticeMode = LocalStorage.load<PracticeMode>("words_practiceMode");
    const savedDisplayMode = LocalStorage.load<UnifiedDisplayMode>("words_displayMode");

    if (savedPracticeMode) {
      setPracticeMode(savedPracticeMode);
    }
    if (savedDisplayMode) {
      setDisplayMode(savedDisplayMode);
    }
  };

  // 更新显示的单词池（选中的单词 + 模糊匹配）
  const updateDisplayWords = (words: WordObject[]) => {
    const selected = words.filter(w => w.selected);
    
    // 提取关键词
    const keywords = new Set<string>();
    selected.forEach(word => {
      // 从汉字提取
      word.kanji.split('').forEach(c => keywords.add(c));
      // 从假名提取
      word.hiragana.split('').forEach(c => keywords.add(c));
    });
    
    // 模糊匹配：如果单词包含任一关键词，自动关联
    const matched = words.filter(word => {
      if (word.selected) return true;
      
      for (const kw of keywords) {
        if (word.kanji.includes(kw) || word.hiragana.includes(kw) || word.katakana.includes(kw)) {
          return true;
        }
      }
      return false;
    });
    
    setDisplayWords([...matched]);
    setUsedWords([]);
  };

  // 保存选择状态
  const saveSelections = (words: WordObject[]) => {
    const selections: Record<string, boolean> = {};
    words.forEach(word => {
      const key = `${word.hiragana}_${word.katakana}_${word.kanji}`;
      selections[key] = word.selected;
    });
    LocalStorage.save("words_selections", selections);
  };

  const handleStart = () => {
    const selectedWords = displayWords.filter(w => w.selected);
    if (selectedWords.length === 0) {
      toast.error("请至少选择一个单词");
      return;
    }
    
    setDisplayWords(selectedWords);
    setUsedWords([]);
    setIsStarted(true);
    getNextWord();
  };

  const getNextWord = () => {
    setShowHint(practiceMode === PracticeMode.learning);

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

    // 学习模式自动发音
    if (practiceMode === PracticeMode.learning) {
      setTimeout(() => handlePronounce(), 500);
    }
  };

  const getDisplayText = (word: WordObject, mode: UnifiedDisplayMode): string => {
    switch (mode) {
      case "mixed":
        return `${word.hiragana}${word.pitch}\n${word.katakana}${word.pitch}\n${word.kanji}\n${word.chinese}\n${word.romaji}`;
      case "kana":
        return `${word.hiragana}${word.pitch}\n${word.katakana}${word.pitch}`;
      case "romaji":
        return word.romaji;
      default:
        return word.chinese;
    }
  };

  const getHintText = (word: WordObject, mode: UnifiedDisplayMode): string => {
    switch (mode) {
      case "mixed":
        return "";  // 混合模式不需要提示
      case "kana":
        return `${word.kanji}\n${word.chinese}\n${word.romaji}`;
      case "romaji":
        return `${word.hiragana}${word.pitch} / ${word.katakana}${word.pitch}\n${word.kanji}\n${word.chinese}`;
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

  // 选择面板功能
  const toggleWordSelection = (index: number) => {
    const updated = [...allWords];
    updated[index].selected = !updated[index].selected;
    setAllWords(updated);
    saveSelections(updated);
    updateDisplayWords(updated);
  };

  const handleSelectAll = () => {
    const updated = allWords.map(w => ({ ...w, selected: true }));
    setAllWords(updated);
    saveSelections(updated);
    updateDisplayWords(updated);
    toast.success(`已选择全部 ${updated.length} 个单词`);
  };

  const handleDeselectAll = () => {
    const updated = allWords.map(w => ({ ...w, selected: false }));
    setAllWords(updated);
    saveSelections(updated);
    updateDisplayWords(updated);
    toast.success("已取消选择所有单词");
  };

  const handleInvertSelection = () => {
    const updated = allWords.map(w => ({ ...w, selected: !w.selected }));
    setAllWords(updated);
    saveSelections(updated);
    updateDisplayWords(updated);
    const selectedCount = updated.filter(w => w.selected).length;
    toast.success(`已反选，当前选择 ${selectedCount} 个单词`);
  };

  // 搜索过滤
  const filteredWords = allWords.filter(word => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      word.hiragana.includes(query) ||
      word.katakana.includes(query) ||
      word.kanji.includes(query) ||
      word.romaji.toLowerCase().includes(query) ||
      word.chinese.includes(query)
    );
  });

  // 键盘快捷键
  useEffect(() => {
    if (!isStarted || isSettingsOpen || isSelectionOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
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
  }, [isStarted, isSettingsOpen, isSelectionOpen, currentWord]);

  const selectedCount = allWords.filter(w => w.selected).length;
  const matchedCount = displayWords.filter(w => w.selected).length;

  const keyboardShortcuts = [
    { key: "Space/Enter", description: "下一个" },
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
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">单词学习</h2>
                    <Button
                      variant="outline"
                      onClick={() => setIsSelectionOpen(true)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      选择单词
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">已选择</p>
                      <p className="text-2xl font-bold">{selectedCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">含关联</p>
                      <p className="text-2xl font-bold">{displayWords.length}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleStart}
                    className="w-full"
                    size="lg"
                    disabled={selectedCount === 0}
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    开始学习
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
                  <div className="text-6xl font-bold min-h-[200px] flex items-center justify-center whitespace-pre-line">
                    {currentWord.displayText}
                  </div>

                  {showHint && currentWord.hint && (
                    <div className="text-3xl text-muted-foreground whitespace-pre-line">
                      {currentWord.hint}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={getNextWord} size="lg">
                <Brain className="h-5 w-5 mr-2" />
                下一个 (Space)
              </Button>

              {practiceMode === PracticeMode.memory && (
                <>
                  <Button onClick={handleShowHint} variant="outline" size="lg">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    提示 (H)
                  </Button>
                  <Button onClick={handlePronounce} variant="outline" size="lg">
                    <Volume2 className="h-5 w-5 mr-2" />
                    发音 (P)
                  </Button>
                </>
              )}

              <Button
                onClick={() => setIsStarted(false)}
                variant="secondary"
                size="lg"
              >
                退出
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* 设置面板 */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>设置</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* 学习模式 */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4" />
                学习模式
              </h3>
              <RadioGroup
                value={practiceMode}
                onValueChange={(v) => handlePracticeModeChange(v as PracticeMode)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={PracticeMode.learning} id="learning" />
                  <Label htmlFor="learning" className="cursor-pointer">
                    学习模式（自动提示+发音）
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={PracticeMode.memory} id="memory" />
                  <Label htmlFor="memory" className="cursor-pointer">
                    记忆模式（手动控制）
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 显示内容 */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                显示内容
              </h3>
              <RadioGroup
                value={displayMode}
                onValueChange={(v) => handleDisplayModeChange(v as UnifiedDisplayMode)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="mixed" />
                  <Label htmlFor="mixed" className="cursor-pointer">
                    混合显示（全部信息）
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kana" id="kana" />
                  <Label htmlFor="kana" className="cursor-pointer">
                    假名显示
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="romaji" id="romaji" />
                  <Label htmlFor="romaji" className="cursor-pointer">
                    罗马音显示
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 主题设置 */}
            <ThemeSettings />

            {/* 键盘快捷键 */}
            <KeyboardShortcuts shortcuts={keyboardShortcuts} />
          </div>
        </SheetContent>
      </Sheet>

      {/* 选择面板 */}
      <Sheet open={isSelectionOpen} onOpenChange={setIsSelectionOpen}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>选择单词</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            {/* 搜索框 */}
            <Input
              placeholder="搜索单词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* 批量操作 */}
            <div className="flex gap-2">
              <Button onClick={handleSelectAll} variant="outline" size="sm">
                <CheckSquare className="h-4 w-4 mr-1" />
                全选
              </Button>
              <Button onClick={handleDeselectAll} variant="outline" size="sm">
                <Square className="h-4 w-4 mr-1" />
                全不选
              </Button>
              <Button onClick={handleInvertSelection} variant="outline" size="sm">
                <Minimize2 className="h-4 w-4 mr-1" />
                反选
              </Button>
            </div>

            {/* 统计 */}
            <div className="p-3 bg-muted rounded-lg text-sm">
              已选择: {selectedCount} / {allWords.length}
            </div>

            {/* 单词列表 */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredWords.map((word, index) => {
                const originalIndex = allWords.indexOf(word);
                return (
                  <div
                    key={originalIndex}
                    className="flex items-start gap-2 p-2 hover:bg-muted rounded"
                  >
                    <Checkbox
                      checked={word.selected}
                      onCheckedChange={() => toggleWordSelection(originalIndex)}
                      className="mt-1"
                    />
                    <Label
                      className="cursor-pointer flex-1 text-sm"
                      onClick={() => toggleWordSelection(originalIndex)}
                    >
                      <div className="font-medium">
                        {word.kanji} ({word.hiragana}{word.pitch})
                      </div>
                      <div className="text-muted-foreground">
                        {word.chinese} · {word.romaji}
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
