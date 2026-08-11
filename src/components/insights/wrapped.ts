import type { PeriodSnapshot, ReaderDna, WrappedSlide } from "./types";

export function buildMonthlyWrapped(
  snap: PeriodSnapshot,
  dna: ReaderDna,
): WrappedSlide[] {
  const topGenre = snap.genreShare[0]?.genre ?? "Fantasy";
  const topBook = "Hamnet";
  const surprise = "Legends & Lattes";
  return [
    {
      id: "intro",
      eyebrow: "ReadLife Wrapped",
      title: "Your August in books",
      body: "A month of night pages, immersive worlds, and a few soft landings.",
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
      title: "Highest-rated read",
      emphasis: topBook,
      body: "quiet devastation, five stars",
    },
    {
      id: "surprise",
      title: "Biggest surprise",
      emphasis: surprise,
      body: "comfort fantasy that still counted",
    },
    {
      id: "era",
      title: "Your reading era",
      emphasis: "Night Owl",
      body: `${snap.timeOfDay.evening + snap.timeOfDay.lateNight}% of minutes after late afternoon`,
    },
    {
      id: "dna",
      title: "Reader DNA shift",
      emphasis: "Genre Exploration +12%",
      body: `Now reading as ${dna.title}`,
    },
    {
      id: "sentence",
      title: "August in one sentence",
      body: snap.monthlyNarrative,
    },
    {
      id: "share",
      title: "Share your August",
      body: "Turn this month into a story card for Instagram, TikTok, or your shelf.",
    },
  ];
}

export function buildYearlyWrapped(snap: PeriodSnapshot): WrappedSlide[] {
  return [
    {
      id: "y1",
      eyebrow: "2026 Wrapped",
      title: "A year in the making",
      body: `${snap.booksFinished.value}+ finishes this season · streaking at ${snap.streakDays.value} days`,
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
      title: "Share your year",
      body: "Yearly Wrapped cards stay private until you choose to publish.",
    },
  ];
}
