import { BINGO_BONUS, BOARD_SIZE, CENTER, premiumAt } from "./board";
import { totalBookishBonus } from "./bookish-bonus";
import { LETTER_VALUES } from "./letters";
import { isEnglishWord } from "./word-dict";
import type {
  BoardCell,
  Direction,
  Placement,
  ScoredMove,
  Tile,
} from "./types";

export function emptyBoard(): BoardCell[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ letter: null })),
  );
}

export function boardHasTiles(board: BoardCell[][]): boolean {
  return board.some((row) => row.some((c) => c.letter));
}

function inBounds(r: number, c: number) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

function step(dir: Direction): [number, number] {
  return dir === "across" ? [0, 1] : [1, 0];
}

/** Expand a contiguous word through (row,col) along direction. */
export function readWordAt(
  board: BoardCell[][],
  row: number,
  col: number,
  dir: Direction,
): { word: string; startRow: number; startCol: number } | null {
  if (!board[row][col].letter) return null;
  const [dr, dc] = step(dir);
  let r = row;
  let c = col;
  while (inBounds(r - dr, c - dc) && board[r - dr][c - dc].letter) {
    r -= dr;
    c -= dc;
  }
  let word = "";
  let rr = r;
  let cc = c;
  while (inBounds(rr, cc) && board[rr][cc].letter) {
    word += board[rr][cc].letter!;
    rr += dr;
    cc += dc;
  }
  if (word.length < 2) return null;
  return { word, startRow: r, startCol: c };
}

/**
 * Validate a placement and return score + words formed.
 * `assigned` maps blank tile id → letter A-Z.
 */
export function evaluatePlacement(
  board: BoardCell[][],
  rack: Tile[],
  placement: Placement,
  assigned: Record<string, string> = {},
): { ok: true; move: ScoredMove; tilesUsed: Tile[] } | { ok: false; error: string } {
  const { row, col, direction, word, tileIds } = placement;
  const W = word.toUpperCase();
  if (W.length < 2) return { ok: false, error: "Words need at least 2 letters." };
  if (!/^[A-Z]+$/.test(W)) return { ok: false, error: "Letters only." };

  const [dr, dc] = step(direction);
  if (!inBounds(row, col) || !inBounds(row + dr * (W.length - 1), col + dc * (W.length - 1))) {
    return { ok: false, error: "That word runs off the board." };
  }

  const rackById = new Map(rack.map((t) => [t.id, t]));
  const usedIds: string[] = [];
  let tilePtr = 0;
  let coversCenter = false;
  let touchesExisting = false;
  const newCells: Array<{ r: number; c: number; letter: string; tile: Tile }> = [];

  for (let i = 0; i < W.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    const existing = board[r][c].letter;
    const want = W[i];
    if (r === CENTER && c === CENTER) coversCenter = true;

    if (existing) {
      if (existing !== want) {
        return { ok: false, error: "Conflicts with a letter already on the board." };
      }
      touchesExisting = true;
      continue;
    }

    if (tilePtr >= tileIds.length) {
      return { ok: false, error: "Not enough tiles selected." };
    }
    const tid = tileIds[tilePtr++];
    const tile = rackById.get(tid);
    if (!tile || usedIds.includes(tid)) {
      return { ok: false, error: "Invalid tile selection." };
    }
    usedIds.push(tid);

    if (tile.isBlank) {
      const fromMap = assigned[tid]?.toUpperCase();
      const blankOrder = usedIds.filter((id) => rackById.get(id)?.isBlank);
      const bi = blankOrder.indexOf(tid);
      const letter = (
        fromMap ||
        placement.blankAssignments?.[bi] ||
        ""
      ).toUpperCase();
      if (!/^[A-Z]$/.test(letter)) {
        return { ok: false, error: "Choose a letter for each blank." };
      }
      if (letter !== want) {
        return { ok: false, error: "Blank letter doesn't match the word." };
      }
    } else if (tile.letter !== want) {
      return { ok: false, error: "Rack tiles don't spell that word." };
    }

    newCells.push({ r, c, letter: want, tile });
  }

  if (tilePtr !== tileIds.length) {
    return { ok: false, error: "Extra tiles selected." };
  }
  if (newCells.length === 0) {
    return { ok: false, error: "You must place at least one new tile." };
  }

  // Continuity: no gaps in the main word path (already ensured by walking)
  // Connectivity to board
  const firstMove = !boardHasTiles(board);
  if (firstMove) {
    if (!coversCenter) {
      return { ok: false, error: "First word must cover the center star." };
    }
  } else if (!touchesExisting) {
    // Must also touch orthogonally via a new cell adjacent to existing
    const ortho = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    const adjacent = newCells.some(({ r, c }) =>
      ortho.some(([or, oc]) => {
        const rr = r + or;
        const cc = c + oc;
        return inBounds(rr, cc) && !!board[rr][cc].letter;
      }),
    );
    if (!adjacent) {
      return { ok: false, error: "New tiles must connect to existing letters." };
    }
  }

  // Build temp board
  const temp = board.map((rowCells) => rowCells.map((cell) => ({ ...cell })));
  for (const { r, c, letter } of newCells) {
    temp[r][c] = { letter, fresh: true };
  }

  // The true main word is the full contiguous line after placement
  // (not just the dictionary stub the player/AI aimed for).
  const main = readWordAt(temp, newCells[0].r, newCells[0].c, direction);
  if (!main) {
    return { ok: false, error: "Could not form a word." };
  }
  // Every newly placed tile must sit on that same main line.
  for (const { r, c } of newCells) {
    const along = readWordAt(temp, r, c, direction);
    if (!along || along.word !== main.word) {
      return { ok: false, error: "Tiles must form one continuous word." };
    }
  }
  if (!isEnglishWord(main.word)) {
    return { ok: false, error: `"${main.word}" isn't in the dictionary.` };
  }

  const wordsFormed: string[] = [main.word];
  const crossDir: Direction = direction === "across" ? "down" : "across";

  // Cross words through each newly placed letter
  for (const { r, c } of newCells) {
    const cross = readWordAt(temp, r, c, crossDir);
    if (cross) {
      if (!isEnglishWord(cross.word)) {
        return {
          ok: false,
          error: `Cross word "${cross.word}" isn't a valid word.`,
        };
      }
      wordsFormed.push(cross.word);
    }
  }

  // Score the full main word
  let score = 0;
  let wordMult = 1;
  const [mdr, mdc] = step(direction);
  for (let i = 0; i < main.word.length; i++) {
    const r = main.startRow + mdr * i;
    const c = main.startCol + mdc * i;
    const placed = newCells.find((n) => n.r === r && n.c === c);
    const letter = main.word[i];
    let pts = LETTER_VALUES[letter] ?? 0;
    if (placed) {
      if (placed.tile.isBlank) pts = 0;
      const prem = premiumAt(r, c);
      if (prem === "dl") pts *= 2;
      if (prem === "tl") pts *= 3;
      if (prem === "dw" || prem === "center") wordMult *= 2;
      if (prem === "tw") wordMult *= 3;
    }
    score += pts;
  }
  score *= wordMult;

  // Cross scores
  for (const { r, c, tile } of newCells) {
    const cross = readWordAt(temp, r, c, crossDir);
    if (!cross) continue;
    let crossScore = 0;
    let crossMult = 1;
    const [cdr, cdc] = step(crossDir);
    for (let i = 0; i < cross.word.length; i++) {
      const rr = cross.startRow + cdr * i;
      const cc = cross.startCol + cdc * i;
      const isNew = rr === r && cc === c;
      let pts = LETTER_VALUES[cross.word[i]] ?? 0;
      if (isNew && tile.isBlank) pts = 0;
      if (isNew) {
        const prem = premiumAt(rr, cc);
        if (prem === "dl") pts *= 2;
        if (prem === "tl") pts *= 3;
        if (prem === "dw" || prem === "center") crossMult *= 2;
        if (prem === "tw") crossMult *= 3;
      }
      crossScore += pts;
    }
    score += crossScore * crossMult;
  }

  if (newCells.length === 7) score += BINGO_BONUS;

  const { bonus: bookishBonus, hits } = totalBookishBonus(wordsFormed);
  score += bookishBonus;

  const tilesUsed = usedIds.map((id) => rackById.get(id)!);

  return {
    ok: true,
    move: {
      row: main.startRow,
      col: main.startCol,
      direction,
      word: main.word,
      tileIds: usedIds,
      blankAssignments: placement.blankAssignments,
      score,
      wordsFormed,
      bookishBonus: bookishBonus || undefined,
      bookishHits: hits.length ? hits.map((h) => h.word) : undefined,
    },
    tilesUsed,
  };
}

export function applyMove(
  board: BoardCell[][],
  move: ScoredMove,
): BoardCell[][] {
  const next = board.map((row) => row.map((cell) => ({ ...cell, fresh: false })));
  const [dr, dc] = step(move.direction);
  for (let i = 0; i < move.word.length; i++) {
    const r = move.row + dr * i;
    const c = move.col + dc * i;
    if (!next[r][c].letter) {
      next[r][c] = { letter: move.word[i], fresh: true };
    }
  }
  return next;
}

/** Try to build a word string from rack letters (no board). */
export function canSpellFromRack(word: string, rack: Tile[]): boolean {
  const counts: Record<string, number> = {};
  let blanks = 0;
  for (const t of rack) {
    if (t.isBlank) blanks++;
    else counts[t.letter] = (counts[t.letter] ?? 0) + 1;
  }
  for (const ch of word.toUpperCase()) {
    if (counts[ch]) counts[ch]--;
    else if (blanks > 0) blanks--;
    else return false;
  }
  return true;
}

export function allocateTilesForWord(
  word: string,
  rack: Tile[],
): { tileIds: string[]; blankAssignments: string[] } | null {
  const W = word.toUpperCase();
  const available = rack.map((t) => ({ ...t }));
  const tileIds: string[] = [];
  const blankAssignments: string[] = [];

  for (const ch of W) {
    const exact = available.findIndex((t) => !t.isBlank && t.letter === ch);
    if (exact >= 0) {
      tileIds.push(available[exact].id);
      available.splice(exact, 1);
      continue;
    }
    const blank = available.findIndex((t) => t.isBlank);
    if (blank >= 0) {
      tileIds.push(available[blank].id);
      blankAssignments.push(ch);
      available.splice(blank, 1);
      continue;
    }
    return null;
  }
  return { tileIds, blankAssignments };
}
