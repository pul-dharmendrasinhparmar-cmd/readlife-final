import { pointKey } from "../levels/types";
import type { Point } from "../types";
import { sameCell } from "./movement";

export type CollisionKind = "wall" | "obstacle" | "self" | null;

/** True when head would leave the playable grid [0..grid-1]. No wrapping. */
export function isOutOfBounds(p: Point, grid: number): boolean {
  return p.x < 0 || p.y < 0 || p.x >= grid || p.y >= grid;
}

export function hitsObstacle(
  p: Point,
  obstacles: Set<string>,
): boolean {
  return obstacles.has(pointKey(p));
}

export function hitsSelf(p: Point, body: Point[]): boolean {
  return body.some((seg) => sameCell(seg, p));
}

/**
 * Classic Snake collision against the cell the head is moving into.
 * When not growing, the tip vacates that frame — exclude it from self-checks
 * so sliding into the departing tail is allowed.
 */
export function detectCollision(
  next: Point,
  body: Point[],
  grid: number,
  obstacles: Set<string>,
  growing: boolean,
): CollisionKind {
  if (isOutOfBounds(next, grid)) return "wall";
  if (obstacles.size > 0 && hitsObstacle(next, obstacles)) return "obstacle";

  // Body is head-first. Tip is last. Tip stays only when growing.
  const solidBody = growing || body.length <= 1 ? body : body.slice(0, -1);
  if (hitsSelf(next, solidBody)) return "self";
  return null;
}
