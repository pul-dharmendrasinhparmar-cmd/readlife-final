import { pointKey } from "../levels/types";
import type { Point } from "../types";
import { sameCell } from "./movement";

export type CollisionKind = "wall" | "obstacle" | "self" | null;

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
  // Tail will move unless growing — caller passes the cells that remain.
  return body.some((seg) => sameCell(seg, p));
}

export function detectCollision(
  next: Point,
  body: Point[],
  grid: number,
  obstacles: Set<string>,
  growing: boolean,
): CollisionKind {
  if (isOutOfBounds(next, grid)) return "wall";
  if (hitsObstacle(next, obstacles)) return "obstacle";
  const checkBody = growing ? body : body.slice(0, -1);
  if (hitsSelf(next, checkBody)) return "self";
  return null;
}
