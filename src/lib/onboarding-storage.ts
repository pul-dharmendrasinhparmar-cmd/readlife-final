"use client";

import {
  INITIAL_STATE,
  ONBOARDING_STORAGE_KEY,
  type OnboardingState,
} from "@/components/onboarding/data";

export function saveOnboardingState(state: OnboardingState) {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

export function loadOnboardingState(): OnboardingState | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    return {
      ...INITIAL_STATE,
      ...parsed,
      goals: { ...INITIAL_STATE.goals, ...(parsed.goals ?? {}) },
      lovedBooks: parsed.lovedBooks ?? INITIAL_STATE.lovedBooks,
      skipBooks: parsed.skipBooks ?? INITIAL_STATE.skipBooks,
      genres: parsed.genres ?? INITIAL_STATE.genres,
      formats: parsed.formats ?? INITIAL_STATE.formats,
    };
  } catch {
    return null;
  }
}

/** Demo-friendly defaults when setup has not been completed yet. */
export function getDashboardState(): OnboardingState {
  const saved = loadOnboardingState();
  if (saved) {
    return {
      ...saved,
      displayName: saved.displayName.trim() || "Alex",
      avatar: saved.avatar ?? "female",
      pet: saved.pet ?? "cat",
      petName: saved.petName.trim() || "Mochi",
    };
  }
  return {
    ...INITIAL_STATE,
    displayName: "Alex",
    avatar: "female",
    pet: "cat",
    petName: "Mochi",
  };
}
