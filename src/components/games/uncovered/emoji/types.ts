export type FeedbackResult =
  | "exact_book"
  | "same_author"
  | "same_genre_decade"
  | "no_relation";

export type EmojiBook = {
  id: string;
  title: string;
  author: string;
  genreTags: string[];
  publicationYear: number;
  isbn?: string;
};

export type EmojiPuzzle = {
  id: string;
  book: EmojiBook;
  emojiSequence: [string, string, string, string, string];
  emojiRationale: [string, string, string, string, string];
};

export type EmojiGuess = {
  guessNumber: number;
  feedback: FeedbackResult;
  title: string;
  author: string;
};

export type EmojiPhase = "playing" | "revealed";
