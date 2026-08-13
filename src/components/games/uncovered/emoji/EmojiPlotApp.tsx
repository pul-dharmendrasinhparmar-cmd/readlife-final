"use client";

import { useEffect, useRef, useState } from "react";
import { FEEDBACK_LABEL } from "./feedback";
import { MAX_EMOJI_GUESSES, searchEmojiBooks } from "./puzzles";
import type { EmojiBook, EmojiGuess, FeedbackResult } from "./types";
import { useEmojiGame } from "./useEmojiGame";

type Props = {
  onChangeMode: () => void;
  onBackToGames?: () => void;
};

export function EmojiPlotApp({ onChangeMode, onBackToGames }: Props) {
  const g = useEmojiGame();

  const puzzle = g.puzzle;
  if (!puzzle) {
    return (
      <div className="unc-root">
        <div className="unc-shell">
          <p className="unc-scoreline" style={{ marginTop: "2rem" }}>
            Shuffling a plot…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="unc-root">
      <div className="unc-shell">
        <div className="unc-play unc-emoji-play">
          <p className="unc-kicker">Uncovered · Emoji</p>
          <button
            type="button"
            className="unc-mode-link"
            onClick={onChangeMode}
          >
            Switch mode
          </button>
          <p className="unc-scoreline">
            {g.phase === "playing"
              ? `${g.remaining} guess${g.remaining === 1 ? "" : "es"} left`
              : g.won
                ? `Solved in ${g.guesses.length}`
                : "Out of guesses"}
          </p>
          <div className="unc-emoji-prompt-row">
            <p className="unc-prompt">Which book is this plot?</p>
            <button
              type="button"
              className={`unc-hint-btn${g.canUseHint ? "" : " is-used"}`}
              onClick={g.useHint}
              disabled={!g.canUseHint}
              aria-label={
                g.canUseHint
                  ? `Use hint, ${g.hintsLeft} left`
                  : g.phase === "playing"
                    ? "No hints left"
                    : "Hints unavailable"
              }
              title={
                g.canUseHint
                  ? `Hint (${g.hintsLeft} left)`
                  : "No hints left"
              }
            >
              <HintBulbIcon />
              {g.phase === "playing" ? (
                <span className="unc-hint-count">{g.hintsLeft}</span>
              ) : null}
            </button>
          </div>

          <div className="unc-emoji-row" aria-label="Plot in five emojis">
            {puzzle.emojiSequence.map((emoji, i) => (
              <span key={`${puzzle.id}-${i}`} className="unc-emoji-beat">
                {emoji}
              </span>
            ))}
          </div>

          <p className="unc-emoji-hint">
            Opening → conflict → low point → turn → resolution
          </p>

          {g.hints.length > 0 ? (
            <ul className="unc-hint-list">
              {g.hints.map((hint, i) => (
                <li key={`${i}-${hint}`}>{hint}</li>
              ))}
            </ul>
          ) : null}

          <ol className="unc-emoji-grid">
            {g.guesses.map((item) => (
              <GuessRow key={item.guessNumber} guess={item} />
            ))}
            {Array.from({ length: MAX_EMOJI_GUESSES - g.guesses.length }).map(
              (_, i) => (
                <li key={`empty-${i}`} className="unc-emoji-slot" />
              ),
            )}
          </ol>

          {g.phase === "playing" ? (
            <GuessSearch onGuess={g.guess} />
          ) : (
            <Reveal
              won={g.won}
              title={puzzle.book.title}
              author={puzzle.book.author}
              coverUrl={g.coverUrl}
              emojis={puzzle.emojiSequence}
              rationale={puzzle.emojiRationale}
            />
          )}

          <div className="unc-emoji-legend" aria-label="Feedback key">
            <span>🟩 exact</span>
            <span>🟨 same author</span>
            <span>🟧 genre / decade</span>
            <span>⬛ none</span>
          </div>

          {g.phase === "revealed" ? (
            <div className="unc-emoji-actions">
              <button type="button" className="unc-cta" onClick={g.restart}>
                Next book
              </button>
              <button type="button" className="unc-cta-ghost" onClick={g.share}>
                {g.shareCopied ? "Copied!" : "Share result"}
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
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function HintBulbIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="unc-hint-icon"
      aria-hidden
    >
      <path
        d="M9.2 17.5h5.6M10 20h4"
        strokeLinecap="round"
      />
      <path
        d="M12 3.8a5.4 5.4 0 0 1 5.4 5.4c0 2.2-1.2 3.4-2.2 4.4-.6.6-.9 1.4-.9 2.2H9.7c0-.8-.3-1.6-.9-2.2-1-1-2.2-2.2-2.2-4.4A5.4 5.4 0 0 1 12 3.8Z"
        strokeLinejoin="round"
      />
      <path d="M12 7.2v2.2" strokeLinecap="round" />
    </svg>
  );
}

function GuessRow({ guess }: { guess: EmojiGuess }) {
  return (
    <li className={`unc-emoji-guess is-${guess.feedback}`}>
      <span className="unc-emoji-mark" title={FEEDBACK_LABEL[guess.feedback]}>
        {mark(guess.feedback)}
      </span>
      <span className="unc-emoji-guess-text">
        {guess.title}
        <span> — {guess.author}</span>
      </span>
    </li>
  );
}

function mark(feedback: FeedbackResult) {
  if (feedback === "exact_book") return "🟩";
  if (feedback === "same_author") return "🟨";
  if (feedback === "same_genre_decade") return "🟧";
  return "⬛";
}

function GuessSearch({ onGuess }: { onGuess: (book: EmojiBook) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EmojiBook[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setResults(searchEmojiBooks(query));
    }, 80);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(book: EmojiBook) {
    onGuess(book);
    setQuery("");
    setResults([]);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0) pick(results[active]!);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="unc-emoji-search">
      <input
        type="text"
        inputMode="search"
        autoComplete="off"
        value={query}
        placeholder="Guess a book title…"
        aria-label="Guess a book title"
        aria-autocomplete="list"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="unc-emoji-suggest"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open && results.length > 0 ? (
        <ul id="unc-emoji-suggest" role="listbox" className="unc-emoji-suggest">
          {results.map((book, i) => (
            <li key={book.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={i === active ? "is-active" : ""}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(book)}
              >
                <strong>{book.title}</strong>
                <span>
                  {book.author}
                  {book.publicationYear ? ` · ${book.publicationYear}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Reveal({
  won,
  title,
  author,
  coverUrl,
  emojis,
  rationale,
}: {
  won: boolean;
  title: string;
  author: string;
  coverUrl: string | null;
  emojis: string[];
  rationale: string[];
}) {
  return (
    <div className="unc-result unc-emoji-reveal">
      <p className={`unc-result-mark ${won ? "is-yes" : "is-no"}`}>
        {won ? "✓ SOLVED" : "✕ THE BOOK WAS"}
      </p>
      <div className="unc-emoji-book">
        {coverUrl ? (
          // Flip/reveal faces elsewhere need raw img; this is a static jacket.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" width={56} height={84} />
        ) : (
          <span className="unc-emoji-jacket" aria-hidden />
        )}
        <div>
          <h3 className="unc-result-title">{title}</h3>
          <p className="unc-result-meta">{author}</p>
        </div>
      </div>
      <ul className="unc-emoji-why">
        {emojis.map((emoji, i) => (
          <li key={i}>
            <span>{emoji}</span>
            <p>{rationale[i]}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
