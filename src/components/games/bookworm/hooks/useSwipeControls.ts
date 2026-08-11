"use client";

import { useCallback, useRef, type TouchEvent } from "react";
import type { Dir } from "../types";

const MIN_SWIPE = 28;

export function useSwipeControls(
  onSwipe: (dir: Dir) => void,
  enabled: boolean,
) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !start.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
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

  return { onTouchStart, onTouchEnd };
}
