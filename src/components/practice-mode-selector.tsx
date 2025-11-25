import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PracticeMode } from "@/lib/types";
import { BookMarked, GraduationCap, Sparkles, Volume2 } from "lucide-react";

interface PracticeModeSelectorProps {
  practiceMode: PracticeMode;
  autoPlaySound: boolean;
  onPracticeModeChange: (mode: PracticeMode) => void;
  onAutoPlaySoundChange: (enabled: boolean) => void;
  autoPlayLabel?: string;
}

export function PracticeModeSelector({
  practiceMode,
  autoPlaySound,
  onPracticeModeChange,
  onAutoPlaySoundChange,
  autoPlayLabel = "切換時自動朗讀",
}: PracticeModeSelectorProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
        <GraduationCap className="h-4 w-4" />
        練習模式
      </h3>
      <div className="flex gap-2">
        <Button
          variant={practiceMode === PracticeMode.learning ? "default" : "outline"}
          onClick={() => onPracticeModeChange(PracticeMode.learning)}
          className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
        >
          <BookMarked className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          學習模式
        </Button>
        <Button
          variant={practiceMode === PracticeMode.memory ? "default" : "outline"}
          onClick={() => onPracticeModeChange(PracticeMode.memory)}
          className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
        >
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
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
                  {autoPlayLabel}
                </p>
              </div>
            </div>
            <Switch
              id="autoPlaySound"
              checked={autoPlaySound}
              onCheckedChange={onAutoPlaySoundChange}
              className="flex-shrink-0 scale-90"
            />
          </div>
        </div>
      )}
    </div>
  );
}

