import { useEffect } from "react";

interface KeyboardShortcutsConfig {
  onNext?: () => void;
  onToggleHint?: () => void;
  onPlaySound?: () => void;
  onStart?: () => void;
  onGoHome?: () => void;
  onGoKana?: () => void;
  onGoWords?: () => void;
  onGoPhrases?: () => void;
  onToggleSettings?: () => void;
  onToggleHelp?: () => void;
  isStarted?: boolean;
  isSettingsOpen?: boolean;
  isHelpOpen?: boolean;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onNext,
  onToggleHint,
  onPlaySound,
  onStart,
  onGoHome,
  onGoKana,
  onGoWords,
  onGoPhrases,
  onToggleSettings,
  onToggleHelp,
  isStarted = false,
  isSettingsOpen = false,
  isHelpOpen = false,
  enabled = true,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    if (!enabled) return;

    let awaitingGoto = false;
    let gotoTimer: number | undefined;

    const resetGoto = () => {
      awaitingGoto = false;
      if (gotoTimer) {
        clearTimeout(gotoTimer);
        gotoTimer = undefined;
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Gmail style navigation: g + key combos
      if (awaitingGoto) {
        switch (key) {
          case "h":
            if (onGoHome) {
              e.preventDefault();
              onGoHome();
            }
            break;
          case "k":
            if (onGoKana) {
              e.preventDefault();
              onGoKana();
            }
            break;
          case "w":
            if (onGoWords) {
              e.preventDefault();
              onGoWords();
            }
            break;
          case "p":
            if (onGoPhrases) {
              e.preventDefault();
              onGoPhrases();
            }
            break;
          default:
            break;
        }
        resetGoto();
        return;
      }

      if (key === "g") {
        awaitingGoto = true;
        gotoTimer = window.setTimeout(resetGoto, 800);
        return;
      }

      // Global shortcuts (work even when not started)
      if (key === "s") {
        if (!isHelpOpen && onToggleSettings) {
          e.preventDefault();
          onToggleSettings();
        }
        return;
      }

      if (key === "?") {
        if (!isSettingsOpen && onToggleHelp) {
          e.preventDefault();
          onToggleHelp();
        }
        return;
      }

      // Start session (when available)
      if (!isStarted && !isSettingsOpen && !isHelpOpen) {
        if (key === "enter" && onStart) {
          e.preventDefault();
          onStart();
          return;
        }
      }

      // Practice shortcuts (only work when started and no dialogs open)
      if (isStarted && !isSettingsOpen && !isHelpOpen) {
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
      resetGoto();
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    onNext,
    onToggleHint,
    onPlaySound,
    onStart,
    onGoHome,
    onGoKana,
    onGoWords,
    onGoPhrases,
    onToggleSettings,
    onToggleHelp,
    isStarted,
    isSettingsOpen,
    isHelpOpen,
    enabled,
  ]);
}

// Standard shortcuts list for all learning pages
export const STANDARD_SHORTCUTS = [
  { key: "S", description: "開關設置" },
  { key: "?", description: "開關幫助" },
  { key: "G H", description: "回到首頁" },
  { key: "G K", description: "前往假名學習" },
  { key: "G W", description: "前往單詞學習" },
  { key: "G P", description: "前往句子學習" },
  { key: "Enter", description: "開始學習" },
  { key: "Space / N / →", description: "下一個" },
  { key: "H", description: "顯示/隱藏提示" },
  { key: "P / V", description: "播放發音" },
];
