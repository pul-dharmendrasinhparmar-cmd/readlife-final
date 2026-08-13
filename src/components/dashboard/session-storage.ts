"use client";

import type { DiscoveryState } from "@/components/search/types";
import { updateLibraryEntry } from "@/lib/discovery-storage";
import { shouldSeedDemo, storageKey } from "@/lib/user-storage";

const TODAY_KEY = "readlife-today-goal-v1";

export type TodayGoalProgress = {
  date: string; // YYYY-MM-DD
  minutesDone: number;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function loadTodayGoalProgress(): TodayGoalProgress {
  const date = todayKey();
  const demoMinutes = shouldSeedDemo() ? 18 : 0;
  if (typeof window === "undefined") {
    return { date, minutesDone: demoMinutes };
  }
  try {
    const raw = localStorage.getItem(storageKey(TODAY_KEY));
    if (!raw) {
      const seed = { date, minutesDone: demoMinutes };
      if (shouldSeedDemo()) {
        localStorage.setItem(storageKey(TODAY_KEY), JSON.stringify(seed));
      }
      return seed;
    }
    const parsed = JSON.parse(raw) as TodayGoalProgress;
    if (parsed.date !== date) {
      const fresh = { date, minutesDone: 0 };
      localStorage.setItem(storageKey(TODAY_KEY), JSON.stringify(fresh));
      return fresh;
    }
    return parsed;
  } catch {
    return { date, minutesDone: demoMinutes };
  }
}

export function addTodayMinutes(minutes: number): TodayGoalProgress {
  const current = loadTodayGoalProgress();
  const next = {
    date: todayKey(),
    minutesDone: current.minutesDone + Math.max(0, minutes),
  };
  try {
    localStorage.setItem(storageKey(TODAY_KEY), JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export type SessionCompleteInput = {
  bookId: string;
  minutes: number;
  pagesReadDelta: number;
};

/** Apply a finished reading session to discovery library state. */
export function completeReadingSession(
  state: DiscoveryState,
  input: SessionCompleteInput,
): DiscoveryState {
  const entry = state.entries.find((e) => e.bookId === input.bookId);
  const prevPages = entry?.pagesRead ?? 0;
  const prevPct = entry?.progressPct ?? 0;
  const pagesRead = prevPages + Math.max(0, input.pagesReadDelta);

  // Keep progress coherent with existing demo ratios when possible
  let progressPct = prevPct;
  if (prevPages > 0 && prevPct > 0) {
    const impliedTotal = prevPages / (prevPct / 100);
    progressPct = Math.min(
      99,
      Math.round((pagesRead / impliedTotal) * 100),
    );
  } else if (input.pagesReadDelta > 0) {
    progressPct = Math.min(99, prevPct + Math.max(1, Math.round(input.pagesReadDelta / 4)));
  } else {
    progressPct = Math.min(99, prevPct + Math.max(1, Math.round(input.minutes / 8)));
  }

  const label = `Today · ${input.minutes} min`;
  addTodayMinutes(input.minutes);

  return updateLibraryEntry(state, input.bookId, {
    status: "reading",
    pagesRead,
    progressPct,
    lastSessionLabel: label,
    minutesThisWeek: (entry?.minutesThisWeek ?? 0) + input.minutes,
    history: [
      ...(entry?.history ?? []),
      {
        at: new Date().toISOString(),
        label: `Session logged · ${input.minutes} min`,
      },
    ],
  });
}
