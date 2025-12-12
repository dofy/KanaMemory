import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HelpDialog } from "@/components/help-dialog";
import { STANDARD_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";

interface GlobalShortcutsContextType {
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  toggleHelp: () => void;
}

const GlobalShortcutsContext = createContext<GlobalShortcutsContextType | null>(
  null
);

export function useGlobalShortcuts() {
  const context = useContext(GlobalShortcutsContext);
  if (!context) {
    throw new Error(
      "useGlobalShortcuts must be used within GlobalShortcutsProvider"
    );
  }
  return context;
}

interface GlobalShortcutsProviderProps {
  children: ReactNode;
}

export function GlobalShortcutsProvider({
  children,
}: GlobalShortcutsProviderProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleHelp = useCallback(() => {
    setIsHelpOpen((prev) => !prev);
  }, []);

  useEffect(() => {
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
        let handled = true;
        switch (key) {
          case "h":
            navigate("/");
            break;
          case "k":
            navigate("/kana");
            break;
          case "w":
            navigate("/words");
            break;
          case "p":
            navigate("/phrases");
            break;
          case "s":
            navigate("/study-plans");
            break;
          case "b":
            navigate("/badges");
            break;
          default:
            handled = false;
            break;
        }
        if (handled) {
          e.preventDefault();
        }
        resetGoto();
        return;
      }

      if (key === "g") {
        awaitingGoto = true;
        gotoTimer = window.setTimeout(resetGoto, 800);
        return;
      }

      // Help shortcut (global)
      if (key === "?") {
        e.preventDefault();
        toggleHelp();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      resetGoto();
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [navigate, toggleHelp, location.pathname]);

  return (
    <GlobalShortcutsContext.Provider
      value={{ isHelpOpen, setIsHelpOpen, toggleHelp }}
    >
      {children}
      <HelpDialog
        open={isHelpOpen}
        onOpenChange={setIsHelpOpen}
        shortcuts={STANDARD_SHORTCUTS}
      />
    </GlobalShortcutsContext.Provider>
  );
}
