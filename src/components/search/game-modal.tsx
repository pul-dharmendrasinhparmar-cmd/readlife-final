"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { BookleApp } from "@/components/games/bookle/BookleApp";
import { BookwormApp } from "@/components/games/bookworm/BookwormApp";
import { LexiconApp } from "@/components/games/lexicon/LexiconApp";
import { UncoveredApp } from "@/components/games/uncovered/UncoveredApp";
import { PiecesApp } from "@/components/games/pieces/PiecesApp";
import { TrolleyApp } from "@/components/games/trolley/TrolleyApp";
import { BookboundApp } from "@/components/games/bookbound/BookboundApp";
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
    game?.id === "bookle" ||
    game?.id === "bookworm" ||
    game?.id === "lexicon" ||
    game?.id === "uncovered" ||
    game?.id === "pieces" ||
    game?.id === "trolley" ||
    game?.id === "bookbound";

  useEffect(() => {
    if (!open || !game) return;
    setFeedback(null);
    setClueIndex(0);
    if (game.id === "guess-the-book") setGuessRound(buildGuessRound());
    if (game.id === "know-your-library") setQuiz(buildLibraryQuiz());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && game.id !== "bookbound") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, game, onClose]);

  const answerTitle = useMemo(() => {
    if (!guessRound) return "";
    return DISCOVER_BOOKS.find((b) => b.id === guessRound.answerId)?.title ?? "";
  }, [guessRound]);

  if (!open || !game) return null;

  const fullscreenSize =
    game.id === "lexicon"
      ? "max-md:h-[100dvh] h-[min(96svh,920px)] max-w-4xl"
      : game.id === "uncovered"
        ? "max-md:h-[100dvh] h-[min(96svh,920px)] max-w-xl"
        : game.id === "pieces"
          ? "max-md:h-[100dvh] h-[min(96svh,960px)] max-w-3xl"
          : game.id === "trolley"
            ? "max-md:h-[100dvh] h-[min(96svh,920px)] max-w-md"
            : game.id === "bookbound"
              ? "max-md:h-[100dvh] h-[min(96svh,760px)] max-w-5xl"
              : "max-md:h-[100dvh] h-[min(96svh,960px)] max-w-3xl";

  return (
    <div className="fixed inset-0 z-[70] flex items-stretch justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#2a2438]/55 backdrop-blur-[2px] max-md:hidden"
        aria-label="Close game"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={
          isFullscreenGame
            ? `relative z-10 flex w-full flex-col overflow-hidden border-[#4a425c] bg-[#3a324f] shadow-[0_24px_60px_rgba(42,36,56,0.25)] max-md:rounded-none max-md:border-0 sm:rounded-[1.5rem] sm:border ${fullscreenSize}`
            : "relative z-10 m-3 w-full max-w-lg rounded-[1.5rem] border border-[#4a425c] bg-[#3a324f] p-6 shadow-[0_24px_60px_rgba(42,36,56,0.25)] sm:m-0"
        }
      >
        <div
          className={
            isFullscreenGame
              ? "flex shrink-0 items-start justify-between gap-3 border-b border-[#4a425c]/80 px-4 py-2.5 pt-[max(0.65rem,env(safe-area-inset-top))] sm:px-5 sm:py-3 sm:pt-3"
              : "flex items-start justify-between gap-3"
          }
        >
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
              Mini game
            </p>
            <h2
              id={titleId}
              className="mt-0.5 truncate font-serif text-xl font-semibold text-ink sm:mt-1 sm:text-2xl"
            >
              {game.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-ink hover:bg-[#3f3654] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
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
        ) : game.id === "lexicon" && game.playable ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <LexiconApp />
          </div>
        ) : game.id === "uncovered" && game.playable ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <UncoveredApp onBackToGames={onClose} />
          </div>
        ) : game.id === "pieces" && game.playable ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PiecesApp onBackToGames={onClose} />
          </div>
        ) : game.id === "trolley" && game.playable ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <TrolleyApp onBackToGames={onClose} />
          </div>
        ) : game.id === "bookbound" && game.playable ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <BookboundApp onBackToGames={onClose} />
          </div>
        ) : !game.playable ? (
          <div className="mt-6 rounded-2xl border border-[#4a425c] bg-[#2a2438]/80 px-4 py-8 text-center">
            <p className="font-serif text-lg font-semibold text-ink">
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
            <p className="mt-2 rounded-2xl bg-[#2a2438] px-4 py-3 font-serif text-base text-ink">
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
                  className="rounded-2xl border border-[#564d6a] bg-[#342c45] px-4 py-2.5 text-left text-sm font-semibold text-ink hover:border-forest/40 disabled:opacity-70"
                >
                  {opt}
                </button>
              ))}
            </div>
            {!feedback && clueIndex < guessRound.clues.length - 1 ? (
              <button
                type="button"
                onClick={() => setClueIndex((i) => i + 1)}
                className="mt-3 text-sm font-semibold text-ink underline-offset-2 hover:underline"
              >
                Need another clue
              </button>
            ) : null}
            {feedback ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">{feedback}</p>
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
            <p className="font-serif text-lg text-ink">{quiz.question}</p>
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
                  className="rounded-2xl border border-[#564d6a] bg-[#342c45] px-4 py-2.5 text-left text-sm font-semibold text-ink hover:border-forest/40"
                >
                  {opt}
                </button>
              ))}
            </div>
            {feedback ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">{feedback}</p>
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
