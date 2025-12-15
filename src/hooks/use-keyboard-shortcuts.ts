import { useEffect } from "react";

// Page-level keyboard shortcuts config
interface KeyboardShortcutsConfig {
  onNext?: () => void;
  onToggleHint?: () => void;
  onPlaySound?: () => void;
  onPrev?: () => void;
  onMarkIncorrect?: () => void;
  onMarkCorrect?: () => void;
  onStart?: () => void;
  onToggleSettings?: () => void;
  isStarted?: boolean;
  isSettingsOpen?: boolean;
  isDialogOpen?: boolean; // Any dialog open (help, badge, etc.)
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onNext,
  onToggleHint,
  onPlaySound,
  onPrev,
  onMarkIncorrect,
  onMarkCorrect,
  onStart,
  onToggleSettings,
  isStarted = false,
  isSettingsOpen = false,
  isDialogOpen = false,
  enabled = true,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Settings shortcut
      if (key === "s" && !isDialogOpen && onToggleSettings) {
        e.preventDefault();
        onToggleSettings();
        return;
      }

      // Start session (when available)
      if (!isStarted && !isSettingsOpen && !isDialogOpen) {
        if (key === "enter" && onStart) {
          e.preventDefault();
          onStart();
          return;
        }
      }

      // Practice shortcuts (only work when started and no dialogs open)
      if (isStarted && !isSettingsOpen && !isDialogOpen) {
        switch (key) {
          case " ":
          case "arrowright":
          case "n":
            if (onNext) {
              e.preventDefault();
              onNext();
            }
            break;
          case "h":
            if (onToggleHint) {
              e.preventDefault();
              onToggleHint();
            }
            break;
          case "arrowleft":
            if (onPrev) {
              e.preventDefault();
              onPrev();
            }
            break;
          case "x":
            if (onMarkIncorrect) {
              e.preventDefault();
              onMarkIncorrect();
            }
            break;
          case "y":
            if (onMarkCorrect) {
              e.preventDefault();
              onMarkCorrect();
            }
            break;
          case "p":
          case "v":
            if (onPlaySound) {
              e.preventDefault();
              onPlaySound();
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    onNext,
    onToggleHint,
    onPlaySound,
    onPrev,
    onMarkIncorrect,
    onMarkCorrect,
    onStart,
    onToggleSettings,
    isStarted,
    isSettingsOpen,
    isDialogOpen,
    enabled,
  ]);
}

// Standard shortcuts list for help dialog
export const STANDARD_SHORTCUTS = [
  { key: "S", description: "開關設定" },
  { key: "?", description: "開關幫助" },
  { key: "G H", description: "回到首頁" },
  { key: "G K", description: "前往假名學習" },
  { key: "G W", description: "前往單詞學習" },
  { key: "G P", description: "前往句子學習" },
  { key: "G S", description: "前往學習方案" },
  { key: "G B", description: "前往成就勳章" },
  { key: "Enter", description: "開始學習" },
  { key: "Space / N / →", description: "下一個" },
  { key: "←", description: "上一個（學習模式）" },
  { key: "H", description: "顯示/隱藏提示" },
  { key: "X", description: "標記：還不會（學習方案學習頁）" },
  { key: "Y", description: "標記：已掌握（學習方案學習頁）" },
  { key: "P / V", description: "播放發音" },
];
