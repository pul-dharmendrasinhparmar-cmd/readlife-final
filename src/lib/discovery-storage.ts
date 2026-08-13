"use client";

import type {
  DiscoveryState,
  DiscoverBook,
  LibraryEntry,
  LibraryStatus,
  TbrEntry,
  TbrPriority,
  DiscoverySourceType,
  BookFormat,
} from "@/components/search/types";
import {
  DEFAULT_SAVED_LIST_IDS,
  SEED_LIBRARY_ENTRIES,
} from "@/components/library/seed";
import { shouldSeedDemo, storageKey } from "@/lib/user-storage";

const STORAGE_KEY = "readlife-discovery-v2";
const LEGACY_KEY = "readlife-discovery-v1";

function now() {
  return new Date().toISOString();
}

function deriveCompat(entries: LibraryEntry[]): Pick<
  DiscoveryState,
  "tbr" | "currentlyReadingId" | "readBookIds" | "userRatings"
> {
  const tbr: TbrEntry[] = entries
    .filter((e) => e.status === "tbr")
    .map((e) => ({
      bookId: e.bookId,
      priority: e.priority ?? "someday",
      note: e.note ?? "",
      sourceType: e.sourceType ?? "other",
      sourceName: e.sourceName,
      sourceUser: e.sourceUser,
      dateAdded: e.dateAdded,
    }));

  const reading = entries.filter((e) => e.status === "reading");
  const currentlyReadingId = reading[0]?.bookId ?? null;

  const readBookIds = entries
    .filter((e) => e.status === "read")
    .map((e) => e.bookId);

  const userRatings: Record<string, number> = {};
  entries.forEach((e) => {
    if (typeof e.rating === "number") userRatings[e.bookId] = e.rating;
  });

  return { tbr, currentlyReadingId, readBookIds, userRatings };
}

function withCompat(
  entries: LibraryEntry[],
  followingIds: string[],
  savedListIds: string[],
): DiscoveryState {
  return {
    entries,
    followingIds,
    savedListIds,
    ...deriveCompat(entries),
  };
}

/** Guest / marketing demo library (Alex). */
export const DEFAULT_DISCOVERY_STATE: DiscoveryState = withCompat(
  SEED_LIBRARY_ENTRIES,
  [],
  DEFAULT_SAVED_LIST_IDS,
);

/** Signed-in accounts start here — no books until the user adds them. */
export function emptyDiscoveryState(): DiscoveryState {
  return withCompat([], [], []);
}

function defaultStateForScope(): DiscoveryState {
  return shouldSeedDemo()
    ? structuredClone(DEFAULT_DISCOVERY_STATE)
    : emptyDiscoveryState();
}

function migrateLegacy(raw: string): DiscoveryState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<DiscoveryState> & {
      currentlyReadingId?: string | null;
      tbr?: TbrEntry[];
      readBookIds?: string[];
      userRatings?: Record<string, number>;
    };
    if (parsed.entries && Array.isArray(parsed.entries)) {
      return withCompat(
        parsed.entries,
        parsed.followingIds ?? [],
        parsed.savedListIds ?? DEFAULT_SAVED_LIST_IDS,
      );
    }

    // Build entries from v1 shape + seed fill for missing demo content
    const byId = new Map<string, LibraryEntry>();
    SEED_LIBRARY_ENTRIES.forEach((e) => byId.set(e.bookId, { ...e }));

    (parsed.tbr ?? []).forEach((t) => {
      byId.set(t.bookId, {
        bookId: t.bookId,
        status: "tbr",
        priority: t.priority,
        note: t.note,
        sourceType: t.sourceType,
        sourceName: t.sourceName,
        sourceUser: t.sourceUser,
        dateAdded: t.dateAdded,
        dateUpdated: t.dateAdded,
      });
    });

    if (parsed.currentlyReadingId) {
      const existing = byId.get(parsed.currentlyReadingId);
      byId.set(parsed.currentlyReadingId, {
        ...(existing ?? {
          bookId: parsed.currentlyReadingId,
          dateAdded: now(),
        }),
        bookId: parsed.currentlyReadingId,
        status: "reading",
        dateUpdated: now(),
        dateStarted: existing?.dateStarted ?? now(),
        progressPct: existing?.progressPct ?? 10,
      });
    }

    (parsed.readBookIds ?? []).forEach((id) => {
      if (byId.get(id)?.status === "reading") return;
      const existing = byId.get(id);
      byId.set(id, {
        ...(existing ?? { bookId: id, dateAdded: now() }),
        bookId: id,
        status: "read",
        rating: parsed.userRatings?.[id] ?? existing?.rating,
        dateUpdated: now(),
        dateFinished: existing?.dateFinished ?? now(),
        progressPct: 100,
      });
    });

    Object.entries(parsed.userRatings ?? {}).forEach(([id, rating]) => {
      const e = byId.get(id);
      if (e) byId.set(id, { ...e, rating });
    });

    return withCompat(
      [...byId.values()],
      parsed.followingIds ?? [],
      parsed.savedListIds ?? DEFAULT_SAVED_LIST_IDS,
    );
  } catch {
    return null;
  }
}

export function loadDiscoveryState(): DiscoveryState {
  if (typeof window === "undefined") return defaultStateForScope();
  try {
    const v2 = localStorage.getItem(storageKey(STORAGE_KEY));
    if (v2) {
      const parsed = JSON.parse(v2) as Partial<DiscoveryState>;
      // Authenticated users may legitimately have an empty library.
      if (Array.isArray(parsed.entries)) {
        const entries = parsed.entries.map((e) => {
          const status = (e as { status?: string }).status;
          if (status === "interested") {
            return { ...e, status: "tbr" as LibraryStatus, priority: e.priority ?? "someday" };
          }
          return e;
        });
        const next = withCompat(
          entries,
          parsed.followingIds ?? [],
          parsed.savedListIds ?? [],
        );
        saveDiscoveryState(next);
        return next;
      }
    }
    // Legacy guest migration only — never copy guest demo into a user namespace.
    if (shouldSeedDemo()) {
      const v1 = localStorage.getItem(LEGACY_KEY);
      if (v1) {
        const migrated = migrateLegacy(v1);
        if (migrated) {
          saveDiscoveryState(migrated);
          return migrated;
        }
      }
      return structuredClone(DEFAULT_DISCOVERY_STATE);
    }
    return emptyDiscoveryState();
  } catch {
    return defaultStateForScope();
  }
}

export function saveDiscoveryState(state: DiscoveryState) {
  try {
    const payload = withCompat(
      state.entries,
      state.followingIds,
      state.savedListIds,
    );
    localStorage.setItem(storageKey(STORAGE_KEY), JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function upsertEntry(
  state: DiscoveryState,
  bookId: string,
  patch: Partial<LibraryEntry> & { status?: LibraryStatus },
): DiscoveryState {
  const existing = state.entries.find((e) => e.bookId === bookId);
  const entry: LibraryEntry = {
    ...(existing ?? {
      bookId,
      status: "tbr" as LibraryStatus,
      dateAdded: now(),
      dateUpdated: now(),
    }),
    ...patch,
    bookId,
    status: patch.status ?? existing?.status ?? "tbr",
    dateAdded: existing?.dateAdded ?? patch.dateAdded ?? now(),
    dateUpdated: now(),
  };
  const entries = [
    ...state.entries.filter((e) => e.bookId !== bookId),
    entry,
  ];
  const next = withCompat(entries, state.followingIds, state.savedListIds);
  saveDiscoveryState(next);
  return next;
}

export function addToTbr(
  state: DiscoveryState,
  entry: Omit<TbrEntry, "dateAdded"> & { dateAdded?: string },
): DiscoveryState {
  return upsertEntry(state, entry.bookId, {
    status: "tbr",
    priority: entry.priority,
    note: entry.note,
    sourceType: entry.sourceType,
    sourceName: entry.sourceName,
    sourceUser: entry.sourceUser,
    dateAdded: entry.dateAdded ?? now(),
    history: [
      ...(state.entries.find((e) => e.bookId === entry.bookId)?.history ?? []),
      {
        at: now(),
        label: `Added to TBR · ${PRIORITY_LABELS[entry.priority].label}`,
      },
    ],
  });
}

export function setCurrentlyReading(
  state: DiscoveryState,
  bookId: string,
): DiscoveryState {
  const existing = state.entries.find((e) => e.bookId === bookId);
  return upsertEntry(state, bookId, {
    status: "reading",
    priority: undefined,
    dateStarted: existing?.dateStarted ?? now(),
    progressPct: existing?.progressPct && existing.progressPct > 0
      ? existing.progressPct
      : 1,
    history: [
      ...(existing?.history ?? []),
      { at: now(), label: "Started reading" },
    ],
  });
}

export function updateLibraryEntry(
  state: DiscoveryState,
  bookId: string,
  patch: Partial<LibraryEntry>,
): DiscoveryState {
  return upsertEntry(state, bookId, patch);
}

export function setLibraryStatus(
  state: DiscoveryState,
  bookId: string,
  status: LibraryStatus,
  extras: Partial<LibraryEntry> = {},
): DiscoveryState {
  const existing = state.entries.find((e) => e.bookId === bookId);
  const history = [...(existing?.history ?? [])];
  const stamp = now();

  if (status === "reading") history.push({ at: stamp, label: "Started reading" });
  if (status === "read") history.push({ at: stamp, label: "Finished" });
  if (status === "paused") {
    history.push({
      at: stamp,
      label: `Paused at ${extras.progressPct ?? existing?.progressPct ?? 0}%${
        extras.pauseReason ? ` · ${extras.pauseReason}` : ""
      }`,
    });
  }
  if (status === "dnf") {
    history.push({
      at: stamp,
      label: `DNF at ${extras.progressPct ?? existing?.progressPct ?? 0}%${
        extras.dnfReason ? ` · ${extras.dnfReason}` : ""
      }`,
    });
  }
  if (status === "tbr") {
    history.push({
      at: stamp,
      label: `Moved to TBR · ${
        PRIORITY_LABELS[extras.priority ?? existing?.priority ?? "someday"].label
      }`,
    });
  }

  return upsertEntry(state, bookId, {
    status,
    ...extras,
    dateStarted:
      status === "reading"
        ? extras.dateStarted ?? existing?.dateStarted ?? stamp
        : existing?.dateStarted,
    dateFinished: status === "read" ? stamp : existing?.dateFinished,
    datePaused: status === "paused" ? stamp : existing?.datePaused,
    dateDnf: status === "dnf" ? stamp : existing?.dateDnf,
    progressPct:
      status === "read"
        ? 100
        : extras.progressPct ?? existing?.progressPct,
    history,
  });
}

export function moveTbrPriority(
  state: DiscoveryState,
  bookId: string,
  priority: TbrPriority,
): DiscoveryState {
  return setLibraryStatus(state, bookId, "tbr", { priority });
}

export function removeFromLibrary(
  state: DiscoveryState,
  bookId: string,
): DiscoveryState {
  const entries = state.entries.filter((e) => e.bookId !== bookId);
  const next = withCompat(entries, state.followingIds, state.savedListIds);
  saveDiscoveryState(next);
  return next;
}

export function toggleFollow(
  state: DiscoveryState,
  readerId: string,
): DiscoveryState {
  const following = state.followingIds.includes(readerId)
    ? state.followingIds.filter((id) => id !== readerId)
    : [...state.followingIds, readerId];
  const next = withCompat(state.entries, following, state.savedListIds);
  saveDiscoveryState(next);
  return next;
}

export function toggleSavedList(
  state: DiscoveryState,
  listId: string,
): DiscoveryState {
  const saved = state.savedListIds.includes(listId)
    ? state.savedListIds.filter((id) => id !== listId)
    : [...state.savedListIds, listId];
  const next = withCompat(state.entries, state.followingIds, saved);
  saveDiscoveryState(next);
  return next;
}

export function getEntry(
  state: DiscoveryState,
  bookId: string,
): LibraryEntry | undefined {
  return state.entries.find((e) => e.bookId === bookId);
}

export function countByStatus(state: DiscoveryState) {
  const counts = {
    reading: 0,
    read: 0,
    tbr: 0,
    paused: 0,
    dnf: 0,
    favorites: 0,
    reviewed: 0,
    total: state.entries.length,
  };
  state.entries.forEach((e) => {
    counts[e.status] += 1;
    if (e.isFavorite) counts.favorites += 1;
    if (e.review) counts.reviewed += 1;
  });
  return counts;
}

export const PRIORITY_LABELS: Record<
  TbrPriority,
  { label: string; emoji: string; blurb: string }
> = {
  "read-next": {
    label: "Read Next",
    emoji: "🔥",
    blurb: "High priority.",
  },
  "read-soon": {
    label: "Read Soon",
    emoji: "🌿",
    blurb: "Planning to read relatively soon.",
  },
  someday: {
    label: "Someday",
    emoji: "☁️",
    blurb: "Interested, but no rush.",
  },
  "need-to-read": {
    label: "Need to Read",
    emoji: "📌",
    blurb: "Required / book club / commitment.",
  },
};

export const SOURCE_OPTIONS: { id: DiscoverySourceType; label: string }[] = [
  { id: "recommendation", label: "ReadLife Recommendation" },
  { id: "friend", label: "Friend" },
  { id: "reading_list", label: "Reading List" },
  { id: "booktok", label: "BookTok" },
  { id: "bookstagram", label: "Bookstagram" },
  { id: "booktube", label: "BookTube" },
  { id: "self", label: "Self-discovered" },
  { id: "other", label: "Other" },
];

export const FORMAT_LABELS: Record<BookFormat, string> = {
  physical: "Physical",
  ebook: "Ebook",
  audiobook: "Audiobook",
  manga: "Manga/Comic",
  mixed: "Mixed",
};

export const PAUSE_REASONS = [
  "Too busy",
  "Wrong mood",
  "Waiting for audiobook",
  "Need a break",
  "Too long",
  "Other",
];

export const DNF_REASONS = [
  "Not for me",
  "Pacing",
  "Writing style",
  "Characters",
  "Mood mismatch",
  "Too long",
  "Didn't connect",
  "Other",
];

export function getBookStatus(
  state: DiscoveryState,
  bookId: string,
): "READ" | "READING" | "TBR" | "PAUSED" | "DNF" | "NOT ADDED" {
  const entry = getEntry(state, bookId);
  if (!entry) return "NOT ADDED";
  switch (entry.status) {
    case "reading":
      return "READING";
    case "read":
      return "READ";
    case "tbr":
      return "TBR";
    case "paused":
      return "PAUSED";
    case "dnf":
      return "DNF";
  }
}

export function listProgress(
  state: DiscoveryState,
  bookIds: string[],
): { read: number; total: number; avgRating: number | null; onTbr: number } {
  const read = bookIds.filter((id) =>
    state.entries.some((e) => e.bookId === id && e.status === "read"),
  ).length;
  const onTbr = bookIds.filter((id) =>
    state.entries.some((e) => e.bookId === id && e.status === "tbr"),
  ).length;
  const ratings = bookIds
    .map((id) => getEntry(state, id)?.rating)
    .filter((r): r is number => typeof r === "number");
  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
        10
      : null;
  return { read, total: bookIds.length, avgRating, onTbr };
}

export function findBook(
  books: DiscoverBook[],
  id: string,
): DiscoverBook | undefined {
  return books.find((b) => b.id === id);
}

export function tbrAgeDays(entry: LibraryEntry) {
  const added = new Date(entry.dateAdded).getTime();
  return Math.floor((Date.now() - added) / (1000 * 60 * 60 * 24));
}
