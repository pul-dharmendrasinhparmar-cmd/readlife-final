/** Multiplier thresholds by streak length. */
const TIERS: { min: number; multiplier: number; label: string }[] = [
  { min: 10, multiplier: 4, label: "BOOKWORM IS RAVENOUS!" },
  { min: 5, multiplier: 3, label: "BOOKWORM IS HUNGRY!" },
  { min: 3, multiplier: 2, label: "3 BOOK STREAK!" },
];

export function multiplierForStreak(streak: number): number {
  for (const t of TIERS) {
    if (streak >= t.min) return t.multiplier;
  }
  return 1;
}

export function comboLabelForStreak(streak: number): string | null {
  for (const t of TIERS) {
    if (streak >= t.min) {
      if (streak === t.min) return t.label;
      if (streak === 10) return t.label;
      if (streak > 10 && streak % 5 === 0) return `${streak} BOOK STREAK!`;
      if (streak === 3 || streak === 5) return t.label;
      return null;
    }
  }
  return null;
}

export function pointsForEat(
  basePoints: number,
  streakAfterEat: number,
): number {
  return basePoints * multiplierForStreak(streakAfterEat);
}

export type ComboTickResult = {
  streak: number;
  multiplier: number;
  expiresAt: number;
  justUnlockedLabel: string | null;
};

export function applyEatToCombo(
  prevStreak: number,
  prevExpiresAt: number | null,
  now: number,
  windowMs: number,
): ComboTickResult {
  const stillActive =
    prevExpiresAt !== null && now <= prevExpiresAt && prevStreak > 0;
  const streak = stillActive ? prevStreak + 1 : 1;
  const justUnlockedLabel = comboLabelForStreak(streak);
  return {
    streak,
    multiplier: multiplierForStreak(streak),
    expiresAt: now + windowMs,
    justUnlockedLabel,
  };
}

export function expireComboIfNeeded(
  streak: number,
  expiresAt: number | null,
  now: number,
): { streak: number; multiplier: number; expiresAt: number | null } {
  if (expiresAt !== null && now > expiresAt) {
    return { streak: 0, multiplier: 1, expiresAt: null };
  }
  return {
    streak,
    multiplier: multiplierForStreak(streak),
    expiresAt,
  };
}
