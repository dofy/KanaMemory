import type { StudyPlanDefinition } from "./db-types";

let plansCache: StudyPlanDefinition[] | null = null;

export async function loadStudyPlans(): Promise<StudyPlanDefinition[]> {
  if (plansCache) {
    return plansCache;
  }

  try {
    const response = await fetch("/dict/study-plans.json");
    if (!response.ok) {
      throw new Error(`Failed to load study plans: ${response.statusText}`);
    }

    plansCache = await response.json();
    return plansCache!;
  } catch (error) {
    console.error("Error loading study plans:", error);
    return [];
  }
}

export function getStudyPlanById(
  plans: StudyPlanDefinition[],
  id: string
): StudyPlanDefinition | undefined {
  return plans.find((p) => p.id === id);
}

export function clearPlansCache(): void {
  plansCache = null;
}

