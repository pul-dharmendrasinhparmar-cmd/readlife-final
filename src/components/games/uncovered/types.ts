export type UncoveredDifficulty = "easy" | "medium" | "hard";

export type ArtFocus = {
  /** Horizontal focal point of the artwork, e.g. "50%" */
  x: string;
  /** Vertical focal point — crop toward art, away from title */
  y: string;
  /** Zoom used while text is hidden */
  scale: number;
  /** Circular window radius as a percent of the card (default 46) */
  window?: number;
};

export type UncoveredQuestion = {
  id: string;
  title: string;
  author: string;
  series?: string;
  genre?: string;
  fullCoverImage: string;
  hiddenCoverImage: string;
  options: string[];
  correctAnswer: string;
  difficulty: UncoveredDifficulty;
  artFocus: ArtFocus;
};

export type RoundResult = {
  questionId: string;
  correct: boolean;
  selected: string;
  points: number;
  bonus: number;
};

export type UncoveredPhase =
  | "intro"
  | "guessing"
  | "stamping"
  | "revealed"
  | "complete";

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

export type DailyPuzzle = {
  number: number;
  date: string;
  questions: UncoveredQuestion[];
};
