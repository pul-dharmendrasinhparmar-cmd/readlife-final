export type BookTab = "about" | "forum" | "reviews" | "feed";

export type RatingBreakdown = {
  enjoyment: number;
  quality: number;
  characters: number;
  plot: number;
  audiobook: number;
};

export type CommunityStats = {
  finished: number;
  reading: number;
  interested: number;
  tbr: number;
  paused: number;
  dnf: number;
  ratingsCount: number;
  postsCount: number;
};

export type ForumPost = {
  id: string;
  username: string;
  edited?: boolean;
  title: string;
  body: string;
  spoilers: boolean;
  progressPct: number;
  pageHint?: number;
  score: number;
  commentCount: number;
};

export type ForumComment = {
  id: string;
  username: string;
  body: string;
  atLabel: string;
  score?: number;
  spoilers?: boolean;
};

export type CommunityReview = {
  id: string;
  username: string;
  dateLabel: string;
  rating: number;
  body: string;
  spoilers: boolean;
  likes: number;
  commentCount: number;
  following?: boolean;
};

export type FeedActivityKind =
  | "interested"
  | "progress"
  | "started"
  | "finished"
  | "tbr";

export type FeedActivity = {
  id: string;
  username: string;
  kind: FeedActivityKind;
  timeAgo: string;
  progressPct?: number;
  likes: number;
  commentCount: number;
};

export type BookCommunity = {
  publishedLabel: string;
  breakdown: RatingBreakdown;
  stats: CommunityStats;
  forum: ForumPost[];
  reviews: CommunityReview[];
  feed: FeedActivity[];
};
