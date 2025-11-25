import type {
  KanaDataJson,
  KanaItem,
  MemoObject,
  FYType,
  WordItem,
  WordObject,
  WordsData,
  PhraseItem,
  PhraseObject,
  PhrasesData,
} from "./types";

export class DataLoader {
  private static kanaCache: MemoObject[] | null = null;
  private static wordsCache: WordsData | null = null;
  private static phrasesCache: PhrasesData | null = null;

  // Convert KanaItem to MemoObject with UI state
  private static convertKanaItem(item: KanaItem, fyType: FYType): MemoObject {
    return {
      ...item,
      fyType,
      selected: fyType === 0, // Default: seion selected, others not
      labels: [],
      // Backward compatibility aliases
      displayText: item.hiragana,
      displayText2: item.katakana,
      remind: item.romaji,
    };
  }

  // Load kana data from JSON file
  static async loadKanaData(): Promise<MemoObject[]> {
    if (this.kanaCache) {
      return this.kanaCache;
    }

    try {
      const response = await fetch("/dict/kana.json");
      if (!response.ok) {
        throw new Error(`Failed to load kana data: ${response.statusText}`);
      }

      const data: KanaDataJson = await response.json();
      
      // Convert and add UI state
      this.kanaCache = [
        ...data.seion.map(item => this.convertKanaItem(item, 0)),   // FYType.seion
        ...data.dakuon.map(item => this.convertKanaItem(item, 1)),  // FYType.dakuon
        ...data.yoon.map(item => this.convertKanaItem(item, 2)),    // FYType.yoon
      ];

      return this.kanaCache;
    } catch (error) {
      console.error("Error loading kana data:", error);
      throw error;
    }
  }

  // Load words data from JSON file
  static async loadWordsData(): Promise<WordsData> {
    if (this.wordsCache) {
      return this.wordsCache;
    }

    try {
      const response = await fetch("/dict/words.json");
      if (!response.ok) {
        throw new Error(`Failed to load words data: ${response.statusText}`);
      }

      const data: WordItem[] = await response.json();
      
      // Add UI state to each word
      this.wordsCache = data.map(word => ({
        ...word,
        selected: true  // Default: all words selected
      }));
      
      return this.wordsCache;
    } catch (error) {
      console.error("Error loading words data:", error);
      throw error;
    }
  }

  // Load phrases data from JSON file
  static async loadPhrasesData(): Promise<PhrasesData> {
    if (this.phrasesCache) {
      return this.phrasesCache;
    }

    try {
      const response = await fetch("/dict/phrases.json");
      if (!response.ok) {
        throw new Error(`Failed to load phrases data: ${response.statusText}`);
      }

      const data: Record<string, PhraseItem[]> = await response.json();
      
      // Add UI state to each phrase
      this.phrasesCache = {};
      for (const category in data) {
        this.phrasesCache[category] = data[category].map(phrase => ({
          ...phrase,
          selected: true  // Default: all phrases selected
        }));
      }
      
      return this.phrasesCache;
    } catch (error) {
      console.error("Error loading phrases data:", error);
      return {};
    }
  }

  // Get all words (now just returns the cached data directly)
  static async getAllWords(): Promise<WordObject[]> {
    return await this.loadWordsData();
  }

  // Get phrases by category
  static async getPhrasesByCategory(category: string): Promise<PhraseObject[]> {
    const phrasesData = await this.loadPhrasesData();
    return phrasesData[category] || [];
  }

  // Get all phrase categories
  static async getPhraseCategories(): Promise<string[]> {
    const phrasesData = await this.loadPhrasesData();
    return Object.keys(phrasesData);
  }

  // Clear all caches
  static clearCache(): void {
    this.kanaCache = null;
    this.wordsCache = null;
    this.phrasesCache = null;
  }
}

