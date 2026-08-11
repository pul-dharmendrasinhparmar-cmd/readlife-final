import type { ReadingSession } from "./types";

/**
 * MOCK reading sessions for demo Analytics.
 * Totals for August 2026 ≈ 1476 minutes (24.6h) to match Dashboard preview.
 * Marked as mock in calculators when used for period overlays.
 */
export const DEMO_SESSIONS: ReadingSession[] = [
  // Late July → streak continuity
  { id: "s0", bookId: "night-circus", date: "2026-07-30", startHour: 21, minutes: 48, pagesRead: 32, format: "physical" },
  { id: "s1", bookId: "night-circus", date: "2026-07-31", startHour: 22, minutes: 55, pagesRead: 38, format: "physical" },
  // August
  { id: "s2", bookId: "night-circus", date: "2026-08-01", startHour: 21, minutes: 62, pagesRead: 44, format: "physical" },
  { id: "s3", bookId: "piranesi", date: "2026-08-01", startHour: 14, minutes: 28, pagesRead: 18, format: "ebook" },
  { id: "s4", bookId: "night-circus", date: "2026-08-02", startHour: 20, minutes: 41, pagesRead: 30, format: "physical" },
  { id: "s5", bookId: "legends-lattes", date: "2026-08-02", startHour: 9, minutes: 35, pagesRead: 28, format: "physical" },
  { id: "s6", bookId: "night-circus", date: "2026-08-03", startHour: 22, minutes: 70, pagesRead: 48, format: "physical" },
  { id: "s7", bookId: "fourth-wing", date: "2026-08-03", startHour: 18, minutes: 55, pagesRead: 0, format: "audiobook" },
  { id: "s8", bookId: "hamnet", date: "2026-08-04", startHour: 21, minutes: 64, pagesRead: 52, format: "physical" },
  { id: "s9", bookId: "night-circus", date: "2026-08-05", startHour: 20, minutes: 38, pagesRead: 26, format: "physical" },
  { id: "s10", bookId: "house-sky", date: "2026-08-05", startHour: 11, minutes: 42, pagesRead: 34, format: "physical" },
  { id: "s11", bookId: "piranesi", date: "2026-08-06", startHour: 21, minutes: 33, pagesRead: 22, format: "ebook" },
  { id: "s12", bookId: "circe", date: "2026-08-06", startHour: 8, minutes: 40, pagesRead: 0, format: "audiobook" },
  { id: "s13", bookId: "night-circus", date: "2026-08-07", startHour: 22, minutes: 64, pagesRead: 52, format: "physical" },
  { id: "s14", bookId: "evelyn-hugo", date: "2026-08-07", startHour: 15, minutes: 36, pagesRead: 30, format: "physical" },
  { id: "s15", bookId: "night-circus", date: "2026-08-08", startHour: 21, minutes: 42, pagesRead: 36, format: "physical" },
  { id: "s16", bookId: "six-crows", date: "2026-08-08", startHour: 19, minutes: 50, pagesRead: 40, format: "physical" },
  { id: "s17", bookId: "acomaf", date: "2026-08-09", startHour: 23, minutes: 58, pagesRead: 45, format: "ebook" },
  { id: "s18", bookId: "piranesi", date: "2026-08-09", startHour: 20, minutes: 28, pagesRead: 20, format: "ebook" },
  { id: "s19", bookId: "night-circus", date: "2026-08-10", startHour: 21, minutes: 42, pagesRead: 30, format: "physical" },
  { id: "s20", bookId: "project-hail", date: "2026-08-10", startHour: 7, minutes: 45, pagesRead: 0, format: "audiobook" },
  { id: "s21", bookId: "night-circus", date: "2026-08-11", startHour: 20, minutes: 36, pagesRead: 24, format: "physical" },
  { id: "s22", bookId: "babel", date: "2026-08-11", startHour: 13, minutes: 25, pagesRead: 18, format: "physical" },
];

/** Books treated as finished in August 2026 for monthly Insights (MOCK overlay). */
export const DEMO_AUGUST_FINISHED_IDS = [
  "legends-lattes",
  "hamnet",
  "house-sky",
  "fourth-wing",
  "evelyn-hugo",
  "six-crows",
  "circe",
  "acomaf",
] as const;

export const DEMO_STREAK_DAYS = 12;
