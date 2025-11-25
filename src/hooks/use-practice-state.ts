import { useState, useEffect } from "react";
import { LocalStorage } from "@/lib/local-storage";
import { PracticeMode } from "@/lib/types";

interface UsePracticeStateConfig<T = string> {
  storagePrefix: string;
  defaultPracticeMode?: PracticeMode;
  defaultDisplayMode?: T;
}

export function usePracticeState<T = string>({
  storagePrefix,
  defaultPracticeMode = PracticeMode.memory,
  defaultDisplayMode,
}: UsePracticeStateConfig<T>) {
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(defaultPracticeMode);
  const [displayMode, setDisplayMode] = useState<T | undefined>(defaultDisplayMode);
  const [autoPlaySound, setAutoPlaySound] = useState(false);

  useEffect(() => {
    // Load saved practice mode
    const savedPracticeMode = LocalStorage.load<PracticeMode>(
      `${storagePrefix}_practiceMode`
    );
    if (savedPracticeMode) {
      setPracticeMode(savedPracticeMode);
    }

    // Load saved display mode
    const savedDisplayMode = LocalStorage.load<T>(
      `${storagePrefix}_displayMode`
    );
    if (savedDisplayMode) {
      setDisplayMode(savedDisplayMode);
    }

    // Load saved auto play sound
    const savedAutoPlaySound = LocalStorage.load<boolean>(
      `${storagePrefix}_autoPlaySound`
    );
    if (savedAutoPlaySound !== null) {
      setAutoPlaySound(savedAutoPlaySound);
    }
  }, [storagePrefix]);

  const handlePracticeModeChange = (mode: PracticeMode) => {
    setPracticeMode(mode);
    LocalStorage.save(`${storagePrefix}_practiceMode`, mode);
  };

  const handleDisplayModeChange = (mode: T) => {
    setDisplayMode(mode);
    LocalStorage.save(`${storagePrefix}_displayMode`, mode);
  };

  const handleAutoPlaySoundChange = (enabled: boolean) => {
    setAutoPlaySound(enabled);
    LocalStorage.save(`${storagePrefix}_autoPlaySound`, enabled);
  };

  return {
    practiceMode,
    displayMode,
    autoPlaySound,
    setPracticeMode: handlePracticeModeChange,
    setDisplayMode: handleDisplayModeChange,
    setAutoPlaySound: handleAutoPlaySoundChange,
  };
}

