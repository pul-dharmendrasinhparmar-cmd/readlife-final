"use client";

import { useEffect, useRef, useState } from "react";
import Board from "./Board";
import Keyboard from "./Keyboard";
import { useWordle } from "./useWordle";

type Theme = {
  title: string;
  tagline: string;
  accent: string;
  author?: string;
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

  const [aiHint, setAiHint] = useState<string | null>(null);
  const [aiHintLoading, setAiHintLoading] = useState(false);
  const [aiHintError, setAiHintError] = useState<string | null>(null);
  const [aiHintUsed, setAiHintUsed] = useState(false);

  const reported = useRef(false);
  useEffect(() => {
    if (status !== "playing" && !reported.current && onGameEnd) {
      reported.current = true;
      onGameEnd({ won: status === "won", guessCount: guesses.length });
    }
  }, [status, guesses.length, onGameEnd]);

  const handleNewWord = () => {
    reset();
    setAiHint(null);
    setAiHintError(null);
    setAiHintUsed(false);
    onNewWord();
  };

  const fetchAiHint = async () => {
    if (aiHintUsed || aiHintLoading || status !== "playing") return;
    setAiHintLoading(true);
    setAiHintError(null);
    try {
      const res = await fetch("/api/games-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: "bookle",
          themeTitle: theme.title,
          themeTagline: theme.tagline,
          themeAuthor: theme.author ?? "",
          answer,
          hintsUsed: aiHintUsed ? 1 : 0,
          attempt: guesses.length,
        }),
      });
      const data = (await res.json()) as { hint?: string; error?: string };
      if (!res.ok || !data.hint) {
        setAiHintError(data.error ?? "AI hint unavailable.");
        return;
      }
      setAiHint(data.hint);
      setAiHintUsed(true);
    } catch {
      setAiHintError("Could not reach AI hint.");
    } finally {
      setAiHintLoading(false);
    }
  };

  const hintDisabled = !canUseHint;
  const hintButtonLabel = hintUsed
    ? "Hint used"
    : status !== "playing"
      ? "Hint unavailable"
      : "Use hint";

  const aiDisabled =
    aiHintUsed || aiHintLoading || status !== "playing";
  const aiButtonLabel = aiHintUsed
    ? "AI hint used"
    : aiHintLoading
      ? "Asking…"
      : "AI hint";

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
            className={`hint-btn ai-hint-btn${aiHintUsed ? " used" : ""}`}
            onClick={() => void fetchAiHint()}
            disabled={aiDisabled}
            aria-label={aiButtonLabel}
            title="Soft genre/era vibe — never reveals letters"
          >
            {aiButtonLabel}
          </button>
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
        ) : aiHintError ? (
          <div className="toast">{aiHintError}</div>
        ) : aiHint ? (
          <div className="hint-reveal ai-hint-reveal">{aiHint}</div>
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
          showHintGhosts={status === "playing"}
        />
      </div>

      <Keyboard onKey={pressKey} keyStatuses={keyStatuses} />
    </div>
  );
}
