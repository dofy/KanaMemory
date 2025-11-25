

import { Keyboard } from "lucide-react";

interface KeyboardShortcut {
  key: string;
  description: string;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
        <Keyboard className="h-4 w-4" />
        鍵盤快捷鍵
      </h3>
      <div className="rounded-lg border bg-card p-3 sm:p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded text-[10px] sm:text-xs font-mono">
                {shortcut.key}
              </kbd>
              <span className="text-muted-foreground">
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

