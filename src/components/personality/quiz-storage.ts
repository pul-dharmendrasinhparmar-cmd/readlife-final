"use client";

import { PERSONALITY_QUESTIONS } from "./questions";
import { getPersonality } from "./personalities";
import { buildAssessmentId, scoreAnswers } from "./score";
import type {
  DimensionId,
  LikertValue,
  PersonalityAssessment,
  QuizProgress,
} from "./types";

const PROGRESS_KEY = "readlife-personality-progress-v1";
const HISTORY_KEY = "readlife-personality-history-v1";
const ACTIVE_KEY = "readlife-personality-active-v1";
const SEEDED_KEY = "readlife-personality-demo-seeded-v1";
/** Set to `1` to skip pre-seeded EIMO demo assessment. */
const SKIP_DEMO_KEY = "readlife-personality-skip-demo";

function now() {
  return new Date().toISOString();
}

/** Deterministic demo answers → EIMO (Explorer / Immersive / Mood / Solo). */
function buildDemoEimoAnswers(): Record<string, LikertValue> {
  const answers: Record<string, LikertValue> = {};
  for (const q of PERSONALITY_QUESTIONS) {
    if (q.dimension === "EL") {
      answers[q.id] = q.orientation === 1 ? 5 : 2;
    } else if (q.dimension === "IA") {
      answers[q.id] = q.orientation === 1 ? 5 : 1;
    } else if (q.dimension === "PM") {
      answers[q.id] = q.orientation === -1 ? 5 : 2;
    } else {
      answers[q.id] = q.orientation === -1 ? 4 : 2;
    }
  }
  return answers;
}

function assessmentFromScore(
  id: string,
  answers: Record<string, LikertValue>,
  tieBreakers: Partial<Record<DimensionId, string>>,
  startedAt: string,
  completedAt: string,
  extras: Partial<PersonalityAssessment> = {},
): PersonalityAssessment {
  const scored = scoreAnswers(answers, tieBreakers);
  if (!scored.personalityCode) {
    throw new Error("Cannot build assessment while dimensions remain tied.");
  }
  return {
    id,
    startedAt,
    completedAt,
    answers,
    tieBreakers,
    rawScores: scored.rawScores,
    percentages: Object.fromEntries(
      scored.dimensions.map((d) => [
        d.dimension,
        {
          first: d.firstPolePercentage,
          second: d.secondPolePercentage,
          balanced: d.balanced,
        },
      ]),
    ) as PersonalityAssessment["percentages"],
    balancedDimensions: scored.balancedDimensions,
    personalityCode: scored.personalityCode,
    isPublic: true,
    addedToProfile: false,
    ...extras,
  };
}

/**
 * Seed demo EIMO once. Never overwrites an existing history/active assessment.
 */
export function ensureDemoPersonalitySeed(): PersonalityAssessment | null {
  if (typeof window === "undefined") return null;
  try {
    if (localStorage.getItem(SKIP_DEMO_KEY) === "1") return null;
    const history = loadHistory();
    if (history.length > 0) {
      localStorage.setItem(SEEDED_KEY, "1");
      return loadActiveAssessment();
    }
    if (localStorage.getItem(SEEDED_KEY) === "1") {
      return loadActiveAssessment();
    }

    const answers = buildDemoEimoAnswers();
    const assessment = assessmentFromScore(
      "pa-demo-eimo",
      answers,
      {},
      "2026-07-15T18:00:00.000Z",
      "2026-07-15T18:22:00.000Z",
      { isPublic: true, addedToProfile: true },
    );
    appendHistory(assessment);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(assessment));
    localStorage.setItem(SEEDED_KEY, "1");
    return assessment;
  } catch {
    return null;
  }
}

export function loadQuizProgress(): QuizProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuizProgress;
  } catch {
    return null;
  }
}

export function saveQuizProgress(progress: QuizProgress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function clearQuizProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // ignore
  }
}

export function loadHistory(): PersonalityAssessment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PersonalityAssessment[];
  } catch {
    return [];
  }
}

/** Append or update by id — never wipe unrelated history. */
function appendHistory(assessment: PersonalityAssessment) {
  const history = loadHistory();
  const next = [assessment, ...history.filter((h) => h.id !== assessment.id)].slice(
    0,
    20,
  );
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function loadActiveAssessment(): PersonalityAssessment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (raw) return JSON.parse(raw) as PersonalityAssessment;
    const history = loadHistory();
    return history.find((h) => h.addedToProfile) ?? history[0] ?? null;
  } catch {
    return null;
  }
}

export function saveAssessment(assessment: PersonalityAssessment) {
  appendHistory(assessment);
  if (assessment.addedToProfile) {
    try {
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(assessment));
    } catch {
      // ignore
    }
  }
}

export function setActiveAssessment(assessment: PersonalityAssessment) {
  const next = { ...assessment, addedToProfile: true };
  appendHistory(next);
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function updateActiveVisibility(isPublic: boolean) {
  const active = loadActiveAssessment();
  if (!active) return null;
  const next = { ...active, isPublic };
  appendHistory(next);
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function completeQuiz(input: {
  answers: Record<string, LikertValue>;
  tieBreakers: Partial<Record<DimensionId, string>>;
  startedAt: string;
}): PersonalityAssessment {
  const assessment = assessmentFromScore(
    buildAssessmentId(),
    input.answers,
    input.tieBreakers,
    input.startedAt,
    now(),
    { isPublic: true, addedToProfile: false },
  );
  appendHistory(assessment);
  clearQuizProgress();
  return assessment;
}

export function getActivePersonalityLabel(): string | null {
  const active = loadActiveAssessment();
  if (!active?.addedToProfile) return null;
  const p = getPersonality(active.personalityCode);
  return `${p.emoji} ${p.name}`;
}
