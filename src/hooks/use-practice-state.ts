import { useState, useEffect, useCallback } from "react";
import { Storage } from "@/lib/storage";
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
  const [practiceMode, setPracticeModeState] =
    useState<PracticeMode>(defaultPracticeMode);
  const [displayMode, setDisplayModeState] = useState<T | undefined>(
    defaultDisplayMode
  );
  const [autoPlaySound, setAutoPlaySoundState] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const [savedPracticeMode, savedDisplayMode, savedAutoPlaySound] =
        await Promise.all([
          Storage.load<PracticeMode>(`${storagePrefix}_practiceMode`),
          Storage.load<T>(`${storagePrefix}_displayMode`),
          Storage.load<boolean>(`${storagePrefix}_autoPlaySound`),
        ]);

      if (savedPracticeMode !== null) {
        setPracticeModeState(savedPracticeMode);
      }
      if (savedDisplayMode !== null) {
        setDisplayModeState(savedDisplayMode);
      }
      if (savedAutoPlaySound !== null) {
        setAutoPlaySoundState(savedAutoPlaySound);
      }

      setIsLoaded(true);
    };

    loadSettings();
  }, [storagePrefix]);

  const setPracticeMode = useCallback(
    (mode: PracticeMode) => {
      setPracticeModeState(mode);
      Storage.save(`${storagePrefix}_practiceMode`, mode);
    },
    [storagePrefix]
  );

  const setDisplayMode = useCallback(
    (mode: T) => {
      setDisplayModeState(mode);
      Storage.save(`${storagePrefix}_displayMode`, mode);
    },
    [storagePrefix]
  );

  const setAutoPlaySound = useCallback(
    (enabled: boolean) => {
      setAutoPlaySoundState(enabled);
      Storage.save(`${storagePrefix}_autoPlaySound`, enabled);
    },
    [storagePrefix]
  );

  return {
    practiceMode,
    displayMode,
    autoPlaySound,
    isLoaded,
    setPracticeMode,
    setDisplayMode,
    setAutoPlaySound,
  };
}
