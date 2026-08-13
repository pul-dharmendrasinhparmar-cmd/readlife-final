"use client";

import { shouldSeedDemo, storageKey } from "@/lib/user-storage";

export type FavoriteQuote = {
  id: string;
  text: string;
  bookTitle: string;
  author: string;
  createdAt: string;
};

const KEY = "readlife-quotes-v1";

const SEED: FavoriteQuote[] = [
  {
    id: "q-circus-1",
    text: "The circus arrives without warning. No announcements precede it…",
    bookTitle: "The Night Circus",
    author: "Erin Morgenstern",
    createdAt: "2026-07-22T20:00:00.000Z",
  },
  {
    id: "q-piranesi-1",
    text: "The Beauty of the House is immeasurable; its Kindness infinite.",
    bookTitle: "Piranesi",
    author: "Susanna Clarke",
    createdAt: "2026-08-02T19:00:00.000Z",
  },
  {
    id: "q-circe-1",
    text: "I thought: I cannot bear this world a moment longer. Then I laugh at myself.",
    bookTitle: "Circe",
    author: "Madeline Miller",
    createdAt: "2026-08-05T21:30:00.000Z",
  },
];

function defaults(): FavoriteQuote[] {
  return shouldSeedDemo() ? [...SEED] : [];
}

export function loadQuotes(): FavoriteQuote[] {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(storageKey(KEY));
    if (!raw) {
      const fresh = defaults();
      if (shouldSeedDemo()) {
        localStorage.setItem(storageKey(KEY), JSON.stringify(fresh));
      }
      return fresh;
    }
    const parsed = JSON.parse(raw) as FavoriteQuote[];
    if (!Array.isArray(parsed)) return defaults();
    if (shouldSeedDemo() && !parsed.length) return [...SEED];
    return parsed;
  } catch {
    return defaults();
  }
}

export function saveQuotes(quotes: FavoriteQuote[]) {
  try {
    localStorage.setItem(storageKey(KEY), JSON.stringify(quotes));
  } catch {
    // ignore
  }
}

export function addQuote(
  input: Omit<FavoriteQuote, "id" | "createdAt">,
): FavoriteQuote[] {
  const next = [
    {
      ...input,
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString(),
    },
    ...loadQuotes(),
  ];
  saveQuotes(next);
  return next;
}

export function updateQuote(
  id: string,
  input: Omit<FavoriteQuote, "id" | "createdAt">,
): FavoriteQuote[] {
  const next = loadQuotes().map((quote) =>
    quote.id === id ? { ...quote, ...input } : quote,
  );
  saveQuotes(next);
  return next;
}

export function deleteQuote(id: string): FavoriteQuote[] {
  const next = loadQuotes().filter((quote) => quote.id !== id);
  saveQuotes(next);
  return next;
}
