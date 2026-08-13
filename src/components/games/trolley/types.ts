export type TrolleyStats = {
  gamesPlayed: number;
  personalBest: number;
  lastScore?: number;
  lastCollected?: number;
  lastReaderType?: string;
  currentPlayStreak: number;
  longestPlayStreak: number;
  lastPlayedDate?: string;
};

export type TrolleyPhase =
  | "tutorial"
  | "ready"
  | "playing"
  | "paused"
  | "results";
