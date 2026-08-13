"use client";

import { useEffect, useState } from "react";
import {
  addToTbr,
  getBookStatus,
  loadDiscoveryState,
} from "@/lib/discovery-storage";
import type { DiscoveryState } from "@/components/search/types";
import { PIECES, PIECE_COUNT } from "./piece-meta";
import { formatPiecesTime } from "./covers";
import { usePiecesGame } from "./hooks/usePiecesGame";
import { pieceMaskStyle } from "./mask-style";
import { PiecesIcon } from "./PiecesIcon";
import type { PiecesCover } from "./types";
import "./pieces.css";

type Props = {
  onBackToGames?: () => void;
};

export function PiecesApp({ onBackToGames }: Props) {
  const g = usePiecesGame();

  if (g.phase === "intro") {
    return (
      <div className="pcs-root">
        <div className="pcs-shell">
          <div className="pcs-intro">
            <PiecesIcon className="pcs-icon pcs-icon-lg" />
            <p className="pcs-kicker">Cover jigsaw</p>
            <h2 className="pcs-title">Pieces</h2>
            <p className="pcs-tagline">
              Reconstruct a portrait book cover with 35 real jigsaw pieces.
            </p>
            <p className="pcs-selected">
              {g.selected.id === g.daily.id ? "Today · " : ""}
              {g.selected.title}
              <span> by {g.selected.author}</span>
            </p>
            <div className="pcs-covers" role="listbox" aria-label="Book covers">
              {g.covers.map((cover) => (
                <CoverOption
                  key={cover.id}
                  cover={cover}
                  selected={cover.id === g.selected.id}
                  isToday={cover.id === g.daily.id}
                  onSelect={() => g.selectCover(cover)}
                />
              ))}
            </div>
            <button type="button" className="pcs-cta" onClick={g.start}>
              Scatter the pieces
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (g.phase === "complete") {
    return (
      <div className="pcs-root">
        <div className="pcs-shell">
          <div className="pcs-complete">
            <p className="pcs-kicker">Cover restored</p>
            <h2 className="pcs-title">Pieces complete</h2>
            <p className="pcs-tagline">
              {g.selected.title} by {g.selected.author}
            </p>
            <div className="pcs-complete-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.coverUrl} alt="" onError={g.onCoverError} />
            </div>
            <div className="pcs-stats">
              <div className="pcs-stat">
                <p>Time</p>
                <p>{formatPiecesTime(g.elapsedMs)}</p>
              </div>
              <div className="pcs-stat">
                <p>Pieces</p>
                <p>
                  {PIECE_COUNT}/{PIECE_COUNT}
                </p>
              </div>
            </div>
            <button type="button" className="pcs-cta" onClick={g.start}>
              Play again
            </button>
            <AddToTbrButton cover={g.selected} />
            <button type="button" className="pcs-cta-ghost" onClick={g.goIntro}>
              Another cover
            </button>
            {onBackToGames ? (
              <button
                type="button"
                className="pcs-cta-ghost"
                onClick={onBackToGames}
              >
                Back to Games
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pcs-root">
      <div className="pcs-shell">
        <div className="pcs-hud">
          <p>
            {g.placedCount}
            <span> / {PIECE_COUNT}</span>
          </p>
          <p className="pcs-hud-title">{g.selected.title}</p>
          <p>{formatPiecesTime(g.elapsedMs)}</p>
        </div>
        <div className="pcs-play">
          <div className="pcs-stage">
            <div ref={g.boardRef} className="pcs-board">
              {PIECES.filter((p) => g.placed.has(p.id)).map((piece) => (
                <div
                  key={piece.id}
                  className="pcs-board-piece"
                  style={{
                    ...pieceMaskStyle(piece, g.coverUrl, g.scale),
                    left: piece.bbox.x * g.scale,
                    top: piece.bbox.y * g.scale,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="pcs-tray" aria-label="Puzzle pieces">
            {g.trayPieces.map((piece) => {
              const thumbScale = Math.min(
                48 / piece.bbox.w,
                52 / piece.bbox.h,
              );
              const dragging = g.drag?.id === piece.id;
              return (
                <div
                  key={piece.id}
                  className="pcs-thumb"
                  role="button"
                  tabIndex={dragging ? -1 : 0}
                  aria-label={`Puzzle piece ${piece.id}`}
                  style={{ opacity: dragging ? 0 : 1 }}
                  onPointerDown={(e) => g.beginDrag(piece.id, e)}
                >
                  <div
                    style={{
                      ...pieceMaskStyle(piece, g.coverUrl, thumbScale),
                      pointerEvents: "none",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        {g.drag ? (
          <div
            className="pcs-drag"
            style={{
              ...pieceMaskStyle(
                PIECES.find((p) => p.id === g.drag!.id)!,
                g.coverUrl,
                g.scale,
              ),
              left: g.drag.x,
              top: g.drag.y,
            }}
          />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={g.coverUrl} alt="" hidden onError={g.onCoverError} />
      </div>
    </div>
  );
}

function AddToTbrButton({ cover }: { cover: PiecesCover }) {
  const [discovery, setDiscovery] = useState<DiscoveryState | null>(null);

  useEffect(() => {
    setDiscovery(loadDiscoveryState());
  }, [cover.id]);

  const status = discovery
    ? getBookStatus(discovery, cover.id)
    : "NOT ADDED";

  if (status === "TBR") {
    return (
      <p className="pcs-cta-ghost pcs-cta-added" aria-live="polite">
        On your TBR ✓
      </p>
    );
  }

  return (
    <button
      type="button"
      className="pcs-cta-ghost"
      onClick={() => {
        const current = discovery ?? loadDiscoveryState();
        const next = addToTbr(current, {
          bookId: cover.id,
          priority: "read-soon",
          note: "Restored the cover in Pieces",
          sourceType: "self",
          sourceName: "Pieces",
        });
        setDiscovery(next);
      }}
    >
      {status === "NOT ADDED" ? "Add to TBR" : "Move to TBR"}
    </button>
  );
}

function CoverOption({
  cover,
  selected,
  isToday,
  onSelect,
}: {
  cover: PiecesCover;
  selected: boolean;
  isToday: boolean;
  onSelect: () => void;
}) {
  const [src, setSrc] = useState(cover.image);
  return (
    <button
      type="button"
      role="option"
      aria-label={`${cover.title} by ${cover.author}${isToday ? ", today's puzzle" : ""}`}
      aria-selected={selected}
      className={`pcs-cover-opt${selected ? " is-selected" : ""}`}
      onClick={onSelect}
      title={`${cover.title} — ${cover.author}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        onError={() => {
          if (src !== cover.fallbackImage) setSrc(cover.fallbackImage);
        }}
      />
      {isToday ? <span className="pcs-cover-today">Today</span> : null}
    </button>
  );
}
