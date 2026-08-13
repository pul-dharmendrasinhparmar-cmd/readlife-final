"use client";

import { useEffect, useRef, useState } from "react";
import { CuteUncovered } from "@/components/games/hub/CuteUncovered";
import { EmojiPlotApp } from "./emoji/EmojiPlotApp";
import { useUncoveredGame } from "./hooks/useUncoveredGame";
import {
  MAX_ROUND_POINTS,
  POINTS_CORRECT,
} from "./questions";
import type { UncoveredQuestion, UncoveredPhase } from "./types";
import "./uncovered.css";

const LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

type Props = {
  onBackToGames?: () => void;
};

type Mode = "pick" | "cover" | "emoji";

export function UncoveredApp({ onBackToGames }: Props) {
  const [mode, setMode] = useState<Mode>("pick");

  if (mode === "pick") {
    return (
      <ModeSelect
        onPick={setMode}
        onBackToGames={onBackToGames}
      />
    );
  }

  if (mode === "emoji") {
    return (
      <EmojiPlotApp
        onChangeMode={() => setMode("pick")}
        onBackToGames={onBackToGames}
      />
    );
  }

  return (
    <CoverGame
      onChangeMode={() => setMode("pick")}
      onBackToGames={onBackToGames}
    />
  );
}

function ModeSelect({
  onPick,
  onBackToGames,
}: {
  onPick: (mode: "cover" | "emoji") => void;
  onBackToGames?: () => void;
}) {
  return (
    <div className="unc-root">
      <div className="unc-shell">
        <div className="unc-intro">
          <CuteUncovered className="h-16 w-16" />
          <p className="unc-kicker">Two ways in</p>
          <h2 className="unc-title">Uncovered</h2>
          <p className="unc-tagline">
            Guess the book from a hidden cover, or from the plot told in five
            emojis.
          </p>
          <div className="unc-modes">
            <button
              type="button"
              className="unc-mode"
              onClick={() => onPick("cover")}
            >
              <span className="unc-mode-kicker">Cover quiz</span>
              <span className="unc-mode-title">Guess by cover</span>
              <span className="unc-mode-copy">
                A cropped jacket. Six choices. Ten rounds.
              </span>
            </button>
            <button
              type="button"
              className="unc-mode"
              onClick={() => onPick("emoji")}
            >
              <span className="unc-mode-kicker">Emoji plot</span>
              <span className="unc-mode-title">Guess by emoji</span>
              <span className="unc-mode-copy">
                Five plot beats. Six guesses. Color clues like Wordle.
              </span>
            </button>
          </div>
          {onBackToGames ? (
            <button
              type="button"
              className="unc-cta-ghost"
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

function CoverGame({
  onChangeMode,
  onBackToGames,
}: {
  onChangeMode: () => void;
  onBackToGames?: () => void;
}) {
  const g = useUncoveredGame();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    g.start();
  }, [g.start]);

  if (g.phase === "complete") {
    return (
      <div className="unc-root">
        <div className="unc-shell">
          <div className="unc-complete">
            <p className="unc-kicker">Cover quiz</p>
            <h2 className="unc-title">Uncovered Complete</h2>
            <p className="unc-tagline">
              {g.recognized === g.questions.length
                ? "Every cover, uncovered."
                : "The art always remembers."}
            </p>
            <div className="unc-stats-grid">
              <div className="unc-stat">
                <p>Score</p>
                <p>
                  {g.score} / {MAX_ROUND_POINTS}
                </p>
              </div>
              <div className="unc-stat">
                <p>Books recognized</p>
                <p>
                  {g.recognized}/{g.questions.length}
                </p>
              </div>
              <div className="unc-stat">
                <p>Best streak</p>
                <p>{g.bestStreak}</p>
              </div>
              <div className="unc-stat">
                <p>Puzzle</p>
                <p>#{g.puzzleNumber}</p>
              </div>
            </div>
            <div className="unc-round-list" aria-label="Round results">
              {g.results.map((r, i) => (
                <span key={r.questionId} className="unc-round-chip">
                  {i + 1} {r.correct ? "✓" : "✕"}
                </span>
              ))}
            </div>
            <button type="button" className="unc-cta" onClick={g.start}>
              Play Again
            </button>
            <button
              type="button"
              className="unc-cta-ghost"
              onClick={onChangeMode}
            >
              Cover or emoji
            </button>
            {onBackToGames ? (
              <button
                type="button"
                className="unc-cta-ghost"
                onClick={onBackToGames}
              >
                Back to Games
              </button>
            ) : null}
            <button type="button" className="unc-cta-ghost" onClick={g.share}>
              {g.shareCopied ? "Copied!" : "Share Result"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!g.question) return null;
  return <PlayScreen g={g} onChangeMode={onChangeMode} />;
}

function PlayScreen({
  g,
  onChangeMode,
}: {
  g: ReturnType<typeof useUncoveredGame>;
  onChangeMode: () => void;
}) {
  const q = g.question!;
  const revealed = g.phase === "revealed";
  const showOptions = g.phase === "guessing";
  const round = g.results[g.index];
  const playRef = useRef<HTMLDivElement>(null);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [aiHintLoading, setAiHintLoading] = useState(false);
  const [aiHintError, setAiHintError] = useState<string | null>(null);
  const [aiHintUsedFor, setAiHintUsedFor] = useState<string | null>(null);

  useEffect(() => {
    playRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [g.phase, g.index]);

  useEffect(() => {
    setAiHint(null);
    setAiHintError(null);
  }, [q.id]);

  const fetchAiHint = async () => {
    if (aiHintLoading || g.phase !== "guessing") return;
    if (aiHintUsedFor === q.id) return;
    setAiHintLoading(true);
    setAiHintError(null);
    try {
      const res = await fetch("/api/games-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: "uncovered-cover",
          title: q.title,
          author: q.author,
          genre: q.genre ?? "",
          difficulty: q.difficulty,
        }),
      });
      const data = (await res.json()) as { hint?: string; error?: string };
      if (!res.ok || !data.hint) {
        setAiHintError(data.error ?? "AI hint unavailable.");
        return;
      }
      setAiHint(data.hint);
      setAiHintUsedFor(q.id);
    } catch {
      setAiHintError("Could not reach AI hint.");
    } finally {
      setAiHintLoading(false);
    }
  };

  const aiUsed = aiHintUsedFor === q.id;

  return (
    <div className="unc-root">
      <div className="unc-shell">
        <div
          className={`unc-play${revealed ? " is-revealed" : ""}`}
          ref={playRef}
        >
          <p className="unc-kicker">Uncovered · Cover</p>
          <button
            type="button"
            className="unc-mode-link"
            onClick={onChangeMode}
          >
            Switch mode
          </button>
          <div className="unc-progress" aria-label="Round progress">
            {g.questions.map((item, i) => {
              const done = g.results[i];
              const cls = done
                ? done.correct
                  ? "is-yes"
                  : "is-no"
                : i === g.index
                  ? "is-current"
                  : "";
              return (
                <span
                  key={item.id}
                  className={`unc-dot ${cls}`}
                  title={`Book ${i + 1}`}
                />
              );
            })}
          </div>
          <p className="unc-scoreline">
            {g.index + 1} / {g.questions.length} · {g.score} pts
          </p>

          <CoverStage
            key={q.id}
            question={q}
            phase={g.phase}
            correct={g.results[g.index]?.correct ?? null}
          />

          <div className="unc-emoji-prompt-row">
            <p className="unc-prompt">
              {revealed ? q.title : "What book is this?"}
            </p>
            {showOptions ? (
              <button
                type="button"
                className={`unc-hint-btn${aiUsed ? " is-used" : ""}`}
                onClick={() => void fetchAiHint()}
                disabled={aiUsed || aiHintLoading}
                aria-label={
                  aiUsed
                    ? "AI hint used"
                    : aiHintLoading
                      ? "Loading AI hint"
                      : "Get AI vibe hint"
                }
                title="Soft genre/era vibe — never names the title"
              >
                {aiHintLoading ? "…" : "AI"}
              </button>
            ) : null}
          </div>

          {aiHintError ? (
            <p className="unc-emoji-hint" role="status">
              {aiHintError}
            </p>
          ) : null}
          {aiHint ? (
            <ul className="unc-hint-list">
              <li>{aiHint}</li>
            </ul>
          ) : null}

          {showOptions ? (
            <div className="unc-options">
              {q.options.map((opt, i) => {
                const picked = g.selected === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`unc-opt${picked ? " is-picked" : ""}`}
                    onClick={() => g.selectAnswer(opt)}
                  >
                    <span className="unc-letter">{LETTERS[i]}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {revealed && round ? (
            <ResultCard
              question={q}
              selected={g.selected}
              correct={round.correct}
              points={round.points}
              bonus={round.bonus}
            />
          ) : null}
        </div>
        {revealed && round ? (
          <div className="unc-next-bar">
            <button type="button" className="unc-cta" onClick={g.continueNext}>
              {g.index + 1 >= g.questions.length ? "See results" : "Next Book"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CoverStage({
  question,
  phase,
  correct,
}: {
  question: UncoveredQuestion;
  phase: UncoveredPhase;
  correct: boolean | null;
}) {
  const flipped = phase === "revealed";
  const stamping = phase === "stamping" || phase === "revealed";
  const wrongShake = phase === "stamping" && correct === false;

  return (
    <div className="unc-stage">
      <div
        className={`unc-flip${flipped ? " is-flipped" : ""}${
          wrongShake ? " is-wrong-shake" : ""
        }`}
      >
        <div className="unc-face unc-face-front">
          <HiddenCover question={question} />
          {stamping && correct != null ? (
            <div
              className={`unc-stamp is-in${correct ? "" : " is-wrong"}`}
              aria-hidden
            >
              <span>{correct ? "✓ CORRECT" : "✕ WRONG"}</span>
            </div>
          ) : null}
        </div>
        <div className="unc-face unc-face-back">
          {/* Flip faces need a raw img; next/image wrappers break backface-visibility. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="unc-cover-img"
            src={question.fullCoverImage}
            alt={`${question.title} by ${question.author}`}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

function HiddenCover({ question }: { question: UncoveredQuestion }) {
  const { x, y, scale, window: win = 46 } = question.artFocus;
  const fx = Number.parseFloat(x) / 100;
  const fy = Number.parseFloat(y) / 100;
  return (
    <>
      <div
        className="unc-crop"
        style={{ clipPath: `circle(${win}% at 50% 50%)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="unc-cover-img is-hidden"
          src={question.fullCoverImage}
          alt=""
          draggable={false}
          style={{
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
            maxWidth: "none",
            position: "absolute",
            left: `${50 - fx * scale * 100}%`,
            top: `${50 - fy * scale * 100}%`,
          }}
        />
      </div>
      <span className="unc-vignette" aria-hidden />
    </>
  );
}

function ResultCard({
  question,
  selected,
  correct,
  points,
  bonus,
}: {
  question: UncoveredQuestion;
  selected: string | null;
  correct: boolean;
  points: number;
  bonus: number;
}) {
  const earned = points + bonus;
  return (
    <div className="unc-result">
      <p className={`unc-result-mark ${correct ? "is-yes" : "is-no"}`}>
        {correct ? "✓ CORRECT" : "✕ WRONG"}
      </p>
      <h3 className="unc-result-title">{question.title}</h3>
      <p className="unc-result-meta">
        {question.author}
        {question.genre ? ` · ${question.genre}` : ""}
      </p>
      {question.series ? (
        <p className="unc-result-meta">{question.series}</p>
      ) : null}
      {!correct && selected ? (
        <p className="unc-result-meta">You guessed {selected}</p>
      ) : null}
      <p className="unc-result-pts">
        {earned > 0
          ? `+${earned} points${bonus ? ` (includes +${bonus} streak bonus)` : ""}`
          : `+0 points · ${POINTS_CORRECT} next time`}
      </p>
    </div>
  );
}
