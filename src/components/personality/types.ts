export type DimensionId = "EL" | "IA" | "PM" | "SO";

export type DimensionPole = {
  letter: string;
  label: string;
};

export type DimensionDef = {
  id: DimensionId;
  first: DimensionPole;
  second: DimensionPole;
};

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export type PersonalityQuestion = {
  id: string;
  text: string;
  dimension: DimensionId;
  /** +1 supports first pole; -1 supports second pole */
  orientation: 1 | -1;
};

export type TieBreaker = {
  id: string;
  dimension: DimensionId;
  prompt: string;
  optionA: { letter: string; label: string; blurb: string };
  optionB: { letter: string; label: string; blurb: string };
};

export type PersonalityCode =
  | "EIPS"
  | "EIPO"
  | "EAPS"
  | "EAPO"
  | "EIMS"
  | "EIMO"
  | "EAMS"
  | "EAMO"
  | "LIPS"
  | "LIPO"
  | "LAPS"
  | "LAPO"
  | "LIMS"
  | "LIMO"
  | "LAMS"
  | "LAMO";

export type PersonalityDefinition = {
  code: PersonalityCode;
  emoji: string;
  name: string;
  motto: string;
  poles: [string, string, string, string];
  summary: string;
  longExplanation: string;
  strengths: string[];
  watchOuts: string[];
  superpower: string;
  kryptonite: string;
  tbrStyle: string;
  socialReadingStyle: string;
  recommendationStyle: string;
  suggestedChallenge: string;
  suggestedFeatures: string[];
  suggestedRoom: string;
  suggestedPet: string;
};

export type DimensionScore = {
  dimension: DimensionId;
  rawScore: number;
  firstPolePercentage: number;
  secondPolePercentage: number;
  balanced: boolean;
  winner: string;
  winnerLabel: string;
  loserLabel: string;
};

export type ScoreResult = {
  rawScores: Record<DimensionId, number>;
  dimensions: DimensionScore[];
  balancedDimensions: DimensionId[];
  tiedDimensions: DimensionId[];
  personalityCode: PersonalityCode | null;
};

export type PersonalityAssessment = {
  id: string;
  startedAt: string;
  completedAt: string;
  answers: Record<string, LikertValue>;
  tieBreakers: Partial<Record<DimensionId, string>>;
  rawScores: Record<DimensionId, number>;
  percentages: Record<
    DimensionId,
    { first: number; second: number; balanced: boolean }
  >;
  balancedDimensions: DimensionId[];
  personalityCode: PersonalityCode;
  isPublic: boolean;
  addedToProfile: boolean;
};

export type QuizProgress = {
  answers: Record<string, LikertValue>;
  currentIndex: number;
  startedAt: string;
  updatedAt: string;
};

export const DIMENSIONS: DimensionDef[] = [
  {
    id: "EL",
    first: { letter: "E", label: "Explorer" },
    second: { letter: "L", label: "Loyalist" },
  },
  {
    id: "IA",
    first: { letter: "I", label: "Immersive" },
    second: { letter: "A", label: "Analytical" },
  },
  {
    id: "PM",
    first: { letter: "P", label: "Planner" },
    second: { letter: "M", label: "Mood Reader" },
  },
  {
    id: "SO",
    first: { letter: "S", label: "Social" },
    second: { letter: "O", label: "Solo" },
  },
];

export const LIKERT_LABELS: Record<LikertValue, string> = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral / depends",
  4: "Agree",
  5: "Strongly agree",
};
