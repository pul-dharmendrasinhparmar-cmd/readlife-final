import type { PeriodSnapshot, ReaderDna, WrappedSlide } from "./types";

export function buildMonthlyWrapped(
  snap: PeriodSnapshot,
  dna: ReaderDna,
): WrappedSlide[] {
  const topGenre = snap.genreShare[0]?.genre ?? "Fantasy";
  const nightPct = snap.timeOfDay.evening + snap.timeOfDay.lateNight;
  return [
    {
      id: "intro",
      eyebrow: "ReadLife Wrapped",
      title: `Your ${snap.label} in books`,
      body: "A month shaped by pages, moods, and quiet rituals.",
    },
    {
      id: "books",
      title: "You finished",
      emphasis: String(snap.booksFinished.value),
      body: "books",
    },
    {
      id: "minutes",
      title: "You spent",
      emphasis: `${snap.minutesRead.value.toLocaleString()} minutes`,
      body: "between chapters",
    },
    {
      id: "genre",
      title: "Genre of the month",
      emphasis: topGenre,
      body: "still your gravitational center",
    },
    {
      id: "highest",
      title: "Rating pulse",
      emphasis: snap.avgRating.value
        ? `${snap.avgRating.value.toFixed(1)}★`
        : "Still forming",
      body: "average across finishes this stretch",
    },
    {
      id: "surprise",
      title: "Session stamina",
      emphasis: `${snap.sessionStats.avgMinutes || 0} min`,
      body: "typical session length",
    },
    {
      id: "era",
      title: "Your reading era",
      emphasis: nightPct >= 50 ? "Night Owl" : "Daylight Reader",
      body: `${nightPct}% of minutes after late afternoon`,
    },
    {
      id: "dna",
      title: "Reader DNA",
      emphasis: dna.title,
      body: "how this month shifted your reading identity",
    },
    {
      id: "sentence",
      title: `${snap.label} in one sentence`,
      body: snap.monthlyNarrative,
    },
    {
      id: "share",
      title: "Share your story",
      body: "Turn this month into a story card for Instagram, TikTok, or your shelf.",
    },
  ];
}

export function buildYearlyWrapped(snap: PeriodSnapshot): WrappedSlide[] {
  const topGenre = snap.genreShare[0]?.genre ?? "Fantasy";
  return [
    {
      id: "y1",
      eyebrow: `${snap.year} Wrapped`,
      title: "A year in the making",
      body: `${snap.booksFinished.value}+ finishes · streaking at ${snap.streakDays.value} days`,
    },
    {
      id: "y2",
      title: "Hours between pages",
      emphasis: `${(snap.minutesRead.value / 60).toFixed(1)}h`,
      body: "and counting",
    },
    {
      id: "y3",
      title: "Your strongest source",
      emphasis: snap.sourcePerformance[0]?.source ?? "Friends",
      body: "recommendations that stick",
    },
    {
      id: "y4",
      title: "Genre gravity",
      emphasis: topGenre,
      body: "where your year kept orbiting",
    },
    {
      id: "y5",
      title: "Streak story",
      emphasis: `${snap.streakDays.value} days`,
      body: "your longest unbroken reading rhythm",
    },
    {
      id: "sentence",
      title: "The year in one sentence",
      body: snap.monthlyNarrative,
    },
    {
      id: "share",
      title: "Share your year",
      body: "Yearly Wrapped cards stay private until you choose to publish.",
    },
  ];
}

export function mergeWrappedSlides(
  base: WrappedSlide[],
  patches: WrappedSlide[],
): WrappedSlide[] {
  if (!patches.length) return base;
  const map = new Map(patches.map((s) => [s.id, s]));
  return base.map((slide) => {
    if (slide.id === "share") return slide;
    const patch = map.get(slide.id);
    if (!patch) return slide;
    return {
      ...slide,
      eyebrow: patch.eyebrow ?? slide.eyebrow,
      title: patch.title || slide.title,
      emphasis: patch.emphasis ?? slide.emphasis,
      body: patch.body ?? slide.body,
    };
  });
}
