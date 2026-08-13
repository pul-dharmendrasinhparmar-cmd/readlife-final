import { loadBookboundStats } from "@/components/games/bookbound/storage";
import { loadProgress } from "@/components/games/bookworm/save/progress";
import { LEVEL_1_COZY_SHELF } from "@/components/games/bookworm/levels/level1-cozy-shelf";
import { loadLexiconStats } from "@/components/games/lexicon/storage";
import { loadUncoveredStats } from "@/components/games/uncovered/storage";
import { loadPiecesStats } from "@/components/games/pieces/storage";
import { loadTrolleyStats } from "@/components/games/trolley/storage";
import { buildDemoProfile, todayISO } from "./demo-data";
import type {
  BookboundStats,
  GameProfile,
  LexiconStats,
  PiecesStats,
  TrolleyStats,
  UncoveredStats,
} from "./types";

const STORAGE_KEY = "readlife-games-profile-v1";

const EMPTY_LEXICON: LexiconStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  personalBest: 0,
};

const EMPTY_UNCOVERED: UncoveredStats = {
  gamesPlayed: 0,
  personalBest: 0,
  currentPlayStreak: 0,
  longestPlayStreak: 0,
  longestRecognizeStreak: 0,
  todayCompleted: false,
};

const EMPTY_PIECES: PiecesStats = {
  gamesPlayed: 0,
  puzzlesCompleted: 0,
  bestTimeMs: 0,
  todayCompleted: false,
};

const EMPTY_TROLLEY: TrolleyStats = {
  gamesPlayed: 0,
  personalBest: 0,
  currentPlayStreak: 0,
  longestPlayStreak: 0,
};

const EMPTY_BOOKBOUND: BookboundStats = {
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

function mergeLiveBookworm(profile: GameProfile): GameProfile {
  try {
    const live = loadProgress(LEVEL_1_COZY_SHELF.id);
    if (live.highScore > profile.bookworm.personalBest) {
      return {
        ...profile,
        bookworm: {
          ...profile.bookworm,
          personalBest: live.highScore,
          highestLevelReached: LEVEL_1_COZY_SHELF.name,
        },
        hasPlayedAny: true,
      };
    }
  } catch {
    /* ignore */
  }
  return profile;
}

function mergeLiveLexicon(profile: GameProfile): GameProfile {
  try {
    const live = loadLexiconStats();
    const base = profile.lexicon ?? EMPTY_LEXICON;
    if (
      live.gamesPlayed > (base.gamesPlayed ?? 0) ||
      live.personalBest > (base.personalBest ?? 0)
    ) {
      return {
        ...profile,
        lexicon: {
          gamesPlayed: Math.max(base.gamesPlayed, live.gamesPlayed),
          gamesWon: Math.max(base.gamesWon, live.gamesWon),
          personalBest: Math.max(base.personalBest, live.personalBest),
          lastScore: live.lastScore ?? base.lastScore,
          lastPlayedDate: live.lastPlayedDate ?? base.lastPlayedDate,
        },
        hasPlayedAny: profile.hasPlayedAny || live.gamesPlayed > 0,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    ...profile,
    lexicon: profile.lexicon ?? EMPTY_LEXICON,
  };
}

function mergeLiveUncovered(profile: GameProfile): GameProfile {
  try {
    const live = loadUncoveredStats();
    const base = profile.uncovered ?? EMPTY_UNCOVERED;
    if (
      live.gamesPlayed > (base.gamesPlayed ?? 0) ||
      live.personalBest > (base.personalBest ?? 0) ||
      live.todayCompleted
    ) {
      return {
        ...profile,
        uncovered: {
          ...base,
          ...live,
          gamesPlayed: Math.max(base.gamesPlayed, live.gamesPlayed),
          personalBest: Math.max(base.personalBest, live.personalBest),
          longestPlayStreak: Math.max(
            base.longestPlayStreak,
            live.longestPlayStreak,
          ),
          longestRecognizeStreak: Math.max(
            base.longestRecognizeStreak,
            live.longestRecognizeStreak,
          ),
        },
        hasPlayedAny: profile.hasPlayedAny || live.gamesPlayed > 0,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    ...profile,
    uncovered: profile.uncovered ?? EMPTY_UNCOVERED,
  };
}

function mergeLivePieces(profile: GameProfile): GameProfile {
  try {
    const live = loadPiecesStats();
    const base = profile.pieces ?? EMPTY_PIECES;
    if (
      live.gamesPlayed > (base.gamesPlayed ?? 0) ||
      live.puzzlesCompleted > (base.puzzlesCompleted ?? 0) ||
      live.todayCompleted
    ) {
      return {
        ...profile,
        pieces: {
          ...base,
          ...live,
          gamesPlayed: Math.max(base.gamesPlayed, live.gamesPlayed),
          puzzlesCompleted: Math.max(
            base.puzzlesCompleted,
            live.puzzlesCompleted,
          ),
          bestTimeMs:
            base.bestTimeMs === 0
              ? live.bestTimeMs
              : live.bestTimeMs === 0
                ? base.bestTimeMs
                : Math.min(base.bestTimeMs, live.bestTimeMs),
        },
        hasPlayedAny: profile.hasPlayedAny || live.gamesPlayed > 0,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    ...profile,
    pieces: profile.pieces ?? EMPTY_PIECES,
  };
}

function mergeLiveTrolley(profile: GameProfile): GameProfile {
  try {
    const live = loadTrolleyStats();
    const base = profile.trolley ?? EMPTY_TROLLEY;
    if (
      live.gamesPlayed > (base.gamesPlayed ?? 0) ||
      live.personalBest > (base.personalBest ?? 0)
    ) {
      return {
        ...profile,
        trolley: {
          ...base,
          ...live,
          gamesPlayed: Math.max(base.gamesPlayed, live.gamesPlayed),
          personalBest: Math.max(base.personalBest, live.personalBest),
          longestPlayStreak: Math.max(
            base.longestPlayStreak,
            live.longestPlayStreak,
          ),
        },
        hasPlayedAny: profile.hasPlayedAny || live.gamesPlayed > 0,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    ...profile,
    trolley: profile.trolley ?? EMPTY_TROLLEY,
  };
}

function mergeLiveBookbound(profile: GameProfile): GameProfile {
  try {
    const live = loadBookboundStats();
    const base = profile.bookbound ?? EMPTY_BOOKBOUND;
    if (
      live.gamesPlayed > (base.gamesPlayed ?? 0) ||
      live.highestScore > (base.highestScore ?? 0) ||
      live.highestLevelUnlocked > (base.highestLevelUnlocked ?? 1)
    ) {
      return {
        ...profile,
        bookbound: {
          ...base,
          ...live,
          gamesPlayed: Math.max(base.gamesPlayed, live.gamesPlayed),
          highestScore: Math.max(base.highestScore, live.highestScore),
          highestLevelUnlocked: Math.max(
            base.highestLevelUnlocked,
            live.highestLevelUnlocked,
          ) as BookboundStats["highestLevelUnlocked"],
        },
        hasPlayedAny: profile.hasPlayedAny || live.gamesPlayed > 0,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    ...profile,
    bookbound: profile.bookbound ?? EMPTY_BOOKBOUND,
  };
}

function normalizeProfile(parsed: GameProfile): GameProfile {
  return {
    ...parsed,
    lexicon: parsed.lexicon ?? EMPTY_LEXICON,
    uncovered: parsed.uncovered ?? EMPTY_UNCOVERED,
    pieces: parsed.pieces ?? EMPTY_PIECES,
    trolley: parsed.trolley ?? EMPTY_TROLLEY,
    bookbound: parsed.bookbound ?? EMPTY_BOOKBOUND,
  };
}

function withLiveStats(profile: GameProfile): GameProfile {
  return mergeLiveBookbound(
    mergeLiveTrolley(
      mergeLivePieces(
        mergeLiveUncovered(mergeLiveLexicon(mergeLiveBookworm(profile))),
      ),
    ),
  );
}

export function loadGameProfile(): GameProfile {
  if (typeof window === "undefined") return buildDemoProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = buildDemoProfile();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return withLiveStats(seeded);
    }
    const parsed = normalizeProfile(JSON.parse(raw) as GameProfile);
    return withLiveStats(parsed);
  } catch {
    return withLiveStats(buildDemoProfile());
  }
}

export function saveGameProfile(profile: GameProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

/** Mark today as a qualifying game day (idempotent). */
export function recordQualifyingDay(profile: GameProfile): GameProfile {
  const today = todayISO();
  if (profile.overallStreak.lastQualifiedDate === today) {
    return { ...profile, hasPlayedAny: true };
  }

  const yesterday = (() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  const continued = profile.overallStreak.lastQualifiedDate === yesterday;
  const current = continued ? profile.overallStreak.current + 1 : 1;
  const recentDays = [
    ...profile.overallStreak.recentDays.filter((d) => d !== today),
    today,
  ].slice(-14);

  const next: GameProfile = {
    ...profile,
    hasPlayedAny: true,
    overallStreak: {
      current,
      longest: Math.max(profile.overallStreak.longest, current),
      lastQualifiedDate: today,
      recentDays,
    },
  };
  saveGameProfile(next);
  return next;
}

export function streakSecuredToday(profile: GameProfile) {
  return profile.overallStreak.lastQualifiedDate === todayISO();
}
