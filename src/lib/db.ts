import Dexie, { type Table } from "dexie";
import type {
  UserSettings,
  LearningProgress,
  CheckInRecord,
  Badge,
  TestRecord,
  DictKanaItem,
  DictWordItem,
  DictPhraseItem,
  DataVersion,
} from "./db-types";

const DB_NAME = "KanaMemoryDB";
const CURRENT_VERSION = 1;

class KanaMemoryDB extends Dexie {
  // User data
  settings!: Table<UserSettings, string>;
  learningProgress!: Table<LearningProgress, string>;
  checkIn!: Table<CheckInRecord, string>;
  badges!: Table<Badge, string>;
  testRecords!: Table<TestRecord, string>;

  // Dictionary data
  kana!: Table<DictKanaItem, string>;
  words!: Table<DictWordItem, string>;
  phrases!: Table<DictPhraseItem, string>;
  dataVersions!: Table<DataVersion, string>;

  constructor() {
    super(DB_NAME);

    this.version(CURRENT_VERSION).stores({
      // User data stores
      settings: "key",
      learningProgress: "id, type, lastPracticed, masteryLevel",
      checkIn: "date, timestamp",
      badges: "id, type, unlockedAt",
      testRecords: "id, type, timestamp",
      // Dictionary data stores
      kana: "hiragana, type, romaji",
      words: "id, hiragana",
      phrases: "id, category",
      dataVersions: "key",
    });

    // Future version upgrade example:
    // this.version(2).stores({
    //   // Add new indexes or stores here
    // }).upgrade(tx => {
    //   // Migration logic
    // });
  }
}

export const db = new KanaMemoryDB();

export async function initDatabase(): Promise<void> {
  await db.open();
}

// Data version constants - update these when JSON files change
export const DATA_VERSIONS = {
  kana: "1.0.0",
  words: "1.0.0",
  phrases: "1.0.0",
};

export async function getDataVersion(
  key: string
): Promise<DataVersion | undefined> {
  return db.dataVersions.get(key);
}

export async function setDataVersion(
  key: string,
  version: string
): Promise<void> {
  await db.dataVersions.put({
    key,
    version,
    updatedAt: Date.now(),
  });
}

export async function isDataOutdated(key: string): Promise<boolean> {
  const stored = await getDataVersion(key);
  if (!stored) return true;
  return stored.version !== DATA_VERSIONS[key as keyof typeof DATA_VERSIONS];
}

export {
  type UserSettings,
  type LearningProgress,
  type CheckInRecord,
  type Badge,
  type TestRecord,
  type DictKanaItem,
  type DictWordItem,
  type DictPhraseItem,
  type DataVersion,
};
