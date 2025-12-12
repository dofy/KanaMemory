import { db } from "./db";

export class Storage {
  private static isBrowser = typeof window !== "undefined";

  static async save<T>(key: string, value: T): Promise<void> {
    if (!this.isBrowser) return;

    try {
      await db.settings.put({
        key,
        value,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Storage save error:", error);
    }
  }

  static async load<T>(key: string): Promise<T | null> {
    if (!this.isBrowser) return null;

    try {
      const result = await db.settings.get(key);
      return result ? (result.value as T) : null;
    } catch (error) {
      console.error("Storage load error:", error);
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    if (!this.isBrowser) return;

    try {
      await db.settings.delete(key);
    } catch (error) {
      console.error("Storage remove error:", error);
    }
  }
}
