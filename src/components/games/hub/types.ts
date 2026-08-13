import type { BookboundStats } from "@/components/games/bookbound/types";
import type { PiecesStats } from "@/components/games/pieces/types";
import type { TrolleyStats } from "@/components/games/trolley/types";

export type { BookboundStats, PiecesStats, TrolleyStats };

export type LeaderboardVisibility = "friends" | "global" | "private";

export type OverallStreak = {
  current: number;
  longest: number;
  /** ISO date YYYY-MM-DD of last qualifying day */
  lastQualifiedDate?: string;
  /** Recent qualifying days (local calendar), newest last */
  recentDays: string[];
};

export type BookleStats = {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  currentSolveStreak: number;
  longestSolveStreak: number;
  averageGuesses: number;
  guessDistribution: Record<1 | 2 | 3 | 4 | 5 | 6, number>;
  lastPlayedDate?: string;
  /** Whether today's daily was completed (solved or failed) */
  todayCompleted: boolean;
  yesterdayGuesses?: number;
};

export type BookwormStats = {
  gamesPlayed: number;
  personalBest: number;
  lastScore?: number;
  highestLevelReached: string;
  totalBooksCollected: number;
  currentPlayStreak: number;
  longestPlayStreak: number;
  lastPlayedDate?: string;
};

export type LexiconStats = {
  gamesPlayed: number;
  gamesWon: number;
  personalBest: number;
  lastScore?: number;
  lastPlayedDate?: string;
};

export type UncoveredStats = {
  gamesPlayed: number;
  personalBest: number;
  lastScore?: number;
  lastRecognized?: number;
  currentPlayStreak: number;
  longestPlayStreak: number;
  longestRecognizeStreak: number;
  lastPlayedDate?: string;
  todayCompleted: boolean;
  todayScore?: number;
  todayRecognized?: number;
};

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  /** Emoji fallback when no image asset is available */
  icon: string;
  /** Optional illustrated badge under /public */
  iconSrc?: string;
};

export type UserGameAchievement = {
  achievementId: string;
  unlockedAt: string;
  progress?: number;
  completed: boolean;
};

export type GameChallenge = {
  id: string;
  game:
    | "bookle"
    | "bookworm"
    | "lexicon"
    | "uncovered"
    | "pieces"
    | "trolley"
    | "bookbound"
    | "cross";
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
};

export type LeaderboardScope = "friends" | "global";
export type LeaderboardPeriod = "week" | "all";
export type LeaderboardGame =
  | "bookle"
  | "bookworm"
  | "lexicon"
  | "uncovered"
  | "pieces"
  | "trolley";

export type BookwormLeaderRow = {
  userId: string;
  displayName: string;
  username: string;
  avatar: string;
  personality?: string;
  score: number;
  levelReached: string;
  isYou?: boolean;
  delta?: number;
};

export type BookleLeaderRow = {
  userId: string;
  displayName: string;
  username: string;
  avatar: string;
  personality?: string;
  solvedThisWeek: number;
  puzzlesThisWeek: number;
  averageGuesses: number;
  isYou?: boolean;
};

/** Shared score row for Wordsmith / Uncovered / Trolley */
export type ScoreLeaderRow = {
  userId: string;
  displayName: string;
  username: string;
  avatar: string;
  personality?: string;
  score: number;
  isYou?: boolean;
  delta?: number;
};

export type PiecesLeaderRow = {
  userId: string;
  displayName: string;
  username: string;
  avatar: string;
  personality?: string;
  bestTimeMs: number;
  isYou?: boolean;
};

export type FeaturedToday =
  | {
      kind: "bookle";
      title: string;
      blurb: string;
      cta: string;
      completed: boolean;
    }
  | {
      kind: "bookworm";
      title: string;
      blurb: string;
      cta: string;
      targetScore?: number;
    }
  | {
      kind: "uncovered";
      title: string;
      blurb: string;
      cta: string;
      completed: boolean;
    };

export type GameProfile = {
  userId: string;
  overallStreak: OverallStreak;
  bookle: BookleStats;
  bookworm: BookwormStats;
  lexicon: LexiconStats;
  uncovered: UncoveredStats;
  pieces: PiecesStats;
  trolley: TrolleyStats;
  bookbound: BookboundStats;
  achievements: UserGameAchievement[];
  pinnedAchievementIds: string[];
  challenges: GameChallenge[];
  leaderboardVisibility: LeaderboardVisibility;
  hasPlayedAny: boolean;
};
