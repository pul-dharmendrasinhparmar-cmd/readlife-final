import { BOARD_SIZE } from "./board";
import type { BoardCell, Direction, Placement, Tile } from "./types";

export type PendingCell = {
  row: number;
  col: number;
  tile: Tile;
  /** Assigned letter when tile is blank */
  letter: string;
};

export function cellKey(row: number, col: number) {
  return `${row},${col}`;
}

/**
 * Infer a single-line placement from provisional tiles on the board.
 */
export function placementFromPending(
  board: BoardCell[][],
  pending: PendingCell[],
): { ok: true; placement: Placement } | { ok: false; error: string } {
  if (pending.length === 0) {
    return { ok: false, error: "Drag tiles onto the board first." };
  }

  const rows = new Set(pending.map((p) => p.row));
  const cols = new Set(pending.map((p) => p.col));
  const across = rows.size === 1;
  const down = cols.size === 1;
  if (!across && !down) {
    return { ok: false, error: "Tiles must form a straight line." };
  }
  const direction: Direction = across ? "across" : "down";
  const [dr, dc] = direction === "across" ? [0, 1] : [1, 0];

  const sorted = [...pending].sort((a, b) =>
    direction === "across" ? a.col - b.col : a.row - b.row,
  );

  let startRow = sorted[0].row;
  let startCol = sorted[0].col;
  while (
    startRow - dr >= 0 &&
    startCol - dc >= 0 &&
    startRow - dr < BOARD_SIZE &&
    startCol - dc < BOARD_SIZE &&
    board[startRow - dr][startCol - dc].letter
  ) {
    startRow -= dr;
    startCol -= dc;
  }

  const pendingMap = new Map(pending.map((p) => [cellKey(p.row, p.col), p]));
  const last = sorted[sorted.length - 1];

  // Ensure no gaps between first and last pending tile
  let r = sorted[0].row;
  let c = sorted[0].col;
  while (!(r === last.row && c === last.col)) {
    r += dr;
    c += dc;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
      return { ok: false, error: "Tiles must connect in one word." };
    }
    const key = cellKey(r, c);
    if (!pendingMap.has(key) && !board[r][c].letter) {
      return { ok: false, error: "No gaps allowed in your word." };
    }
  }

  // Build full word from expanded start through trailing board letters
  let word = "";
  const tileIds: string[] = [];
  const blankAssignments: string[] = [];
  r = startRow;
  c = startCol;
  let guard = 0;
  while (guard++ < BOARD_SIZE) {
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
    const pend = pendingMap.get(cellKey(r, c));
    const existing = board[r][c].letter;
    if (pend) {
      if (existing) {
        return { ok: false, error: "That square already has a letter." };
      }
      word += pend.letter;
      tileIds.push(pend.tile.id);
      if (pend.tile.isBlank) blankAssignments.push(pend.letter);
    } else if (existing) {
      word += existing;
    } else {
      break;
    }
    r += dr;
    c += dc;
  }

  if (tileIds.length !== pending.length) {
    return { ok: false, error: "Tiles must connect in one word." };
  }

  return {
    ok: true,
    placement: {
      row: startRow,
      col: startCol,
      direction,
      word,
      tileIds,
      blankAssignments,
    },
  };
}
