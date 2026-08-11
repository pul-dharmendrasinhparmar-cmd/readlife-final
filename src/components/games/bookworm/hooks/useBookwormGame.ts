"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyEatToCombo,
  expireComboIfNeeded,
} from "../engine/combo";
import { detectCollision } from "../engine/collision";
import { canTurn, nextHead, resolvePendingDir } from "../engine/movement";
import { randomDeathMessage } from "../engine/results";
import { computeStars } from "../engine/scoring";
import { spawnBook } from "../engine/spawn";
import { tickMsForBooks } from "../engine/speed";
import { getLevel, obstaclesSet } from "../levels";
import type { LevelConfig } from "../levels/types";
import { loadProgress, persistRun, saveProgress } from "../save/progress";
import { createSoundApi } from "../sound/sound";
import type {
  BookFood,
  ComboState,
  Dir,
  EatFeedback,
  LevelProgress,
  Phase,
  Point,
  StarId,
} from "../types";

const EMPTY_COMBO: ComboState = {
  streak: 0,
  multiplier: 1,
  expiresAt: null,
  label: null,
};

function cloneSnake(level: LevelConfig): Point[] {
  return level.startSnake.map((p) => ({ ...p }));
}

export function useBookwormGame(levelId?: string) {
  const level = useMemo(() => getLevel(levelId), [levelId]);
  const obstacleKeys = useMemo(
    () => obstaclesSet(level.obstacles),
    [level.obstacles],
  );

  const [phase, setPhase] = useState<Phase>("intro");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [snake, setSnake] = useState<Point[]>(() => cloneSnake(level));
  const [dir, setDir] = useState<Dir>(level.startDir);
  const [book, setBook] = useState<BookFood | null>(null);
  const [booksEaten, setBooksEaten] = useState(0);
  const [score, setScore] = useState(0);
  const [bestComboThisRun, setBestComboThisRun] = useState(0);
  const [combo, setCombo] = useState<ComboState>(EMPTY_COMBO);
  const [starsEarned, setStarsEarned] = useState<StarId[]>([]);
  const [eatPop, setEatPop] = useState<EatFeedback>(null);
  const [deathMessage, setDeathMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<LevelProgress>(() =>
    loadProgress(level.id),
  );
  const [comboFlash, setComboFlash] = useState<string | null>(null);

  const soundRef = useRef(createSoundApi(progress.muted));
  const phaseRef = useRef(phase);
  const dirRef = useRef(dir);
  const pendingDir = useRef<Dir | null>(null);
  const snakeRef = useRef(snake);
  const bookRef = useRef(book);
  const booksEatenRef = useRef(booksEaten);
  const scoreRef = useRef(score);
  const comboRef = useRef(combo);
  const bestComboRef = useRef(bestComboThisRun);
  const lastSpeedTier = useRef(0);

  phaseRef.current = phase;
  dirRef.current = dir;
  snakeRef.current = snake;
  bookRef.current = book;
  booksEatenRef.current = booksEaten;
  scoreRef.current = score;
  comboRef.current = combo;
  bestComboRef.current = bestComboThisRun;

  useEffect(() => {
    setProgress(loadProgress(level.id));
    soundRef.current.setMuted(loadProgress(level.id).muted);
  }, [level.id]);

  const persistEnd = useCallback(
    (runScore: number, runCombo: number, stars: StarId[]) => {
      const next = persistRun(level.id, {
        score: runScore,
        bestCombo: runCombo,
        stars: stars.length,
      });
      setProgress(next);
    },
    [level.id],
  );

  const resetBoard = useCallback(() => {
    const body = cloneSnake(level);
    setSnake(body);
    setDir(level.startDir);
    dirRef.current = level.startDir;
    pendingDir.current = null;
    setBook(spawnBook({ grid: level.grid, snake: body, obstacles: level.obstacles }));
    setBooksEaten(0);
    setScore(0);
    setBestComboThisRun(0);
    setCombo(EMPTY_COMBO);
    comboRef.current = EMPTY_COMBO;
    setStarsEarned([]);
    setEatPop(null);
    setDeathMessage(null);
    setComboFlash(null);
    lastSpeedTier.current = 0;
  }, [level]);

  const beginCountdown = useCallback(() => {
    resetBoard();
    setPhase("countdown");
    setCountdown(3);
  }, [resetBoard]);

  const queueDir = useCallback((next: Dir) => {
    if (phaseRef.current !== "playing") return;
    // One buffered turn per tick — don't overwrite, or a second key/swipe
    // can cancel an escape and steer back into a wall ("random" death).
    if (pendingDir.current !== null) return;
    if (!canTurn(dirRef.current, next)) return;
    pendingDir.current = next;
  }, []);

  const toggleMute = useCallback(() => {
    const nextMuted = !soundRef.current.muted;
    soundRef.current.setMuted(nextMuted);
    setProgress(saveProgress(level.id, { muted: nextMuted }));
  }, [level.id]);

  // Countdown 3-2-1-GO
  useEffect(() => {
    if (phase !== "countdown" || countdown === null) return;
    soundRef.current.play(countdown === 0 ? "go" : "countdown");
    if (countdown === 0) {
      const t = window.setTimeout(() => {
        setCountdown(null);
        setPhase("playing");
      }, 450);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 700);
    return () => window.clearTimeout(t);
  }, [phase, countdown]);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, Dir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
        W: "up",
        S: "down",
        A: "left",
        D: "right",
      };
      const next = map[e.key];
      if (next) {
        if (
          phaseRef.current === "playing" ||
          phaseRef.current === "countdown"
        ) {
          e.preventDefault();
        }
        queueDir(next);
        return;
      }
      if (
        (e.key === " " || e.key === "Enter") &&
        phaseRef.current === "intro"
      ) {
        e.preventDefault();
        beginCountdown();
      }
    }
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [queueDir, beginCountdown]);

  // Prevent page scroll while playing (touch)
  useEffect(() => {
    if (phase !== "playing") return;
    const prevent = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
    };
    document.addEventListener("touchmove", prevent, { passive: false });
    return () => document.removeEventListener("touchmove", prevent);
  }, [phase]);

  // Combo expiry ticker
  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      const now = Date.now();
      const c = comboRef.current;
      const next = expireComboIfNeeded(c.streak, c.expiresAt, now);
      if (next.streak !== c.streak || next.expiresAt !== c.expiresAt) {
        const state: ComboState = {
          ...next,
          label: null,
        };
        comboRef.current = state;
        setCombo(state);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [phase]);

  // Main game loop
  useEffect(() => {
    if (phase !== "playing") return;
    let alive = true;
    let timer = 0;

    const finishDeath = () => {
      const stars = computeStars({
        level,
        booksEaten: booksEatenRef.current,
        score: scoreRef.current,
        bestCombo: bestComboRef.current,
        completed: false,
      });
      setStarsEarned(stars);
      setDeathMessage(randomDeathMessage());
      setPhase("dead");
      soundRef.current.play("gameover");
      persistEnd(scoreRef.current, bestComboRef.current, stars);
    };

    const finishWin = () => {
      const stars = computeStars({
        level,
        booksEaten: booksEatenRef.current,
        score: scoreRef.current,
        bestCombo: bestComboRef.current,
        completed: true,
      });
      setStarsEarned(stars);
      setPhase("celebrating");
      soundRef.current.play("complete");
      persistEnd(scoreRef.current, bestComboRef.current, stars);
      window.setTimeout(() => {
        if (phaseRef.current === "celebrating") setPhase("complete");
      }, 1400);
    };

    const step = () => {
      if (!alive || phaseRef.current !== "playing") return;

      const applied = resolvePendingDir(dirRef.current, pendingDir.current);
      pendingDir.current = null;
      dirRef.current = applied;
      setDir(applied);

      const body = snakeRef.current;
      const head = body[0];
      const nxt = nextHead(head, applied);
      const eating =
        bookRef.current !== null &&
        nxt.x === bookRef.current.x &&
        nxt.y === bookRef.current.y;

      const hit = detectCollision(
        nxt,
        body,
        level.grid,
        obstacleKeys,
        eating,
      );
      if (hit) {
        finishDeath();
        return;
      }

      const nextBody = eating
        ? [nxt, ...body]
        : [nxt, ...body.slice(0, -1)];
      snakeRef.current = nextBody;
      setSnake(nextBody);

      if (eating) {
        const now = Date.now();
        const comboNext = applyEatToCombo(
          comboRef.current.streak,
          comboRef.current.expiresAt,
          now,
          level.comboWindowMs,
        );
        const points = level.pointsPerBook * comboNext.multiplier;
        const nextScore = scoreRef.current + points;
        const nextBooks = booksEatenRef.current + 1;
        scoreRef.current = nextScore;
        booksEatenRef.current = nextBooks;
        setScore(nextScore);
        setBooksEaten(nextBooks);

        const comboState: ComboState = {
          streak: comboNext.streak,
          multiplier: comboNext.multiplier,
          expiresAt: comboNext.expiresAt,
          label: comboNext.justUnlockedLabel,
        };
        comboRef.current = comboState;
        setCombo(comboState);

        if (comboNext.streak > bestComboRef.current) {
          bestComboRef.current = comboNext.streak;
          setBestComboThisRun(comboNext.streak);
        }

        if (comboNext.justUnlockedLabel) {
          setComboFlash(
            `${comboNext.justUnlockedLabel}\n×${comboNext.multiplier}`,
          );
          soundRef.current.play("combo");
          window.setTimeout(() => setComboFlash(null), 900);
        } else {
          soundRef.current.play("eat");
        }

        const eatenBook = bookRef.current!;
        setEatPop({
          id: eatenBook.id,
          x: eatenBook.x,
          y: eatenBook.y,
          text: `+${points}`,
        });
        window.setTimeout(() => setEatPop(null), 420);

        // Speed tier feedback
        const tierIdx = level.speedTiers.reduce(
          (acc, t, i) => (nextBooks >= t.fromBooks ? i : acc),
          0,
        );
        if (tierIdx > lastSpeedTier.current) {
          lastSpeedTier.current = tierIdx;
          soundRef.current.play("speed");
        }

        if (nextBooks >= level.goalBooks) {
          setBook(null);
          bookRef.current = null;
          finishWin();
          return;
        }

        const nextBook = spawnBook({
          grid: level.grid,
          snake: nextBody,
          obstacles: level.obstacles,
          now,
        });
        bookRef.current = nextBook;
        setBook(nextBook);
      }

      timer = window.setTimeout(
        step,
        tickMsForBooks(booksEatenRef.current, level),
      );
    };

    timer = window.setTimeout(
      step,
      tickMsForBooks(booksEatenRef.current, level),
    );
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [phase, level, obstacleKeys, persistEnd]);

  return {
    level,
    phase,
    countdown,
    snake,
    dir,
    book,
    booksEaten,
    score,
    bestComboThisRun,
    combo,
    starsEarned,
    eatPop,
    deathMessage,
    progress,
    comboFlash,
    startLevel: beginCountdown,
    tryAgain: beginCountdown,
    queueDir,
    toggleMute,
    muted: progress.muted,
  };
}
