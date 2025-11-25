export class TTSService {
  private isSpeechSynthesisSupported: boolean;
  private japaneseVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;

  constructor() {
    this.isSpeechSynthesisSupported =
      typeof window !== "undefined" && "speechSynthesis" in window;

    if (this.isSpeechSynthesisSupported) {
      this.initVoices();
    }
  }

  private initVoices() {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();

      if (voices.length > 0) {
        const japaneseVoices = voices.filter((voice) =>
          voice.lang.startsWith("ja")
        );

        this.japaneseVoice = japaneseVoices[0] || null;
        this.voicesLoaded = true;
      }
    };

    loadVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    setTimeout(() => {
      if (!this.voicesLoaded || !this.japaneseVoice) {
        loadVoices();
      }
    }, 100);
  }

  private romajiToKana(romaji: string): string {
    const romajiToKanaMap: Record<string, string> = {
      // basic vowels
      a: "あ",
      i: "い",
      u: "う",
      e: "え",
      o: "お",
      // k-group
      ka: "か",
      ki: "き",
      ku: "く",
      ke: "け",
      ko: "こ",
      // g-group
      ga: "が",
      gi: "ぎ",
      gu: "ぐ",
      ge: "げ",
      go: "ご",
      // s-group
      sa: "さ",
      si: "し",
      shi: "し",
      su: "す",
      se: "せ",
      so: "そ",
      // z-group
      za: "ざ",
      zi: "じ",
      ji: "じ",
      zu: "ず",
      ze: "ぜ",
      zo: "ぞ",
      // t-group
      ta: "た",
      ti: "ち",
      chi: "ち",
      tu: "つ",
      tsu: "つ",
      te: "て",
      to: "と",
      // d-group
      da: "だ",
      di: "ぢ",
      du: "づ",
      de: "で",
      do: "ど",
      // n-group
      na: "な",
      ni: "に",
      nu: "ぬ",
      ne: "ね",
      no: "の",
      // h-group
      ha: "は",
      hi: "ひ",
      hu: "ふ",
      fu: "ふ",
      he: "へ",
      ho: "ほ",
      // b-group
      ba: "ば",
      bi: "び",
      bu: "ぶ",
      be: "べ",
      bo: "ぼ",
      // p-group
      pa: "ぱ",
      pi: "ぴ",
      pu: "ぷ",
      pe: "ぺ",
      po: "ぽ",
      // m-group
      ma: "ま",
      mi: "み",
      mu: "む",
      me: "め",
      mo: "も",
      // y-group
      ya: "や",
      yu: "ゆ",
      yo: "よ",
      // r-group
      ra: "ら",
      ri: "り",
      ru: "る",
      re: "れ",
      ro: "ろ",
      // w-group
      wa: "わ",
      wo: "を",
      // n
      n: "ん",
      // yoon (palatalized sounds)
      kya: "きゃ",
      kyu: "きゅ",
      kyo: "きょ",
      gya: "ぎゃ",
      gyu: "ぎゅ",
      gyo: "ぎょ",
      sya: "しゃ",
      sha: "しゃ",
      syu: "しゅ",
      shu: "しゅ",
      syo: "しょ",
      sho: "しょ",
      zya: "じゃ",
      ja: "じゃ",
      zyu: "じゅ",
      ju: "じゅ",
      zyo: "じょ",
      jo: "じょ",
      cya: "ちゃ",
      cha: "ちゃ",
      cyu: "ちゅ",
      chu: "ちゅ",
      cyo: "ちょ",
      cho: "ちょ",
      nya: "にゃ",
      nyu: "にゅ",
      nyo: "にょ",
      hya: "ひゃ",
      hyu: "ひゅ",
      hyo: "ひょ",
      bya: "びゃ",
      byu: "びゅ",
      byo: "びょ",
      pya: "ぴゃ",
      pyu: "ぴゅ",
      pyo: "ぴょ",
      mya: "みゃ",
      myu: "みゅ",
      myo: "みょ",
      rya: "りゃ",
      ryu: "りゅ",
      ryo: "りょ",
    };

    return romajiToKanaMap[romaji.toLowerCase()] || romaji;
  }

  private isRomaji(text: string): boolean {
    return /^[a-zA-Z]+$/.test(text);
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (
        !this.isSpeechSynthesisSupported ||
        !this.voicesLoaded ||
        !this.japaneseVoice
      ) {
        reject(new Error("TTS not available"));
        return;
      }

      let textToSpeak = text;
      if (this.isRomaji(text)) {
        textToSpeak = this.romajiToKana(text);
      }

      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "ja-JP";
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.voice = this.japaneseVoice;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      speechSynthesis.speak(utterance);
    });
  }

  stop() {
    if (this.isSpeechSynthesisSupported) {
      speechSynthesis.cancel();
    }
  }
}
