import { useCallback, useEffect, useMemo, useState } from "react";
import { computeFeedback } from "./feedback";
import {
  MAX_EMOJI_GUESSES,
  coverUrlFor,
  dealEmojiPuzzle,
} from "./puzzles";
import type { EmojiBook, EmojiGuess, EmojiPhase, EmojiPuzzle } from "./types";

export const MAX_EMOJI_HINTS = 2;

export function useEmojiGame() {
  const [puzzle, setPuzzle] = useState<EmojiPuzzle | null>(null);
  const [guesses, setGuesses] = useState<EmojiGuess[]>([]);
  const [phase, setPhase] = useState<EmojiPhase>("playing");
  const [shareCopied, setShareCopied] = useState(false);
  const [hints, setHints] = useState<string[]>([]);

  useEffect(() => {
    setPuzzle(dealEmojiPuzzle());
  }, []);

  const remaining = MAX_EMOJI_GUESSES - guesses.length;
  const won = guesses.some((g) => g.feedback === "exact_book");

  const guess = useCallback(
    (book: EmojiBook) => {
      if (!puzzle || phase !== "playing") return;
      const already = guesses.some(
        (g) => g.title.toLowerCase() === book.title.toLowerCase(),
      );
      if (already) return;

      const feedback = computeFeedback(book, puzzle.book);
      const next: EmojiGuess[] = [
        ...guesses,
        {
          guessNumber: guesses.length + 1,
          feedback,
          title: book.title,
          author: book.author,
        },
      ];
      setGuesses(next);
      if (feedback === "exact_book" || next.length >= MAX_EMOJI_GUESSES) {
        setPhase("revealed");
      }
    },
    [guesses, phase, puzzle],
  );

  const restart = useCallback(() => {
    setPuzzle(dealEmojiPuzzle());
    setGuesses([]);
    setPhase("playing");
    setShareCopied(false);
    setHints([]);
  }, []);

  const shareText = useMemo(() => {
    if (!puzzle) return "";
    const score = won
      ? `${guesses.length}/${MAX_EMOJI_GUESSES}`
      : `X/${MAX_EMOJI_GUESSES}`;
    const grid = guesses
      .map((g) =>
        g.feedback === "exact_book"
          ? "🟩"
          : g.feedback === "same_author"
            ? "🟨"
            : g.feedback === "same_genre_decade"
              ? "🟧"
              : "⬛",
      )
      .join("");
    return `Uncovered · Emoji ${score}\n${puzzle.emojiSequence.join(" ")}\n${grid}`;
  }, [guesses, puzzle, won]);

  const share = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      setShareCopied(false);
    }
  }, [shareText]);

  const hintsLeft = MAX_EMOJI_HINTS - hints.length;
  const canUseHint = phase === "playing" && hintsLeft > 0 && !!puzzle;

  const useHint = useCallback(() => {
    if (!puzzle || phase !== "playing") return;
    const next = nextHint(puzzle, hints.length);
    if (!next) return;
    setHints((prev) => [...prev, next]);
  }, [puzzle, phase, hints.length]);

  return {
    puzzle,
    guesses,
    phase,
    remaining,
    won,
    coverUrl: puzzle ? coverUrlFor(puzzle.book) : null,
    shareCopied,
    hints,
    hintsLeft,
    canUseHint,
    guess,
    restart,
    share,
    useHint,
  };
}

function titleCaseTag(tag: string) {
  if (tag === "ya") return "YA";
  return tag
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function nextHint(puzzle: EmojiPuzzle, used: number): string | null {
  const { book } = puzzle;
  if (used === 0) {
    const genre = titleCaseTag(book.genreTags[0] ?? "fiction");
    const decade = `${Math.floor(book.publicationYear / 10) * 10}s`;
    return `${genre} · ${decade}`;
  }
  if (used === 1) return `By ${book.author}`;
  return null;
}
