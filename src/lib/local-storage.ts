export class LocalStorage {
  private static isBrowser = typeof window !== "undefined"

  public static save<T>(key: string, value: T): void {
    if (!this.isBrowser) return
    try {
      const data = JSON.stringify(value)
      window.localStorage.setItem(key, data)
    } catch (error) {
      console.error("LocalStorage save error:", error)
    }
  }

  public static load<T>(key: string): T | null {
    if (!this.isBrowser) return null
    try {
      const json = window.localStorage.getItem(key)
      if (!json) return null
      return JSON.parse(json) as T
    } catch (error) {
      console.error("LocalStorage load error:", error)
      return null
    }
  }

  public static remove(key: string): void {
    if (!this.isBrowser) return
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error("LocalStorage remove error:", error)
    }
  }
}

