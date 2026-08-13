"use client";

import {
  EMPTY_ONBOARDING_STATE,
  INITIAL_STATE,
  ONBOARDING_STORAGE_KEY,
  type OnboardingState,
} from "@/components/onboarding/data";
import {
  displayNameFromHints,
  getAuthHints,
  shouldSeedDemo,
  storageKey,
} from "@/lib/user-storage";

function mergeBase(): OnboardingState {
  return shouldSeedDemo()
    ? structuredClone(INITIAL_STATE)
    : structuredClone(EMPTY_ONBOARDING_STATE);
}

export function saveOnboardingState(state: OnboardingState) {
  try {
    localStorage.setItem(
      storageKey(ONBOARDING_STORAGE_KEY),
      JSON.stringify(state),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function loadOnboardingState(): OnboardingState | null {
  try {
    const raw = localStorage.getItem(storageKey(ONBOARDING_STORAGE_KEY));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    const base = mergeBase();
    return {
      ...base,
      ...parsed,
      goals: { ...base.goals, ...(parsed.goals ?? {}) },
      lovedBooks: parsed.lovedBooks ?? base.lovedBooks,
      skipBooks: parsed.skipBooks ?? base.skipBooks,
      genres: parsed.genres ?? base.genres,
      formats: parsed.formats ?? base.formats,
    };
  } catch {
    return null;
  }
}

/** Dashboard identity + goals — demo Alex for guests; auth/empty for accounts. */
export function getDashboardState(): OnboardingState {
  const saved = loadOnboardingState();
  if (shouldSeedDemo()) {
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

  const hints = getAuthHints();
  const fallbackName = displayNameFromHints(hints);
  if (saved) {
    return {
      ...saved,
      displayName: saved.displayName.trim() || fallbackName,
    };
  }
  return {
    ...EMPTY_ONBOARDING_STATE,
    displayName: fallbackName,
  };
}
