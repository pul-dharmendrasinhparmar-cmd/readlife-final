import { BOARD_SIZE, CENTER } from "./board";
import {
  allocateTilesForWord,
  boardHasTiles,
  evaluatePlacement,
} from "./engine";
import { bookishBonusFor } from "./bookish-bonus";
import {
  getAiWordsByLength,
  isAiFriendlyWord,
  isDictReady,
} from "./word-dict";
import type { BoardCell, Direction, ScoredMove, Tile } from "./types";

function rackLetterMultiset(rack: Tile[]): {
  counts: Map<string, number>;
  blanks: number;
} {
  const counts = new Map<string, number>();
  let blanks = 0;
  for (const t of rack) {
    if (t.isBlank) blanks++;
    else counts.set(t.letter, (counts.get(t.letter) ?? 0) + 1);
  }
  return { counts, blanks };
}

function canForm(
  word: string,
  counts: Map<string, number>,
  blanks: number,
  boardLetters: Map<number, string>,
): boolean {
  const use = new Map(counts);
  let b = blanks;
  for (let i = 0; i < word.length; i++) {
    const onBoard = boardLetters.get(i);
    if (onBoard) {
      if (onBoard !== word[i]) return false;
      continue;
    }
    const ch = word[i];
    const n = use.get(ch) ?? 0;
    if (n > 0) use.set(ch, n - 1);
    else if (b > 0) b--;
    else return false;
  }
  let newCount = 0;
  for (let i = 0; i < word.length; i++) {
    if (!boardLetters.has(i)) newCount++;
  }
  return newCount > 0;
}

function boardPattern(
  board: BoardCell[][],
  row: number,
  col: number,
  dir: Direction,
  len: number,
): Map<number, string> | null {
  const dr = dir === "across" ? 0 : 1;
  const dc = dir === "across" ? 1 : 0;
  const endR = row + dr * (len - 1);
  const endC = col + dc * (len - 1);
  if (endR >= BOARD_SIZE || endC >= BOARD_SIZE || row < 0 || col < 0) {
    return null;
  }

  const pattern = new Map<number, string>();
  for (let i = 0; i < len; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    const L = board[r][c].letter;
    if (L) pattern.set(i, L);
  }
  return pattern;
}

function touchesOrFirst(
  board: BoardCell[][],
  row: number,
  col: number,
  dir: Direction,
  len: number,
  pattern: Map<number, string>,
): boolean {
  if (!boardHasTiles(board)) {
    const dr = dir === "across" ? 0 : 1;
    const dc = dir === "across" ? 1 : 0;
    for (let i = 0; i < len; i++) {
      if (row + dr * i === CENTER && col + dc * i === CENTER) return true;
    }
    return false;
  }
  if (pattern.size > 0) return true;
  const dr = dir === "across" ? 0 : 1;
  const dc = dir === "across" ? 1 : 0;
  const ortho: Array<[number, number]> = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  for (let i = 0; i < len; i++) {
    if (pattern.has(i)) continue;
    const r = row + dr * i;
    const c = col + dc * i;
    for (const [or, oc] of ortho) {
      const rr = r + or;
      const cc = c + oc;
      if (
        rr >= 0 &&
        rr < BOARD_SIZE &&
        cc >= 0 &&
        cc < BOARD_SIZE &&
        board[rr][cc].letter
      ) {
        return true;
      }
    }
  }
  return false;
}

/** Everyday 2-letter words the AI may still form as crosses. */
const COMMON_TWO = new Set([
  "AM",
  "AN",
  "AS",
  "AT",
  "BE",
  "BY",
  "DO",
  "GO",
  "HE",
  "HI",
  "IF",
  "IN",
  "IS",
  "IT",
  "ME",
  "MY",
  "NO",
  "OF",
  "OK",
  "ON",
  "OR",
  "OX",
  "SO",
  "TO",
  "UP",
  "US",
  "WE",
]);

/** Scrabble-legal stubs that look like gibberish to casual players — AI avoids these. */
const AI_AVOID = new Set([
  "AA",
  "AAH",
  "AAHS",
  "AAL",
  "AALS",
  "AAS",
  "AE",
  "AG",
  "AH",
  "AI",
  "AL",
  "AR",
  "AW",
  "AX",
  "BA",
  "BI",
  "BO",
  "DE",
  "ED",
  "EF",
  "EH",
  "EL",
  "EM",
  "EN",
  "ER",
  "ES",
  "ET",
  "EW",
  "EX",
  "FA",
  "FE",
  "FY",
  "GI",
  "HM",
  "HO",
  "ID",
  "JO",
  "KA",
  "KI",
  "LA",
  "LI",
  "LO",
  "MA",
  "MI",
  "MM",
  "MO",
  "MU",
  "NA",
  "NE",
  "NU",
  "OD",
  "OE",
  "OH",
  "OI",
  "OM",
  "OP",
  "OS",
  "OU",
  "OW",
  "OY",
  "PA",
  "PE",
  "PI",
  "PO",
  "QI",
  "RE",
  "SH",
  "SI",
  "TA",
  "TE",
  "TI",
  "UH",
  "UM",
  "UN",
  "UT",
  "WO",
  "XI",
  "XU",
  "YA",
  "YE",
  "YO",
  "ZA",
  "YIP",
  "YIPS",
  "YUP",
  "ZAP",
  "ZED",
  "ZEE",
  "ZOA",
]);

function isAwkwardAiWord(word: string): boolean {
  const w = word.toUpperCase();
  if (AI_AVOID.has(w)) return true;
  if (w.length === 2 && !COMMON_TWO.has(w)) return true;
  // Prefer everyday vocabulary — obscure Scrabble-only forms fail this.
  if (w.length >= 3 && !isAiFriendlyWord(w)) return true;
  return false;
}

function moveLooksNatural(move: ScoredMove): boolean {
  const words = move.wordsFormed?.length ? move.wordsFormed : [move.word];
  return words.every((w) => !isAwkwardAiWord(w));
}

function aiWordQuality(word: string): number {
  // Prefer natural-looking plays over tournament stubs.
  if (isAwkwardAiWord(word)) return -50;
  if (word.length <= 2) return -25;
  if (word.length === 3) return -6;
  if (bookishBonusFor(word)) return 20 + word.length;
  return word.length >= 5 ? word.length : word.length * 0.5;
}

function moveQuality(move: ScoredMove): number {
  const words = move.wordsFormed?.length ? move.wordsFormed : [move.word];
  const awkwardPenalty = words.reduce(
    (s, w) => s + (isAwkwardAiWord(w) ? -45 : 0),
    0,
  );
  return (
    move.score +
    aiWordQuality(move.word) +
    awkwardPenalty +
    (move.bookishBonus ?? 0) * 0.5 +
    (move.word.length >= 5 ? 8 : 0)
  );
}

/**
 * Find a strong legal move. Searches longer words first and prefers
 * bookish / natural-looking plays over short Scrabble stubs.
 */
export function findBestMove(
  board: BoardCell[][],
  rack: Tile[],
  opts?: { maxCandidates?: number; timeBudgetMs?: number },
): ScoredMove | null {
  if (!isDictReady()) return null;

  const maxCandidates = opts?.maxCandidates ?? 80;
  const budget = opts?.timeBudgetMs ?? 1400;
  const start = performance.now();
  const { counts, blanks } = rackLetterMultiset(rack);
  const first = !boardHasTiles(board);
  const maxLen = Math.min(15, rack.length + (first ? 0 : 10));
  const minLen = 3;

  const candidates: ScoredMove[] = [];
  const seen = new Set<string>();

  const tryPlace = (word: string, row: number, col: number, dir: Direction) => {
    if (performance.now() - start > budget && candidates.length > 0) return;
    if (AI_AVOID.has(word) && candidates.length >= 8) return;

    const pattern = boardPattern(board, row, col, dir, word.length);
    if (!pattern) return;
    if (!canForm(word, counts, blanks, pattern)) return;
    if (!touchesOrFirst(board, row, col, dir, word.length, pattern)) return;

    const needWord = word
      .split("")
      .filter((_, i) => !pattern.has(i))
      .join("");
    const alloc = allocateTilesForWord(needWord, rack);
    if (!alloc) return;

    const key = `${row},${col},${dir},${word}`;
    if (seen.has(key)) return;
    seen.add(key);

    const blankAssignMap: Record<string, string> = {};
    let bi = 0;
    for (const id of alloc.tileIds) {
      const t = rack.find((x) => x.id === id);
      if (t?.isBlank) {
        blankAssignMap[id] = alloc.blankAssignments[bi++] ?? "";
      }
    }

    const result = evaluatePlacement(
      board,
      rack,
      {
        row,
        col,
        direction: dir,
        word,
        tileIds: alloc.tileIds,
        blankAssignments: alloc.blankAssignments,
      },
      blankAssignMap,
    );
    if (!result.ok) return;
    // Never aim for obscure Scrabble-only forms (e.g. WAMEFOU) when friendlier plays exist.
    if (!moveLooksNatural(result.move)) {
      if (candidates.length >= 6) return;
      // Keep a few awkward fallbacks only if the rack is stuck.
      candidates.push(result.move);
      return;
    }
    candidates.push(result.move);
  };

  // Longer common/bookish words first.
  const lengths: number[] = [];
  for (let len = maxLen; len >= minLen; len--) lengths.push(len);

  if (first) {
    for (const len of lengths) {
      if (len > rack.length) continue;
      const words = getAiWordsByLength(len);
      for (const word of words) {
        if (!canForm(word, counts, blanks, new Map())) continue;
        for (const dir of ["across", "down"] as Direction[]) {
          for (let offset = 0; offset < word.length; offset++) {
            const row = dir === "across" ? CENTER : CENTER - offset;
            const col = dir === "across" ? CENTER - offset : CENTER;
            tryPlace(word, row, col, dir);
          }
        }
        if (candidates.length >= maxCandidates) break;
        if (performance.now() - start > budget && candidates.length > 0) break;
      }
      if (candidates.length >= maxCandidates) break;
      if (performance.now() - start > budget && candidates.length > 0) break;
    }
  } else {
    const anchors: Array<{ r: number; c: number; L: string }> = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const L = board[r][c].letter;
        if (L) anchors.push({ r, c, L });
      }
    }

    for (const len of lengths) {
      if (performance.now() - start > budget && candidates.length >= 8) break;
      const words = getAiWordsByLength(len);
      for (const word of words) {
        if (performance.now() - start > budget && candidates.length >= 8) break;
        if (AI_AVOID.has(word)) continue;
        for (const { r, c, L } of anchors) {
          if (!word.includes(L)) continue;
          for (let i = 0; i < word.length; i++) {
            if (word[i] !== L) continue;
            tryPlace(word, r, c - i, "across");
            tryPlace(word, r - i, c, "down");
          }
        }
        if (candidates.length >= maxCandidates) break;
      }
      if (candidates.length >= maxCandidates) break;
    }
  }

  // Last resort: shorter common words only (still no Scrabble gibberish)
  if (candidates.length === 0) {
    for (const len of [3, 2]) {
      const words = getAiWordsByLength(len);
      for (const word of words) {
        if (first) {
          if (!canForm(word, counts, blanks, new Map())) continue;
          for (const dir of ["across", "down"] as Direction[]) {
            for (let offset = 0; offset < word.length; offset++) {
              const row = dir === "across" ? CENTER : CENTER - offset;
              const col = dir === "across" ? CENTER - offset : CENTER;
              tryPlace(word, row, col, dir);
            }
          }
        } else {
          const anchors: Array<{ r: number; c: number; L: string }> = [];
          for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
              const L = board[r][c].letter;
              if (L) anchors.push({ r, c, L });
            }
          }
          for (const { r, c, L } of anchors) {
            if (!word.includes(L)) continue;
            for (let i = 0; i < word.length; i++) {
              if (word[i] !== L) continue;
              tryPlace(word, r, c - i, "across");
              tryPlace(word, r - i, c, "down");
            }
          }
        }
        if (candidates.length >= 20) break;
        if (performance.now() - start > budget && candidates.length > 0) break;
      }
      if (candidates.length > 0) break;
    }
  }

  if (candidates.length === 0) return null;

  const natural = candidates.filter(moveLooksNatural);
  const poolBase = natural.length > 0 ? natural : candidates;

  const ranked = [...poolBase].sort((a, b) => moveQuality(b) - moveQuality(a));

  const preferred = ranked.filter(
    (m) => m.word.length >= 4 && moveLooksNatural(m),
  );
  const pool = preferred.length > 0 ? preferred : ranked;

  if (pool.length > 1 && Math.random() < 0.15) return pool[1];
  return pool[0];
}
