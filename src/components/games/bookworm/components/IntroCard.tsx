"use client";

import type { LevelConfig } from "../levels/types";
import type { LevelProgress, StarId } from "../types";

type IntroProps = {
  level: LevelConfig;
  progress: LevelProgress;
  onStart: () => void;
};

function StarRow({
  count,
  max = 3,
}: {
  count: number;
  max?: number;
}) {
  return (
    <span className="bw-stars" aria-label={`${count} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? "filled" : "empty"}>
          {i < count ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export function IntroCard({ level, progress, onStart }: IntroProps) {
  return (
    <div className="bw-panel bw-intro">
      <p className="bw-panel-eyebrow">BOOKWORM</p>
      <h3 className="bw-panel-title">
        LEVEL {level.number}
        <span>COZY SHELF</span>
      </h3>
      <p className="bw-panel-tagline">{level.tagline}</p>

      <div className="bw-intro-progress">
        <StarRow count={progress.bestStars} />
        <p>
          High Score: <strong>{progress.highScore}</strong>
        </p>
        <p>
          Best Combo:{" "}
          <strong>
            {progress.bestCombo > 0 ? `×${progress.bestCombo}` : "—"}
          </strong>
        </p>
      </div>

      <div className="bw-goal-box">
        <p className="bw-goal-main">Devour {level.goalBooks} books.</p>
        <ul className="bw-star-goals">
          {level.stars.map((s) => (
            <li key={s.id}>
              <span aria-hidden>☆</span> {s.label}
            </li>
          ))}
        </ul>
      </div>

      <p className="bw-controls-hint">Swipe the board · Arrow keys / WASD</p>

      <button type="button" className="bw-btn" onClick={onStart}>
        Start Level
      </button>
    </div>
  );
}

type ResultStarsProps = {
  level: LevelConfig;
  earned: StarId[];
};

export function ResultStars({ level, earned }: ResultStarsProps) {
  const set = new Set(earned);
  return (
    <ul className="bw-result-stars">
      {level.stars.map((s) => (
        <li key={s.id} className={set.has(s.id) ? "earned" : ""}>
          <span aria-hidden>{set.has(s.id) ? "★" : "☆"}</span>
          {s.label}
        </li>
      ))}
    </ul>
  );
}
