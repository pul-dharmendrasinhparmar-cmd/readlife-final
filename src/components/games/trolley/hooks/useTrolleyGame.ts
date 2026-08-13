"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadGameProfile,
  recordQualifyingDay,
} from "@/components/games/hub/storage";
import {
  GAME_CONFIG,
  STORY_SPARKS,
  type Genre,
  type ThemeId,
  readerTypeFromCounts,
  booksForGenre,
} from "../gameConfig";
import {
  createEffects,
  isGood,
  resolveCatch,
  spawnIntervalMs,
  spawnItem,
  type FallingItem,
} from "../engine";
import { isMuted, setMuted, sfx } from "../sfx";
import {
  hasSeenTrolleyTutorial,
  markTrolleyTutorialSeen,
  recordTrolleyGame,
} from "../storage";
import type { TrolleyPhase } from "../types";

export type Phase = TrolleyPhase;

export type FloatMsg = { id: string; text: string; x: number; good: boolean };

export function useTrolleyGame() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [trolleyX, setTrolleyX] = useState(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState<number>(GAME_CONFIG.startingLives);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONFIG.roundSeconds);
  const [combo, setCombo] = useState(0);
  const [theme, setTheme] = useState<ThemeId>("default");
  const [boostGenre, setBoostGenre] = useState<Genre | null>(null);
  const [genreCounts, setGenreCounts] = useState<Partial<Record<Genre, number>>>(
    {},
  );
  const [collected, setCollected] = useState(0);
  const [mute, setMute] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [tiltSupported, setTiltSupported] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [floats, setFloats] = useState<FloatMsg[]>([]);
  const [celebrate, setCelebrate] = useState(false);

  const phaseRef = useRef(phase);
  const trolleyRef = useRef(trolleyX);
  const itemsRef = useRef(items);
  const effectsRef = useRef(createEffects());
  const lastSpawn = useRef(0);
  const lastCombo = useRef(0);
  const roundStart = useRef(0);
  const raf = useRef(0);
  const keys = useRef({ left: false, right: false });
  const dragging = useRef(false);
  const playfieldRef = useRef<HTMLDivElement | null>(null);
  const boostRef = useRef<Genre | null>(null);
  const livesRef = useRef(lives);
  const scoreRef = useRef(score);
  const recordedRef = useRef(false);
  const comboRef = useRef(combo);

  phaseRef.current = phase;
  trolleyRef.current = trolleyX;
  boostRef.current = boostGenre;
  livesRef.current = lives;
  scoreRef.current = score;
  comboRef.current = combo;

  useEffect(() => {
    setMute(isMuted());
    if (!hasSeenTrolleyTutorial()) setPhase("tutorial");
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1400);
  }, []);

  const addFloat = useCallback((text: string, x: number, good: boolean) => {
    const id = Math.random().toString(36).slice(2);
    setFloats((f) => [...f, { id, text, x, good }]);
    window.setTimeout(() => {
      setFloats((f) => f.filter((m) => m.id !== id));
    }, 900);
  }, []);

  const themeRef = useRef(theme);
  themeRef.current = theme;

  const enterStoryWorld = useCallback(
    (sparkId: string, floatX = 50) => {
      const spark = STORY_SPARKS.find((s) => s.id === sparkId) ?? STORY_SPARKS[0];
      if (themeRef.current === spark.theme) {
        showToast(`Still in ${spark.placeName}`);
        return;
      }
      sfx.spark();
      setTheme(spark.theme);
      setBoostGenre(spark.boostGenre);
      boostRef.current = spark.boostGenre;
      setScore((s) => s + spark.bonusScore);
      addFloat(`+${spark.bonusScore}`, floatX, true);
      showToast(spark.enterLine);
    },
    [addFloat, showToast],
  );
  const enterWorldRef = useRef(enterStoryWorld);
  enterWorldRef.current = enterStoryWorld;

  function finishTutorial() {
    markTrolleyTutorialSeen();
    setPhase("ready");
  }

  function startRound() {
    setItems([]);
    setScore(0);
    setLives(GAME_CONFIG.startingLives);
    setTimeLeft(GAME_CONFIG.roundSeconds);
    setCombo(0);
    setGenreCounts({});
    setCollected(0);
    setTheme("default");
    setBoostGenre(null);
    boostRef.current = null;
    effectsRef.current = createEffects();
    itemsRef.current = [];
    lastSpawn.current = 0;
    lastCombo.current = 0;
    recordedRef.current = false;
    roundStart.current = performance.now();
    setTrolleyX(50);
    setPhase("playing");
    phaseRef.current = "playing";
  }

  function toggleMute() {
    const next = !mute;
    setMute(next);
    setMuted(next);
  }

  function togglePause() {
    if (phase === "playing") {
      setPhase("paused");
      phaseRef.current = "paused";
    } else if (phase === "paused") {
      setPhase("playing");
      phaseRef.current = "playing";
      roundStart.current =
        performance.now() - (GAME_CONFIG.roundSeconds - timeLeft) * 1000;
    }
  }

  async function enableTilt() {
    setTiltSupported(true);
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<PermissionState>;
    };
    try {
      if (typeof DOE.requestPermission === "function") {
        const state = await DOE.requestPermission();
        if (state !== "granted") {
          showToast("Tilt permission was not granted");
          return;
        }
      }
      setTiltEnabled(true);
      showToast("Tilt controls on");
    } catch {
      showToast("Tilt not available on this device");
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
        keys.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
        keys.current.right = true;
      if (e.key === "p" || e.key === "P") togglePause();
      if (e.key === "m" || e.key === "M") toggleMute();
      if ((e.key === " " || e.key === "Enter") && phaseRef.current === "ready")
        startRound();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
        keys.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
        keys.current.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [mute, phase, timeLeft]);

  useEffect(() => {
    if (!tiltEnabled) return;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (phaseRef.current !== "playing") return;
      const gamma = e.gamma ?? 0;
      const mapped = 50 + (gamma / 35) * 50;
      setTrolleyX(Math.max(8, Math.min(92, mapped)));
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, [tiltEnabled]);

  const moveToClientX = useCallback((clientX: number) => {
    const el = playfieldRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setTrolleyX(Math.max(8, Math.min(92, pct)));
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;

    let last = performance.now();
    let running = true;
    let lastTimePaint = 0;

    const frame = (now: number) => {
      if (!running || phaseRef.current !== "playing") return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const elapsed = (now - roundStart.current) / 1000;
      const left = Math.max(0, GAME_CONFIG.roundSeconds - elapsed);
      if (now - lastTimePaint > 200) {
        lastTimePaint = now;
        setTimeLeft(left);
      }
      if (left <= 0 || livesRef.current <= 0) {
        setTimeLeft(0);
        sfx.gameOver();
        setPhase("results");
        phaseRef.current = "results";
        return;
      }

      const ratio = 1 - left / GAME_CONFIG.roundSeconds;
      const effects = effectsRef.current;
      const slow = now < effects.slowUntil ? GAME_CONFIG.glassesSlowFactor : 1;

      if (!tiltEnabled && !dragging.current) {
        let x = trolleyRef.current;
        if (keys.current.left) x -= GAME_CONFIG.trolleyMoveSpeed * dt;
        if (keys.current.right) x += GAME_CONFIG.trolleyMoveSpeed * dt;
        x = Math.max(8, Math.min(92, x));
        if (x !== trolleyRef.current) setTrolleyX(x);
      }

      if (now - lastSpawn.current > spawnIntervalMs(ratio)) {
        lastSpawn.current = now;
        itemsRef.current = [
          ...itemsRef.current,
          spawnItem(now, ratio, boostRef.current),
        ];
      }

      const catchY = GAME_CONFIG.catchYPct;
      const catchBand = GAME_CONFIG.catchBandPct;
      const tx = trolleyRef.current;
      const goodHalf =
        GAME_CONFIG.trolleyWidthPct / 2 + GAME_CONFIG.catchPadPct / 2;
      const badHalf =
        (GAME_CONFIG.trolleyWidthPct * GAME_CONFIG.hazardWidthFactor) / 2 +
        GAME_CONFIG.hazardCatchPadPct / 2;

      const next: FallingItem[] = [];
      for (const item of itemsRef.current) {
        const y = item.y + ((item.speed * slow) / 7.5) * dt;
        if (y >= catchY && y <= catchY + catchBand) {
          const metaGood = isGood(item.kind);
          const half = metaGood ? goodHalf : badHalf;
          if (Math.abs(item.x - tx) <= half) {
            const result = resolveCatch(item, now, effects);
            if (result.points > 0 || result.lifeDelta > 0) {
              if (result.points >= 50 || result.enterSparkId) sfx.catchRare();
              else sfx.catchGood();
              setCelebrate(true);
              window.setTimeout(() => setCelebrate(false), 420);
            } else if (result.lifeDelta < 0) {
              sfx.catchBad();
            }

            if (result.points !== 0) {
              const withinCombo =
                now - lastCombo.current < GAME_CONFIG.comboWindowMs;
              lastCombo.current = now;
              setCombo((c) => (withinCombo ? Math.min(c + 1, 8) : 1));
              const comboBonus = withinCombo
                ? Math.min(comboRef.current + 1, 5) * 2
                : 0;
              const gained =
                result.points + (result.points > 0 ? comboBonus : 0);
              setScore((s) => Math.max(0, s + gained));
              addFloat(
                gained >= 0 ? `+${gained}` : `${gained}`,
                item.x,
                gained >= 0,
              );
            } else {
              addFloat(result.message, item.x, result.lifeDelta >= 0);
              setCombo(0);
            }

            if (result.lifeDelta !== 0) {
              setLives((l) => Math.max(0, Math.min(5, l + result.lifeDelta)));
            }
            if (result.grantMultiplier) {
              effects.multiplierUntil = now + GAME_CONFIG.bookmarkMultiplierMs;
              showToast("Bookmark boost: 2× points");
            } else if (result.grantSlow) {
              effects.slowUntil = now + GAME_CONFIG.glassesSlowMs;
              showToast("Glasses on — slow rain!");
            } else if (result.enterSparkId) {
              enterWorldRef.current(result.enterSparkId, item.x);
            } else if (result.lifeDelta < 0) {
              showToast(result.message);
            }
            if (result.genre) {
              setCollected((n) => n + 1);
              setGenreCounts((g) => ({
                ...g,
                [result.genre!]: (g[result.genre!] ?? 0) + 1,
              }));
            }
            continue;
          }
        }
        if (y < 110) next.push({ ...item, y });
      }
      itemsRef.current = next;
      setItems(next);

      raf.current = requestAnimationFrame(frame);
    };

    raf.current = requestAnimationFrame(frame);
    return () => {
      running = false;
      cancelAnimationFrame(raf.current);
    };
  }, [phase, tiltEnabled, addFloat, showToast]);

  const reader = readerTypeFromCounts(genreCounts);
  const recommended =
    booksForGenre(reader.genre)[0] ?? booksForGenre("adventure")[0];
  const earnedReward = score >= GAME_CONFIG.rewardScoreThreshold;

  useEffect(() => {
    if (phase !== "results" || recordedRef.current) return;
    recordedRef.current = true;
    recordTrolleyGame({
      score: scoreRef.current,
      collected,
      readerType: reader.title,
    });
    try {
      recordQualifyingDay(loadGameProfile());
    } catch {
      /* ignore */
    }
  }, [phase, collected, reader.title]);

  return {
    phase,
    trolleyX,
    items,
    score,
    lives,
    timeLeft,
    combo,
    theme,
    toast,
    floats,
    celebrate,
    mute,
    tiltEnabled,
    tiltSupported,
    collected,
    genreCounts,
    reader,
    recommended,
    earnedReward,
    playfieldRef,
    finishTutorial,
    startRound,
    toggleMute,
    togglePause,
    enableTilt,
    moveToClientX,
    setDragging: (v: boolean) => {
      dragging.current = v;
    },
  };
}
