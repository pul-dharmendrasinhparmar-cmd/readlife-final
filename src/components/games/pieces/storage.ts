import { localISODate } from "@/components/games/uncovered/questions";
import type { PiecesStats } from "./types";

const KEY = "readlife-pieces-stats-v1";

export const EMPTY_PIECES_STATS: PiecesStats = {
  gamesPlayed: 0,
  puzzlesCompleted: 0,
  bestTimeMs: 0,
  todayCompleted: false,
};

export function loadPiecesStats(): PiecesStats {
  if (typeof window === "undefined") return EMPTY_PIECES_STATS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_PIECES_STATS;
    const parsed = JSON.parse(raw) as PiecesStats;
    const today = localISODate();
    return {
      ...EMPTY_PIECES_STATS,
      ...parsed,
      todayCompleted:
        parsed.lastPlayedDate === today && !!parsed.todayCompleted,
    };
  } catch {
    return EMPTY_PIECES_STATS;
  }
}

export function recordPiecesGame(input: { timeMs: number; completed: boolean }) {
  if (typeof window === "undefined") return;
  const prev = loadPiecesStats();
  const today = localISODate();
  const bestTimeMs =
    input.completed && input.timeMs > 0
      ? prev.bestTimeMs === 0
        ? input.timeMs
        : Math.min(prev.bestTimeMs, input.timeMs)
      : prev.bestTimeMs;

  const next: PiecesStats = {
    gamesPlayed: prev.gamesPlayed + 1,
    puzzlesCompleted: prev.puzzlesCompleted + (input.completed ? 1 : 0),
    bestTimeMs,
    lastTimeMs: input.completed ? input.timeMs : prev.lastTimeMs,
    lastPlayedDate: today,
    todayCompleted: input.completed || (prev.lastPlayedDate === today && prev.todayCompleted),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
