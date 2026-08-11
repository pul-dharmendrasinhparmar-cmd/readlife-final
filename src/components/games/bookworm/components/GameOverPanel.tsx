"use client";

type Props = {
  booksEaten: number;
  goal: number;
  score: number;
  bestCombo: number;
  message: string | null;
  onTryAgain: () => void;
  onBack: () => void;
};

export function GameOverPanel({
  booksEaten,
  goal,
  score,
  bestCombo,
  message,
  onTryAgain,
  onBack,
}: Props) {
  return (
    <div className="bw-panel bw-over">
      <h3 className="bw-panel-title die">Bookworm Crashed!</h3>
      <dl className="bw-stats">
        <div>
          <dt>Books Devoured</dt>
          <dd>
            {booksEaten} / {goal}
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
      {message ? <p className="bw-funny">{message}</p> : null}
      <div className="bw-actions">
        <button type="button" className="bw-btn" onClick={onTryAgain}>
          Try Again
        </button>
        <button type="button" className="bw-btn bw-btn-ghost" onClick={onBack}>
          Back to Games
        </button>
      </div>
    </div>
  );
}
