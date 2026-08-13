import { getBookById } from "@/components/search/data";
import type { DiscoveryState, LibraryEntry } from "@/components/search/types";
import { SOURCE_OPTIONS, tbrAgeDays } from "@/lib/discovery-storage";
import { shouldSeedDemo } from "@/lib/user-storage";
import {
  DEMO_AUGUST_FINISHED_IDS,
  DEMO_SESSIONS,
  DEMO_STREAK_DAYS,
} from "./demo-sessions";
import type {
  InsightPeriod,
  PeriodSnapshot,
  ReadingSession,
} from "./types";

const SOURCE_LABEL: Record<string, string> = Object.fromEntries(
  SOURCE_OPTIONS.map((s) => [s.id, s.label]),
);

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function daysBetween(a: string, b: string) {
  const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function bucketHour(h: number): keyof PeriodSnapshot["timeOfDay"] {
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "lateNight";
}

export function buildPeriodSnapshot(
  state: DiscoveryState,
  period: InsightPeriod,
  year = 2026,
  month = 7, // August
): PeriodSnapshot {
  const entries = state.entries;
  const useDemo = shouldSeedDemo();
  const sessions = useDemo ? DEMO_SESSIONS : [];

  // --- sessions for activity (MOCK for guests; empty for accounts) ---
  const periodSessions = filterSessions(sessions, period, year, month);
  const minutesRead = periodSessions.reduce((s, x) => s + x.minutes, 0);
  const pagesFromSessions = periodSessions.reduce((s, x) => s + x.pagesRead, 0);
  const sessionDays = new Set(periodSessions.map((s) => s.date));

  // --- finished books ---
  // CALCULATED for all/year from library; MOCK overlay for August demo month/week (guests)
  let finishedEntries: LibraryEntry[] = [];
  let finishedProvenance: PeriodSnapshot["booksFinished"]["provenance"] =
    "calculated";

  if (useDemo && period === "month" && year === 2026 && month === 7) {
    finishedEntries = DEMO_AUGUST_FINISHED_IDS.map(
      (id) => entries.find((e) => e.bookId === id)!,
    ).filter(Boolean);
    finishedProvenance = "hybrid";
  } else if (useDemo && period === "week") {
    finishedEntries = DEMO_AUGUST_FINISHED_IDS.slice(0, 2)
      .map((id) => entries.find((e) => e.bookId === id)!)
      .filter(Boolean);
    finishedProvenance = "mock";
  } else if (period === "year") {
    finishedEntries = entries.filter(
      (e) =>
        e.status === "read" &&
        e.dateFinished &&
        new Date(e.dateFinished).getFullYear() === year,
    );
    // ensure demo richness for guests only
    if (useDemo && finishedEntries.length < 6) {
      finishedEntries = entries.filter((e) => e.status === "read");
      finishedProvenance = "hybrid";
    }
  } else {
    finishedEntries = entries.filter((e) => e.status === "read");
  }

  const ratings = finishedEntries
    .map((e) => e.rating)
    .filter((r): r is number => typeof r === "number");

  const activityByDay = buildActivity(periodSessions, year, month, period);

  const timeOfDay = { morning: 0, afternoon: 0, evening: 0, lateNight: 0 };
  periodSessions.forEach((s) => {
    timeOfDay[bucketHour(s.startHour)] += s.minutes;
  });
  const todTotal = Object.values(timeOfDay).reduce((a, b) => a + b, 0) || 1;
  const todPct = {
    morning: Math.round((timeOfDay.morning / todTotal) * 100),
    afternoon: Math.round((timeOfDay.afternoon / todTotal) * 100),
    evening: Math.round((timeOfDay.evening / todTotal) * 100),
    lateNight: Math.round((timeOfDay.lateNight / todTotal) * 100),
  };

  // Formats — CALCULATED from finished entries + session minutes (hybrid)
  const formatByBooks: Record<string, number> = {};
  finishedEntries.forEach((e) => {
    const f = e.format ?? "physical";
    formatByBooks[f] = (formatByBooks[f] ?? 0) + 1;
  });
  const formatByMinutes: Record<string, number> = {};
  periodSessions.forEach((s) => {
    formatByMinutes[s.format] = (formatByMinutes[s.format] ?? 0) + s.minutes;
  });

  // Genres — CALCULATED from finished
  const genreMap = new Map<string, { count: number; ratings: number[] }>();
  finishedEntries.forEach((e) => {
    const book = getBookById(e.bookId);
    book?.genres.forEach((g) => {
      const cur = genreMap.get(g) ?? { count: 0, ratings: [] };
      cur.count += 1;
      if (e.rating) cur.ratings.push(e.rating);
      genreMap.set(g, cur);
    });
  });
  const genreTotal = [...genreMap.values()].reduce((s, g) => s + g.count, 0) || 1;
  const genreShare = [...genreMap.entries()]
    .map(([genre, v]) => ({
      genre,
      count: v.count,
      share: Math.round((v.count / genreTotal) * 100),
      avgRating: avg(v.ratings),
    }))
    .sort((a, b) => b.count - a.count);

  const highestRatedGenre =
    [...genreShare].sort((a, b) => b.avgRating - a.avgRating)[0] ?? null;

  // Fastest finished — CALCULATED where dates exist
  const genreDays = new Map<string, number[]>();
  finishedEntries.forEach((e) => {
    if (!e.dateStarted || !e.dateFinished) return;
    const book = getBookById(e.bookId);
    const days = daysBetween(e.dateStarted, e.dateFinished);
    book?.genres.forEach((g) => {
      const arr = genreDays.get(g) ?? [];
      arr.push(days);
      genreDays.set(g, arr);
    });
  });
  const fastestGenre =
    [...genreDays.entries()]
      .map(([genre, days]) => ({ genre, avgDays: avg(days) }))
      .sort((a, b) => a.avgDays - b.avgDays)[0] ?? null;

  const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<
    1 | 2 | 3 | 4 | 5,
    number
  >;
  ratings.forEach((r) => {
    const bucket = Math.min(5, Math.max(1, Math.round(r))) as 1 | 2 | 3 | 4 | 5;
    ratingDist[bucket] += 1;
  });

  // Outcomes — CALCULATED from library
  const finishedN = entries.filter((e) => e.status === "read").length;
  const pausedN = entries.filter((e) => e.status === "paused").length;
  const dnfN = entries.filter((e) => e.status === "dnf").length;
  const outcomeTotal = finishedN + pausedN + dnfN || 1;

  // DNF reasons — CALCULATED
  const dnfReasonMap = new Map<string, number>();
  entries
    .filter((e) => e.status === "dnf")
    .forEach((e) => {
      const r = e.dnfReason ?? "Other";
      dnfReasonMap.set(r, (dnfReasonMap.get(r) ?? 0) + 1);
    });
  const dnfTotal = [...dnfReasonMap.values()].reduce((a, b) => a + b, 0) || 1;
  const dnfReasons = [...dnfReasonMap.entries()]
    .map(([reason, n]) => ({
      reason,
      share: Math.round((n / dnfTotal) * 100),
    }))
    .sort((a, b) => b.share - a.share);

  // Pause — CALCULATED + light mock for resume days (guests)
  const pauseStats = {
    paused: pausedN,
    resumed: useDemo ? 2 : 0,
    waiting: pausedN,
    avgResumeDays: useDemo ? 18 : 0,
  };

  // Source performance — CALCULATED from library
  const sourceMap = new Map<
    string,
    { completed: number; ratings: number[]; started: number }
  >();
  entries.forEach((e) => {
    const key = e.sourceType ?? "self";
    const cur = sourceMap.get(key) ?? {
      completed: 0,
      ratings: [],
      started: 0,
    };
    if (e.status === "read" || e.status === "reading" || e.status === "dnf") {
      cur.started += 1;
    }
    if (e.status === "read") {
      cur.completed += 1;
      if (e.rating) cur.ratings.push(e.rating);
    }
    sourceMap.set(key, cur);
  });
  const sourcePerformance = [...sourceMap.entries()]
    .map(([source, v]) => ({
      source: SOURCE_LABEL[source] ?? source,
      books: v.completed,
      avgRating: avg(v.ratings) || 0,
      completionRate:
        v.started > 0 ? Math.round((v.completed / v.started) * 100) : 0,
    }))
    .filter((s) => s.books > 0 || s.completionRate > 0)
    .sort((a, b) => b.avgRating - a.avgRating);

  // Influencers — CALCULATED
  const inflMap = new Map<
    string,
    { completed: number; ratings: number[]; onTbr: number }
  >();
  entries.forEach((e) => {
    if (!e.sourceUser) return;
    const cur = inflMap.get(e.sourceUser) ?? {
      completed: 0,
      ratings: [],
      onTbr: 0,
    };
    if (e.status === "read") {
      cur.completed += 1;
      if (e.rating) cur.ratings.push(e.rating);
    }
    if (e.status === "tbr") cur.onTbr += 1;
    inflMap.set(e.sourceUser, cur);
  });
  const influencers = [...inflMap.entries()]
    .map(([username, v]) => ({
      username,
      completed: v.completed,
      avgRating: avg(v.ratings) || 0,
      onTbr: v.onTbr,
    }))
    .sort((a, b) => b.completed - a.completed);

  // TBR — CALCULATED
  const tbrEntries = entries.filter((e) => e.status === "tbr");
  const byPriority: Record<string, number> = {
    "read-next": 0,
    "read-soon": 0,
    someday: 0,
    "need-to-read": 0,
  };
  tbrEntries.forEach((e) => {
    const p = e.priority ?? "someday";
    byPriority[p] = (byPriority[p] ?? 0) + 1;
  });
  const oldestDays = tbrEntries.reduce(
    (m, e) => Math.max(m, tbrAgeDays(e)),
    0,
  );
  const fantasyShare = (() => {
    if (!tbrEntries.length) return 0;
    const fantasy = tbrEntries.filter((e) =>
      getBookById(e.bookId)?.genres.includes("Fantasy"),
    ).length;
    return Math.round((fantasy / tbrEntries.length) * 100);
  })();
  const somedayOverYear = tbrEntries.filter(
    (e) => e.priority === "someday" && tbrAgeDays(e) > 365,
  ).length;

  // Session stats — CALCULATED from mock sessions
  const mins = periodSessions.map((s) => s.minutes).sort((a, b) => a - b);
  const sessionStats = {
    avgMinutes: Math.round(avg(mins)),
    longestMinutes: mins.length ? mins[mins.length - 1] : 0,
    typicalMin: mins.length ? mins[Math.floor(mins.length * 0.25)] : 0,
    typicalMax: mins.length ? mins[Math.floor(mins.length * 0.75)] : 0,
    pagesPerHour:
      minutesRead > 0
        ? Math.round((pagesFromSessions / minutesRead) * 60)
        : 0,
  };

  // Length bands — CALCULATED
  const bands = [
    { band: "Under 300", min: 0, max: 299 },
    { band: "300–500", min: 300, max: 500 },
    { band: "500+", min: 501, max: 99999 },
  ];
  const lengthBands = bands.map((b) => {
    const set = finishedEntries.filter((e) => {
      const pages = getBookById(e.bookId)?.pageCount ?? 0;
      return pages >= b.min && pages <= b.max && e.rating;
    });
    return {
      band: b.band,
      count: set.length,
      avgRating: avg(set.map((e) => e.rating!)),
    };
  });

  const patterns = buildPatterns({
    todPct,
    genreShare,
    sourcePerformance,
    formatByBooks,
    formatByMinutes,
    minutesRead,
    influencers,
    somedayOverYear,
    finishedEntries,
    entries,
  });

  const label =
    period === "week"
      ? "This Week"
      : period === "month"
        ? monthLabel(year, month)
        : period === "year"
          ? String(year)
          : "All Time";

  // Align Dashboard month preview for guests: Aug 2026 = 8 books, 1476 min, 4.3★, streak 12
  const isDemoAugust =
    useDemo && period === "month" && year === 2026 && month === 7;
  const booksFinishedValue = isDemoAugust
    ? 8
    : finishedEntries.length || (useDemo ? finishedN : finishedEntries.length);
  const minutesValue = isDemoAugust
    ? 1476
    : useDemo
      ? minutesRead || Math.round(finishedN * 90)
      : minutesRead;
  const pagesValue = isDemoAugust
    ? 2436
    : useDemo
      ? pagesFromSessions || booksFinishedValue * 320
      : pagesFromSessions;
  const avgRatingValue = isDemoAugust
    ? 4.3
    : avg(ratings) || (useDemo ? 4.0 : 0);

  return {
    label,
    period,
    year,
    month,
    booksFinished: { value: booksFinishedValue, provenance: finishedProvenance },
    pagesRead: {
      value: pagesValue,
      provenance: isDemoAugust ? "hybrid" : useDemo ? "mock" : "calculated",
    },
    minutesRead: {
      value: minutesValue,
      provenance: isDemoAugust ? "hybrid" : useDemo ? "mock" : "calculated",
    },
    sessions: {
      value: isDemoAugust
        ? 14
        : periodSessions.length || (useDemo ? 6 : 0),
      provenance: useDemo ? "mock" : "calculated",
    },
    streakDays: {
      value: useDemo ? DEMO_STREAK_DAYS : 0,
      provenance: useDemo ? "hybrid" : "calculated",
    },
    avgRating: {
      value: avgRatingValue,
      provenance: isDemoAugust ? "hybrid" : "calculated",
    },
    readingDays: {
      value: isDemoAugust
        ? 18
        : sessionDays.size || (useDemo ? 10 : 0),
      provenance: useDemo ? "mock" : "calculated",
    },
    goalBooks: { current: booksFinishedValue, target: 10 },
    goalMinutes: { current: minutesValue, target: 1800 },
    goalDays: {
      current: isDemoAugust ? 18 : sessionDays.size,
      target: 20,
    },
    activityByDay,
    timeOfDay: todPct,
    formatByBooks,
    formatByMinutes,
    genreShare,
    highestRatedGenre: highestRatedGenre
      ? { genre: highestRatedGenre.genre, avgRating: highestRatedGenre.avgRating }
      : null,
    fastestGenre,
    ratingDist,
    outcomes: {
      finished: Math.round((finishedN / outcomeTotal) * 100),
      paused: Math.round((pausedN / outcomeTotal) * 100),
      dnf: Math.round((dnfN / outcomeTotal) * 100),
    },
    dnfReasons,
    pauseStats,
    sourcePerformance,
    influencers,
    tbr: {
      total: tbrEntries.length,
      byPriority,
      oldestDays,
      addedThisPeriod: isDemoAugust ? 5 : 2,
      finishedFromTbr: isDemoAugust ? 5 : 3,
      fantasyShare,
      somedayOverYear,
    },
    sessionStats,
    lengthBands,
    patterns,
    monthlyNarrative: buildNarrative(genreShare, todPct, sourcePerformance),
    comparePrevious: {
      books: [6, booksFinishedValue],
      minutes: [1220, minutesValue],
      genres: [4, Math.min(6, genreShare.length || 6)],
    },
  };
}

function filterSessions(
  sessions: ReadingSession[],
  period: InsightPeriod,
  year: number,
  month: number,
) {
  if (period === "all" || period === "year") {
    return sessions.filter((s) => s.date.startsWith(String(year)));
  }
  if (period === "week") {
    return sessions.filter((s) => s.date >= "2026-08-05" && s.date <= "2026-08-11");
  }
  return sessions.filter((s) => {
    const d = new Date(s.date + "T12:00:00");
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

function buildActivity(
  sessions: ReadingSession[],
  year: number,
  month: number,
  period: InsightPeriod,
) {
  const map = new Map<string, { minutes: number; pages: number; sessions: number }>();
  sessions.forEach((s) => {
    const cur = map.get(s.date) ?? { minutes: 0, pages: 0, sessions: 0 };
    cur.minutes += s.minutes;
    cur.pages += s.pagesRead;
    cur.sessions += 1;
    map.set(s.date, cur);
  });

  if (period === "month" || period === "week") {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const start = period === "week" ? 5 : 1;
    const end = period === "week" ? 11 : daysInMonth;
    const rows = [];
    for (let d = start; d <= end; d++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const cur = map.get(date) ?? { minutes: 0, pages: 0, sessions: 0 };
      rows.push({ date, ...cur });
    }
    return rows;
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));
}

function buildPatterns(input: {
  todPct: PeriodSnapshot["timeOfDay"];
  genreShare: PeriodSnapshot["genreShare"];
  sourcePerformance: PeriodSnapshot["sourcePerformance"];
  formatByBooks: Record<string, number>;
  formatByMinutes: Record<string, number>;
  minutesRead: number;
  influencers: PeriodSnapshot["influencers"];
  somedayOverYear: number;
  finishedEntries: LibraryEntry[];
  entries: LibraryEntry[];
}): PeriodSnapshot["patterns"] {
  const patterns: PeriodSnapshot["patterns"] = [];
  const night = input.todPct.evening + input.todPct.lateNight;
  if (night >= 50) {
    patterns.push({
      id: "night",
      icon: "🌙",
      text: `You read ${night}% of your minutes after 5 PM.`,
      why: `Evening ${input.todPct.evening}% + late night ${input.todPct.lateNight}% of session minutes fall after work hours.`,
    });
  }

  const fantasy = input.genreShare.find((g) => g.genre === "Fantasy");
  const overall = avg(
    input.finishedEntries
      .map((e) => e.rating)
      .filter((r): r is number => typeof r === "number"),
  );
  if (fantasy && fantasy.avgRating > overall) {
    patterns.push({
      id: "fantasy",
      icon: "🧙",
      text: `Fantasy is ${fantasy.share}% of finished books but drives many of your highest ratings (${fantasy.avgRating}★ avg).`,
      why: `You finished ${fantasy.count} fantasy books averaging ${fantasy.avgRating}★ vs overall ${overall || 4}★.`,
    });
  }

  const friends = input.sourcePerformance.find((s) =>
    s.source.toLowerCase().includes("friend"),
  );
  if (friends && friends.avgRating >= 4) {
    patterns.push({
      id: "friends",
      icon: "👥",
      text: `Books from friends average ${friends.avgRating}★ — among your strongest sources.`,
      why: `${friends.books} completed friend recommendations with ${friends.completionRate}% completion.`,
      action: { label: "Discover readers", href: "/search" },
    });
  }

  const audioMin = input.formatByMinutes.audiobook ?? 0;
  const totalMin =
    Object.values(input.formatByMinutes).reduce((a, b) => a + b, 0) || 1;
  const audioShare = Math.round((audioMin / totalMin) * 100);
  if (audioShare >= 15) {
    patterns.push({
      id: "audio",
      icon: "🎧",
      text: `Audiobooks are ${audioShare}% of your reading time this period.`,
      why: `Session logs attribute ${audioMin} audiobook minutes of ${totalMin} total.`,
    });
  }

  if (input.somedayOverYear > 0) {
    patterns.push({
      id: "tbr",
      icon: "📚",
      text: `${input.somedayOverYear} books have been sitting in Someday for over a year.`,
      why: "Calculated from TBR dateAdded on Someday-priority titles.",
      action: { label: "Review TBR", href: "/library" },
    });
  }

  const mina = input.influencers.find((i) => i.username === "minareads");
  if (mina) {
    patterns.push({
      id: "mina",
      icon: "🌱",
      text: `@minareads remains a reliable influence — ${mina.completed} completed, ${mina.onTbr} still on your TBR.`,
      why: "Counted library entries with sourceUser = minareads.",
      action: { label: "View Mina", href: "/readers/minareads" },
    });
  }

  return patterns.slice(0, 6);
}

function buildNarrative(
  genreShare: PeriodSnapshot["genreShare"],
  tod: PeriodSnapshot["timeOfDay"],
  sources: PeriodSnapshot["sourcePerformance"],
) {
  const top = genreShare[0]?.genre ?? "Fantasy";
  const night = tod.evening + tod.lateNight;
  const best = sources[0]?.source ?? "friends";
  return `August was an immersive month. ${top} stayed central, ${night}% of your minutes landed in the evening or later, and ${best.toLowerCase()} continued to surface your highest-rated finishes. You also kept two books in progress — proof that ReadLife is tracking the journey, not just the endings.`;
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
}
