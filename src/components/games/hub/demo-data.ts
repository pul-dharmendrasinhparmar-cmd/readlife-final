import { DISCOVER_READERS } from "@/components/search/data";
import type {
  BookleLeaderRow,
  BookwormLeaderRow,
  FeaturedToday,
  GameProfile,
  PiecesLeaderRow,
  ScoreLeaderRow,
} from "./types";

function localISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Last N local calendar days ending yesterday (or including today). */
export function recentDayRange(count: number, includeToday = true): string[] {
  const days: string[] = [];
  const start = includeToday ? 0 : 1;
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (i + start));
    days.push(localISODate(d));
  }
  return days;
}

export function todayISO() {
  return localISODate(new Date());
}

/** Fresh games profile for signed-in accounts — no demo streaks. */
export function buildEmptyProfile(overrides?: Partial<GameProfile>): GameProfile {
  const base: GameProfile = {
    userId: "you",
    hasPlayedAny: false,
    leaderboardVisibility: "friends",
    overallStreak: {
      current: 0,
      longest: 0,
      recentDays: [],
    },
    bookle: {
      gamesPlayed: 0,
      gamesWon: 0,
      winRate: 0,
      currentSolveStreak: 0,
      longestSolveStreak: 0,
      averageGuesses: 0,
      guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      todayCompleted: false,
    },
    bookworm: {
      gamesPlayed: 0,
      personalBest: 0,
      highestLevelReached: "",
      totalBooksCollected: 0,
      currentPlayStreak: 0,
      longestPlayStreak: 0,
    },
    lexicon: {
      gamesPlayed: 0,
      gamesWon: 0,
      personalBest: 0,
    },
    uncovered: {
      gamesPlayed: 0,
      personalBest: 0,
      currentPlayStreak: 0,
      longestPlayStreak: 0,
      longestRecognizeStreak: 0,
      todayCompleted: false,
    },
    pieces: {
      gamesPlayed: 0,
      puzzlesCompleted: 0,
      bestTimeMs: 0,
      todayCompleted: false,
    },
    trolley: {
      gamesPlayed: 0,
      personalBest: 0,
      currentPlayStreak: 0,
      longestPlayStreak: 0,
    },
    bookbound: {
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
    },
    achievements: [],
    pinnedAchievementIds: [],
    challenges: [],
  };
  return { ...base, ...overrides };
}

/** Seeded “lived-in” profile so the hub isn’t a wall of zeros. */
export function buildDemoProfile(overrides?: Partial<GameProfile>): GameProfile {
  const today = todayISO();
  const week = recentDayRange(7, true);
  // Qualify Mon–Sat; today still open
  const qualified = week.slice(0, 6);

  const base: GameProfile = {
    userId: "you",
    hasPlayedAny: true,
    leaderboardVisibility: "friends",
    overallStreak: {
      current: 6,
      longest: 12,
      lastQualifiedDate: qualified[qualified.length - 1],
      recentDays: qualified,
    },
    bookle: {
      gamesPlayed: 23,
      gamesWon: 18,
      winRate: 0.78,
      currentSolveStreak: 4,
      longestSolveStreak: 9,
      averageGuesses: 3.9,
      guessDistribution: { 1: 1, 2: 3, 3: 6, 4: 5, 5: 2, 6: 1 },
      lastPlayedDate: qualified[qualified.length - 1],
      todayCompleted: false,
      yesterdayGuesses: 4,
    },
    bookworm: {
      gamesPlayed: 42,
      personalBest: 2840,
      lastScore: 1920,
      highestLevelReached: "Cozy Shelf",
      totalBooksCollected: 1286,
      currentPlayStreak: 3,
      longestPlayStreak: 8,
      lastPlayedDate: qualified[qualified.length - 2],
    },
    lexicon: {
      gamesPlayed: 7,
      gamesWon: 3,
      personalBest: 312,
      lastScore: 248,
      lastPlayedDate: qualified[qualified.length - 3],
    },
    uncovered: {
      gamesPlayed: 4,
      personalBest: 450,
      lastScore: 400,
      lastRecognized: 4,
      currentPlayStreak: 2,
      longestPlayStreak: 3,
      longestRecognizeStreak: 4,
      lastPlayedDate: qualified[qualified.length - 2],
      todayCompleted: false,
    },
    pieces: {
      gamesPlayed: 0,
      puzzlesCompleted: 0,
      bestTimeMs: 0,
      todayCompleted: false,
    },
    trolley: {
      gamesPlayed: 0,
      personalBest: 0,
      currentPlayStreak: 0,
      longestPlayStreak: 0,
    },
    bookbound: {
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
    },
    achievements: [
      {
        achievementId: "first-chapter",
        unlockedAt: "2026-07-12T10:00:00.000Z",
        completed: true,
      },
      {
        achievementId: "bookle-brain",
        unlockedAt: "2026-07-20T18:00:00.000Z",
        completed: true,
      },
      {
        achievementId: "worming-shelves",
        unlockedAt: "2026-07-28T21:00:00.000Z",
        completed: true,
      },
      {
        achievementId: "sharp-reader",
        unlockedAt: "2026-08-02T09:00:00.000Z",
        completed: true,
      },
      {
        achievementId: "double-feature",
        unlockedAt: "2026-08-05T20:00:00.000Z",
        completed: true,
      },
      {
        achievementId: "on-a-roll",
        unlockedAt: "2026-08-08T22:00:00.000Z",
        completed: true,
      },
      {
        achievementId: "shelf-master",
        unlockedAt: "",
        progress: 2840 / 2500,
        completed: false,
      },
      {
        achievementId: "trolley-star",
        unlockedAt: "",
        progress: 0,
        completed: false,
      },
      {
        achievementId: "perfect-week",
        unlockedAt: "",
        progress: 6 / 7,
        completed: false,
      },
      {
        achievementId: "bb-first-page",
        unlockedAt: "",
        progress: 0,
        completed: false,
      },
      {
        achievementId: "bb-ogre-slayer",
        unlockedAt: "",
        progress: 0,
        completed: false,
      },
      {
        achievementId: "bb-ink-master",
        unlockedAt: "",
        progress: 0,
        completed: false,
      },
      {
        achievementId: "bb-dragon-slayer",
        unlockedAt: "",
        progress: 0,
        completed: false,
      },
      {
        achievementId: "bb-story-restored",
        unlockedAt: "",
        progress: 0,
        completed: false,
      },
    ],
    pinnedAchievementIds: ["on-a-roll", "shelf-master", "bookle-brain"],
    challenges: [
      {
        id: "bw-1500",
        game: "bookworm",
        title: "Score 1,500",
        description: "Reach 1,500 points in a single Bookworm run.",
        progress: 1920,
        target: 1500,
        completed: true,
      },
      {
        id: "bk-today",
        game: "bookle",
        title: "Solve today's Bookle",
        description: "Finish today's daily puzzle.",
        progress: 0,
        target: 1,
        completed: false,
      },
      {
        id: "lx-win",
        game: "lexicon",
        title: "Beat ReadLife",
        description: "Win a Wordsmith match against the house.",
        progress: 3,
        target: 1,
        completed: true,
      },
      {
        id: "cross-both",
        game: "cross",
        title: "Double Feature",
        description: "Play both Bookle and Bookworm today.",
        progress: 0,
        target: 2,
        completed: false,
      },
      {
        id: "bk-week-5",
        game: "bookle",
        title: "Five this week",
        description: "Complete 5 Bookles this week.",
        progress: 4,
        target: 5,
        completed: false,
      },
    ],
  };

  // Ensure today isn't falsely in recentDays unless completed
  void today;
  return { ...base, ...overrides };
}

export function buildFeaturedToday(profile: GameProfile): FeaturedToday {
  if (!profile.bookle.todayCompleted) {
    return {
      kind: "bookle",
      title: "Daily Bookle",
      blurb: "A fresh puzzle is waiting on the shelf.",
      cta: "Play Bookle",
      completed: false,
    };
  }
  if (!profile.uncovered?.todayCompleted) {
    return {
      kind: "uncovered",
      title: "Uncovered",
      blurb: "Guess from a cover or from five plot emojis.",
      cta: "Play Uncovered",
      completed: false,
    };
  }
  return {
    kind: "bookworm",
    title: "Today's Bookworm Challenge",
    blurb: "Reach 1,500 points on the Cozy Shelf.",
    cta: "Start Challenge",
    targetScore: 1500,
  };
}

function reader(id: string) {
  return DISCOVER_READERS.find((r) => r.id === id)!;
}

export function bookwormFriendsLeaderboard(
  yourBest: number,
): BookwormLeaderRow[] {
  const mina = reader("mina");
  const jordan = reader("jordan");
  const sam = reader("sam");
  const priya = reader("priya");

  const rows: BookwormLeaderRow[] = [
    {
      userId: mina.id,
      displayName: mina.displayName,
      username: mina.username,
      avatar: mina.avatar,
      personality: mina.readingPersonality,
      score: 4820,
      levelReached: "Midnight Library",
      delta: 1,
    },
    {
      userId: "you",
      displayName: "You",
      username: "you",
      avatar: "/avatars/reader-female.png",
      score: yourBest,
      levelReached: "Cozy Shelf",
      isYou: true,
      delta: 0,
    },
    {
      userId: jordan.id,
      displayName: jordan.displayName,
      username: jordan.username,
      avatar: jordan.avatar,
      personality: jordan.readingPersonality,
      score: 3410,
      levelReached: "Café Chaos",
      delta: -1,
    },
    {
      userId: sam.id,
      displayName: sam.displayName,
      username: sam.username,
      avatar: sam.avatar,
      personality: sam.readingPersonality,
      score: 2970,
      levelReached: "Cozy Shelf",
      delta: 2,
    },
    {
      userId: priya.id,
      displayName: priya.displayName,
      username: priya.username,
      avatar: priya.avatar,
      personality: priya.readingPersonality,
      score: 2510,
      levelReached: "Cozy Shelf",
      delta: 0,
    },
  ];

  return rows.sort((a, b) => b.score - a.score);
}

export function bookleFriendsLeaderboard(): BookleLeaderRow[] {
  const mina = reader("mina");
  const jordan = reader("jordan");
  const sam = reader("sam");
  const priya = reader("priya");

  const rows: BookleLeaderRow[] = [
    {
      userId: mina.id,
      displayName: mina.displayName,
      username: mina.username,
      avatar: mina.avatar,
      personality: mina.readingPersonality,
      solvedThisWeek: 7,
      puzzlesThisWeek: 7,
      averageGuesses: 3.8,
    },
    {
      userId: priya.id,
      displayName: priya.displayName,
      username: priya.username,
      avatar: priya.avatar,
      personality: priya.readingPersonality,
      solvedThisWeek: 6,
      puzzlesThisWeek: 7,
      averageGuesses: 3.4,
    },
    {
      userId: "you",
      displayName: "You",
      username: "you",
      avatar: "/avatars/reader-female.png",
      solvedThisWeek: 5,
      puzzlesThisWeek: 7,
      averageGuesses: 3.9,
      isYou: true,
    },
    {
      userId: jordan.id,
      displayName: jordan.displayName,
      username: jordan.username,
      avatar: jordan.avatar,
      personality: jordan.readingPersonality,
      solvedThisWeek: 5,
      puzzlesThisWeek: 7,
      averageGuesses: 4.1,
    },
    {
      userId: sam.id,
      displayName: sam.displayName,
      username: sam.username,
      avatar: sam.avatar,
      personality: sam.readingPersonality,
      solvedThisWeek: 4,
      puzzlesThisWeek: 7,
      averageGuesses: 4.4,
    },
  ];

  return rows.sort((a, b) => {
    if (b.solvedThisWeek !== a.solvedThisWeek) {
      return b.solvedThisWeek - a.solvedThisWeek;
    }
    return a.averageGuesses - b.averageGuesses;
  });
}

function scoreFriendsBoard(
  yourBest: number,
  friendScores: [string, number, number?][],
): ScoreLeaderRow[] {
  const rows: ScoreLeaderRow[] = friendScores.map(([id, score, delta]) => {
    const r = reader(id);
    return {
      userId: r.id,
      displayName: r.displayName,
      username: r.username,
      avatar: r.avatar,
      personality: r.readingPersonality,
      score,
      delta,
    };
  });
  rows.push({
    userId: "you",
    displayName: "You",
    username: "you",
    avatar: "/avatars/reader-female.png",
    score: yourBest,
    isYou: true,
    delta: 0,
  });
  return rows.sort((a, b) => b.score - a.score);
}

export function lexiconFriendsLeaderboard(yourBest: number): ScoreLeaderRow[] {
  return scoreFriendsBoard(yourBest, [
    ["mina", 486, 1],
    ["priya", 402, 0],
    ["jordan", 368, -1],
    ["sam", 295, 2],
  ]);
}

export function uncoveredFriendsLeaderboard(yourBest: number): ScoreLeaderRow[] {
  return scoreFriendsBoard(yourBest, [
    ["priya", 720, 1],
    ["mina", 610, 0],
    ["sam", 540, 2],
    ["jordan", 380, -1],
  ]);
}

export function trolleyFriendsLeaderboard(yourBest: number): ScoreLeaderRow[] {
  return scoreFriendsBoard(yourBest > 0 ? yourBest : 6380, [
    ["jordan", 9180, 1],
    ["mina", 8450, 0],
    ["priya", 7020, -1],
    ["sam", 5640, 2],
  ]);
}

export function piecesFriendsLeaderboard(yourBestMs: number): PiecesLeaderRow[] {
  const mina = reader("mina");
  const jordan = reader("jordan");
  const sam = reader("sam");
  const priya = reader("priya");

  const rows: PiecesLeaderRow[] = [
    {
      userId: mina.id,
      displayName: mina.displayName,
      username: mina.username,
      avatar: mina.avatar,
      personality: mina.readingPersonality,
      bestTimeMs: 98_000,
    },
    {
      userId: priya.id,
      displayName: priya.displayName,
      username: priya.username,
      avatar: priya.avatar,
      personality: priya.readingPersonality,
      bestTimeMs: 124_000,
    },
    {
      userId: "you",
      displayName: "You",
      username: "you",
      avatar: "/avatars/reader-female.png",
      bestTimeMs: yourBestMs > 0 ? yourBestMs : 156_000,
      isYou: true,
    },
    {
      userId: jordan.id,
      displayName: jordan.displayName,
      username: jordan.username,
      avatar: jordan.avatar,
      personality: jordan.readingPersonality,
      bestTimeMs: 178_000,
    },
    {
      userId: sam.id,
      displayName: sam.displayName,
      username: sam.username,
      avatar: sam.avatar,
      personality: sam.readingPersonality,
      bestTimeMs: 212_000,
    },
  ];

  return rows.sort((a, b) => a.bestTimeMs - b.bestTimeMs);
}
