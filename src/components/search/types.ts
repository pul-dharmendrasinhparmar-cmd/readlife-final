export type TbrPriority = "read-next" | "read-soon" | "someday" | "need-to-read";

export type DiscoverySourceType =
  | "recommendation"
  | "friend"
  | "reading_list"
  | "booktok"
  | "bookstagram"
  | "booktube"
  | "other"
  | "search"
  | "self";

export type BookFormat = "physical" | "ebook" | "audiobook" | "manga" | "mixed";

export type LibraryStatus = "reading" | "read" | "tbr" | "paused" | "dnf";

export type HistoryEvent = {
  at: string;
  label: string;
};

export type LibraryEntry = {
  bookId: string;
  status: LibraryStatus;
  priority?: TbrPriority;
  note?: string;
  sourceType?: DiscoverySourceType;
  sourceName?: string;
  sourceUser?: string;
  preferredFormat?: BookFormat;
  format?: BookFormat;
  progressPct?: number;
  pagesRead?: number;
  dateAdded: string;
  dateStarted?: string;
  dateFinished?: string;
  datePaused?: string;
  dateDnf?: string;
  dateUpdated: string;
  pauseReason?: string;
  dnfReason?: string;
  rating?: number;
  isFavorite?: boolean;
  review?: string;
  reviewDate?: string;
  reviewSpoiler?: boolean;
  moodTags?: string[];
  lastSessionLabel?: string;
  minutesThisWeek?: number;
  timesRead?: number;
  tags?: string[];
  history?: HistoryEvent[];
};

/** @deprecated Prefer LibraryEntry; kept for Search TBR modal shape */
export type TbrEntry = {
  bookId: string;
  priority: TbrPriority;
  note: string;
  sourceType: DiscoverySourceType;
  sourceName?: string;
  sourceUser?: string;
  dateAdded: string;
};

export type DiscoverBook = {
  id: string;
  title: string;
  author: string;
  cover: string;
  color: string;
  description: string;
  genres: string[];
  averageRating: number;
  pageCount: number;
  readLifeReaders: number;
  reviewCount: number;
  formats: string[];
  recommendationReason?: string;
  /** Short taste-signal labels shown as “Based on …” under AI picks */
  recommendationBasedOn?: string[];
  discoveryCategory?:
    | "for-you"
    | "hidden-gems"
    | "trending"
    | "outside"
    | "mood";
  friendRating?: number;
  followedReadersCount?: number;
};

export type DiscoverReader = {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  readingPersonality: string;
  favoriteGenres: string[];
  currentBook: string;
  readingMatch: number;
  matchReasons: string[];
  followers: number;
  following: number;
  section:
    | "similar"
    | "broaden"
    | "list-makers"
    | "new"
    | "friends-follow";
};

export type DiscoverList = {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  tags: string[];
  bookIds: string[];
  saveCount: number;
  readerCount: number;
  completionCount: number;
  section:
    | "trending"
    | "for-you"
    | "following"
    | "short"
    | "outside";
};

export type MiniGame = {
  id: string;
  title: string;
  description: string;
  playable: boolean;
};

export type DiscoveryState = {
  entries: LibraryEntry[];
  followingIds: string[];
  savedListIds: string[];
  /** Derived helpers kept for Search compatibility */
  tbr: TbrEntry[];
  currentlyReadingId: string | null;
  readBookIds: string[];
  userRatings: Record<string, number>;
};

export type ToastMessage = {
  id: string;
  text: string;
  actionLabel?: string;
  actionHref?: string;
};
