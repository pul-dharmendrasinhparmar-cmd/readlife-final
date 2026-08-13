"use client";

import { useCallback, useRef, type PointerEvent, type TouchEvent } from "react";
import type { Dir } from "../types";

const MIN_SWIPE = 24;

export function useSwipeControls(
  onSwipe: (dir: Dir) => void,
  enabled: boolean,
) {
  const start = useRef<{ x: number; y: number; pointerId: number | null } | null>(
    null,
  );

  const finish = useCallback(
    (x: number, y: number) => {
      if (!enabled || !start.current) return;
      const dx = x - start.current.x;
      const dy = y - start.current.y;
      start.current = null;
      if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        onSwipe(dx > 0 ? "right" : "left");
      } else {
        onSwipe(dy > 0 ? "down" : "up");
      }
    },
    [enabled, onSwipe],
  );

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      if (!enabled || e.button !== 0) return;
      // Prefer pointer path; ignore secondary touch duplicates / pinch.
      if (e.pointerType === "touch") {
        e.preventDefault();
      }
      if (start.current && start.current.pointerId !== e.pointerId) {
        // Second finger — abort swipe so the browser doesn't treat it as zoom.
        start.current = null;
        return;
      }
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      start.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!enabled || !start.current || start.current.pointerId !== e.pointerId) {
        return;
      }
      if (e.pointerType === "touch") e.preventDefault();
    },
    [enabled],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      if (!enabled || !start.current || start.current.pointerId !== e.pointerId) {
        return;
      }
      finish(e.clientX, e.clientY);
    },
    [enabled, finish],
  );

  const onPointerCancel = useCallback(() => {
    start.current = null;
  }, []);

  // Fallback for environments where pointer events are flaky
  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || start.current) return;
      const t = e.touches[0];
      if (!t) return;
      start.current = { x: t.clientX, y: t.clientY, pointerId: null };
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !start.current || start.current.pointerId !== null) return;
      const t = e.changedTouches[0];
      if (!t) return;
      finish(t.clientX, t.clientY);
    },
    [enabled, finish],
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onTouchStart,
    onTouchEnd,
  };
}
