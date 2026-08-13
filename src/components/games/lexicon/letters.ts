import type { Tile } from "./types";

/** Standard Scrabble letter point values. */
export const LETTER_VALUES: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
  "?": 0,
};

/** Classic Scrabble tile distribution (full counts). */
export const FULL_DISTRIBUTION: ReadonlyArray<readonly [string, number]> = [
  ["A", 9],
  ["B", 2],
  ["C", 2],
  ["D", 4],
  ["E", 12],
  ["F", 2],
  ["G", 3],
  ["H", 2],
  ["I", 9],
  ["J", 1],
  ["K", 1],
  ["L", 4],
  ["M", 2],
  ["N", 6],
  ["O", 8],
  ["P", 2],
  ["Q", 1],
  ["R", 6],
  ["S", 4],
  ["T", 6],
  ["U", 4],
  ["V", 2],
  ["W", 2],
  ["X", 1],
  ["Y", 2],
  ["Z", 1],
  ["?", 2],
];

let tileSeq = 0;

export function makeTile(letter: string): Tile {
  const upper = letter.toUpperCase();
  const isBlank = upper === "?";
  return {
    id: `t${++tileSeq}-${upper}-${Math.random().toString(36).slice(2, 7)}`,
    letter: upper,
    points: LETTER_VALUES[upper] ?? 0,
    isBlank,
  };
}

export function createBag(): Tile[] {
  const bag: Tile[] = [];
  for (const [letter, count] of FULL_DISTRIBUTION) {
    for (let i = 0; i < count; i++) bag.push(makeTile(letter));
  }
  return shuffle(bag);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawTiles(bag: Tile[], n: number): { drawn: Tile[]; bag: Tile[] } {
  const drawn = bag.slice(0, n);
  return { drawn, bag: bag.slice(n) };
}

export function refillRack(
  rack: Tile[],
  bag: Tile[],
  size = 7,
): { rack: Tile[]; bag: Tile[] } {
  const need = size - rack.length;
  if (need <= 0 || bag.length === 0) return { rack, bag };
  const { drawn, bag: next } = drawTiles(bag, need);
  return { rack: [...rack, ...drawn], bag: next };
}

/** Remaining letters still in the bag (for distribution UI). */
export function bagDistribution(bag: Tile[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const [letter] of FULL_DISTRIBUTION) counts[letter] = 0;
  for (const t of bag) {
    counts[t.letter] = (counts[t.letter] ?? 0) + 1;
  }
  return counts;
}

/** Pull specific letters out of the bag (for seeding an opener). */
export function takeLettersFromBag(
  bag: Tile[],
  word: string,
): { tiles: Tile[]; bag: Tile[] } | null {
  let remaining = [...bag];
  const tiles: Tile[] = [];
  for (const ch of word.toUpperCase()) {
    const idx = remaining.findIndex((t) => !t.isBlank && t.letter === ch);
    if (idx < 0) return null;
    tiles.push(remaining[idx]);
    remaining = [...remaining.slice(0, idx), ...remaining.slice(idx + 1)];
  }
  return { tiles, bag: remaining };
}
