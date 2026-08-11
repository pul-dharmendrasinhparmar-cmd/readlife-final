"use client";

import type { LevelConfig } from "../levels/types";
import type { StarId } from "../types";
import { ResultStars } from "./IntroCard";

type Props = {
  level: LevelConfig;
  score: number;
  bestCombo: number;
  starsEarned: StarId[];
  onPlayAgain: () => void;
};

export function LevelCompletePanel({
  level,
  score,
  bestCombo,
  starsEarned,
  onPlayAgain,
}: Props) {
  return (
    <div className="bw-panel bw-complete">
      <h3 className="bw-panel-title">Level Complete!</h3>
      <p className="bw-panel-sub">{level.name}</p>
      <dl className="bw-stats">
        <div>
          <dt>Books Devoured</dt>
          <dd>
            {level.goalBooks} / {level.goalBooks}
          </dd>
        </div>
        <div>
          <dt>Score</dt>
          <dd>{score}</dd>
        </div>
        <div>
          <dt>Best Combo</dt>
          <dd>{bestCombo > 0 ? `×${bestCombo}` : "—"}</dd>
        </div>
      </dl>
      <ResultStars level={level} earned={starsEarned} />
      <p className="bw-star-count">
        {starsEarned.length} / {level.stars.length} STARS
      </p>
      <div className="bw-actions">
        <button type="button" className="bw-btn" onClick={onPlayAgain}>
          Play Again
        </button>
        <button
          type="button"
          className="bw-btn bw-btn-ghost"
          disabled={!level.nextLevelReady}
          title={level.nextLevelReady ? undefined : "Coming soon"}
        >
          {level.nextLevelLabel}
        </button>
      </div>
    </div>
  );
}
