import type { EmojiBook, FeedbackResult } from "./types";

function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

function shareGenre(a: string[], b: string[]): boolean {
  const setB = new Set(b);
  return a.some((tag) => setB.has(tag));
}

/** exact > same author > same genre/decade > none */
export function computeFeedback(
  guessed: EmojiBook,
  answer: EmojiBook,
): FeedbackResult {
  if (guessed.id === answer.id || guessed.title.toLowerCase() === answer.title.toLowerCase()) {
    return "exact_book";
  }
  if (guessed.author.toLowerCase() === answer.author.toLowerCase()) {
    return "same_author";
  }
  const sameDecade = decadeOf(guessed.publicationYear) === decadeOf(answer.publicationYear);
  if (sameDecade || shareGenre(guessed.genreTags, answer.genreTags)) {
    return "same_genre_decade";
  }
  return "no_relation";
}

export const FEEDBACK_EMOJI: Record<FeedbackResult, string> = {
  exact_book: "🟩",
  same_author: "🟨",
  same_genre_decade: "🟧",
  no_relation: "⬛",
};

export const FEEDBACK_LABEL: Record<FeedbackResult, string> = {
  exact_book: "Exact book",
  same_author: "Same author",
  same_genre_decade: "Same genre or decade",
  no_relation: "No relation",
};
