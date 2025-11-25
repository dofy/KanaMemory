import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface DisplayModeSelectorProps<T = string> {
  displayMode: T;
  modes: Array<{ value: T; label: string }>;
  onChange: (mode: T) => void;
}

export function DisplayModeSelector<T extends string = string>({
  displayMode,
  modes,
  onChange,
}: DisplayModeSelectorProps<T>) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
        <Eye className="h-4 w-4" />
        顯示內容
      </h3>
      <div className="flex justify-between gap-2">
        {modes.map((mode) => (
          <Button
            key={mode.value}
            variant={displayMode === mode.value ? "default" : "outline"}
            onClick={() => onChange(mode.value)}
            className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
          >
            {mode.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

