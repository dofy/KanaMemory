import { useEffect, useRef } from "react";
import { TTSService } from "@/lib/tts";

export function useTTS() {
  const ttsServiceRef = useRef<TTSService | null>(null);

  useEffect(() => {
    if (!ttsServiceRef.current) {
      ttsServiceRef.current = new TTSService();
    }
  }, []);

  const speak = async (text: string) => {
    if (ttsServiceRef.current) {
      try {
        await ttsServiceRef.current.speak(text);
      } catch (error) {
        console.error("TTS error:", error);
      }
    }
  };

  return { speak };
}

