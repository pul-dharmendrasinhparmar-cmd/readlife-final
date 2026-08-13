export type PiecesPhase = "intro" | "playing" | "complete";

export type PiecesCover = {
  id: string;
  title: string;
  author: string;
  image: string;
  fallbackImage: string;
};

export type PiecesStats = {
  gamesPlayed: number;
  puzzlesCompleted: number;
  bestTimeMs: number;
  lastTimeMs?: number;
  lastPlayedDate?: string;
  todayCompleted: boolean;
};

export type PieceDrag = {
  id: number;
  pointerId: number;
  grabX: number;
  grabY: number;
  x: number;
  y: number;
};
