import {
  db,
  isDataOutdated,
  setDataVersion,
  DATA_VERSIONS,
  type DictKanaItem,
  type DictWordItem,
  type DictPhraseItem,
} from "./db";
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

  private static convertKanaItem(item: KanaItem, fyType: FYType): MemoObject {
    return {
      ...item,
      fyType,
      selected: fyType === 0,
      labels: [],
      displayText: item.hiragana,
      displayText2: item.katakana,
      remind: item.romaji,
    };
  }

  private static getFyType(type: string): FYType {
    switch (type) {
      case "seion":
        return 0;
      case "dakuon":
        return 1;
      case "yoon":
        return 2;
      default:
        return 0;
    }
  }

  // Load kana data - prioritize IndexedDB, fallback to fetch
  static async loadKanaData(): Promise<MemoObject[]> {
    if (this.kanaCache) {
      return this.kanaCache;
    }

    try {
      const needsUpdate = await isDataOutdated("kana");

      if (!needsUpdate) {
        const storedData = await db.kana.toArray();
        if (storedData.length > 0) {
          this.kanaCache = storedData.map((item) =>
            this.convertKanaItem(
              {
                hiragana: item.hiragana,
                katakana: item.katakana,
                romaji: item.romaji,
              },
              this.getFyType(item.type)
            )
          );
          return this.kanaCache;
        }
      }

      // Fetch from server and update IndexedDB
      const response = await fetch("/dict/kana.json");
      if (!response.ok) {
        throw new Error(`Failed to load kana data: ${response.statusText}`);
      }

      const data: KanaDataJson = await response.json();

      // Store in IndexedDB (use hiragana as primary key since romaji can have duplicates)
      const kanaItems: DictKanaItem[] = [
        ...data.seion.map((item) => ({
          hiragana: item.hiragana,
          katakana: item.katakana,
          romaji: item.romaji,
          type: "seion" as const,
        })),
        ...data.dakuon.map((item) => ({
          hiragana: item.hiragana,
          katakana: item.katakana,
          romaji: item.romaji,
          type: "dakuon" as const,
        })),
        ...data.yoon.map((item) => ({
          hiragana: item.hiragana,
          katakana: item.katakana,
          romaji: item.romaji,
          type: "yoon" as const,
        })),
      ];

      await db.transaction("rw", db.kana, db.dataVersions, async () => {
        await db.kana.clear();
        await db.kana.bulkAdd(kanaItems);
        await setDataVersion("kana", DATA_VERSIONS.kana);
      });

      this.kanaCache = [
        ...data.seion.map((item) => this.convertKanaItem(item, 0)),
        ...data.dakuon.map((item) => this.convertKanaItem(item, 1)),
        ...data.yoon.map((item) => this.convertKanaItem(item, 2)),
      ];

      return this.kanaCache;
    } catch (error) {
      console.error("Error loading kana data:", error);
      throw error;
    }
  }

  // Load words data - prioritize IndexedDB, fallback to fetch
  static async loadWordsData(): Promise<WordsData> {
    if (this.wordsCache) {
      return this.wordsCache;
    }

    try {
      const needsUpdate = await isDataOutdated("words");

      if (!needsUpdate) {
        const storedData = await db.words.toArray();
        if (storedData.length > 0) {
          this.wordsCache = storedData.map((item) => ({
            hiragana: item.hiragana,
            japanese: item.japanese,
            romaji: item.romaji,
            chinese: item.chinese,
            pitch: item.pitch,
            selected: true,
          }));
          return this.wordsCache;
        }
      }

      // Fetch from server and update IndexedDB
      const response = await fetch("/dict/words.json");
      if (!response.ok) {
        throw new Error(`Failed to load words data: ${response.statusText}`);
      }

      const data: WordItem[] = await response.json();

      // Store in IndexedDB
      const wordItems: DictWordItem[] = data.map((item, index) => ({
        id: `word_${index}`,
        hiragana: item.hiragana,
        japanese: item.japanese,
        romaji: item.romaji,
        chinese: item.chinese,
        pitch: item.pitch,
      }));

      await db.transaction("rw", db.words, db.dataVersions, async () => {
        await db.words.clear();
        await db.words.bulkAdd(wordItems);
        await setDataVersion("words", DATA_VERSIONS.words);
      });

      this.wordsCache = data.map((word) => ({
        ...word,
        selected: true,
      }));

      return this.wordsCache;
    } catch (error) {
      console.error("Error loading words data:", error);
      throw error;
    }
  }

  // Load phrases data - prioritize IndexedDB, fallback to fetch
  static async loadPhrasesData(): Promise<PhrasesData> {
    if (this.phrasesCache) {
      return this.phrasesCache;
    }

    try {
      const needsUpdate = await isDataOutdated("phrases");

      if (!needsUpdate) {
        const storedData = await db.phrases.toArray();
        if (storedData.length > 0) {
          // Group by category
          const grouped: PhrasesData = {};
          for (const item of storedData) {
            if (!grouped[item.category]) {
              grouped[item.category] = [];
            }
            grouped[item.category].push({
              japanese: item.japanese,
              hiragana: item.hiragana,
              romaji: item.romaji,
              chinese: item.chinese,
              selected: true,
            });
          }
          this.phrasesCache = grouped;
          return this.phrasesCache;
        }
      }

      // Fetch from server and update IndexedDB
      const response = await fetch("/dict/phrases.json");
      if (!response.ok) {
        throw new Error(`Failed to load phrases data: ${response.statusText}`);
      }

      const data: Record<string, PhraseItem[]> = await response.json();

      // Store in IndexedDB
      const phraseItems: DictPhraseItem[] = [];
      for (const category in data) {
        data[category].forEach((item, index) => {
          phraseItems.push({
            id: `${category}_${index}`,
            category,
            japanese: item.japanese,
            hiragana: item.hiragana,
            romaji: item.romaji,
            chinese: item.chinese,
          });
        });
      }

      await db.transaction("rw", db.phrases, db.dataVersions, async () => {
        await db.phrases.clear();
        await db.phrases.bulkAdd(phraseItems);
        await setDataVersion("phrases", DATA_VERSIONS.phrases);
      });

      this.phrasesCache = {};
      for (const category in data) {
        this.phrasesCache[category] = data[category].map((phrase) => ({
          ...phrase,
          selected: true,
        }));
      }

      return this.phrasesCache;
    } catch (error) {
      console.error("Error loading phrases data:", error);
      return {};
    }
  }

  static async getAllWords(): Promise<WordObject[]> {
    return await this.loadWordsData();
  }

  static async getPhrasesByCategory(category: string): Promise<PhraseObject[]> {
    const phrasesData = await this.loadPhrasesData();
    return phrasesData[category] || [];
  }

  static async getPhraseCategories(): Promise<string[]> {
    const phrasesData = await this.loadPhrasesData();
    return Object.keys(phrasesData);
  }

  static clearCache(): void {
    this.kanaCache = null;
    this.wordsCache = null;
    this.phrasesCache = null;
  }
}
