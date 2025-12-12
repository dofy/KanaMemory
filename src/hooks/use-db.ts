import { useState, useEffect } from "react";
import { initDatabase } from "@/lib/db";

interface UseDBResult {
  isReady: boolean;
  error: Error | null;
}

let dbInitialized = false;
let dbInitPromise: Promise<void> | null = null;

export function useDB(): UseDBResult {
  const [isReady, setIsReady] = useState(dbInitialized);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (dbInitialized) {
      setIsReady(true);
      return;
    }

    if (!dbInitPromise) {
      dbInitPromise = initDatabase()
        .then(() => {
          dbInitialized = true;
        })
        .catch((err) => {
          console.error("Database initialization failed:", err);
          throw err;
        });
    }

    dbInitPromise
      .then(() => {
        setIsReady(true);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      });
  }, []);

  return { isReady, error };
}
