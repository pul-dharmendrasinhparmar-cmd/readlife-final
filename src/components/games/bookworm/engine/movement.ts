import type { Dir, Point } from "../types";

export const DIR_DELTA: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const OPPOSITE: Record<Dir, Dir> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function sameCell(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

export function nextHead(head: Point, dir: Dir): Point {
  const d = DIR_DELTA[dir];
  return { x: head.x + d.x, y: head.y + d.y };
}

/** Ignore 180° reverse into the body. */
export function canTurn(current: Dir, next: Dir): boolean {
  return OPPOSITE[current] !== next;
}

export function resolvePendingDir(
  current: Dir,
  pending: Dir | null,
): Dir {
  if (!pending) return current;
  return canTurn(current, pending) ? pending : current;
}
