import { bookishBonusWordList } from "./bookish-bonus";

let wordSet: Set<string> | null = null;
let wordList: string[] | null = null;
let wordsByLen: Map<number, string[]> | null = null;

/** Everyday / bookish words ReadLife is allowed to *choose* as plays. */
let aiWordSet: Set<string> | null = null;
let aiWordsByLen: Map<number, string[]> | null = null;

let loadPromise: Promise<void> | null = null;

export function isDictReady(): boolean {
  return wordSet !== null && aiWordSet !== null;
}

export function englishWordCount(): number {
  return wordList?.length ?? 0;
}

export function isEnglishWord(word: string): boolean {
  if (!wordSet) return false;
  return wordSet.has(word.trim().toUpperCase());
}

/** True if ReadLife may intentionally play this as a main/cross word. */
export function isAiFriendlyWord(word: string): boolean {
  if (!aiWordSet) return false;
  return aiWordSet.has(word.trim().toUpperCase());
}

export function getWordsByLength(len: number): readonly string[] {
  return wordsByLen?.get(len) ?? [];
}

/** Candidate words for the AI (common English + bookish bonuses). */
export function getAiWordsByLength(len: number): readonly string[] {
  return aiWordsByLen?.get(len) ?? [];
}

export function getAllWords(): readonly string[] {
  return wordList ?? [];
}

function indexList(words: Iterable<string>): {
  set: Set<string>;
  byLen: Map<number, string[]>;
} {
  const set = new Set<string>();
  const byLen = new Map<number, string[]>();
  for (const raw of words) {
    const w = raw.trim().toUpperCase();
    if (w.length < 2 || w.length > 15 || !/^[A-Z]+$/.test(w)) continue;
    if (set.has(w)) continue;
    set.add(w);
    const arr = byLen.get(w.length);
    if (arr) arr.push(w);
    else byLen.set(w.length, [w]);
  }
  return { set, byLen };
}

function parseWordFile(text: string): string[] {
  return text
    .split(/\n+/)
    .map((w) => w.trim().toUpperCase())
    .filter((w) => w.length >= 2 && w.length <= 15 && /^[A-Z]+$/.test(w));
}

const DICT_URL = "/games/lexicon/english-words.txt?v=scrabble-nwl";
const AI_COMMON_URL = "/games/lexicon/ai-common-words.txt?v=common-20k";
let loadedUrl: string | null = null;

/** Load Scrabble dict + AI common vocab (idempotent per URL version). */
export function loadEnglishDictionary(): Promise<void> {
  const key = `${DICT_URL}|${AI_COMMON_URL}`;
  if (wordSet && aiWordSet && loadedUrl === key) return Promise.resolve();
  if (loadPromise && loadedUrl === key) return loadPromise;

  loadedUrl = key;
  loadPromise = (async () => {
    const [dictRes, aiRes] = await Promise.all([
      fetch(DICT_URL),
      fetch(AI_COMMON_URL),
    ]);
    if (!dictRes.ok) throw new Error("Failed to load dictionary");
    const dictText = await dictRes.text();
    const scrabble = parseWordFile(dictText);
    const full = indexList(scrabble);
    // Bookish bonuses always legal for everyone
    for (const w of bookishBonusWordList()) {
      if (!full.set.has(w)) {
        full.set.add(w);
        const arr = full.byLen.get(w.length);
        if (arr) arr.push(w);
        else full.byLen.set(w.length, [w]);
      }
    }
    wordSet = full.set;
    wordList = [...full.set];
    wordsByLen = full.byLen;

    const aiRaw = aiRes.ok ? parseWordFile(await aiRes.text()) : [];
    // AI may only *aim* for common/bookish words that are also Scrabble-legal
    const aiMerged = [
      ...aiRaw.filter((w) => full.set.has(w)),
      ...bookishBonusWordList(),
    ];
    // Allow a few everyday 2-letter crosses
    for (const w of [
      "AM",
      "AN",
      "AS",
      "AT",
      "BE",
      "BY",
      "DO",
      "GO",
      "HE",
      "HI",
      "IF",
      "IN",
      "IS",
      "IT",
      "ME",
      "MY",
      "NO",
      "OF",
      "OK",
      "ON",
      "OR",
      "SO",
      "TO",
      "UP",
      "US",
      "WE",
    ]) {
      if (full.set.has(w)) aiMerged.push(w);
    }
    const ai = indexList(aiMerged);
    aiWordSet = ai.set;
    aiWordsByLen = ai.byLen;
  })();

  return loadPromise;
}
