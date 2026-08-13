"use client";

import { buildPeriodSnapshot } from "@/components/insights/calculate";
import { DEMO_STREAK_DAYS } from "@/components/insights/demo-sessions";
import { shouldSeedDemo } from "@/lib/user-storage";
import type { BuddyRead } from "@/components/profile/types";
import { getBookById } from "@/components/search/data";
import type {
  DiscoverBook,
  DiscoveryState,
  LibraryEntry,
} from "@/components/search/types";
import type { OnboardingState } from "@/components/onboarding/data";

export type CurrentBookView = {
  entry: LibraryEntry;
  book: DiscoverBook;
  progressPct: number;
  pagesRead: number;
  pagesTotal: number;
};

export type SpineBook = {
  bookId: string;
  title: string;
  author: string;
  cover: string;
  color: string;
  dateFinished?: string;
};

export type MonthPreview = {
  booksFinished: number;
  hoursRead: number;
  avgRating: number;
  minutesRead: number;
  streakDays: number;
};

export function getGreeting(displayName: string, now = new Date()) {
  const h = now.getHours();
  const hello =
    h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const name = displayName.trim() || "Alex";
  return { hello, name, line: `${hello}, ${name}` };
}

export function resolvePagesTotal(entry: LibraryEntry, book: DiscoverBook) {
  if (entry.pagesRead && entry.progressPct && entry.progressPct > 0) {
    return Math.max(
      entry.pagesRead,
      Math.round(entry.pagesRead / (entry.progressPct / 100)),
    );
  }
  return book.pageCount;
}

export function getCurrentBook(
  discovery: DiscoveryState,
): CurrentBookView | null {
  const id = discovery.currentlyReadingId;
  const entry =
    (id ? discovery.entries.find((e) => e.bookId === id) : null) ??
    discovery.entries.find((e) => e.status === "reading") ??
    null;
  if (!entry) return null;
  const book = getBookById(entry.bookId);
  if (!book) return null;
  const progressPct = entry.progressPct ?? 0;
  const pagesRead = entry.pagesRead ?? 0;
  return {
    entry,
    book,
    progressPct,
    pagesRead,
    pagesTotal: resolvePagesTotal(entry, book),
  };
}

/** Recent finished books as shelf spines (by finish date desc). */
export function getRecentSpines(
  discovery: DiscoveryState,
  limit = 6,
): SpineBook[] {
  return discovery.entries
    .filter((e) => e.status === "read")
    .sort((a, b) => {
      const da = a.dateFinished ?? a.dateUpdated;
      const db = b.dateFinished ?? b.dateUpdated;
      return db.localeCompare(da);
    })
    .slice(0, limit)
    .map((e) => {
      const book = getBookById(e.bookId);
      if (!book) return null;
      return {
        bookId: e.bookId,
        title: book.title,
        author: book.author,
        cover: book.cover,
        color: book.color,
        dateFinished: e.dateFinished,
      };
    })
    .filter(Boolean) as SpineBook[];
}

export function getTbrBooks(discovery: DiscoveryState, limit = 8) {
  return discovery.entries
    .filter((e) => e.status === "tbr")
    .sort((a, b) => b.dateUpdated.localeCompare(a.dateUpdated))
    .slice(0, limit)
    .map((e) => {
      const book = getBookById(e.bookId);
      return book ? { entry: e, book } : null;
    })
    .filter(Boolean) as { entry: LibraryEntry; book: DiscoverBook }[];
}

export function getMonthPreview(discovery: DiscoveryState): MonthPreview {
  const snap = buildPeriodSnapshot(discovery, "month");
  const minutes = snap.minutesRead.value;
  return {
    booksFinished: snap.booksFinished.value,
    hoursRead: Math.round((minutes / 60) * 10) / 10,
    avgRating: snap.avgRating.value,
    minutesRead: minutes,
    streakDays: snap.streakDays.value || (shouldSeedDemo() ? DEMO_STREAK_DAYS : 0),
  };
}

export function getStreakDays(): number {
  return shouldSeedDemo() ? DEMO_STREAK_DAYS : 0;
}

export function getTodayGoalMinutes(onboarding: OnboardingState) {
  if (onboarding.goals.time.enabled) return onboarding.goals.time.value;
  return 30;
}

export function getUpcomingFromBuddyReads(buddyReads: BuddyRead[]) {
  return buddyReads
    .filter((b) => b.status === "active" || b.status === "pending")
    .map((b) => {
      const book = getBookById(b.bookId);
      return {
        id: b.id,
        kind: "buddy" as const,
        title: `Buddy read with ${b.friendName}`,
        subtitle: book
          ? `${book.title} · you ${b.myProgress}% · ${b.friendName} ${b.friendProgress}%`
          : `With ${b.friendName}`,
        targetEndDate: b.targetEndDate,
        bookCover: book?.cover,
        bookColor: book?.color,
      };
    });
}

export const DEMO_READING_PARTY = {
  id: "party-cozy",
  kind: "party" as const,
  title: "Cozy Fantasy Hour",
  subtitle: "Tonight · 8pm · soft books & tea",
  targetEndDate: undefined as string | undefined,
  bookCover: undefined as string | undefined,
  bookColor: undefined as string | undefined,
};
