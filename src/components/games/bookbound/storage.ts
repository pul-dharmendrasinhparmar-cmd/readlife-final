import type { GameProfile, UserGameAchievement } from "@/components/games/hub/types";
import { storageKey } from "@/lib/user-storage";
import type { BookboundStats, ChapterId, RunStats } from "./types";

const KEY = "readlife-bookbound-stats-v1";
const INTRO_KEY = "readlife-bookbound-intro";
const MUTE_KEY = "readlife-bookbound-mute";

export const EMPTY_BOOKBOUND: BookboundStats = {
  gamesPlayed: 0,
  highestLevelUnlocked: 1,
  level1Completed: false,
  level2Completed: false,
  level3Completed: false,
  highestScore: 0,
  totalPagesCollected: 0,
  totalGoldenPagesCollected: 0,
  totalEnemiesDefeated: 0,
  ogresDefeated: 0,
  witchesDefeated: 0,
  dragonsDefeated: 0,
};

export function loadBookboundStats(): BookboundStats {
  if (typeof window === "undefined") return EMPTY_BOOKBOUND;
  try {
    const raw = localStorage.getItem(storageKey(KEY));
    if (!raw) return EMPTY_BOOKBOUND;
    return { ...EMPTY_BOOKBOUND, ...(JSON.parse(raw) as BookboundStats) };
  } catch {
    return EMPTY_BOOKBOUND;
  }
}

function saveStats(next: BookboundStats) {
  try {
    localStorage.setItem(storageKey(KEY), JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function hasSeenBookboundIntro() {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(storageKey(INTRO_KEY)) === "1";
  } catch {
    return true;
  }
}

export function markBookboundIntroSeen() {
  try {
    localStorage.setItem(storageKey(INTRO_KEY), "1");
  } catch {
    /* ignore */
  }
}

export function loadBookboundMute() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(storageKey(MUTE_KEY)) === "1";
  } catch {
    return false;
  }
}

export function saveBookboundMute(muted: boolean) {
  try {
    localStorage.setItem(storageKey(MUTE_KEY), muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function upsertAchievement(
  list: UserGameAchievement[],
  id: string,
  completed: boolean,
  progress?: number,
): UserGameAchievement[] {
  const existing = list.find((a) => a.achievementId === id);
  if (existing?.completed) return list;
  const next: UserGameAchievement = {
    achievementId: id,
    unlockedAt: completed ? new Date().toISOString() : existing?.unlockedAt ?? "",
    completed,
    progress: completed ? 1 : progress,
  };
  if (!existing) return [...list, next];
  return list.map((a) => (a.achievementId === id ? next : a));
}

export function applyBookboundAchievements(
  profile: GameProfile,
  stats: BookboundStats,
): GameProfile {
  let achievements = profile.achievements;
  achievements = upsertAchievement(
    achievements,
    "bb-first-page",
    stats.totalPagesCollected >= 1,
    Math.min(1, stats.totalPagesCollected),
  );
  achievements = upsertAchievement(
    achievements,
    "bb-ogre-slayer",
    stats.ogresDefeated >= 1,
    Math.min(1, stats.ogresDefeated),
  );
  achievements = upsertAchievement(
    achievements,
    "bb-ink-master",
    stats.level2Completed,
    stats.level2Completed ? 1 : stats.level1Completed ? 0.5 : 0,
  );
  achievements = upsertAchievement(
    achievements,
    "bb-dragon-slayer",
    stats.dragonsDefeated >= 1,
    Math.min(1, stats.dragonsDefeated),
  );
  achievements = upsertAchievement(
    achievements,
    "bb-story-restored",
    stats.level3Completed,
    (Number(stats.level1Completed) +
      Number(stats.level2Completed) +
      Number(stats.level3Completed)) /
      3,
  );
  if (!achievements.some((a) => a.achievementId === "first-chapter" && a.completed)) {
    achievements = upsertAchievement(achievements, "first-chapter", true, 1);
  }
  return { ...profile, achievements, hasPlayedAny: true };
}

export function recordBookboundSession(input: {
  chapter: ChapterId;
  completed: boolean;
  run: RunStats;
}): BookboundStats {
  if (typeof window === "undefined") return EMPTY_BOOKBOUND;
  const prev = loadBookboundStats();
  const unlocked = input.completed
    ? (Math.min(3, Math.max(prev.highestLevelUnlocked, input.chapter + 1)) as ChapterId)
    : prev.highestLevelUnlocked;

  const next: BookboundStats = {
    gamesPlayed: prev.gamesPlayed + 1,
    highestLevelUnlocked: Math.max(prev.highestLevelUnlocked, unlocked) as ChapterId,
    level1Completed: prev.level1Completed || (input.completed && input.chapter === 1),
    level2Completed: prev.level2Completed || (input.completed && input.chapter === 2),
    level3Completed: prev.level3Completed || (input.completed && input.chapter === 3),
    highestScore: Math.max(prev.highestScore, input.run.score),
    lastScore: input.run.score,
    totalPagesCollected: prev.totalPagesCollected + input.run.pages,
    totalGoldenPagesCollected:
      prev.totalGoldenPagesCollected + input.run.golden,
    totalEnemiesDefeated: prev.totalEnemiesDefeated + input.run.enemiesDefeated,
    ogresDefeated: prev.ogresDefeated + input.run.ogres,
    witchesDefeated: prev.witchesDefeated + input.run.witches,
    dragonsDefeated: prev.dragonsDefeated + input.run.dragons,
    lastPlayedAt: new Date().toISOString(),
  };
  saveStats(next);
  return next;
}
