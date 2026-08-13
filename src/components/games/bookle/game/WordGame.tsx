"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ThemeSelect from "../catalog/ThemeSelect";
import Backdrop from "./Backdrop";
import GameScreen from "./GameScreen";

const PUZZLES_PER_DAY = 3;

type Theme = {
  bookId: string;
  title: string;
  author: string;
  tagline: string;
  accent: string;
  words: string[];
  backdrop: {
    preset: string;
    skyGradient: string[];
    silhouetteColor?: string;
    overlayEffect?: string;
    overlayColor?: string;
  };
  schemaVersion: number;
};

type ThemeSummary = Omit<Theme, "words">;

type Catalog = {
  listThemes: () => Promise<ThemeSummary[]>;
  getTheme: (bookId: string) => Promise<Theme | null>;
  getDailyAnswers: (bookId: string, date: string | Date) => Promise<string[]>;
};

type Props = {
  catalog: Catalog;
  validGuesses: string[];
  /** When true, show a disabled "From Your Shelf" card at the top. */
  shelfLocked?: boolean;
  lockedShelfSummary?: ThemeSummary;
};

export default function WordGame({
  catalog,
  validGuesses,
  shelfLocked = false,
  lockedShelfSummary,
}: Props) {
  const [themes, setThemes] = useState<ThemeSummary[] | null>(null);
  const [bookId, setBookId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [dailyAnswers, setDailyAnswers] = useState<string[]>([]);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [results, setResults] = useState<{ won: boolean; guessCount: number }[]>(
    [],
  );
  const [phase, setPhase] = useState<"loading" | "select" | "playing" | "summary">(
    "loading",
  );

  useEffect(() => {
    catalog.listThemes().then((t) => {
      setThemes(t);
      setPhase("select");
    });
  }, [catalog]);

  useEffect(() => {
    if (!bookId) return;
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      catalog.getTheme(bookId),
      catalog.getDailyAnswers(bookId, today),
    ]).then(([t, answers]) => {
      setTheme(t);
      setDailyAnswers(answers);
      setPuzzleIndex(0);
      setResults([]);
      setPhase("playing");
    });
  }, [bookId, catalog]);

  const validWords = useMemo(() => {
    if (!theme) return validGuesses;
    return [...validGuesses, ...theme.words];
  }, [validGuesses, theme]);

  const handleBack = useCallback(() => {
    setBookId(null);
    setTheme(null);
    setPhase("select");
  }, []);

  const handlePuzzleEnd = useCallback(
    (result: { won: boolean; guessCount: number }) => {
      setResults((prev) => [...prev, result]);
    },
    [],
  );

  const handleNextPuzzle = useCallback(() => {
    if (puzzleIndex + 1 < PUZZLES_PER_DAY) {
      setPuzzleIndex((i) => i + 1);
    } else {
      setPhase("summary");
    }
  }, [puzzleIndex]);

  if (phase === "loading") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
          color: "#a89db8",
        }}
      >
        Loading...
      </div>
    );
  }

  if (phase === "select") {
    return (
      <ThemeSelect
        themes={themes}
        onSelect={setBookId}
        lockedShelf={shelfLocked ? lockedShelfSummary ?? null : null}
      />
    );
  }

  if (!theme || dailyAnswers.length === 0) return null;

  if (phase === "summary") {
    const wins = results.filter((r) => r.won).length;
    return (
      <Backdrop token={theme.backdrop} fullPage>
        <div
          className="game-panel"
          style={{ ["--accent" as string]: theme.accent }}
        >
          <header className="game-header">
            <button type="button" className="back-btn" onClick={handleBack}>
              ← Themes
            </button>
            <div className="game-title">
              <h1>{theme.title}</h1>
              <p>Daily Results</p>
            </div>
            <div />
          </header>
          <div className="daily-summary">
            <h2>Today&apos;s Puzzles Complete</h2>
            <div className="summary-row">
              {results.map((r, i) => (
                <div className="summary-item" key={i}>
                  <div className="label">Puzzle {i + 1}</div>
                  <div
                    className="value"
                    style={{
                      color: r.won ? "var(--correct)" : "var(--absent)",
                    }}
                  >
                    {r.won ? r.guessCount : "X"}/6
                  </div>
                </div>
              ))}
            </div>
            <p>{wins === 3 ? "Perfect sweep!" : `${wins}/3 solved`}</p>
            <p className="comeback">Come back tomorrow for more!</p>
          </div>
        </div>
      </Backdrop>
    );
  }

  return (
    <Backdrop token={theme.backdrop} fullPage>
      <PuzzleProgress
        results={results}
        current={puzzleIndex}
        total={PUZZLES_PER_DAY}
      />
      <GameScreen
        key={`${bookId}-${puzzleIndex}`}
        answer={dailyAnswers[puzzleIndex]}
        validWords={validWords}
        theme={theme}
        onBack={handleBack}
        onNewWord={handleNextPuzzle}
        onGameEnd={handlePuzzleEnd}
      />
    </Backdrop>
  );
}

function PuzzleProgress({
  results,
  current,
  total,
}: {
  results: { won: boolean; guessCount: number }[];
  current: number;
  total: number;
}) {
  return (
    <div
      className="puzzle-progress"
      style={{
        position: "absolute",
        top: 12,
        right: 16,
        zIndex: 2,
        padding: "6px 10px",
        borderRadius: 999,
        background: "rgba(251, 246, 238, 0.88)",
        border: "1px solid #4a425c",
      }}
    >
      {Array.from({ length: total }, (_, i) => {
        let cls = "puzzle-dot";
        if (i < results.length) cls += results[i].won ? " completed" : " failed";
        else if (i === current) cls += " active";
        return <div key={i} className={cls} />;
      })}
      <span>
        Puzzle {current + 1}/{total}
      </span>
    </div>
  );
}
