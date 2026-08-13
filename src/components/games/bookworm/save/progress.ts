import { storageKey } from "@/lib/user-storage";
import type { LevelProgress } from "../types";

const PREFIX = "readlife-bookworm";

function key(levelId: string, field: string) {
  return storageKey(`${PREFIX}:${levelId}:${field}`);
}

const DEFAULT: LevelProgress = {
  highScore: 0,
  bestCombo: 0,
  bestStars: 0,
  muted: false,
};

export function loadProgress(levelId: string): LevelProgress {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    return {
      highScore: Number(localStorage.getItem(key(levelId, "highScore"))) || 0,
      bestCombo: Number(localStorage.getItem(key(levelId, "bestCombo"))) || 0,
      bestStars: Number(localStorage.getItem(key(levelId, "bestStars"))) || 0,
      muted: localStorage.getItem(key(levelId, "muted")) === "1",
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveProgress(
  levelId: string,
  patch: Partial<LevelProgress>,
): LevelProgress {
  const current = loadProgress(levelId);
  const next: LevelProgress = {
    highScore: Math.max(current.highScore, patch.highScore ?? 0),
    bestCombo: Math.max(current.bestCombo, patch.bestCombo ?? 0),
    bestStars: Math.max(current.bestStars, patch.bestStars ?? 0),
    muted: patch.muted ?? current.muted,
  };
  // When only updating mute, don't zero out highs via Math.max with 0
  if (patch.highScore === undefined) next.highScore = current.highScore;
  if (patch.bestCombo === undefined) next.bestCombo = current.bestCombo;
  if (patch.bestStars === undefined) next.bestStars = current.bestStars;

  try {
    localStorage.setItem(key(levelId, "highScore"), String(next.highScore));
    localStorage.setItem(key(levelId, "bestCombo"), String(next.bestCombo));
    localStorage.setItem(key(levelId, "bestStars"), String(next.bestStars));
    localStorage.setItem(key(levelId, "muted"), next.muted ? "1" : "0");
  } catch {
    /* ignore quota */
  }
  return next;
}

export function persistRun(
  levelId: string,
  run: { score: number; bestCombo: number; stars: number },
): LevelProgress {
  const current = loadProgress(levelId);
  return saveProgress(levelId, {
    highScore: Math.max(current.highScore, run.score),
    bestCombo: Math.max(current.bestCombo, run.bestCombo),
    bestStars: Math.max(current.bestStars, run.stars),
    muted: current.muted,
  });
}
