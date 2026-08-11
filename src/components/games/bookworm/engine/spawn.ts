import { pointKey } from "../levels/types";
import type { BookFood, BookVariant, Point } from "../types";
import { sameCell } from "./movement";

const VARIANTS: BookVariant[] = [
  "hardcover",
  "paperback",
  "folio",
  "novella",
];

/** Muted ReadLife-friendly hues */
const HUES = [18, 28, 38, 145, 155, 200, 220, 340, 350];

function neighbors(p: Point, grid: number): Point[] {
  const out: Point[] = [];
  const deltas = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  for (const d of deltas) {
    const n = { x: p.x + d.x, y: p.y + d.y };
    if (n.x >= 0 && n.y >= 0 && n.x < grid && n.y < grid) out.push(n);
  }
  return out;
}

/** Flood-fill reachable empty cells from snake head. */
export function reachableEmptyCells(
  grid: number,
  start: Point,
  blocked: Set<string>,
): Point[] {
  const seen = new Set<string>();
  const queue: Point[] = [start];
  const free: Point[] = [];
  seen.add(pointKey(start));

  while (queue.length) {
    const cur = queue.shift()!;
    for (const n of neighbors(cur, grid)) {
      const k = pointKey(n);
      if (seen.has(k) || blocked.has(k)) continue;
      seen.add(k);
      free.push(n);
      queue.push(n);
    }
  }
  return free;
}

let bookSeq = 1;

export function spawnBook(args: {
  grid: number;
  snake: Point[];
  obstacles: Point[];
  now?: number;
}): BookFood {
  const blocked = new Set<string>([
    ...args.obstacles.map(pointKey),
    ...args.snake.map(pointKey),
  ]);
  const head = args.snake[0];
  let candidates = reachableEmptyCells(args.grid, head, blocked);

  // Fallback: any empty cell if flood-fill somehow fails
  if (candidates.length === 0) {
    for (let y = 0; y < args.grid; y += 1) {
      for (let x = 0; x < args.grid; x += 1) {
        const p = { x, y };
        if (!blocked.has(pointKey(p))) candidates.push(p);
      }
    }
  }

  // Prefer not spawning adjacent to head (gives a beat to react)
  const nonAdjacent = candidates.filter(
    (c) =>
      Math.abs(c.x - head.x) + Math.abs(c.y - head.y) > 1,
  );
  const pool = nonAdjacent.length > 0 ? nonAdjacent : candidates;
  const cell =
    pool[Math.floor(Math.random() * pool.length)] ?? { x: 0, y: 0 };

  return {
    ...cell,
    id: bookSeq++,
    variant: VARIANTS[Math.floor(Math.random() * VARIANTS.length)],
    hue: HUES[Math.floor(Math.random() * HUES.length)],
    bornAt: args.now ?? Date.now(),
  };
}

export function isEatingBook(head: Point, book: BookFood | null): boolean {
  return book !== null && sameCell(head, book);
}
