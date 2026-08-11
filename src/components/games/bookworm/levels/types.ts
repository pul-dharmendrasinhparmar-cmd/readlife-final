import type { Point, StarDefinition } from "../types";

export type LevelConfig = {
  id: string;
  number: number;
  name: string;
  tagline: string;
  goalBooks: number;
  /** Grid width/height in cells */
  grid: number;
  /** Base tick interval in ms (lower = faster) */
  baseTickMs: number;
  /**
   * Speed tiers by books already eaten.
   * factor is speed multiplier vs start (1.1 = ~10% faster → shorter tick).
   */
  speedTiers: { fromBooks: number; speedFactor: number }[];
  /** Combo expire window in ms */
  comboWindowMs: number;
  /** Points per book before multiplier */
  pointsPerBook: number;
  scoreStarThreshold: number;
  comboStarThreshold: number;
  stars: StarDefinition[];
  /** Static obstacle cells (bookshelf sections) */
  obstacles: Point[];
  /** Starting snake body, head first */
  startSnake: Point[];
  startDir: "up" | "down" | "left" | "right";
  nextLevelLabel: string;
  nextLevelReady: boolean;
};

export function pointKey(p: Point): string {
  return `${p.x},${p.y}`;
}

export function obstaclesSet(obstacles: Point[]): Set<string> {
  return new Set(obstacles.map(pointKey));
}
