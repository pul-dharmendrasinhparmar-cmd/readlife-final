import { storageKey } from "@/lib/user-storage";
import type { UncoveredStats } from "./types";
import { localISODate } from "./questions";

const KEY = "readlife-uncovered-stats-v1";

const EMPTY: UncoveredStats = {
  gamesPlayed: 0,
  personalBest: 0,
  currentPlayStreak: 0,
  longestPlayStreak: 0,
  longestRecognizeStreak: 0,
  todayCompleted: false,
};

function yesterdayISO() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return localISODate(d);
}

export function loadUncoveredStats(): UncoveredStats {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(storageKey(KEY));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as UncoveredStats;
    const today = localISODate();
    return {
      ...EMPTY,
      ...parsed,
      todayCompleted: parsed.lastPlayedDate === today && !!parsed.todayCompleted,
      todayScore: parsed.lastPlayedDate === today ? parsed.todayScore : undefined,
      todayRecognized:
        parsed.lastPlayedDate === today ? parsed.todayRecognized : undefined,
    };
  } catch {
    return EMPTY;
  }
}

export function recordUncoveredGame(input: {
  score: number;
  recognized: number;
  bestStreak: number;
}) {
  if (typeof window === "undefined") return;
  const prev = loadUncoveredStats();
  const today = localISODate();
  const continued = prev.lastPlayedDate === yesterdayISO();
  const alreadyToday = prev.lastPlayedDate === today;
  const currentPlayStreak = alreadyToday
    ? Math.max(prev.currentPlayStreak, 1)
    : continued
      ? prev.currentPlayStreak + 1
      : 1;

  const next: UncoveredStats = {
    gamesPlayed: prev.gamesPlayed + 1,
    personalBest: Math.max(prev.personalBest, input.score),
    lastScore: input.score,
    lastRecognized: input.recognized,
    currentPlayStreak,
    longestPlayStreak: Math.max(prev.longestPlayStreak, currentPlayStreak),
    longestRecognizeStreak: Math.max(
      prev.longestRecognizeStreak,
      input.bestStreak,
    ),
    lastPlayedDate: today,
    todayCompleted: true,
    todayScore: alreadyToday
      ? Math.max(prev.todayScore ?? 0, input.score)
      : input.score,
    todayRecognized: alreadyToday
      ? Math.max(prev.todayRecognized ?? 0, input.recognized)
      : input.recognized,
  };
  try {
    localStorage.setItem(storageKey(KEY), JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
