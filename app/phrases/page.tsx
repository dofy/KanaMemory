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
  type PhraseObject,
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
  const [selectedCategory, setSelectedCategory] = useState<string>("greeting");
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
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      const savedSelections = LocalStorage.load<Record<string, boolean>>("phrases_selections");
      
      // 应用保存的选择状态
      if (savedSelections) {
        for (const category in phrasesData) {
          phrasesData[category].forEach(phrase => {
            const key = `${phrase.japanese}_${phrase.romaji}`;
            if (savedSelections[key] !== undefined) {
              phrase.selected = savedSelections[key];
            }
          });
        }
      }
      
      setAllPhrases(phrasesData);
      
      const savedCategory = LocalStorage.load<string>("phrases_selectedCategory");
      if (savedCategory && phrasesData[savedCategory]) {
        setSelectedCategory(savedCategory);
        updateDisplayPhrases(savedCategory, phrasesData);
      } else {
        updateDisplayPhrases("greeting", phrasesData);
      }
    } catch (error) {
      console.error("Failed to load phrases data:", error);
      toast.error("加载句子数据失败");
    }
  };

  const loadSettings = () => {
    const savedPracticeMode = LocalStorage.load<PracticeMode>("phrases_practiceMode");
    const savedDisplayMode = LocalStorage.load<UnifiedDisplayMode>("phrases_displayMode");

    if (savedPracticeMode) {
      setPracticeMode(savedPracticeMode);
    }
    if (savedDisplayMode) {
      setDisplayMode(savedDisplayMode);
    }
  };

  // 更新显示的句子池（选中的句子 + 模糊匹配）
  const updateDisplayPhrases = (category: string, phrases: Record<string, PhraseObject[]> = allPhrases) => {
    const categoryPhrases = phrases[category] || [];
    const selected = categoryPhrases.filter(p => p.selected);
    
    // 提取关键词
    const keywords = new Set<string>();
    selected.forEach(phrase => {
      phrase.japanese.split('').forEach(c => keywords.add(c));
      phrase.chinese.split(/[，。、]/).forEach(w => w.trim() && keywords.add(w.trim()));
    });
    
    // 模糊匹配：如果句子包含任一关键词，自动关联
    const matched = categoryPhrases.filter(phrase => {
      if (phrase.selected) return true;
      
      for (const kw of keywords) {
        if (phrase.japanese.includes(kw) || phrase.chinese.includes(kw)) {
          return true;
        }
      }
      return false;
    });
    
    setDisplayPhrases([...matched]);
    setUsedPhrases([]);
  };

  // 保存选择状态
  const saveSelections = (phrases: Record<string, PhraseObject[]>) => {
    const selections: Record<string, boolean> = {};
    for (const category in phrases) {
      phrases[category].forEach(phrase => {
        const key = `${phrase.japanese}_${phrase.romaji}`;
        selections[key] = phrase.selected;
      });
    }
    LocalStorage.save("phrases_selections", selections);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    LocalStorage.save("phrases_selectedCategory", category);
    updateDisplayPhrases(category);
  };

  const handleStart = () => {
    const selectedPhrases = displayPhrases.filter(p => p.selected);
    if (selectedPhrases.length === 0) {
      toast.error("请至少选择一个句子");
      return;
    }
    
    setDisplayPhrases(selectedPhrases);
    setUsedPhrases([]);
    setIsStarted(true);
    getNextPhrase();
  };

  const getNextPhrase = () => {
    setShowHint(practiceMode === PracticeMode.learning);

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

    // 学习模式自动发音
    if (practiceMode === PracticeMode.learning) {
      setTimeout(() => handlePronounce(), 500);
    }
  };

  const getDisplayText = (phrase: PhraseObject, mode: UnifiedDisplayMode): string => {
    switch (mode) {
      case "mixed":
        return `${phrase.japanese}\n${phrase.romaji}\n${phrase.chinese}`;
      case "kana":
        return phrase.japanese;
      case "romaji":
        return phrase.romaji;
      default:
        return phrase.chinese;
    }
  };

  const getHintText = (phrase: PhraseObject, mode: UnifiedDisplayMode): string => {
    switch (mode) {
      case "mixed":
        return "";  // 混合模式不需要提示
      case "kana":
        return `${phrase.romaji}\n${phrase.chinese}`;
      case "romaji":
        return `${phrase.japanese}\n${phrase.chinese}`;
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
        await ttsServiceRef.current.speak(currentPhrase.phrase.japanese);
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

  // 选择面板功能
  const togglePhraseSelection = (index: number) => {
    const updated = { ...allPhrases };
    updated[selectedCategory][index].selected = !updated[selectedCategory][index].selected;
    setAllPhrases(updated);
    saveSelections(updated);
    updateDisplayPhrases(selectedCategory, updated);
  };

  const handleSelectAll = () => {
    const updated = { ...allPhrases };
    updated[selectedCategory] = updated[selectedCategory].map(p => ({ ...p, selected: true }));
    setAllPhrases(updated);
    saveSelections(updated);
    updateDisplayPhrases(selectedCategory, updated);
    toast.success(`已选择全部 ${updated[selectedCategory].length} 个句子`);
  };

  const handleDeselectAll = () => {
    const updated = { ...allPhrases };
    updated[selectedCategory] = updated[selectedCategory].map(p => ({ ...p, selected: false }));
    setAllPhrases(updated);
    saveSelections(updated);
    updateDisplayPhrases(selectedCategory, updated);
    toast.success("已取消选择所有句子");
  };

  const handleInvertSelection = () => {
    const updated = { ...allPhrases };
    updated[selectedCategory] = updated[selectedCategory].map(p => ({ ...p, selected: !p.selected }));
    setAllPhrases(updated);
    saveSelections(updated);
    updateDisplayPhrases(selectedCategory, updated);
    const selectedCount = updated[selectedCategory].filter(p => p.selected).length;
    toast.success(`已反选，当前选择 ${selectedCount} 个句子`);
  };

  // 搜索过滤
  const filteredPhrases = (allPhrases[selectedCategory] || []).filter(phrase => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      phrase.japanese.includes(query) ||
      phrase.romaji.toLowerCase().includes(query) ||
      phrase.chinese.includes(query)
    );
  });

  // 键盘快捷键
  useEffect(() => {
    if (!isStarted || isSettingsOpen || isSelectionOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
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
  }, [isStarted, isSettingsOpen, isSelectionOpen, currentPhrase]);

  const currentCategoryPhrases = allPhrases[selectedCategory] || [];
  const selectedCount = currentCategoryPhrases.filter(p => p.selected).length;

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
                    <h2 className="text-2xl font-bold">句子学习</h2>
                    <Button
                      variant="outline"
                      onClick={() => setIsSelectionOpen(true)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      选择句子
                    </Button>
                  </div>

                  {/* 场景分类选择 */}
                  <div className="space-y-2">
                    <Label>场景分类</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                        <Button
                          key={key}
                          variant={selectedCategory === key ? "default" : "outline"}
                          onClick={() => handleCategoryChange(key)}
                        >
                          {name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">已选择</p>
                      <p className="text-2xl font-bold">{selectedCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">含关联</p>
                      <p className="text-2xl font-bold">{displayPhrases.length}</p>
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
                  <div className="text-4xl font-bold min-h-[200px] flex items-center justify-center whitespace-pre-line px-4">
                    {currentPhrase.displayText}
                  </div>

                  {showHint && currentPhrase.hint && (
                    <div className="text-2xl text-muted-foreground whitespace-pre-line px-4">
                      {currentPhrase.hint}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={getNextPhrase} size="lg">
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
                    假名显示（日语原文）
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
            <SheetTitle>选择句子 - {CATEGORY_NAMES[selectedCategory as keyof typeof CATEGORY_NAMES]}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            {/* 场景切换 */}
            <div className="flex gap-2 flex-wrap">
              {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(key)}
                >
                  {name}
                </Button>
              ))}
            </div>

            {/* 搜索框 */}
            <Input
              placeholder="搜索句子..."
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
              已选择: {selectedCount} / {currentCategoryPhrases.length}
            </div>

            {/* 句子列表 */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredPhrases.map((phrase, index) => {
                const originalIndex = currentCategoryPhrases.indexOf(phrase);
                return (
                  <div
                    key={originalIndex}
                    className="flex items-start gap-2 p-2 hover:bg-muted rounded"
                  >
                    <Checkbox
                      checked={phrase.selected}
                      onCheckedChange={() => togglePhraseSelection(originalIndex)}
                      className="mt-1"
                    />
                    <Label
                      className="cursor-pointer flex-1 text-sm"
                      onClick={() => togglePhraseSelection(originalIndex)}
                    >
                      <div className="font-medium">{phrase.japanese}</div>
                      <div className="text-muted-foreground">
                        {phrase.chinese}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {phrase.romaji}
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
