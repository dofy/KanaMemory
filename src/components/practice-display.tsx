import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PracticeDisplayProps {
  content: ReactNode;
  hint?: ReactNode;
  showHint?: boolean;
  className?: string;
}

export function PracticeDisplay({
  content,
  hint,
  showHint = false,
  className,
}: PracticeDisplayProps) {
  const shouldShowHint = showHint && !!hint;

  return (
    <div
      className={cn(
        "w-full flex flex-col",
        shouldShowHint
          ? "gap-4 sm:gap-6 md:gap-8 py-4 sm:py-6 md:py-8"
          : "gap-3 sm:gap-4 md:gap-6 py-3 sm:py-4 md:py-6",
        className
      )}
    >
      <div className="flex justify-center">{content}</div>
      <div
        className={cn(
          "flex justify-center",
          shouldShowHint && "min-h-[56px] sm:min-h-[80px]"
        )}
      >
        {shouldShowHint ? hint : null}
      </div>
    </div>
  );
}
