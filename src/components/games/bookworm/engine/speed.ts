import type { LevelConfig } from "../levels/types";

/**
 * Smooth speed ramp from level tiers.
 * Holds base speed through books 1–10, then eases into each higher tier
 * over a few books so changes feel noticeable but not abrupt.
 */
export function tickMsForBooks(
  booksEaten: number,
  level: LevelConfig,
): number {
  const tiers = level.speedTiers;
  let target = tiers[0].speedFactor;
  let prev = tiers[0].speedFactor;
  let boundary = 0;

  for (let i = 0; i < tiers.length; i += 1) {
    if (booksEaten >= tiers[i].fromBooks) {
      target = tiers[i].speedFactor;
      if (i > 0) {
        prev = tiers[i - 1].speedFactor;
        boundary = tiers[i].fromBooks;
      }
    }
  }

  const blendBooks = 3;
  let factor = target;
  if (boundary > 0 && booksEaten - boundary < blendBooks) {
    const t = (booksEaten - boundary) / blendBooks;
    factor = prev + (target - prev) * Math.min(1, Math.max(0, t));
  }

  return Math.max(55, Math.round(level.baseTickMs / factor));
}
