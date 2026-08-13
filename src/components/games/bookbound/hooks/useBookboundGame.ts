"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadGameProfile,
  recordQualifyingDay,
  saveGameProfile,
} from "@/components/games/hub/storage";
import { createWorld, idleInput, stepWorld, VIEW_H, VIEW_W } from "../engine";
import { getLevel } from "../levels";
import { renderWorld } from "../render";
import { setMuted, sfx } from "../sfx";
import { ALL_SPRITE_URLS, loadImages } from "../sprites";
import {
  applyBookboundAchievements,
  hasSeenBookboundIntro,
  loadBookboundMute,
  loadBookboundStats,
  markBookboundIntroSeen,
  recordBookboundSession,
  saveBookboundMute,
} from "../storage";
import type {
  BookboundInput,
  BookboundPhase,
  BookboundStats,
  ChapterId,
  RunStats,
  WorldState,
} from "../types";

function fitHiDpiCanvas(canvas: HTMLCanvasElement) {
  const parent = canvas.parentElement;
  if (!parent) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { width: availW, height: availH } = parent.getBoundingClientRect();
  if (availW < 2 || availH < 2) return;
  const fit = Math.min(availW / VIEW_W, availH / VIEW_H);
  const cssW = Math.max(1, Math.round(VIEW_W * fit));
  const cssH = Math.max(1, Math.round(VIEW_H * fit));
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  const bw = Math.max(1, Math.round(cssW * dpr));
  const bh = Math.max(1, Math.round(cssH * dpr));
  if (canvas.width !== bw) canvas.width = bw;
  if (canvas.height !== bh) canvas.height = bh;
}

function emptyRun(): RunStats {
  return {
    score: 0,
    pages: 0,
    golden: 0,
    enemiesDefeated: 0,
    heartsLeft: 3,
    ogres: 0,
    witches: 0,
    dragons: 0,
    elapsed: 0,
  };
}

export function useBookboundGame() {
  const [phase, setPhase] = useState<BookboundPhase>(() =>
    typeof window !== "undefined" && hasSeenBookboundIntro()
      ? "levelSelect"
      : "story",
  );
  const [chapter, setChapter] = useState<ChapterId>(1);
  const [stats, setStats] = useState<BookboundStats>(loadBookboundStats);
  const [hud, setHud] = useState({ hearts: 3, score: 0, pages: 0, golden: 0 });
  const [lastRun, setLastRun] = useState<RunStats>(emptyRun);
  const [mute, setMute] = useState(loadBookboundMute);
  const [ready, setReady] = useState(false);
  const [storyPage, setStoryPage] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<WorldState | null>(null);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const inputRef = useRef<BookboundInput>(idleInput());
  const phaseRef = useRef(phase);
  const recordedRef = useRef(false);
  const qualifiedRef = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    setMuted(mute);
    let cancelled = false;
    loadImages(ALL_SPRITE_URLS)
      .then((map) => {
        if (cancelled) return;
        imagesRef.current = map;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
    // Initial asset load + apply stored mute. Mute changes go through toggleMute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const world = worldRef.current;
    if (!canvas || !world) return;
    fitHiDpiCanvas(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = canvas.width / VIEW_W;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    renderWorld(ctx, world, imagesRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ro = new ResizeObserver(() => paint());
    ro.observe(parent);
    paint();
    return () => ro.disconnect();
  }, [ready, paint]);

  const finishRun = useCallback(
    (completed: boolean, world: WorldState) => {
      if (recordedRef.current) return;
      recordedRef.current = true;
      const run = { ...world.run, heartsLeft: world.player.hearts };
      setLastRun(run);
      const qualify = completed || run.elapsed >= 60 || qualifiedRef.current;
      const next = recordBookboundSession({
        chapter,
        completed,
        run,
      });
      setStats(next);
      try {
        let profile = loadGameProfile();
        profile = applyBookboundAchievements(
          { ...profile, bookbound: next, hasPlayedAny: true },
          next,
        );
        if (qualify) recordQualifyingDay(profile);
        else saveGameProfile(profile);
      } catch {
        /* ignore */
      }
      if (completed && chapter === 3) setPhase("gameComplete");
      else if (completed) setPhase("levelComplete");
      else setPhase("gameOver");
    },
    [chapter],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    let last = performance.now();
    let running = true;
    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const world = worldRef.current;
      if (world && phaseRef.current === "playing") {
        const events = stepWorld(world, inputRef.current, dt);
        inputRef.current.jumpPressed = false;
        inputRef.current.attackPressed = false;
        for (const ev of events) {
          if (ev === "jump") sfx.jump();
          else if (ev === "page") sfx.page();
          else if (ev === "golden") sfx.golden();
          else if (ev === "ink") sfx.ink();
          else if (ev === "defeat" || ev === "stomp") sfx.defeat();
          else if (ev === "dragon") sfx.dragon();
          else if (ev === "hurt") sfx.hurt();
          else if (ev === "checkpoint") sfx.checkpoint();
          else if (ev === "complete") sfx.complete();
        }
        setHud((h) => {
          const hearts = world.player.hearts;
          const score = world.run.score;
          const pages = world.run.pages;
          const golden = world.run.golden;
          if (
            h.hearts === hearts &&
            h.score === score &&
            h.pages === pages &&
            h.golden === golden
          ) {
            return h;
          }
          return { hearts, score, pages, golden };
        });
        if (!qualifiedRef.current && world.run.elapsed >= 60) {
          qualifiedRef.current = true;
          try {
            recordQualifyingDay(loadGameProfile());
          } catch {
            /* ignore */
          }
        }
        paint();
        if (world.outcome === "complete") finishRun(true, world);
        else if (world.outcome === "dead") finishRun(false, world);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [phase, finishRun, paint]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const playing = phaseRef.current === "playing";
      if (k === "escape") {
        e.preventDefault();
        if (playing) setPhase("paused");
        else if (phaseRef.current === "paused") setPhase("playing");
        return;
      }
      if (!playing) return;
      if (["arrowleft", "arrowright", "arrowup", " ", "w", "a", "d", "f", "x"].includes(k)) {
        e.preventDefault();
      }
      if (k === "a" || k === "arrowleft") inputRef.current.left = true;
      if (k === "d" || k === "arrowright") inputRef.current.right = true;
      if (k === " " || k === "w" || k === "arrowup") {
        if (!inputRef.current.jump) inputRef.current.jumpPressed = true;
        inputRef.current.jump = true;
      }
      if (k === "f" || k === "x") {
        if (!inputRef.current.attack) inputRef.current.attackPressed = true;
        inputRef.current.attack = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "a" || k === "arrowleft") inputRef.current.left = false;
      if (k === "d" || k === "arrowright") inputRef.current.right = false;
      if (k === " " || k === "w" || k === "arrowup") inputRef.current.jump = false;
      if (k === "f" || k === "x") inputRef.current.attack = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const startChapter = useCallback(
    (id: ChapterId) => {
      setChapter(id);
      recordedRef.current = false;
      qualifiedRef.current = false;
      inputRef.current = idleInput();
      worldRef.current = createWorld(getLevel(id));
      setHud({ hearts: 3, score: 0, pages: 0, golden: 0 });
      setPhase("levelIntro");
      requestAnimationFrame(paint);
    },
    [paint],
  );

  const beginPlay = useCallback(() => {
    setPhase("playing");
  }, []);

  const retry = useCallback(() => {
    startChapter(chapter);
  }, [chapter, startChapter]);

  const nextChapter = useCallback(() => {
    const n = Math.min(3, chapter + 1) as ChapterId;
    startChapter(n);
  }, [chapter, startChapter]);

  const finishStory = useCallback(() => {
    markBookboundIntroSeen();
    setPhase("title");
  }, []);

  const toggleMute = useCallback(() => {
    setMute((m) => {
      const next = !m;
      setMuted(next);
      saveBookboundMute(next);
      return next;
    });
  }, []);

  const hold = useCallback((key: keyof BookboundInput, down: boolean) => {
    if (key === "jump") {
      if (down && !inputRef.current.jump) inputRef.current.jumpPressed = true;
      inputRef.current.jump = down;
    } else if (key === "attack") {
      if (down && !inputRef.current.attack) inputRef.current.attackPressed = true;
      inputRef.current.attack = down;
    } else if (key === "left" || key === "right") {
      inputRef.current[key] = down;
    }
  }, []);

  return {
    phase,
    setPhase,
    chapter,
    stats,
    hud,
    lastRun,
    mute,
    ready,
    storyPage,
    setStoryPage,
    canvasRef,
    startChapter,
    beginPlay,
    retry,
    nextChapter,
    finishStory,
    toggleMute,
    hold,
    goSelect: () => setPhase("levelSelect"),
    replayStory: () => {
      setStoryPage(0);
      setPhase("story");
    },
  };
}
