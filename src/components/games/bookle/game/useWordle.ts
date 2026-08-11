"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

const STATUS_RANK: Record<string, number> = {
  unknown: 0,
  absent: 1,
  present: 2,
  correct: 3,
};

export type GuessRow = {
  word: string;
  result: string[];
};

function evaluateGuess(guess: string, answer: string): string[] {
  const result = Array(WORD_LENGTH).fill("absent");
  const answerLetters = answer.split("");
  const used = Array(WORD_LENGTH).fill(false);

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answerLetters[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const idx = answerLetters.findIndex(
      (letter, j) => letter === guess[i] && !used[j],
    );
    if (idx !== -1) {
      result[i] = "present";
      used[idx] = true;
    }
  }
  return result;
}

/** Positions already confirmed correct via a submitted guess. */
function correctFromGuesses(guesses: GuessRow[]): (string | null)[] {
  const known = Array(WORD_LENGTH).fill(null) as (string | null)[];
  for (const { word, result } of guesses) {
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i] === "correct") known[i] = word[i];
    }
  }
  return known;
}

export function useWordle({
  answer,
  validWords,
}: {
  answer: string;
  validWords: string[];
}) {
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [shakeRow, setShakeRow] = useState(false);
  const [message, setMessage] = useState("");
  const [hintUsed, setHintUsed] = useState(false);
  const [hinted, setHinted] = useState<(string | null)[]>(() =>
    Array(WORD_LENGTH).fill(null),
  );

  const validSet = useMemo(() => new Set(validWords), [validWords]);

  // Transient validation toasts — clear so the hint banner can return.
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => setMessage(""), 1600);
    return () => window.clearTimeout(id);
  }, [message]);

  const canUseHint = useMemo(() => {
    if (status !== "playing" || hintUsed) return false;
    const fromGuesses = correctFromGuesses(guesses);
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (!fromGuesses[i] && !hinted[i]) return true;
    }
    return false;
  }, [status, hintUsed, guesses, hinted]);

  const submitGuess = useCallback(() => {
    if (status !== "playing") return;
    if (current.length !== WORD_LENGTH) {
      setMessage("Not enough letters");
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 400);
      return;
    }
    if (!validSet.has(current)) {
      setMessage("Not in word list");
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 400);
      return;
    }

    const result = evaluateGuess(current, answer);
    const nextGuesses = [...guesses, { word: current, result }];
    setGuesses(nextGuesses);
    setCurrent("");
    setMessage("");

    if (current === answer) {
      setStatus("won");
    } else if (nextGuesses.length >= MAX_GUESSES) {
      setStatus("lost");
    }
  }, [current, answer, guesses, status, validSet]);

  const pressKey = useCallback(
    (key: string) => {
      if (status !== "playing") return;
      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACKSPACE") {
        setCurrent((c) => c.slice(0, -1));
      } else if (/^[A-Z]$/.test(key)) {
        setCurrent((c) => (c.length < WORD_LENGTH ? c + key : c));
      }
    },
    [status, submitGuess],
  );

  const useHint = useCallback(() => {
    if (status !== "playing" || hintUsed) return;

    const fromGuesses = correctFromGuesses(guesses);
    const candidates: number[] = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (!fromGuesses[i] && !hinted[i]) candidates.push(i);
    }
    if (candidates.length === 0) return;

    const index = candidates[Math.floor(Math.random() * candidates.length)];
    const letter = answer[index];
    setHinted((prev) => {
      const next = [...prev];
      next[index] = letter;
      return next;
    });
    setHintUsed(true);
    // Hint text lives in the inline hint-reveal banner only (not the toast).
    setMessage("");
  }, [status, hintUsed, guesses, hinted, answer]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === "ENTER") {
        e.preventDefault();
        pressKey("ENTER");
      } else if (key === "BACKSPACE") {
        e.preventDefault();
        pressKey("BACKSPACE");
      } else if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        pressKey(key);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pressKey]);

  const keyStatuses = useMemo(() => {
    const map: Record<string, string> = {};
    for (const { word, result } of guesses) {
      for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        const newStatus = result[i];
        if (STATUS_RANK[newStatus] > STATUS_RANK[map[letter] || "unknown"]) {
          map[letter] = newStatus;
        }
      }
    }
    for (const letter of hinted) {
      if (
        letter &&
        STATUS_RANK.correct > STATUS_RANK[map[letter] || "unknown"]
      ) {
        map[letter] = "correct";
      }
    }
    return map;
  }, [guesses, hinted]);

  const reset = useCallback(() => {
    setGuesses([]);
    setCurrent("");
    setStatus("playing");
    setMessage("");
    setHintUsed(false);
    setHinted(Array(WORD_LENGTH).fill(null));
  }, []);

  const hintLabel = useMemo(() => {
    const index = hinted.findIndex((letter) => letter !== null);
    if (index === -1) return null;
    return { index, letter: hinted[index]! };
  }, [hinted]);

  return {
    answer,
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
    maxGuesses: MAX_GUESSES,
    wordLength: WORD_LENGTH,
  };
}
