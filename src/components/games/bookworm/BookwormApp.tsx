"use client";

/**
 * BOOKWORM — Level 1 Cozy Shelf
 * Modular snake-with-books mini-game for ReadLife Mini Games.
 */
import { Board } from "./components/Board";
import { CountdownOverlay } from "./components/CountdownOverlay";
import { GameOverPanel } from "./components/GameOverPanel";
import { Hud } from "./components/Hud";
import { IntroCard } from "./components/IntroCard";
import { LevelCompletePanel } from "./components/LevelCompletePanel";
import { useBookwormGame } from "./hooks/useBookwormGame";
import { useSwipeControls } from "./hooks/useSwipeControls";
import "./bookworm.css";

type Props = {
  onBackToGames?: () => void;
};

export function BookwormApp({ onBackToGames }: Props) {
  const game = useBookwormGame();
  const swipeEnabled =
    game.phase === "playing" || game.phase === "countdown";
  const swipe = useSwipeControls(game.queueDir, swipeEnabled);

  const showBoard =
    game.phase === "countdown" ||
    game.phase === "playing" ||
    game.phase === "celebrating" ||
    game.phase === "dead" ||
    game.phase === "complete";

  return (
    <div className="bw-root">
      <div className="bw-decor" aria-hidden>
        <span className="bw-lamp" />
        <span className="bw-plant" />
        <span className="bw-chair" />
        <span className="bw-cat" />
        <span className="bw-stack" />
      </div>

      <div className="bw-shell">
        <Hud
          levelName={game.level.name}
          levelNumber={game.level.number}
          booksEaten={game.booksEaten}
          goal={game.level.goalBooks}
          score={game.score}
          combo={game.combo}
          muted={game.muted}
          onToggleMute={game.toggleMute}
        />

        <div
          className="bw-stage"
          {...swipe}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="bw-frame">
            {showBoard ? (
              <Board
                level={game.level}
                snake={game.snake}
                dir={game.dir}
                book={game.book}
                eatPop={game.eatPop}
                dead={game.phase === "dead"}
                celebrating={
                  game.phase === "celebrating" || game.phase === "complete"
                }
              />
            ) : (
              <div className="bw-board bw-board-placeholder" />
            )}

            {game.phase === "intro" ? (
              <IntroCard
                level={game.level}
                progress={game.progress}
                onStart={game.startLevel}
              />
            ) : null}

            {game.phase === "countdown" ? (
              <CountdownOverlay value={game.countdown} />
            ) : null}

            {game.comboFlash ? (
              <div className="bw-combo-flash" aria-live="polite">
                {game.comboFlash.split("\n").map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            ) : null}

            {game.phase === "celebrating" ? (
              <div className="bw-celebrate" aria-hidden>
                {Array.from({ length: 18 }, (_, i) => (
                  <span key={i} className={`bw-spark s${i % 6}`} />
                ))}
              </div>
            ) : null}

            {game.phase === "dead" ? (
              <GameOverPanel
                booksEaten={game.booksEaten}
                goal={game.level.goalBooks}
                score={game.score}
                bestCombo={game.bestComboThisRun}
                message={game.deathMessage}
                onTryAgain={game.tryAgain}
                onBack={() => onBackToGames?.()}
              />
            ) : null}

            {game.phase === "complete" ? (
              <LevelCompletePanel
                level={game.level}
                score={game.score}
                bestCombo={game.bestComboThisRun}
                starsEarned={game.starsEarned}
                onPlayAgain={game.tryAgain}
              />
            ) : null}
          </div>
        </div>

        <p className="bw-hint">
          {game.phase === "playing"
            ? "Don't hit walls, shelves, or yourself"
            : "Arrow keys / WASD · swipe on the board"}
        </p>
      </div>
    </div>
  );
}
