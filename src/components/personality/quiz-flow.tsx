"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrderedQuestions } from "./questions";
import { getPersonality, formatPersonalityCode } from "./personalities";
import { getTieBreaker } from "./tie-breakers";
import { scoreAnswers } from "./score";
import {
  clearQuizProgress,
  completeQuiz,
  loadQuizProgress,
  saveQuizProgress,
  setActiveAssessment,
} from "./quiz-storage";
import { PersonalityShareCard } from "./share-card";
import { PersonalityCompare } from "./compare";
import { PersonalityResultCard } from "./result-card";
import { PersonalityShelfBridge } from "@/components/ai/personality-shelf";
import {
  DIMENSIONS,
  LIKERT_LABELS,
  type DimensionId,
  type LikertValue,
  type PersonalityAssessment,
} from "./types";

type Phase =
  | "intro"
  | "resume"
  | "questions"
  | "tiebreak"
  | "reveal"
  | "result";

type Props = {
  open: boolean;
  onClose: () => void;
  onComplete: (assessment: PersonalityAssessment) => void;
  followingIds: string[];
  /** Start at result for an existing assessment (view full). */
  viewAssessment?: PersonalityAssessment | null;
};

const LIKERT_VALUES: LikertValue[] = [1, 2, 3, 4, 5];

export function QuizFlow({
  open,
  onClose,
  onComplete,
  followingIds,
  viewAssessment = null,
}: Props) {
  const questions = useMemo(() => getOrderedQuestions(), []);
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, LikertValue>>({});
  const [tieBreakers, setTieBreakers] = useState<
    Partial<Record<DimensionId, string>>
  >({});
  const [tieQueue, setTieQueue] = useState<DimensionId[]>([]);
  const [tieIndex, setTieIndex] = useState(0);
  const [startedAt, setStartedAt] = useState("");
  const [assessment, setAssessment] = useState<PersonalityAssessment | null>(
    null,
  );
  const [revealStep, setRevealStep] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  const resetFresh = useCallback(() => {
    clearQuizProgress();
    setAnswers({});
    setTieBreakers({});
    setTieQueue([]);
    setTieIndex(0);
    setIndex(0);
    setStartedAt(new Date().toISOString());
    setAssessment(null);
    setRevealStep(0);
    setPhase("intro");
  }, []);

  useEffect(() => {
    if (!open) return;
    if (viewAssessment) {
      setAssessment(viewAssessment);
      setPhase("result");
      setRevealStep(3);
      return;
    }
    const progress = loadQuizProgress();
    if (progress && Object.keys(progress.answers).length > 0) {
      setAnswers(progress.answers);
      setIndex(progress.currentIndex);
      setStartedAt(progress.startedAt);
      setPhase("resume");
    } else {
      resetFresh();
    }
  }, [open, viewAssessment, resetFresh]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (phase !== "reveal" || !assessment) return;
    setRevealStep(0);
    const t1 = window.setTimeout(() => setRevealStep(1), 700);
    const t2 = window.setTimeout(() => setRevealStep(2), 1600);
    const t3 = window.setTimeout(() => setRevealStep(3), 2600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [phase, assessment]);

  if (!open) return null;

  const answeredCount = Object.keys(answers).length;
  const current = questions[index];
  const progressPct = Math.round((answeredCount / questions.length) * 100);

  function persist(nextAnswers: Record<string, LikertValue>, nextIndex: number) {
    saveQuizProgress({
      answers: nextAnswers,
      currentIndex: nextIndex,
      startedAt: startedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  function finishOrTie(
    nextAnswers: Record<string, LikertValue>,
    nextTies: Partial<Record<DimensionId, string>>,
  ) {
    const scored = scoreAnswers(nextAnswers, nextTies);
    if (scored.tiedDimensions.length > 0) {
      setTieQueue(scored.tiedDimensions);
      setTieIndex(0);
      setPhase("tiebreak");
      return;
    }
    const done = completeQuiz({
      answers: nextAnswers,
      tieBreakers: nextTies,
      startedAt: startedAt || new Date().toISOString(),
    });
    setAssessment(done);
    setPhase("reveal");
  }

  function selectAnswer(value: LikertValue) {
    if (!current) return;
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    persist(next, index);
  }

  function goNext() {
    if (!current || answers[current.id] == null) return;
    if (index < questions.length - 1) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      persist(answers, nextIndex);
      return;
    }
    finishOrTie(answers, tieBreakers);
  }

  function goBack() {
    if (index === 0) {
      setPhase("intro");
      return;
    }
    const nextIndex = index - 1;
    setIndex(nextIndex);
    persist(answers, nextIndex);
  }

  function pickTie(letter: string) {
    const dim = tieQueue[tieIndex];
    if (!dim) return;
    const nextTies = { ...tieBreakers, [dim]: letter };
    setTieBreakers(nextTies);
    if (tieIndex < tieQueue.length - 1) {
      setTieIndex(tieIndex + 1);
      return;
    }
    finishOrTie(answers, nextTies);
  }

  const scored = assessment
    ? scoreAnswers(assessment.answers, assessment.tieBreakers)
    : null;
  const personality = assessment
    ? getPersonality(assessment.personalityCode)
    : null;

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-forest/45 p-3 backdrop-blur-[2px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Reading Personality quiz"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[1.75rem] border border-[#4a425c] bg-[#3a324f] shadow-[0_24px_60px_rgba(42,36,56,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#4a425c] px-5 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
            Reading Personality
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#3f3654] px-3 py-1.5 text-sm font-semibold text-ink"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {phase === "intro" && (
            <div className="text-center">
              <p className="text-4xl" aria-hidden>
                🌙
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-ink">
                What kind of reader are you?
              </h2>
              <p className="mt-2 text-sm text-muted">
                Discover the habits, instincts and quirks that shape your reading
                life.
              </p>
              <ul className="mt-5 space-y-1 text-sm text-ink/80">
                <li>32 questions</li>
                <li>About 5 minutes</li>
                <li>No right answers</li>
                <li>Retake anytime</li>
              </ul>
              <button
                type="button"
                className="mt-6 w-full rounded-full bg-forest px-5 py-3 text-sm font-semibold text-paper"
                onClick={() => {
                  setStartedAt(new Date().toISOString());
                  setPhase("questions");
                }}
              >
                Discover My Reading Personality
              </button>
              <button
                type="button"
                className="mt-2 w-full rounded-full px-5 py-2.5 text-sm font-semibold text-ink"
                onClick={onClose}
              >
                Maybe Later
              </button>
            </div>
          )}

          {phase === "resume" && (
            <div className="text-center">
              <h2 className="font-serif text-2xl font-semibold text-ink">
                Welcome back.
              </h2>
              <p className="mt-2 text-sm text-muted">
                You&apos;ve completed {answeredCount} of {questions.length}{" "}
                questions.
              </p>
              <button
                type="button"
                className="mt-6 w-full rounded-full bg-forest px-5 py-3 text-sm font-semibold text-paper"
                onClick={() => setPhase("questions")}
              >
                Continue Quiz
              </button>
              <button
                type="button"
                className="mt-2 w-full rounded-full bg-[#3f3654] px-5 py-2.5 text-sm font-semibold text-ink"
                onClick={resetFresh}
              >
                Start Over
              </button>
            </div>
          )}

          {phase === "questions" && current && (
            <div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  Question {index + 1} of {questions.length}
                </span>
                <span>{progressPct}%</span>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-[#4a425c]"
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-forest transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-6 font-serif text-xl font-semibold text-ink">
                {current.text}
              </p>
              <fieldset className="mt-5 space-y-2">
                <legend className="sr-only">Your answer</legend>
                {LIKERT_VALUES.map((v) => {
                  const selected = answers[current.id] === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => selectAnswer(v)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        selected
                          ? "border-forest bg-forest text-paper"
                          : "border-[#564d6a] bg-paper/70 text-ink hover:border-forest/40"
                      }`}
                      aria-pressed={selected}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          selected
                            ? "border-paper"
                            : "border-forest/40"
                        }`}
                        aria-hidden
                      >
                        {selected ? "●" : ""}
                      </span>
                      {LIKERT_LABELS[v]}
                    </button>
                  );
                })}
              </fieldset>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full bg-[#3f3654] px-5 py-2.5 text-sm font-semibold text-ink"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={answers[current.id] == null}
                  className="flex-1 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-40"
                >
                  {index === questions.length - 1 ? "See results" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {phase === "tiebreak" && tieQueue[tieIndex] && (
            <TieBreakStep
              dimension={tieQueue[tieIndex]}
              step={tieIndex + 1}
              total={tieQueue.length}
              onPick={pickTie}
            />
          )}

          {phase === "reveal" && assessment && personality && scored && (
            <div className="text-center">
              {revealStep >= 0 && (
                <p className="animate-[fade-up_0.6s_ease] text-sm text-muted">
                  Your reading instincts have been decoded…
                </p>
              )}
              {revealStep >= 1 && (
                <ul className="mt-5 space-y-2 text-left">
                  {scored.dimensions.map((d) => {
                    const def = DIMENSIONS.find((x) => x.id === d.dimension)!;
                    return (
                      <li
                        key={d.dimension}
                        className="rounded-2xl border border-[#4a425c] bg-paper/60 px-3 py-2 text-sm"
                      >
                        <div className="flex justify-between gap-2">
                          <span className="font-semibold text-ink">
                            {def.first.label} {d.firstPolePercentage}%
                          </span>
                          <span className="text-muted">
                            {def.second.label} {d.secondPolePercentage}%
                          </span>
                        </div>
                        {d.balanced ? (
                          <p className="mt-1 text-xs text-muted">
                            You sit very close to the middle of this dimension.
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
              {revealStep >= 2 && (
                <div className="mt-6 animate-[fade-up_0.5s_ease]">
                  <PersonalityResultCard
                    code={personality.code}
                    name={personality.name}
                    size="reveal"
                  />
                  <h2 className="mt-4 font-serif text-3xl font-semibold tracking-wide text-ink uppercase">
                    {personality.name.replace(/^The /, "")}{" "}
                    <span className="font-sans text-base font-semibold tracking-wide text-ink/70 normal-case">
                      {formatPersonalityCode(personality.code)}
                    </span>
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    {personality.poles.join(" · ")}
                  </p>
                  <p className="mt-4 font-serif text-lg italic text-ink">
                    &ldquo;{personality.motto}&rdquo;
                  </p>
                </div>
              )}
              {revealStep >= 3 && (
                <button
                  type="button"
                  className="mt-6 w-full rounded-full bg-forest px-5 py-3 text-sm font-semibold text-paper"
                  onClick={() => setPhase("result")}
                >
                  Explore My Personality
                </button>
              )}
            </div>
          )}

          {phase === "result" && assessment && personality && scored && (
            <FullResult
              assessment={assessment}
              onAdd={() => {
                const next = setActiveAssessment(assessment);
                setAssessment(next);
                onComplete(next);
              }}
              onShare={() => setShareOpen(true)}
              onCompare={() => setCompareOpen(true)}
              onRetake={() => {
                resetFresh();
                setPhase("intro");
              }}
            />
          )}
        </div>
      </div>

      {assessment && (
        <>
          <PersonalityShareCard
            assessment={assessment}
            open={shareOpen}
            onClose={() => setShareOpen(false)}
          />
          <PersonalityCompare
            assessment={assessment}
            followingIds={followingIds}
            open={compareOpen}
            onClose={() => setCompareOpen(false)}
          />
        </>
      )}
    </div>
  );
}

function TieBreakStep({
  dimension,
  step,
  total,
  onPick,
}: {
  dimension: DimensionId;
  step: number;
  total: number;
  onPick: (letter: string) => void;
}) {
  const tb = getTieBreaker(dimension);
  return (
    <div>
      <p className="text-xs text-muted">
        Tie-breaker {step} of {total}
      </p>
      <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">
        One more choice
      </h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/90">
        {tb.prompt}
      </p>
      <div className="mt-5 space-y-2">
        <button
          type="button"
          onClick={() => onPick(tb.optionA.letter)}
          className="w-full rounded-2xl border border-[#564d6a] bg-paper/80 px-4 py-3 text-left text-sm font-semibold text-ink hover:border-forest/50"
        >
          {tb.optionA.label}
        </button>
        <button
          type="button"
          onClick={() => onPick(tb.optionB.letter)}
          className="w-full rounded-2xl border border-[#564d6a] bg-paper/80 px-4 py-3 text-left text-sm font-semibold text-ink hover:border-forest/50"
        >
          {tb.optionB.label}
        </button>
      </div>
    </div>
  );
}

function FullResult({
  assessment,
  onAdd,
  onShare,
  onCompare,
  onRetake,
}: {
  assessment: PersonalityAssessment;
  onAdd: () => void;
  onShare: () => void;
  onCompare: () => void;
  onRetake: () => void;
}) {
  const p = getPersonality(assessment.personalityCode);
  const scored = scoreAnswers(assessment.answers, assessment.tieBreakers);

  return (
    <div>
      <div className="text-center">
        <PersonalityResultCard
          code={p.code}
          name={p.name}
          size="full"
          showDownload
        />
        <h2 className="mt-4 font-serif text-3xl font-semibold text-ink">
          {p.name}{" "}
          <span className="font-sans text-base font-semibold tracking-wide text-ink/70">
            {formatPersonalityCode(p.code)}
          </span>
        </h2>
        <p className="mt-3 font-serif text-lg italic text-ink">
          &ldquo;{p.motto}&rdquo;
        </p>
        <p className="mt-2 text-sm text-muted">{p.poles.join(" · ")}</p>
      </div>

      <ul className="mt-5 space-y-2">
        {scored.dimensions.map((d) => {
          const def = DIMENSIONS.find((x) => x.id === d.dimension)!;
          const winPct =
            d.winner === def.first.letter
              ? d.firstPolePercentage
              : d.secondPolePercentage;
          return (
            <li key={d.dimension} className="text-sm text-ink">
              <span className="font-semibold">{d.winnerLabel}</span> {winPct}%
              {d.balanced ? (
                <span className="text-muted"> · balanced</span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-sm leading-relaxed text-ink/90">{p.summary}</p>
      <div className="mt-4 space-y-3 whitespace-pre-line text-sm leading-relaxed text-muted">
        {p.longExplanation}
      </div>

      <ResultBlock title="Strengths" items={p.strengths} />
      <ResultBlock title="Watch-outs" items={p.watchOuts} />

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-ink">Superpower</dt>
          <dd className="text-muted">{p.superpower}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Kryptonite</dt>
          <dd className="text-muted">{p.kryptonite}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">TBR style</dt>
          <dd className="text-muted">{p.tbrStyle}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Social reading</dt>
          <dd className="text-muted">{p.socialReadingStyle}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Recommendation style</dt>
          <dd className="text-muted">{p.recommendationStyle}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Suggested challenge</dt>
          <dd className="text-muted">{p.suggestedChallenge}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-[1.25rem] border border-[#4a425c] bg-[#342c45] px-4 py-3">
        <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
          Best ReadLife features
        </p>
        <ul className="mt-2 space-y-1 text-sm text-ink">
          {p.suggestedFeatures.map((f) => (
            <li key={f}>
              {f}
              <span className="text-muted-soft"> — conceptual / future</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Suggested room: {p.suggestedRoom}
        </p>
        <p className="text-sm text-muted">Suggested pet: {p.suggestedPet}</p>
        <p className="mt-2 text-xs text-muted-soft">
          Suggestions only — your room and pet are not changed automatically.
        </p>
      </div>

      <PersonalityShelfBridge
        personalityLabel={`${p.name} (${formatPersonalityCode(p.code)}): ${p.summary}`}
      />

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {!assessment.addedToProfile ? (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-paper sm:col-span-2"
          >
            Add to Profile
          </button>
        ) : (
          <p className="sm:col-span-2 text-center text-sm font-semibold text-ink">
            On your profile ✓
          </p>
        )}
        <button
          type="button"
          onClick={onShare}
          className="rounded-full bg-[#3f3654] px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Share Result
        </button>
        <button
          type="button"
          onClick={onCompare}
          className="rounded-full bg-[#3f3654] px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Compare With Friends
        </button>
        <button
          type="button"
          onClick={onRetake}
          className="rounded-full border border-[#564d6a] px-4 py-2.5 text-sm font-semibold text-ink sm:col-span-2"
        >
          Retake Test
        </button>
      </div>
    </div>
  );
}

function ResultBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
        {title}
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
