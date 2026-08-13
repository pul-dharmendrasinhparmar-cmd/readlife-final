"use client";

export type JournalEntry = {
  id: string;
  title: string;
  body: string;
  mood?: string;
  createdAt: string;
};

const KEY = "readlife-journal-v1";

const SEED: JournalEntry[] = [
  {
    id: "j-1",
    title: "After chapter twelve",
    body: "The tent felt colder tonight. I keep thinking about Celia’s gloves — how love can be a competition and a kindness at once.",
    mood: "wistful",
    createdAt: "2026-08-09T22:10:00.000Z",
  },
  {
    id: "j-2",
    title: "Rainy Sunday",
    body: "Read for forty minutes with Mochi on the armrest. No goals, just pages. Felt like coming home.",
    mood: "cozy",
    createdAt: "2026-08-03T16:40:00.000Z",
  },
];

export function loadJournal(): JournalEntry[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    const parsed = JSON.parse(raw) as JournalEntry[];
    return Array.isArray(parsed) && parsed.length ? parsed : [...SEED];
  } catch {
    return [...SEED];
  }
}

export function saveJournal(entries: JournalEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function addJournalEntry(
  input: Omit<JournalEntry, "id" | "createdAt">,
): JournalEntry[] {
  const next = [
    {
      ...input,
      id: `j-${Date.now()}`,
      createdAt: new Date().toISOString(),
    },
    ...loadJournal(),
  ];
  saveJournal(next);
  return next;
}

export function updateJournalEntry(
  id: string,
  input: Omit<JournalEntry, "id" | "createdAt">,
): JournalEntry[] {
  const next = loadJournal().map((entry) =>
    entry.id === id ? { ...entry, ...input } : entry,
  );
  saveJournal(next);
  return next;
}

export function deleteJournalEntry(id: string): JournalEntry[] {
  const next = loadJournal().filter((entry) => entry.id !== id);
  saveJournal(next);
  return next;
}
