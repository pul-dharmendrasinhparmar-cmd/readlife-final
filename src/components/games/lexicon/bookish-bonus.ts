/**
 * Bookish jargon bonus list for Wordsmith (ReadLife Scrabble).
 * Any real English word is legal; these award flat bonus points on top of
 * normal Scrabble scoring when played as a main or cross word.
 *
 * Tiers: +5 everyday · +10 readerly · +15 craft · +25 rarer craft
 */

export type BonusTier = 5 | 10 | 15 | 25;

export type BookishBonusEntry = {
  word: string;
  bonus: BonusTier;
  category:
    | "Everyday shelf"
    | "Readerly talk"
    | "Craft & structure"
    | "Rarer craft";
};

const RAW: Array<[string, BonusTier, BookishBonusEntry["category"]]> = [
  // —— +5 Everyday shelf ——
  ["BOOK", 5, "Everyday shelf"],
  ["BOOKS", 5, "Everyday shelf"],
  ["READ", 5, "Everyday shelf"],
  ["READER", 5, "Everyday shelf"],
  ["READING", 5, "Everyday shelf"],
  ["PAGE", 5, "Everyday shelf"],
  ["PAGES", 5, "Everyday shelf"],
  ["SHELF", 5, "Everyday shelf"],
  ["SHELVES", 5, "Everyday shelf"],
  ["NOVEL", 5, "Everyday shelf"],
  ["NOVELS", 5, "Everyday shelf"],
  ["POEM", 5, "Everyday shelf"],
  ["POEMS", 5, "Everyday shelf"],
  ["STORY", 5, "Everyday shelf"],
  ["STORIES", 5, "Everyday shelf"],
  ["TALE", 5, "Everyday shelf"],
  ["TALES", 5, "Everyday shelf"],
  ["AUTHOR", 5, "Everyday shelf"],
  ["WRITER", 5, "Everyday shelf"],
  ["LIBRARY", 5, "Everyday shelf"],
  ["CHAPTER", 5, "Everyday shelf"],
  ["POET", 5, "Everyday shelf"],
  ["ESSAY", 5, "Everyday shelf"],
  ["INK", 5, "Everyday shelf"],
  ["SPINE", 5, "Everyday shelf"],
  ["PLOT", 5, "Everyday shelf"],
  ["THEME", 5, "Everyday shelf"],
  ["GENRE", 5, "Everyday shelf"],
  ["PROSE", 5, "Everyday shelf"],
  ["VERSE", 5, "Everyday shelf"],
  ["EPIC", 5, "Everyday shelf"],
  ["MYTH", 5, "Everyday shelf"],
  ["SAGA", 5, "Everyday shelf"],
  ["TOME", 5, "Everyday shelf"],
  ["LORE", 5, "Everyday shelf"],
  ["COZY", 5, "Everyday shelf"],
  ["SKIM", 5, "Everyday shelf"],

  // —— +10 Readerly talk ——
  ["BOOKMARK", 10, "Readerly talk"],
  ["HARDCOVER", 10, "Readerly talk"],
  ["PAPERBACK", 10, "Readerly talk"],
  ["EBOOK", 10, "Readerly talk"],
  ["AUDIOBOOK", 10, "Readerly talk"],
  ["BOOKISH", 10, "Readerly talk"],
  ["BOOKWORM", 10, "Readerly talk"],
  ["REREAD", 10, "Readerly talk"],
  ["DEVOUR", 10, "Readerly talk"],
  ["TROPE", 10, "Readerly talk"],
  ["TROPES", 10, "Readerly talk"],
  ["HEROINE", 10, "Readerly talk"],
  ["VILLAIN", 10, "Readerly talk"],
  ["MEMOIR", 10, "Readerly talk"],
  ["FICTION", 10, "Readerly talk"],
  ["FANTASY", 10, "Readerly talk"],
  ["MYSTERY", 10, "Readerly talk"],
  ["ROMANCE", 10, "Readerly talk"],
  ["HORROR", 10, "Readerly talk"],
  ["THRILLER", 10, "Readerly talk"],
  ["POETRY", 10, "Readerly talk"],
  ["CANON", 10, "Readerly talk"],
  ["CLASSIC", 10, "Readerly talk"],
  ["BESTSELLER", 10, "Readerly talk"],
  ["BOOKSTORE", 10, "Readerly talk"],
  ["BOOKSHOP", 10, "Readerly talk"],
  ["BOOKCLUB", 10, "Readerly talk"],
  ["LIBRARIAN", 10, "Readerly talk"],
  ["SEQUEL", 10, "Readerly talk"],
  ["PREQUEL", 10, "Readerly talk"],
  ["BLURB", 10, "Readerly talk"],
  ["QUILL", 10, "Readerly talk"],
  ["SCROLL", 10, "Readerly talk"],
  ["FABLE", 10, "Readerly talk"],
  ["NOIR", 10, "Readerly talk"],
  ["IRONY", 10, "Readerly talk"],
  ["EDITING", 10, "Readerly talk"],
  ["SIDEKICK", 10, "Readerly talk"],
  ["PAGETURNER", 10, "Readerly talk"],
  ["DOGEARED", 10, "Readerly talk"],
  ["PERUSE", 10, "Readerly talk"],

  // —— +15 Craft & structure ——
  ["PROLOGUE", 15, "Craft & structure"],
  ["EPILOGUE", 15, "Craft & structure"],
  ["PREFACE", 15, "Craft & structure"],
  ["FOREWORD", 15, "Craft & structure"],
  ["AFTERWORD", 15, "Craft & structure"],
  ["CLIMAX", 15, "Craft & structure"],
  ["FLASHBACK", 15, "Craft & structure"],
  ["SUBPLOT", 15, "Craft & structure"],
  ["BACKSTORY", 15, "Craft & structure"],
  ["NARRATOR", 15, "Craft & structure"],
  ["DIALOGUE", 15, "Craft & structure"],
  ["MONOLOGUE", 15, "Craft & structure"],
  ["METAPHOR", 15, "Craft & structure"],
  ["SIMILE", 15, "Craft & structure"],
  ["IMAGERY", 15, "Craft & structure"],
  ["ALLUSION", 15, "Craft & structure"],
  ["MOTIF", 15, "Craft & structure"],
  ["CLIFFHANGER", 15, "Craft & structure"],
  ["NOVELLA", 15, "Craft & structure"],
  ["TRILOGY", 15, "Craft & structure"],
  ["FOOTNOTE", 15, "Craft & structure"],
  ["GLOSSARY", 15, "Craft & structure"],
  ["APPENDIX", 15, "Craft & structure"],
  ["STANZA", 15, "Craft & structure"],
  ["SONNET", 15, "Craft & structure"],
  ["HAIKU", 15, "Craft & structure"],
  ["BALLAD", 15, "Craft & structure"],
  ["COUPLET", 15, "Craft & structure"],
  ["CADENCE", 15, "Craft & structure"],
  ["SATIRE", 15, "Craft & structure"],
  ["ALLEGORY", 15, "Craft & structure"],
  ["PARABLE", 15, "Craft & structure"],
  ["GOTHIC", 15, "Craft & structure"],
  ["NARRATIVE", 15, "Craft & structure"],
  ["LITERARY", 15, "Craft & structure"],
  ["RESOLUTION", 15, "Craft & structure"],
  ["LYRICAL", 15, "Craft & structure"],
  ["REVISION", 15, "Craft & structure"],
  ["ANNOTATE", 15, "Craft & structure"],
  ["ENDNOTE", 15, "Craft & structure"],

  // —— +25 Rarer craft ——
  ["SYMBOLISM", 25, "Rarer craft"],
  ["FORESHADOW", 25, "Rarer craft"],
  ["ARCHETYPE", 25, "Rarer craft"],
  ["PROTAGONIST", 25, "Rarer craft"],
  ["ANTAGONIST", 25, "Rarer craft"],
  ["ANTIHERO", 25, "Rarer craft"],
  ["WORLDBUILDING", 25, "Rarer craft"],
  ["ANTHOLOGY", 25, "Rarer craft"],
  ["OMNIBUS", 25, "Rarer craft"],
  ["MANUSCRIPT", 25, "Rarer craft"],
  ["BIBLIOGRAPHY", 25, "Rarer craft"],
  ["DUSTJACKET", 25, "Rarer craft"],
  ["ENDPAPER", 25, "Rarer craft"],
  ["FLYLEAF", 25, "Rarer craft"],
  ["COLOPHON", 25, "Rarer craft"],
  ["FRONTISPIECE", 25, "Rarer craft"],
  ["PARCHMENT", 25, "Rarer craft"],
  ["VELLUM", 25, "Rarer craft"],
  ["CODEX", 25, "Rarer craft"],
  ["DYSTOPIAN", 25, "Rarer craft"],
  ["UTOPIAN", 25, "Rarer craft"],
  ["SPECULATIVE", 25, "Rarer craft"],
  ["NONFICTION", 25, "Rarer craft"],
  ["BIOGRAPHY", 25, "Rarer craft"],
  ["AUTOBIOGRAPHY", 25, "Rarer craft"],
  ["MARGINALIA", 25, "Rarer craft"],
];

const cleaned: BookishBonusEntry[] = [];
const seen = new Set<string>();
for (const [word, bonus, category] of RAW) {
  const w = word.toUpperCase().replace(/[^A-Z]/g, "");
  if (w.length < 2 || w.length > 15) continue;
  if (seen.has(w)) continue;
  seen.add(w);
  cleaned.push({ word: w, bonus, category });
}

export const BOOKISH_BONUS_WORDS: readonly BookishBonusEntry[] = cleaned.sort((a, b) =>
  a.bonus !== b.bonus ? a.bonus - b.bonus : a.word.localeCompare(b.word),
);

const BONUS_MAP = new Map(BOOKISH_BONUS_WORDS.map((e) => [e.word, e]));

export function bookishBonusFor(word: string): BookishBonusEntry | undefined {
  return BONUS_MAP.get(word.toUpperCase().replace(/[^A-Z]/g, ""));
}

export function totalBookishBonus(words: string[]): {
  bonus: number;
  hits: BookishBonusEntry[];
} {
  const hits: BookishBonusEntry[] = [];
  const used = new Set<string>();
  for (const raw of words) {
    const entry = bookishBonusFor(raw);
    if (!entry || used.has(entry.word)) continue;
    used.add(entry.word);
    hits.push(entry);
  }
  return {
    bonus: hits.reduce((s, h) => s + h.bonus, 0),
    hits,
  };
}

export function bookishBonusCount(): number {
  return BOOKISH_BONUS_WORDS.length;
}

/** All bonus words — also treated as always-valid dictionary entries. */
export function bookishBonusWordList(): string[] {
  return BOOKISH_BONUS_WORDS.map((e) => e.word);
}

export const BONUS_TIERS: ReadonlyArray<{
  bonus: BonusTier;
  category: BookishBonusEntry["category"];
  blurb: string;
}> = [
  {
    bonus: 5,
    category: "Everyday shelf",
    blurb: "Common bookish words you say every day.",
  },
  {
    bonus: 10,
    category: "Readerly talk",
    blurb: "Genres, formats, and reader slang.",
  },
  {
    bonus: 15,
    category: "Craft & structure",
    blurb: "Story craft, form, and book anatomy.",
  },
  {
    bonus: 25,
    category: "Rarer craft",
    blurb: "Trickier lit terms and bookish rarities.",
  },
];

export function wordsByTier(bonus: BonusTier): string[] {
  return BOOKISH_BONUS_WORDS.filter((e) => e.bonus === bonus).map((e) => e.word);
}
