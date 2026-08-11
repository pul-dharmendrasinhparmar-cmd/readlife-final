import { PERSONALITY_QUESTIONS } from "./questions";
import {
  DIMENSIONS,
  type DimensionId,
  type DimensionScore,
  type LikertValue,
  type PersonalityCode,
  type ScoreResult,
} from "./types";

/** Deterministic Reading Personality scoring — no AI at runtime. */

export function centeredScore(response: LikertValue): number {
  return response - 3;
}

export function questionScore(
  response: LikertValue,
  orientation: 1 | -1,
): number {
  return centeredScore(response) * orientation;
}

function sumRawScores(
  answers: Record<string, LikertValue>,
): Record<DimensionId, number> {
  const rawScores: Record<DimensionId, number> = {
    EL: 0,
    IA: 0,
    PM: 0,
    SO: 0,
  };
  for (const q of PERSONALITY_QUESTIONS) {
    const answer = answers[q.id];
    if (answer == null) continue;
    rawScores[q.dimension] += questionScore(answer, q.orientation);
  }
  return rawScores;
}

function effectiveRaw(
  raw: number,
  dimension: DimensionId,
  tieBreakers: Partial<Record<DimensionId, string>>,
  def: (typeof DIMENSIONS)[number],
): { effective: number; unresolved: boolean } {
  if (raw !== 0) return { effective: raw, unresolved: false };
  const pick = tieBreakers[dimension];
  if (pick === def.first.letter) return { effective: 1, unresolved: false };
  if (pick === def.second.letter) return { effective: -1, unresolved: false };
  return { effective: 0, unresolved: true };
}

export function scoreAnswers(
  answers: Record<string, LikertValue>,
  tieBreakers: Partial<Record<DimensionId, string>> = {},
): ScoreResult {
  const rawScores = sumRawScores(answers);
  const tiedDimensions: DimensionId[] = [];
  const balancedDimensions: DimensionId[] = [];

  const dimensions: DimensionScore[] = DIMENSIONS.map((def) => {
    const raw = rawScores[def.id];
    const { effective, unresolved } = effectiveRaw(
      raw,
      def.id,
      tieBreakers,
      def,
    );

    if (unresolved) tiedDimensions.push(def.id);
    // Balanced uses pre-tie raw; exact zero is a tie, not "balanced"
    if (Math.abs(raw) <= 2 && raw !== 0) balancedDimensions.push(def.id);

    const firstPolePercentage = unresolved
      ? 50
      : Math.round(((effective + 16) / 32) * 100);
    const secondPolePercentage = 100 - firstPolePercentage;
    const winFirst = effective >= 0;

    return {
      dimension: def.id,
      rawScore: raw,
      firstPolePercentage,
      secondPolePercentage,
      balanced: Math.abs(raw) <= 2 && raw !== 0,
      winner: unresolved ? "" : winFirst ? def.first.letter : def.second.letter,
      winnerLabel: unresolved
        ? ""
        : winFirst
          ? def.first.label
          : def.second.label,
      loserLabel: unresolved
        ? ""
        : winFirst
          ? def.second.label
          : def.first.label,
    };
  });

  const personalityCode =
    tiedDimensions.length === 0
      ? (dimensions.map((d) => d.winner).join("") as PersonalityCode)
      : null;

  return {
    rawScores,
    dimensions,
    balancedDimensions,
    tiedDimensions,
    personalityCode,
  };
}

export function buildAssessmentId() {
  return `pa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
