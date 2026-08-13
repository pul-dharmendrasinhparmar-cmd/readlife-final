/** Compatibility helpers — prefer word-dict + bookish-bonus. */
export { bookishBonusCount as dictionarySize } from "./bookish-bonus";
export { bookishBonusWordList as BOOKISH_WORDS } from "./bookish-bonus";

import { bookishBonusFor } from "./bookish-bonus";

export function isBookishWord(word: string): boolean {
  return !!bookishBonusFor(word);
}
