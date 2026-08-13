import { loadDiscoveryState } from "@/lib/discovery-storage";

/**
 * User-facing AI feature directory.
 * When you ship a new GenAI surface, add it here — Mailbox reads this list.
 *
 * Prefer deep links with `?ai=` so destination pages can open the right panel.
 * `resolve: "book"` rewrites href to the reader's currently-reading book (or Night Circus).
 */
export type AiDirectoryEntry = {
  id: string;
  label: string;
  blurb: string;
  /** Static href; may be rewritten by resolveAiDirectoryHref */
  href: string;
  resolve?: "book";
};

export const AI_DIRECTORY: AiDirectoryEntry[] = [
  {
    id: "vibe-search",
    label: "Describe a vibe",
    blurb: "AI mood matches with why + Add to TBR",
    href: "/search?ai=vibe",
  },
  {
    id: "for-you",
    label: "For You",
    blurb: "Shelf-based AI picks on Discover",
    href: "/search?ai=foryou",
  },
  {
    id: "discover-tools",
    label: "Discover AI tools",
    blurb: "Taste twins, gifts, lists, friends",
    href: "/search?ai=tools",
  },
  {
    id: "tbr-coach",
    label: "TBR coach",
    blurb: "What to read next from your pile",
    href: "/library?ai=tbr",
  },
  {
    id: "book-chat",
    label: "Book chat",
    blurb: "Spoiler-safe Q&A on a book page",
    href: "/books/night-circus?ai=chat",
    resolve: "book",
  },
  {
    id: "review-polish",
    label: "Review polish",
    blurb: "AI cleanup while you write a review",
    href: "/books/night-circus?ai=review",
    resolve: "book",
  },
  {
    id: "personality-shelf",
    label: "Shelf for your type",
    blurb: "Personality-based catalog picks",
    href: "/profile?ai=shelf",
  },
  {
    id: "session-companion",
    label: "Session companion",
    blurb: "Prompts & journal after a session",
    href: "/home?ai=session",
  },
  {
    id: "habit-wrapped",
    label: "Habit coach & Wrapped",
    blurb: "Monthly/year AI reading story",
    href: "/insights?ai=habit",
  },
  {
    id: "daily-challenge",
    label: "Daily challenge",
    blurb: "Emoji book riddle on Games",
    href: "/games?ai=daily",
  },
  {
    id: "game-hints",
    label: "Adaptive game hints",
    blurb: "Soft AI hints in Bookle & Uncovered",
    href: "/games/bookle",
  },
];

/** Prefer currently-reading (or Night Circus) for book-page AI tools. */
export function resolveAiDirectoryHref(entry: AiDirectoryEntry): string {
  if (entry.resolve !== "book") return entry.href;
  if (typeof window === "undefined") return entry.href;
  try {
    const discovery = loadDiscoveryState();
    const bookId =
      discovery.currentlyReadingId ??
      discovery.entries.find((e) => e.status === "reading")?.bookId ??
      discovery.entries.find((e) => e.status === "tbr")?.bookId ??
      "night-circus";
    const ai = new URL(entry.href, "https://readlife.local").searchParams.get(
      "ai",
    );
    return `/books/${bookId}${ai ? `?ai=${ai}` : ""}`;
  } catch {
    return entry.href;
  }
}
