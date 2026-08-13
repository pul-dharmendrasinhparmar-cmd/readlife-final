/**
 * "From Your Shelf" — builds a Bookle ThemeSpec from finished Library books.
 * Fully client-side; no AI. Returns null when the shelf is empty or too thin.
 */

import { getBookById } from "@/components/search/data";
import type { DiscoverBook, DiscoveryState } from "@/components/search/types";

export const SHELF_THEME_ID = "from-your-shelf";

const FIVE_UPPER = /^[A-Z]{5}$/;
const MIN_WORDS = 15;
const MAX_WORDS = 30;
/** Need a few finished titles so the pool feels personalized, not padded. */
const MIN_READ_BOOKS = 3;

/** Curated proper nouns / thematic answers for seed catalog books when finished. */
const CURATED_BY_BOOK_ID: Record<string, string[]> = {
  hobbit: ["BILBO", "SMAUG", "SHIRE", "DWARF", "RINGS", "STING", "TROLL", "QUEST"],
  piranesi: ["HALLS", "TIDES", "HOUSE", "STONE", "OTHER", "WORLD", "WATER"],
  "night-circus": [
    "MAGIC",
    "NIGHT",
    "TENTS",
    "FLAME",
    "CLOCK",
    "STARS",
    "SPELL",
    "BLACK",
  ],
  "six-crows": ["HEIST", "CREWS", "CROWS", "KNIFE", "DOCKS", "NIGHT", "GOLDY"],
  circe: ["CIRCE", "NYMPH", "ISLES", "SPELL", "WITCH", "MYTHS", "SIREN"],
  achilles: ["SPEAR", "ILIAD", "GLORY", "FATES", "SWORD", "SHIPS", "GREEK"],
  "fourth-wing": ["WINGS", "FLAME", "RIDER", "SCALE", "BLADE", "STORM", "DRAKE"],
  acomaf: ["COURT", "MISTS", "POWER", "NIGHT", "QUEEN", "BLADE", "FAERY"],
  "evelyn-hugo": ["STARS", "FILMS", "DRAMA", "LOVER", "SCENE", "OSCAR", "GLITZ"],
  "legends-lattes": ["BREAD", "LATTE", "FOUND", "QUEST", "ORCUS", "STEAM", "CREAM"],
  "house-sky": ["HOUSE", "OCEAN", "CHILD", "MAGIC", "FOUND", "RULES", "HEART"],
  hamnet: ["PLAYS", "VERSE", "GRIEF", "HOUSE", "CHILD", "WORDS", "STAGE"],
  babel: ["BABEL", "TOWER", "WORDS", "MAGIC", "TOMES", "INKED"],
  "starless-sea": ["STARS", "OCEAN", "STORY", "DOORS", "BELOW", "LOVER", "WORLD"],
};

/** Genre → padding words (prefer dictionary-valid commons). */
const GENRE_FALLBACKS: Record<string, string[]> = {
  Fantasy: [
    "MAGIC",
    "ELVES",
    "QUEST",
    "SWORD",
    "SPELL",
    "CROWN",
    "TOWER",
    "REALM",
    "FLAME",
    "FAIRY",
  ],
  Romance: [
    "HEART",
    "LOVER",
    "CHARM",
    "FLAME",
    "DREAM",
    "SWEET",
    "COURT",
    "BLOOM",
    "VOWED",
    "KISSY",
  ],
  Mystery: [
    "CLUES",
    "CRIME",
    "TWIST",
    "GHOST",
    "HAUNT",
    "BLOOD",
    "ALIBI",
    "PROOF",
    "TRACE",
    "SHADE",
  ],
  Thriller: [
    "FEVER",
    "CHASE",
    "KNIFE",
    "STALK",
    "TWIST",
    "PANIC",
    "ALARM",
    "CRIME",
    "BLOOD",
    "NIGHT",
  ],
  Literary: [
    "PROSE",
    "NOVEL",
    "PAGES",
    "STORY",
    "VERSE",
    "THEME",
    "MOTIF",
    "DRAMA",
    "VOICE",
    "CRAFT",
  ],
  Historical: [
    "EPOCH",
    "KINGS",
    "QUEEN",
    "COURT",
    "CROWN",
    "REIGN",
    "SWORD",
    "PASTS",
    "YEARS",
    "ROYAL",
  ],
  "Sci-Fi": [
    "SPACE",
    "ORBIT",
    "PROBE",
    "ALIEN",
    "ROBOT",
    "LASER",
    "QUARK",
    "COMET",
    "LUNAR",
    "SOLAR",
  ],
  Adventure: [
    "QUEST",
    "TRAIL",
    "OCEAN",
    "SHIPS",
    "STORM",
    "CLIMB",
    "BRAVE",
    "RISKS",
    "TREKS",
    "ROUTE",
  ],
  Cozy: ["BREAD", "QUIET", "BAKED", "SOFTS", "COMFY", "STEAM", "LATTE", "TOAST", "SNUGS", "COCOA"],
  Humor: [
    "JOKES",
    "WITTY",
    "LAUGH",
    "FUNNY",
    "COMIC",
    "QUIPS",
    "IRONY",
    "SMILE",
    "PUNNY",
    "JESTS",
  ],
  Classics: [
    "EPICS",
    "MYTHS",
    "VERSE",
    "FABLE",
    "ILIAD",
    "TOMES",
    "CANON",
    "PROSE",
    "PAGES",
    "ODEON",
  ],
  YA: [
    "YOUTH",
    "CRUSH",
    "DRAMA",
    "REBEL",
    "SQUAD",
    "FIRST",
    "HEART",
    "DREAM",
    "TEENS",
    "PARTY",
  ],
  Contemporary: [
    "TODAY",
    "URBAN",
    "PHONE",
    "EMAIL",
    "DATES",
    "FLATS",
    "METRO",
    "APART",
    "LIVES",
    "ROOMS",
  ],
  "Magical Realism": [
    "MAGIC",
    "DREAM",
    "WEIRD",
    "STARS",
    "SPELL",
    "OTHER",
    "WORLD",
    "FANCY",
    "CHARM",
    "ODDLY",
  ],
  "Found Family": [
    "FOUND",
    "CREWS",
    "BONDS",
    "HOUSE",
    "HEART",
    "TRUST",
    "UNITY",
    "SHARE",
    "KINDS",
    "GROUP",
  ],
};

const DEFAULT_FALLBACKS = [
  "BOOKS",
  "STORY",
  "PAGES",
  "NOVEL",
  "PROSE",
  "TALES",
  "WORDS",
  "READS",
  "SHELF",
  "INKED",
  "TOMES",
  "VERSE",
  "THEME",
  "CRAFT",
  "DRAMA",
  "WORLD",
  "DREAM",
  "NIGHT",
  "STARS",
  "HEART",
];

type BackdropToken = {
  preset: string;
  skyGradient: string[];
  silhouetteColor?: string;
  overlayEffect?: string;
  overlayColor?: string;
};

export type ShelfThemeSpec = {
  bookId: string;
  title: string;
  author: string;
  tagline: string;
  accent: string;
  words: string[];
  backdrop: BackdropToken;
  schemaVersion: number;
};

type GenreVisual = {
  accent: string;
  backdrop: BackdropToken;
};

const GENRE_VISUALS: Record<string, GenreVisual> = {
  Fantasy: {
    accent: "#b08fce",
    backdrop: {
      preset: "shire-hills",
      skyGradient: ["#3a324f 0%", "#2a2438 38%", "#4a425c 70%", "#c9d4b8 100%"],
      silhouetteColor: "#5b4e8c",
      overlayEffect: "none",
      overlayColor: "#fff6d5",
    },
  },
  Romance: {
    accent: "#8b3a5a",
    backdrop: {
      preset: "generic-gradient",
      skyGradient: ["#3a324f 0%", "#f5e6e0 40%", "#edd4d0 72%", "#e0b8b8 100%"],
      silhouetteColor: "#5a2a3a",
      overlayEffect: "mist",
      overlayColor: "#b08fce",
    },
  },
  Mystery: {
    accent: "#4a3a5a",
    backdrop: {
      preset: "city-skyline",
      skyGradient: ["#f7f2ea 0%", "#ebe4dc 40%", "#ddd4ce 70%", "#cfc4bc 100%"],
      silhouetteColor: "#3a3532",
      overlayEffect: "mist",
      overlayColor: "#ffffff",
    },
  },
  Thriller: {
    accent: "#8b5a4a",
    backdrop: {
      preset: "hotel-snow",
      skyGradient: ["#f7f2ea 0%", "#ebe4dc 40%", "#ddd4ce 70%", "#cfc4bc 100%"],
      silhouetteColor: "#3a3532",
      overlayEffect: "snow",
      overlayColor: "#ffffff",
    },
  },
  Literary: {
    accent: "#6b5a3a",
    backdrop: {
      preset: "generic-gradient",
      skyGradient: ["#3a324f 0%", "#2a2438 45%", "#4a425c 100%"],
      silhouetteColor: "#3d3228",
      overlayEffect: "none",
      overlayColor: "#b08fce",
    },
  },
  "Sci-Fi": {
    accent: "#1f4d6e",
    backdrop: {
      preset: "mountains",
      skyGradient: ["#f0f4f8 0%", "#e0e8f0 40%", "#c8d4e0 75%", "#a8b8c8 100%"],
      silhouetteColor: "#2a3a4a",
      overlayEffect: "stars",
      overlayColor: "#b08fce",
    },
  },
  Adventure: {
    accent: "#5b4e8c",
    backdrop: {
      preset: "treeline",
      skyGradient: ["#3a324f 0%", "#2a2438 42%", "#e5e0d0 75%", "#d2d8c4 100%"],
      silhouetteColor: "#9a78c0",
      overlayEffect: "fireflies",
      overlayColor: "#b08fce",
    },
  },
  Cozy: {
    accent: "#6b4a2a",
    backdrop: {
      preset: "shire-hills",
      skyGradient: ["#3a324f 0%", "#f5edd8 40%", "#4a425c 75%", "#d4c4a0 100%"],
      silhouetteColor: "#4a3a28",
      overlayEffect: "fireflies",
      overlayColor: "#b08fce",
    },
  },
  Historical: {
    accent: "#5a4a3a",
    backdrop: {
      preset: "castle-towers",
      skyGradient: ["#3a324f 0%", "#f0e6d8 40%", "#e4d0c4 72%", "#d4b8a8 100%"],
      silhouetteColor: "#3d2a2a",
      overlayEffect: "mist",
      overlayColor: "#b08fce",
    },
  },
};

const DEFAULT_VISUAL: GenreVisual = {
  accent: "#5b4e8c",
  backdrop: {
    preset: "treeline",
    skyGradient: ["#3a324f 0%", "#2a2438 42%", "#e5e0d0 75%", "#d2d8c4 100%"],
    silhouetteColor: "#9a78c0",
    overlayEffect: "none",
    overlayColor: "#b08fce",
  },
};

function normalizeToken(raw: string): string | null {
  const cleaned = raw.toUpperCase().replace(/[^A-Z]/g, "");
  return FIVE_UPPER.test(cleaned) ? cleaned : null;
}

function tokenize(text: string): string[] {
  return text.split(/[^A-Za-z]+/).filter(Boolean);
}

function authorLastNameToken(author: string): string | null {
  const parts = tokenize(author);
  if (!parts.length) return null;
  return normalizeToken(parts[parts.length - 1]);
}

function extractFromBook(
  book: DiscoverBook,
  validSet: Set<string>,
): { preferred: string[]; curated: string[] } {
  const preferred: string[] = [];
  const curated: string[] = [];

  const last = authorLastNameToken(book.author);
  if (last && validSet.has(last)) preferred.push(last);

  for (const genre of book.genres) {
    for (const part of tokenize(genre)) {
      const t = normalizeToken(part);
      if (t && validSet.has(t)) preferred.push(t);
    }
  }

  for (const part of tokenize(book.description)) {
    const t = normalizeToken(part);
    if (t && validSet.has(t)) preferred.push(t);
  }

  for (const part of tokenize(book.title)) {
    const t = normalizeToken(part);
    if (t && validSet.has(t)) preferred.push(t);
  }

  const extras = CURATED_BY_BOOK_ID[book.id];
  if (extras) {
    for (const raw of extras) {
      const t = normalizeToken(raw);
      if (t) curated.push(t);
    }
  }

  return { preferred, curated };
}

function topGenres(books: DiscoverBook[], limit = 3): string[] {
  const counts = new Map<string, number>();
  for (const book of books) {
    for (const g of book.genres) {
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([g]) => g);
}

function collectFallbacks(genres: string[], validSet: Set<string>): string[] {
  const validPads: string[] = [];
  const anyPads: string[] = [];

  const pushList = (list: string[]) => {
    for (const raw of list) {
      const t = normalizeToken(raw);
      if (!t) continue;
      if (validSet.has(t)) validPads.push(t);
      else anyPads.push(t);
    }
  };

  for (const g of genres) {
    const list = GENRE_FALLBACKS[g];
    if (list) pushList(list);
  }
  pushList(DEFAULT_FALLBACKS);

  // Prefer dictionary words; only use non-valid pads if still short
  return [...validPads, ...anyPads];
}

function resolveVisual(genres: string[], books: DiscoverBook[]): GenreVisual {
  for (const g of genres) {
    if (GENRE_VISUALS[g]) return GENRE_VISUALS[g];
  }
  const firstColor = books[0]?.color;
  if (firstColor && firstColor.startsWith("#")) {
    return {
      accent: firstColor,
      backdrop: {
        ...DEFAULT_VISUAL.backdrop,
        silhouetteColor: firstColor,
      },
    };
  }
  return DEFAULT_VISUAL;
}

function dedupePush(target: string[], seen: Set<string>, words: string[]) {
  for (const w of words) {
    if (seen.has(w)) continue;
    seen.add(w);
    target.push(w);
    if (target.length >= MAX_WORDS) return;
  }
}

type DiscoveryLike = {
  entries?: { bookId: string; status: string }[];
  readBookIds?: string[];
};

export function getReadBooks(
  discovery: DiscoveryState | DiscoveryLike,
): DiscoverBook[] {
  const ids = new Set<string>();
  if (Array.isArray(discovery.readBookIds)) {
    for (const id of discovery.readBookIds) ids.add(id);
  }
  if (Array.isArray(discovery.entries)) {
    for (const e of discovery.entries) {
      if (e.status === "read") ids.add(e.bookId);
    }
  }
  const books: DiscoverBook[] = [];
  for (const id of ids) {
    const book = getBookById(id);
    if (book) books.push(book);
  }
  return books;
}

/**
 * Build a ThemeSpec from finished Library books.
 * @returns ThemeSpec or null if fewer than 15 usable words / no read books.
 */
export function buildShelfTheme(
  discoveryOrBooks: DiscoveryState | DiscoveryLike | DiscoverBook[],
  validGuesses: string[] | Set<string>,
): ShelfThemeSpec | null {
  const validSet =
    validGuesses instanceof Set ? validGuesses : new Set(validGuesses);

  const books = Array.isArray(discoveryOrBooks)
    ? discoveryOrBooks
    : getReadBooks(discoveryOrBooks);

  if (books.length === 0) return null;
  if (books.length < MIN_READ_BOOKS) return null;

  const preferred: string[] = [];
  const curated: string[] = [];
  for (const book of books) {
    const extracted = extractFromBook(book, validSet);
    preferred.push(...extracted.preferred);
    curated.push(...extracted.curated);
  }

  const genres = topGenres(books);
  const fallbacks = collectFallbacks(genres, validSet);

  const words: string[] = [];
  const seen = new Set<string>();

  // Curated proper nouns first (allowed even outside VALID_GUESSES)
  dedupePush(words, seen, curated);
  // Then dictionary-valid extracted tokens
  dedupePush(words, seen, preferred);
  // Pad with genre-adjacent fallbacks
  if (words.length < MIN_WORDS) {
    dedupePush(words, seen, fallbacks);
  }

  if (words.length < MIN_WORDS) return null;

  const visual = resolveVisual(genres, books);
  const n = books.length;

  return {
    bookId: SHELF_THEME_ID,
    title: "From Your Shelf",
    author: "Words drawn from your finished books",
    tagline: `Personalized from ${n} finished book${n === 1 ? "" : "s"}`,
    accent: visual.accent,
    words: words.slice(0, MAX_WORDS),
    backdrop: visual.backdrop,
    schemaVersion: 1,
  };
}

/** Soft parchment visual for the locked / empty-shelf card. */
export const SHELF_LOCKED_SUMMARY = {
  bookId: SHELF_THEME_ID,
  title: "From Your Shelf",
  author: "Your Library",
  tagline: "Finish a few books to unlock",
  accent: "#5b4e8c",
  schemaVersion: 1,
  backdrop: {
    preset: "treeline",
    skyGradient: ["#3a324f 0%", "#2a2438 42%", "#e5e0d0 75%", "#d2d8c4 100%"],
    silhouetteColor: "#9a78c0",
    overlayEffect: "none" as const,
    overlayColor: "#b08fce",
  },
};
