

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FYType, type MemoObject } from "@/lib/types";
import { CheckSquare, Minimize2, Square } from "lucide-react";

interface KanaSelectorProps {
  kanaList: MemoObject[];
  onSelectionChange: (updatedList: MemoObject[]) => void;
}

export function KanaSelector({ kanaList, onSelectionChange }: KanaSelectorProps) {
  const updateSelection = (updatedList: MemoObject[]) => {
    onSelectionChange(updatedList);
  };

  const toggleKanaSelection = (romaji: string) => {
    const updated = kanaList.map((k) =>
      k.romaji === romaji ? { ...k, selected: !k.selected } : k
    );
    updateSelection(updated);
  };

  const selectKanasByType = (type: FYType, selected: boolean) => {
    const updated = kanaList.map((k) =>
      k.fyType === type ? { ...k, selected } : k
    );
    updateSelection(updated);
  };

  const invertSelectionByType = (type: FYType) => {
    const updated = kanaList.map((k) =>
      k.fyType === type ? { ...k, selected: !k.selected } : k
    );
    updateSelection(updated);
  };

  // 按行分组逻辑
  const getKanaRows = (kanas: MemoObject[]) => {
    const rows: Record<string, MemoObject[]> = {};
    kanas.forEach((kana) => {
      // 简单的行分组逻辑：根据罗马音首字母
      let rowKey = "other";
      if (kana.fyType === FYType.seion) {
        const firstChar = kana.romaji.charAt(0);
        if (["a", "i", "u", "e", "o"].includes(kana.romaji)) rowKey = "a";
        else rowKey = firstChar;
      } else if (kana.fyType === FYType.dakuon) {
        const firstChar = kana.romaji.charAt(0);
        rowKey = firstChar;
      } else {
        // 拗音按首字母分组
        rowKey = kana.romaji.charAt(0);
      }
      
      if (!rows[rowKey]) rows[rowKey] = [];
      rows[rowKey].push(kana);
    });
    return rows;
  };

  // 渲染假名网格
  const renderKanaGrid = (type: FYType) => {
    const kanas = kanaList.filter((k) => k.fyType === type);
    // 5个一行
    const rows = [];
    for (let i = 0; i < kanas.length; i += 5) {
      rows.push(kanas.slice(i, i + 5));
    }

    const typeNames = {
      [FYType.seion]: "清音",
      [FYType.dakuon]: "濁音",
      [FYType.yoon]: "拗音",
    };
    
    const typeCounts = {
      [FYType.seion]: 46,
      [FYType.dakuon]: 25,
      [FYType.yoon]: 33,
    };
    
    const selectedCount = kanas.filter(k => k.selected).length;
    const totalCount = typeCounts[type];

    return (
      <div className="space-y-3">
        <div className="rounded-lg border bg-card p-3 space-y-2">
          <div className="text-xs font-medium text-center">
            {typeNames[type]} {selectedCount}/{totalCount}
          </div>
          <div className="flex gap-1.5">
            <Button
              size="icon"
              variant="ghost"
              className="flex-1 h-8"
              onClick={() => selectKanasByType(type, true)}
              title="全選"
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="flex-1 h-8"
              onClick={() => selectKanasByType(type, false)}
              title="清空"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {kanas.map((kana) => (
            <div
              key={kana.romaji}
              className="flex flex-col items-center p-1.5 sm:p-2 border rounded hover:bg-muted/50 cursor-pointer"
              onClick={() => toggleKanaSelection(kana.romaji)}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase">{kana.romaji}</span>
                <Checkbox
                  checked={kana.selected}
                  onCheckedChange={() => toggleKanaSelection(kana.romaji)}
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
              </div>
              <div className="text-base sm:text-lg font-bold">{kana.hiragana}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{kana.katakana}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Tabs defaultValue="seion" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-3 sm:mb-4">
        <TabsTrigger value="seion" className="text-xs sm:text-sm">清音</TabsTrigger>
        <TabsTrigger value="dakuon" className="text-xs sm:text-sm">濁音</TabsTrigger>
        <TabsTrigger value="yoon" className="text-xs sm:text-sm">拗音</TabsTrigger>
      </TabsList>
      <TabsContent value="seion" className="mt-0">
        {renderKanaGrid(FYType.seion)}
      </TabsContent>
      <TabsContent value="dakuon" className="mt-0">
        {renderKanaGrid(FYType.dakuon)}
      </TabsContent>
      <TabsContent value="yoon" className="mt-0">
        {renderKanaGrid(FYType.yoon)}
      </TabsContent>
    </Tabs>
  );
}

