"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  loadGameProfile,
  recordQualifyingDay,
} from "@/components/games/hub/storage";
import { allPiecesCovers, getDailyCover } from "../covers";
import { PIECE_COUNT, PIECES, PUZZLE_WIDTH } from "../piece-meta";
import { recordPiecesGame } from "../storage";
import type { PieceDrag, PiecesCover, PiecesPhase } from "../types";

const SNAP_PX = 36;

export function usePiecesGame() {
  const daily = useMemo(() => getDailyCover(), []);
  const covers = useMemo(() => allPiecesCovers(), []);
  const [phase, setPhase] = useState<PiecesPhase>("intro");
  const [selected, setSelected] = useState<PiecesCover>(daily);
  const [coverUrl, setCoverUrl] = useState(daily.image);
  const [placed, setPlaced] = useState<Set<number>>(() => new Set());
  const [drag, setDrag] = useState<PieceDrag | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [boardW, setBoardW] = useState(300);
  const [trayOrder, setTrayOrder] = useState<number[]>(() =>
    PIECES.map((p) => p.id),
  );
  const startedAt = useRef<number | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const recorded = useRef(false);
  const dragRef = useRef<PieceDrag | null>(null);
  dragRef.current = drag;

  const scale = boardW / PUZZLE_WIDTH;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  useEffect(() => {
    const el = boardRef.current;
    if (!el || phase === "intro") return;
    const measure = () => setBoardW(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (startedAt.current == null) startedAt.current = performance.now();
    const id = window.setInterval(() => {
      if (startedAt.current == null) return;
      setElapsedMs(performance.now() - startedAt.current);
    }, 200);
    return () => window.clearInterval(id);
  }, [phase]);

  const finish = useCallback((timeMs: number) => {
    if (recorded.current) return;
    recorded.current = true;
    recordPiecesGame({ timeMs, completed: true });
    try {
      recordQualifyingDay(loadGameProfile());
    } catch {
      /* ignore */
    }
    setElapsedMs(timeMs);
    setPhase("complete");
  }, []);

  const placedCount = placed.size;

  useEffect(() => {
    if (phase !== "playing" || placedCount < PIECE_COUNT) return;
    const timeMs =
      startedAt.current != null
        ? performance.now() - startedAt.current
        : elapsedMs;
    finish(timeMs);
  }, [phase, placedCount, elapsedMs, finish]);

  const start = useCallback(() => {
    recorded.current = false;
    startedAt.current = null;
    setElapsedMs(0);
    setPlaced(new Set());
    setDrag(null);
    const ids = PIECES.map((p) => p.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setTrayOrder(ids);
    setPhase("playing");
  }, []);

  const onCoverError = useCallback(() => {
    setCoverUrl((prev) =>
      prev === selected.fallbackImage ? prev : selected.fallbackImage,
    );
  }, [selected.fallbackImage]);

  const selectCover = useCallback((cover: PiecesCover) => {
    setSelected(cover);
    setCoverUrl(cover.image);
  }, []);

  const goIntro = useCallback(() => {
    setDrag(null);
    setPlaced(new Set());
    setPhase("intro");
  }, []);

  const beginDrag = useCallback(
    (id: number, event: ReactPointerEvent<HTMLElement>) => {
      if (placed.has(id) || phase !== "playing") return;
      event.preventDefault();
      const piece = PIECES.find((p) => p.id === id);
      if (!piece) return;
      const thumb = event.currentTarget.getBoundingClientRect();
      const s = scaleRef.current;
      const relX =
        thumb.width > 0 ? (event.clientX - thumb.left) / thumb.width : 0.5;
      const relY =
        thumb.height > 0 ? (event.clientY - thumb.top) / thumb.height : 0.5;
      const grabX = relX * piece.bbox.w * s;
      const grabY = relY * piece.bbox.h * s;
      const next: PieceDrag = {
        id,
        pointerId: event.pointerId,
        grabX,
        grabY,
        x: event.clientX - grabX,
        y: event.clientY - grabY,
      };
      dragRef.current = next;
      setDrag(next);
    },
    [placed, phase],
  );

  useEffect(() => {
    if (phase !== "playing") return;

    const onMove = (event: PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;
      setDrag({
        ...current,
        x: event.clientX - current.grabX,
        y: event.clientY - current.grabY,
      });
    };

    const onUp = () => {
      const current = dragRef.current;
      if (!current) return;
      const board = boardRef.current;
      const s = scaleRef.current;
      if (board) {
        const piece = PIECES.find((p) => p.id === current.id);
        if (piece) {
          const rect = board.getBoundingClientRect();
          const targetX = rect.left + piece.bbox.x * s;
          const targetY = rect.top + piece.bbox.y * s;
          if (Math.hypot(current.x - targetX, current.y - targetY) <= SNAP_PX) {
            setPlaced((prev) => new Set(prev).add(current.id));
          }
        }
      }
      setDrag(null);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("mouseup", onUp);
    };
  }, [phase]);

  const trayPieces = useMemo(
    () =>
      trayOrder
        .map((id) => PIECES.find((p) => p.id === id)!)
        .filter((p) => !placed.has(p.id)),
    [placed, trayOrder],
  );

  return {
    phase,
    daily,
    covers,
    selected,
    coverUrl,
    onCoverError,
    placed,
    drag,
    elapsedMs,
    boardRef,
    boardW,
    scale,
    placedCount,
    trayPieces,
    start,
    selectCover,
    goIntro,
    beginDrag,
  };
}
