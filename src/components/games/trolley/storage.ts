import type { TrolleyStats } from "./types";

const KEY = "readlife-trolley-stats-v1";
const TUTORIAL_KEY = "readlife-trolley-tutorial";

export const EMPTY_TROLLEY: TrolleyStats = {
  gamesPlayed: 0,
  personalBest: 0,
  currentPlayStreak: 0,
  longestPlayStreak: 0,
};

function localISODate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterdayISO() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return localISODate(d);
}

export function loadTrolleyStats(): TrolleyStats {
  if (typeof window === "undefined") return EMPTY_TROLLEY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_TROLLEY;
    return { ...EMPTY_TROLLEY, ...(JSON.parse(raw) as TrolleyStats) };
  } catch {
    return EMPTY_TROLLEY;
  }
}

export function recordTrolleyGame(input: {
  score: number;
  collected: number;
  readerType: string;
}) {
  if (typeof window === "undefined") return;
  const prev = loadTrolleyStats();
  const today = localISODate();
  const continued = prev.lastPlayedDate === yesterdayISO();
  const alreadyToday = prev.lastPlayedDate === today;
  const currentPlayStreak = alreadyToday
    ? Math.max(prev.currentPlayStreak, 1)
    : continued
      ? prev.currentPlayStreak + 1
      : 1;

  const next: TrolleyStats = {
    gamesPlayed: prev.gamesPlayed + 1,
    personalBest: Math.max(prev.personalBest, input.score),
    lastScore: input.score,
    lastCollected: input.collected,
    lastReaderType: input.readerType,
    currentPlayStreak,
    longestPlayStreak: Math.max(prev.longestPlayStreak, currentPlayStreak),
    lastPlayedDate: today,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function hasSeenTrolleyTutorial() {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(TUTORIAL_KEY) === "1";
  } catch {
    return true;
  }
}

export function markTrolleyTutorialSeen() {
  try {
    localStorage.setItem(TUTORIAL_KEY, "1");
  } catch {
    /* ignore */
  }
}
