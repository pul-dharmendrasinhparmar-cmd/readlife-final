import type { LevelConfig } from "../levels/types";
import type { StarId } from "../types";

export function computeStars(args: {
  level: LevelConfig;
  booksEaten: number;
  score: number;
  bestCombo: number;
  completed: boolean;
}): StarId[] {
  const earned: StarId[] = [];
  if (args.completed || args.booksEaten >= args.level.goalBooks) {
    earned.push("finish");
  }
  if (args.score >= args.level.scoreStarThreshold) {
    earned.push("score500");
  }
  if (args.bestCombo >= args.level.comboStarThreshold) {
    earned.push("combo10");
  }
  return earned;
}

export function scorePoints(
  base: number,
  multiplier: number,
): number {
  return base * multiplier;
}
