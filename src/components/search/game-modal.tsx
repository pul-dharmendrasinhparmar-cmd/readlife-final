"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { BookleApp } from "@/components/games/bookle/BookleApp";
import { BookwormApp } from "@/components/games/bookworm/BookwormApp";
import { DISCOVER_BOOKS } from "./data";
import type { MiniGame } from "./types";

type Props = {
  game: MiniGame | null;
  open: boolean;
  onClose: () => void;
};

type ClueRound = {
  answerId: string;
  clues: string[];
  options: string[];
};

function buildGuessRound(): ClueRound {
  const pool = DISCOVER_BOOKS.filter((b) =>
    ["night-circus", "piranesi", "six-crows", "circe", "babel", "house-sky"].includes(
      b.id,
    ),
  );
  const answer = pool[Math.floor(Math.random() * pool.length)];
  const distractors = DISCOVER_BOOKS.filter((b) => b.id !== answer.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((b) => b.title);
  const options = [...distractors, answer.title].sort(() => Math.random() - 0.5);
  return {
    answerId: answer.id,
    clues: [
      `Author initials: ${answer.author
        .split(" ")
        .map((w) => w[0])
        .join(". ")}.`,
      `Genres: ${answer.genres.slice(0, 2).join(" · ")}`,
      answer.description.slice(0, 90) + "…",
    ],
    options,
  };
}

function buildLibraryQuiz() {
  const rated = DISCOVER_BOOKS.filter((b) =>
    ["night-circus", "piranesi", "six-crows", "achilles", "circe"].includes(b.id),
  );
  const fiveStar = rated.find((b) => b.id === "night-circus")!;
  const options = rated
    .map((b) => b.title)
    .sort(() => Math.random() - 0.5);
  return {
    question: "Which of these books did you rate 5 stars?",
    answer: fiveStar.title,
    options,
  };
}

export function GameModal({ game, open, onClose }: Props) {
  const titleId = useId();
  const [clueIndex, setClueIndex] = useState(0);
  const [guessRound, setGuessRound] = useState<ClueRound | null>(null);
  const [quiz, setQuiz] = useState<ReturnType<typeof buildLibraryQuiz> | null>(
    null,
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const isFullscreenGame =
    game?.id === "bookle" || game?.id === "bookworm";

  useEffect(() => {
    if (!open || !game) return;
    setFeedback(null);
    setClueIndex(0);
    if (game.id === "guess-the-book") setGuessRound(buildGuessRound());
    if (game.id === "know-your-library") setQuiz(buildLibraryQuiz());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, game, onClose]);

  const answerTitle = useMemo(() => {
    if (!guessRound) return "";
    return DISCOVER_BOOKS.find((b) => b.id === guessRound.answerId)?.title ?? "";
  }, [guessRound]);

  if (!open || !game) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#2a342c]/35 backdrop-blur-[2px]"
        aria-label="Close game"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={
          isFullscreenGame
            ? "relative z-10 flex h-[min(92svh,880px)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.5rem] border border-[#e4d5c3] bg-[#fbf6ee] shadow-[0_24px_60px_rgba(40,30,20,0.25)]"
            : "relative z-10 w-full max-w-lg rounded-[1.5rem] border border-[#e4d5c3] bg-[#fbf6ee] p-6 shadow-[0_24px_60px_rgba(40,30,20,0.25)]"
        }
      >
        <div
          className={
            isFullscreenGame
              ? "flex shrink-0 items-start justify-between gap-3 border-b border-[#e4d5c3]/80 px-5 py-3"
              : "flex items-start justify-between gap-3"
          }
        >
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-forest/65 uppercase">
              Mini game
            </p>
            <h2
              id={titleId}
              className="mt-1 font-serif text-2xl font-semibold text-forest"
            >
              {game.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-forest hover:bg-[#efe4d4]"
          >
            Close
          </button>
        </div>

        {game.id === "bookle" && game.playable ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <BookleApp />
          </div>
        ) : game.id === "bookworm" && game.playable ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <BookwormApp onBackToGames={onClose} />
          </div>
        ) : !game.playable ? (
          <div className="mt-6 rounded-2xl border border-[#e4d5c3] bg-[#f3ebe0]/80 px-4 py-8 text-center">
            <p className="font-serif text-lg font-semibold text-forest">
              Game coming to your reading room soon.
            </p>
            <p className="mt-2 text-sm text-muted">
              We&apos;re still stacking the shelves for this one.
            </p>
          </div>
        ) : game.id === "guess-the-book" && guessRound ? (
          <div className="mt-5">
            <p className="text-sm text-muted">
              Clue {clueIndex + 1} of {guessRound.clues.length}
            </p>
            <p className="mt-2 rounded-2xl bg-[#f3ebe0] px-4 py-3 font-serif text-base text-forest">
              {guessRound.clues[clueIndex]}
            </p>
            <div className="mt-4 grid gap-2">
              {guessRound.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={!!feedback}
                  onClick={() => {
                    const correct = opt === answerTitle;
                    setFeedback(
                      correct
                        ? `Correct — ${answerTitle}!`
                        : `Not quite. It was ${answerTitle}.`,
                    );
                  }}
                  className="rounded-2xl border border-[#e0d1bf] bg-[#f7f0e6] px-4 py-2.5 text-left text-sm font-semibold text-forest hover:border-forest/40 disabled:opacity-70"
                >
                  {opt}
                </button>
              ))}
            </div>
            {!feedback && clueIndex < guessRound.clues.length - 1 ? (
              <button
                type="button"
                onClick={() => setClueIndex((i) => i + 1)}
                className="mt-3 text-sm font-semibold text-forest underline-offset-2 hover:underline"
              >
                Need another clue
              </button>
            ) : null}
            {feedback ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-forest">{feedback}</p>
                <button
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    setClueIndex(0);
                    setGuessRound(buildGuessRound());
                  }}
                  className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper"
                >
                  Play again
                </button>
              </div>
            ) : null}
          </div>
        ) : game.id === "know-your-library" && quiz ? (
          <div className="mt-5">
            <p className="font-serif text-lg text-forest">{quiz.question}</p>
            <div className="mt-4 grid gap-2">
              {quiz.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={!!feedback}
                  onClick={() =>
                    setFeedback(
                      opt === quiz.answer
                        ? "Exactly — you know your shelf."
                        : `Close! You gave 5★ to ${quiz.answer}.`,
                    )
                  }
                  className="rounded-2xl border border-[#e0d1bf] bg-[#f7f0e6] px-4 py-2.5 text-left text-sm font-semibold text-forest hover:border-forest/40"
                >
                  {opt}
                </button>
              ))}
            </div>
            {feedback ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-forest">{feedback}</p>
                <button
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    setQuiz(buildLibraryQuiz());
                  }}
                  className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper"
                >
                  Another question
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
