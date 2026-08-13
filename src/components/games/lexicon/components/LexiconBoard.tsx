"use client";

import { LETTER_VALUES } from "../letters";
import { BOARD_SIZE, premiumAt, premiumLabel } from "../board";
import { cellKey, type PendingCell } from "../placement";
import type { BoardCell } from "../types";

type Props = {
  board: BoardCell[][];
  pendingByKey: Map<string, PendingCell>;
  disabled?: boolean;
  selectedTileId?: string | null;
  onDropTile: (row: number, col: number, tileId: string) => void;
  onPickupPending: (row: number, col: number) => void;
  onSelectEmptyCell?: (row: number, col: number) => void;
};

export function LexiconBoard({
  board,
  pendingByKey,
  disabled,
  selectedTileId,
  onDropTile,
  onPickupPending,
  onSelectEmptyCell,
}: Props) {
  return (
    <div className="lex-board-wrap">
      <div className="lex-board" role="grid" aria-label="Wordsmith board">
        {Array.from({ length: BOARD_SIZE }, (_, row) =>
          Array.from({ length: BOARD_SIZE }, (_, col) => {
            const cell = board[row][col];
            const prem = premiumAt(row, col);
            const label = premiumLabel(prem);
            const pend = pendingByKey.get(cellKey(row, col));
            const showLetter = cell.letter || pend?.letter || null;
            const isPending = !!pend;

            return (
              <div
                key={`${row}-${col}`}
                role="gridcell"
                className={`lex-cell prem-${prem}${isPending ? " is-pending" : ""}${disabled ? " is-disabled" : ""}${selectedTileId && !showLetter && !cell.letter ? " is-drop-target" : ""}`}
                onDragOver={(e) => {
                  if (disabled || cell.letter) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  if (disabled || cell.letter) return;
                  e.preventDefault();
                  const tileId = e.dataTransfer.getData("text/tile-id");
                  if (tileId) onDropTile(row, col, tileId);
                }}
                onClick={() => {
                  if (disabled || cell.letter || isPending) return;
                  if (selectedTileId) onDropTile(row, col, selectedTileId);
                  else onSelectEmptyCell?.(row, col);
                }}
                aria-label={
                  showLetter
                    ? `Tile ${showLetter} at row ${row + 1}, column ${col + 1}`
                    : `${label || "Empty"} square at row ${row + 1}, column ${col + 1}`
                }
              >
                {showLetter ? (
                  <button
                    type="button"
                    className={`lex-board-tile${cell.fresh && !isPending ? " is-fresh" : ""}${isPending ? " is-pending-tile" : ""}`}
                    draggable={isPending && !disabled}
                    disabled={!isPending || disabled}
                    onClick={() => {
                      if (isPending && !disabled) onPickupPending(row, col);
                    }}
                    onDragStart={(e) => {
                      if (!pend || disabled) return;
                      e.dataTransfer.setData("text/tile-id", pend.tile.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    aria-label={
                      isPending
                        ? `Pending ${showLetter} — click to return to rack`
                        : showLetter
                    }
                  >
                    {showLetter}
                    <span className="lex-pts">
                      {pend?.tile.isBlank
                        ? 0
                        : (LETTER_VALUES[showLetter] ?? "")}
                    </span>
                  </button>
                ) : (
                  <span className="lex-cell-face" aria-hidden>
                    {prem === "center" ? (
                      <span className="lex-star">★</span>
                    ) : label ? (
                      <span className="lex-prem-label">{label}</span>
                    ) : null}
                  </span>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
