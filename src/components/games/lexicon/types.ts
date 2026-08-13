export type CellPremium = "none" | "dl" | "tl" | "dw" | "tw" | "center";

export type BoardCell = {
  letter: string | null;
  /** Whether this letter was just played (for highlight) */
  fresh?: boolean;
};

export type Tile = {
  id: string;
  letter: string; // A-Z or "?" blank
  points: number;
  isBlank: boolean;
};

export type Direction = "across" | "down";

export type Placement = {
  row: number;
  col: number;
  direction: Direction;
  /** Letters placed this turn (blanks already assigned) */
  word: string;
  /** Rack tile ids used, aligned to non-board letters in word */
  tileIds: string[];
  /** Assigned letters for blanks, same order as blank tiles in tileIds */
  blankAssignments?: string[];
};

export type ScoredMove = Placement & {
  score: number;
  wordsFormed: string[];
  /** Flat bonus from bookish jargon */
  bookishBonus?: number;
  bookishHits?: string[];
};

export type PlayerId = "you" | "readlife";

export type TurnLog = {
  player: PlayerId;
  kind: "play" | "pass" | "exchange";
  word?: string;
  score?: number;
  wordsFormed?: string[];
};

export type GamePhase = "intro" | "playing" | "gameover";

export type LexiconState = {
  phase: GamePhase;
  board: BoardCell[][];
  bag: Tile[];
  yourRack: Tile[];
  aiRack: Tile[];
  yourScore: number;
  aiScore: number;
  turn: PlayerId;
  consecutivePasses: number;
  history: TurnLog[];
  lastMove: ScoredMove | null;
  message: string | null;
  winner: PlayerId | "tie" | null;
};
