"use client";

import { Button } from "@/components/ui/button";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
        <Monitor className="h-4 w-4" />
        主題模式
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={theme === "light" ? "default" : "outline"}
          onClick={() => setTheme("light")}
          className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
        >
          <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          亮色
        </Button>
        <Button
          variant={theme === "dark" ? "default" : "outline"}
          onClick={() => setTheme("dark")}
          className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
        >
          <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          暗色
        </Button>
        <Button
          variant={theme === "system" ? "default" : "outline"}
          onClick={() => setTheme("system")}
          className="flex-1 text-xs sm:text-sm h-auto py-2 sm:py-2.5"
        >
          <Monitor className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          系統
        </Button>
      </div>
    </div>
  );
}

