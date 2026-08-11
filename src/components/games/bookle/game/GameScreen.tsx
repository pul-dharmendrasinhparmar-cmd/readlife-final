"use client";

import { useEffect, useRef } from "react";
import Board from "./Board";
import Keyboard from "./Keyboard";
import { useWordle } from "./useWordle";

type Theme = {
  title: string;
  tagline: string;
  accent: string;
};

type Props = {
  answer: string;
  validWords: string[];
  theme: Theme;
  onBack: () => void;
  onNewWord: () => void;
  onGameEnd?: (result: { won: boolean; guessCount: number }) => void;
};

export default function GameScreen({
  answer,
  validWords,
  theme,
  onBack,
  onNewWord,
  onGameEnd,
}: Props) {
  const {
    guesses,
    current,
    status,
    shakeRow,
    message,
    keyStatuses,
    pressKey,
    reset,
    useHint,
    canUseHint,
    hintUsed,
    hinted,
    hintLabel,
    maxGuesses,
    wordLength,
  } = useWordle({ answer, validWords });

  const reported = useRef(false);
  useEffect(() => {
    if (status !== "playing" && !reported.current && onGameEnd) {
      reported.current = true;
      onGameEnd({ won: status === "won", guessCount: guesses.length });
    }
  }, [status, guesses.length, onGameEnd]);

  const handleNewWord = () => {
    reset();
    onNewWord();
  };

  const hintDisabled = !canUseHint;
  const hintButtonLabel = hintUsed
    ? "Hint used"
    : status !== "playing"
      ? "Hint unavailable"
      : "Use hint";

  return (
    <div className="game-panel" style={{ ["--accent" as string]: theme.accent }}>
      <header className="game-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Themes
        </button>
        <div className="game-title">
          <h1>{theme.title}</h1>
          <p>{theme.tagline}</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className={`hint-btn${hintUsed ? " used" : ""}`}
            onClick={useHint}
            disabled={hintDisabled}
            aria-label={hintButtonLabel}
            aria-disabled={hintDisabled}
            title={hintButtonLabel}
          >
            {hintUsed ? "Hint used" : "Hint"}
          </button>
          <button type="button" className="reset-btn" onClick={handleNewWord}>
            New Word
          </button>
        </div>
      </header>

      {/* Single status slot in document flow — never toast + hint + win stacked. */}
      <div className="game-status" aria-live="polite">
        {status !== "playing" ? (
          <div className={`banner ${status}`}>
            {status === "won" ? "You got it!" : `The word was ${answer}`}
            <button type="button" onClick={handleNewWord}>
              Play again
            </button>
          </div>
        ) : message ? (
          <div className="toast">{message}</div>
        ) : hintLabel ? (
          <div className="hint-reveal">
            Letter {hintLabel.index + 1} is{" "}
            <span className="hint-letter">{hintLabel.letter}</span>
          </div>
        ) : null}
      </div>

      <div className="game-board-area">
        <Board
          guesses={guesses}
          current={current}
          wordLength={wordLength}
          maxGuesses={maxGuesses}
          shakeRow={shakeRow}
          hinted={hinted}
        />
      </div>

      <Keyboard onKey={pressKey} keyStatuses={keyStatuses} />
    </div>
  );
}
