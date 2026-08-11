"use client";

import type { ComboState } from "../types";

type Props = {
  levelName: string;
  levelNumber: number;
  booksEaten: number;
  goal: number;
  score: number;
  combo: ComboState;
  muted: boolean;
  onToggleMute: () => void;
};

export function Hud({
  levelName,
  levelNumber,
  booksEaten,
  goal,
  score,
  combo,
  muted,
  onToggleMute,
}: Props) {
  return (
    <div className="bw-hud">
      <div className="bw-hud-brand">
        <strong>BOOKWORM</strong>
        <span>
          Level {levelNumber} — {levelName}
        </span>
      </div>
      <div className="bw-hud-center">
        <span className="bw-hud-label">Books</span>
        <strong className="bw-hud-value">
          {booksEaten} / {goal}
        </strong>
      </div>
      <div className="bw-hud-right">
        <div>
          <span className="bw-hud-label">Score</span>
          <strong className="bw-hud-value">{score}</strong>
        </div>
        {combo.multiplier > 1 && combo.streak > 0 ? (
          <span className="bw-combo-badge" aria-live="polite">
            ×{combo.multiplier} COMBO
          </span>
        ) : null}
        <button
          type="button"
          className="bw-mute"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute sound" : "Mute sound"}
          title={muted ? "Sound off" : "Sound on"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
    </div>
  );
}
