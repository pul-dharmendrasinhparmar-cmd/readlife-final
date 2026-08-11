import type { LevelConfig } from "./types";

/**
 * Level 1 — Cozy Shelf
 * Static bookshelf corridors only; classic snake skills.
 */
export const LEVEL_1_COZY_SHELF: LevelConfig = {
  id: "level-1-cozy-shelf",
  number: 1,
  name: "Cozy Shelf",
  tagline: "Someone left the library unattended.\nTerrible mistake.",
  goalBooks: 30,
  grid: 16,
  baseTickMs: 175,
  speedTiers: [
    { fromBooks: 0, speedFactor: 1 },
    { fromBooks: 10, speedFactor: 1.1 },
    { fromBooks: 20, speedFactor: 1.2 },
    { fromBooks: 25, speedFactor: 1.3 },
  ],
  comboWindowMs: 2800,
  pointsPerBook: 10,
  scoreStarThreshold: 500,
  comboStarThreshold: 10,
  stars: [
    { id: "finish", label: "Finish the level" },
    { id: "score500", label: "Score 500+" },
    { id: "combo10", label: "Reach a 10-book combo" },
  ],
  // Two short vertical bookshelf sections → soft corridors
  obstacles: [
    { x: 4, y: 3 },
    { x: 4, y: 4 },
    { x: 4, y: 5 },
    { x: 4, y: 6 },
    { x: 11, y: 9 },
    { x: 11, y: 10 },
    { x: 11, y: 11 },
    { x: 11, y: 12 },
  ],
  startSnake: [
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
  ],
  startDir: "right",
  nextLevelLabel: "LEVEL 2 — COMING SOON",
  nextLevelReady: false,
};
