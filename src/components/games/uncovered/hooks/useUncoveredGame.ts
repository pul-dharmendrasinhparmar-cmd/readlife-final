import { useCallback, useMemo, useRef, useState } from "react";
import {
  BONUS_STREAK_3,
  BONUS_STREAK_5,
  BONUS_STREAK_10,
  POINTS_CORRECT,
  ROUNDS_PER_GAME,
  dealQuestions,
  formatShareResult,
  localISODate,
  uncoveredPuzzleNumber,
} from "../questions";
import { recordUncoveredGame } from "../storage";
import type { RoundResult, UncoveredPhase, UncoveredQuestion } from "../types";

const STAMP_MS = 720;
const REVEAL_AFTER_STAMP_MS = 280;

function playStampSound() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    noise.connect(noiseGain).connect(ctx.destination);
    noise.start(now);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);

    window.setTimeout(() => ctx.close().catch(() => {}), 400);
  } catch {
    /* ignore */
  }
}

export function useUncoveredGame() {
  const puzzleNumber = useMemo(() => uncoveredPuzzleNumber(), []);
  const date = useMemo(() => localISODate(), []);
  const [questions, setQuestions] = useState<UncoveredQuestion[]>([]);

  const [phase, setPhase] = useState<UncoveredPhase>("intro");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const question: UncoveredQuestion | undefined = questions[index];
  const correctStreak = results.reduce(
    (streak, r) => (r.correct ? streak + 1 : 0),
    0,
  );
  const score = results.reduce((sum, r) => sum + r.points + r.bonus, 0);
  const recognized = results.filter((r) => r.correct).length;
  const bestStreak = results.reduce(
    (best, r, i, arr) => {
      if (!r.correct) return best;
      let run = 1;
      for (let j = i - 1; j >= 0 && arr[j].correct; j--) run++;
      return Math.max(best, run);
    },
    0,
  );

  const start = useCallback(() => {
    clearTimers();
    setQuestions(dealQuestions());
    setPhase("guessing");
    setIndex(0);
    setSelected(null);
    setResults([]);
    setShareCopied(false);
  }, [clearTimers]);

  const selectAnswer = useCallback(
    (option: string) => {
      if (phase !== "guessing" || !question) return;
      const correct = option === question.correctAnswer;
      const nextStreak = correct ? correctStreak + 1 : 0;
      let bonus = 0;
      if (correct && nextStreak === 3) bonus += BONUS_STREAK_3;
      if (correct && nextStreak === 5) bonus += BONUS_STREAK_5;
      if (correct && nextStreak === ROUNDS_PER_GAME) bonus += BONUS_STREAK_10;

      setSelected(option);
      setResults((prev) => [
        ...prev,
        {
          questionId: question.id,
          correct,
          selected: option,
          points: correct ? POINTS_CORRECT : 0,
          bonus,
        },
      ]);
      setPhase("stamping");
      playStampSound();

      const revealId = window.setTimeout(() => {
        setPhase("revealed");
      }, STAMP_MS + REVEAL_AFTER_STAMP_MS);
      timers.current.push(revealId);
    },
    [phase, question, correctStreak],
  );

  const continueNext = useCallback(() => {
    if (phase !== "revealed") return;
    clearTimers();
    if (index + 1 >= questions.length) {
      const finalRecognized = results.filter((r) => r.correct).length;
      const finalScore = results.reduce((sum, r) => sum + r.points + r.bonus, 0);
      const finalBest = results.reduce((best, r, i, arr) => {
        if (!r.correct) return best;
        let run = 1;
        for (let j = i - 1; j >= 0 && arr[j].correct; j--) run++;
        return Math.max(best, run);
      }, 0);
      recordUncoveredGame({
        score: finalScore,
        recognized: finalRecognized,
        bestStreak: finalBest,
      });
      setPhase("complete");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setPhase("guessing");
  }, [phase, index, questions.length, results, clearTimers]);

  const share = useCallback(async () => {
    const text = formatShareResult({
      puzzleNumber,
      results,
      recognized,
    });
    try {
      await navigator.clipboard.writeText(text);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      setShareCopied(false);
    }
  }, [puzzleNumber, results, recognized]);

  return {
    phase,
    question,
    questions,
    index,
    selected,
    results,
    score,
    recognized,
    bestStreak,
    puzzleNumber,
    date,
    shareCopied,
    start,
    selectAnswer,
    continueNext,
    share,
  };
}
