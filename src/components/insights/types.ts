export type InsightPeriod = "week" | "month" | "year" | "all";

export type DataProvenance = "calculated" | "mock" | "hybrid";

export type ReadingSession = {
  id: string;
  bookId: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 0-23
  minutes: number;
  pagesRead: number;
  format: "physical" | "ebook" | "audiobook";
};

export type MetricValue = {
  value: number;
  provenance: DataProvenance;
};

export type PeriodSnapshot = {
  label: string;
  period: InsightPeriod;
  year: number;
  month: number; // 0-11
  booksFinished: MetricValue;
  pagesRead: MetricValue;
  minutesRead: MetricValue;
  sessions: MetricValue;
  streakDays: MetricValue;
  avgRating: MetricValue;
  readingDays: MetricValue;
  goalBooks: { current: number; target: number };
  goalMinutes: { current: number; target: number };
  goalDays: { current: number; target: number };
  activityByDay: { date: string; minutes: number; pages: number; sessions: number }[];
  timeOfDay: { morning: number; afternoon: number; evening: number; lateNight: number };
  formatByBooks: Record<string, number>;
  formatByMinutes: Record<string, number>;
  genreShare: { genre: string; share: number; count: number; avgRating: number }[];
  highestRatedGenre: { genre: string; avgRating: number } | null;
  fastestGenre: { genre: string; avgDays: number } | null;
  ratingDist: Record<1 | 2 | 3 | 4 | 5, number>;
  outcomes: { finished: number; paused: number; dnf: number };
  dnfReasons: { reason: string; share: number }[];
  pauseStats: { paused: number; resumed: number; waiting: number; avgResumeDays: number };
  sourcePerformance: {
    source: string;
    books: number;
    avgRating: number;
    completionRate: number;
  }[];
  influencers: {
    username: string;
    completed: number;
    avgRating: number;
    onTbr: number;
  }[];
  tbr: {
    total: number;
    byPriority: Record<string, number>;
    oldestDays: number;
    addedThisPeriod: number;
    finishedFromTbr: number;
    fantasyShare: number;
    somedayOverYear: number;
  };
  sessionStats: {
    avgMinutes: number;
    longestMinutes: number;
    typicalMin: number;
    typicalMax: number;
    pagesPerHour: number;
  };
  lengthBands: { band: string; avgRating: number; count: number }[];
  patterns: {
    id: string;
    icon: string;
    text: string;
    why: string;
    action?: { label: string; href: string };
  }[];
  monthlyNarrative: string;
  comparePrevious: {
    books: [number, number];
    minutes: [number, number];
    genres: [number, number];
  };
};

export type DnaTrait = {
  id: string;
  label: string;
  value: number;
  previous: number;
  why: string;
};

export type ReaderDna = {
  title: string;
  summary: string;
  generatedAt: string;
  dataPoints: string;
  confidence: "forming" | "medium" | "high";
  confidencePct: number;
  traits: DnaTrait[];
  previousTitle: string;
  quizPersonality: string;
  quizComparison: string;
  provenance: DataProvenance;
};

export type BadgeDef = {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
  progress?: { current: number; target: number };
};

export type WrappedSlide = {
  id: string;
  eyebrow?: string;
  title: string;
  body?: string;
  emphasis?: string;
};

export type SharePrivacy = {
  booksRead: boolean;
  minutes: boolean;
  readerDna: boolean;
  favoriteBook: boolean;
  dnfs: boolean;
  goals: boolean;
};
