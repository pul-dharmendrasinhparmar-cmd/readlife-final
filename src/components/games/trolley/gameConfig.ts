/** Tunable content for Trolley of Tales — ReadLife catalog edition. */

export type Genre = "fantasy" | "mystery" | "romance" | "adventure" | "literary";

export type GoodKind =
  | "book"
  | "featured"
  | "golden"
  | "bookmark"
  | "glasses"
  | "card"
  | "bulb"
  | "series";

export type BadKind =
  | "coffee"
  | "cake"
  | "cookie"
  | "torn"
  | "water"
  | "notify"
  | "spoiler"
  | "dust";

export type ItemKind = GoodKind | BadKind;

export type ThemeId = "default" | "city" | "dragon" | "future";

export type BookRec = {
  id: string;
  title: string;
  author: string;
  genre: Genre;
  featured?: boolean;
  url: string;
  color: string;
};

export const GAME_CONFIG = {
  name: "Trolley of Tales",
  tagline: "Catch the stories. Dodge the spills.",
  roundSeconds: 60,
  startingLives: 3,
  baseFallSpeed: 85,
  maxFallSpeed: 220,
  spawnEveryMs: 950,
  minSpawnEveryMs: 440,
  trolleyWidthPct: 28,
  catchYPct: 71,
  catchBandPct: 12,
  catchPadPct: 8,
  hazardCatchPadPct: 0,
  hazardWidthFactor: 0.62,
  trolleyMoveSpeed: 95,
  comboWindowMs: 1600,
  glassesSlowMs: 5000,
  glassesSlowFactor: 0.55,
  bookmarkMultiplierMs: 6000,
  bookmarkMultiplier: 2,
  storySparkChance: 0.04,
  rewardScoreThreshold: 200,
  rewardLabel: "Shelf Star — your trolley is overflowing.",
} as const;

export const BOOKS: BookRec[] = [
  {
    id: "night-circus",
    title: "The Night Circus",
    author: "Erin Morgenstern",
    genre: "fantasy",
    featured: true,
    url: "/books/night-circus",
    color: "#5b4e8c",
  },
  {
    id: "six-crows",
    title: "Six of Crows",
    author: "Leigh Bardugo",
    genre: "adventure",
    featured: true,
    url: "/books/six-crows",
    color: "#5c3d2e",
  },
  {
    id: "piranesi",
    title: "Piranesi",
    author: "Susanna Clarke",
    genre: "literary",
    featured: true,
    url: "/books/piranesi",
    color: "#3d5a6c",
  },
  {
    id: "circe",
    title: "Circe",
    author: "Madeline Miller",
    genre: "fantasy",
    url: "/books/circe",
    color: "#5a6b3a",
  },
  {
    id: "silent-patient",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "mystery",
    url: "/books/silent-patient",
    color: "#4a3a2a",
  },
  {
    id: "achilles",
    title: "The Song of Achilles",
    author: "Madeline Miller",
    genre: "romance",
    url: "/books/achilles",
    color: "#8b5a2b",
  },
  {
    id: "babel",
    title: "Babel",
    author: "R.F. Kuang",
    genre: "literary",
    url: "/books/babel",
    color: "#3a2f4a",
  },
  {
    id: "thursday-murder",
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    genre: "mystery",
    url: "/books/thursday-murder",
    color: "#5c4a2e",
  },
  {
    id: "starless-sea",
    title: "The Starless Sea",
    author: "Erin Morgenstern",
    genre: "fantasy",
    url: "/books/starless-sea",
    color: "#3a2f4a",
  },
];

export const ITEM_META: Record<
  ItemKind,
  { label: string; emoji: string; good: boolean; points?: number }
> = {
  book: { label: "Book", emoji: "📘", good: true, points: 10 },
  featured: { label: "Featured book", emoji: "📗", good: true, points: 20 },
  golden: { label: "Golden book", emoji: "📒", good: true, points: 50 },
  bookmark: { label: "Bookmark", emoji: "🔖", good: true },
  glasses: { label: "Reading glasses", emoji: "👓", good: true },
  card: { label: "Library card", emoji: "🪪", good: true },
  bulb: { label: "Idea bulb", emoji: "💡", good: true },
  series: { label: "Book series", emoji: "📚", good: true, points: 30 },
  coffee: { label: "Coffee spill", emoji: "☕", good: false },
  cake: { label: "Messy cake", emoji: "🍰", good: false },
  cookie: { label: "Crumby cookie", emoji: "🍪", good: false },
  torn: { label: "Torn page", emoji: "📄", good: false },
  water: { label: "Water drop", emoji: "💧", good: false },
  notify: { label: "Phone ping", emoji: "📱", good: false },
  spoiler: { label: "Spoiler card", emoji: "🙊", good: false },
  dust: { label: "Dust cloud", emoji: "🌫️", good: false },
};

export const SPAWN_WEIGHTS: { kind: ItemKind; weight: number }[] = [
  { kind: "book", weight: 34 },
  { kind: "featured", weight: 16 },
  { kind: "golden", weight: 5 },
  { kind: "bookmark", weight: 7 },
  { kind: "glasses", weight: 6 },
  { kind: "card", weight: 4 },
  { kind: "bulb", weight: 4 },
  { kind: "series", weight: 5 },
  { kind: "coffee", weight: 10 },
  { kind: "cake", weight: 7 },
  { kind: "cookie", weight: 7 },
  { kind: "torn", weight: 5 },
  { kind: "water", weight: 4 },
  { kind: "notify", weight: 3 },
  { kind: "spoiler", weight: 3 },
  { kind: "dust", weight: 3 },
];

export const STORY_SPARKS = [
  {
    id: "city",
    theme: "city" as ThemeId,
    label: "A hidden city",
    placeName: "Barrel District",
    blurb: "Lanterns, heists, and crooked streets fill the sky.",
    enterLine: "You roll into the Barrel — maps and crow feathers rain down.",
    boostGenre: "adventure" as Genre,
    bonusScore: 40,
    icon: "city",
  },
  {
    id: "dragon",
    theme: "dragon" as ThemeId,
    label: "A talking dragon",
    placeName: "Enchanted Keep",
    blurb: "Friendly scales and cozy stacks tumble down next.",
    enterLine: "Magic pours tea — watch for coffee spills in the keep!",
    boostGenre: "fantasy" as Genre,
    bonusScore: 40,
    icon: "dragon",
  },
  {
    id: "future",
    theme: "future" as ThemeId,
    label: "An endless house",
    placeName: "The House",
    blurb: "Tide-worn halls and statues drift through the portal.",
    enterLine: "The halls unfold — statues and star-charts rain in.",
    boostGenre: "literary" as Genre,
    bonusScore: 40,
    icon: "future",
  },
] as const;

export type StorySparkId = (typeof STORY_SPARKS)[number]["id"];

export type ReaderType = {
  id: string;
  title: string;
  blurb: string;
  genre: Genre;
};

export const READER_TYPES: ReaderType[] = [
  {
    id: "curious-explorer",
    title: "Curious Explorer",
    blurb: "You chase heists, maps, and new horizons.",
    genre: "adventure",
  },
  {
    id: "mystery-detective",
    title: "Mystery Detective",
    blurb: "Clues call to you — and you always open the next page.",
    genre: "mystery",
  },
  {
    id: "dreamweaver",
    title: "Dreamweaver",
    blurb: "Magic feels like home, and circuses open only at night.",
    genre: "fantasy",
  },
  {
    id: "soft-heart",
    title: "Soft Heart",
    blurb: "Love stories linger on your shelf the longest.",
    genre: "romance",
  },
  {
    id: "hall-walker",
    title: "Hall Walker",
    blurb: "You collect strange houses, languages, and labyrinths.",
    genre: "literary",
  },
];

export const THEME_BACKGROUNDS: Record<ThemeId, string> = {
  default: "theme-default",
  city: "theme-city",
  dragon: "theme-dragon",
  future: "theme-future",
};

export function pickWeightedKind(
  weights = SPAWN_WEIGHTS,
  boostGenre?: Genre | null,
): ItemKind {
  let pool = [...weights];
  if (boostGenre === "fantasy") {
    pool = pool.map((w) => {
      if (w.kind === "golden" || w.kind === "bulb" || w.kind === "featured") {
        return { ...w, weight: w.weight + 10 };
      }
      if (w.kind === "series") return { ...w, weight: w.weight + 5 };
      if (w.kind === "coffee" || w.kind === "cake" || w.kind === "cookie") {
        return { ...w, weight: w.weight + 8 };
      }
      if (w.kind === "torn" || w.kind === "water")
        return { ...w, weight: w.weight + 3 };
      return w;
    });
  }
  if (boostGenre === "adventure") {
    pool = pool.map((w) => {
      if (w.kind === "book" || w.kind === "featured" || w.kind === "series") {
        return { ...w, weight: w.weight + 12 };
      }
      if (w.kind === "bookmark" || w.kind === "card") {
        return { ...w, weight: w.weight + 3 };
      }
      if (w.kind === "dust" || w.kind === "notify")
        return { ...w, weight: w.weight + 3 };
      return w;
    });
  }
  if (boostGenre === "literary") {
    pool = pool.map((w) => {
      if (w.kind === "glasses" || w.kind === "featured" || w.kind === "bulb") {
        return { ...w, weight: w.weight + 10 };
      }
      if (w.kind === "book") return { ...w, weight: w.weight + 5 };
      if (w.kind === "spoiler" || w.kind === "notify")
        return { ...w, weight: w.weight + 4 };
      return w;
    });
  }

  const total = pool.reduce((s, w) => s + w.weight, 0);
  let roll = Math.random() * total;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.kind;
  }
  return "book";
}

export function sparkForGenre(genre: Genre) {
  return STORY_SPARKS.find((s) => s.boostGenre === genre) ?? null;
}

export function sparkForBookId(bookId?: string) {
  if (!bookId) return null;
  const book = BOOKS.find((b) => b.id === bookId);
  if (!book?.featured) return null;
  return sparkForGenre(book.genre);
}

export function booksForGenre(genre: Genre): BookRec[] {
  return BOOKS.filter((b) => b.genre === genre);
}

export function readerTypeFromCounts(
  counts: Partial<Record<Genre, number>>,
): ReaderType {
  let best: Genre = "adventure";
  let bestN = -1;
  for (const rt of READER_TYPES) {
    const n = counts[rt.genre] ?? 0;
    if (n > bestN) {
      bestN = n;
      best = rt.genre;
    }
  }
  return READER_TYPES.find((r) => r.genre === best) ?? READER_TYPES[0];
}
