export type Point = { x: number; y: number };

export type Dir = "up" | "down" | "left" | "right";

export type BookVariant = "hardcover" | "paperback" | "folio" | "novella";

export type BookFood = Point & {
  id: number;
  variant: BookVariant;
  hue: number;
  bornAt: number;
};

export type Phase =
  | "intro"
  | "countdown"
  | "playing"
  | "celebrating"
  | "complete"
  | "dead";

export type StarId = "finish" | "score500" | "combo10";

export type StarDefinition = {
  id: StarId;
  label: string;
};

export type LevelProgress = {
  highScore: number;
  bestCombo: number;
  bestStars: number;
  muted: boolean;
};

export type ComboState = {
  streak: number;
  multiplier: number;
  expiresAt: number | null;
  label: string | null;
};

export type EatFeedback = {
  id: number;
  x: number;
  y: number;
  text: string;
} | null;

export type GameSnapshot = {
  phase: Phase;
  countdown: number | null;
  snake: Point[];
  dir: Dir;
  book: BookFood | null;
  booksEaten: number;
  score: number;
  bestComboThisRun: number;
  combo: ComboState;
  starsEarned: StarId[];
  eatPop: EatFeedback;
  deathMessage: string | null;
};
