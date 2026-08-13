import type { DiscoveryState } from "@/components/search/types";
import type { BadgeDef, PeriodSnapshot } from "./types";

/** Distinct hues per badge — stay vivid on dark Ink & Amethyst */
const ACCENTS: Record<string, string> = {
  "night-owl": "#7eb8ff",
  "genre-hopper": "#c4a1ff",
  "second-chance": "#7dd3c0",
  "hidden-gem-hunter": "#f0a6ca",
  "audio-adventurer": "#6ec6ff",
  "tbr-tamer": "#f0c27a",
  "list-explorer": "#9ad0c2",
  "book-bestie": "#ff8fab",
  "marathon-reader": "#e8a87c",
};

export function badgeAccent(id: string): string {
  return ACCENTS[id] ?? "#b08fce";
}

function badgeImage(id: string): string {
  return `/insights/badges/${id}.png`;
}

export function buildBadges(
  state: DiscoveryState,
  snap: PeriodSnapshot,
): BadgeDef[] {
  const night = snap.timeOfDay.evening + snap.timeOfDay.lateNight;
  const genres = snap.genreShare.length;
  const audioShare = share(
    snap.formatByMinutes.audiobook ?? 0,
    Object.values(snap.formatByMinutes).reduce((a, b) => a + b, 0),
  );
  const resumed = snap.pauseStats.resumed > 0;
  const listSources = state.entries.filter(
    (e) => e.sourceType === "reading_list" && e.status === "read",
  ).length;
  const minaDone = state.entries.filter(
    (e) => e.sourceUser === "minareads" && e.status === "read",
  ).length;

  return [
    {
      id: "night-owl",
      name: "Night Owl",
      description: "70%+ of reading minutes after late afternoon.",
      image: badgeImage("night-owl"),
      earned: night >= 60,
      earnedDate: night >= 60 ? "Aug 2026" : undefined,
      progress: { current: night, target: 70 },
      accent: badgeAccent("night-owl"),
    },
    {
      id: "genre-hopper",
      name: "Genre Hopper",
      description: "Read five different genres in the period.",
      image: badgeImage("genre-hopper"),
      earned: genres >= 5,
      earnedDate: genres >= 5 ? "Aug 2026" : undefined,
      progress: { current: Math.min(genres, 5), target: 5 },
      accent: badgeAccent("genre-hopper"),
    },
    {
      id: "second-chance",
      name: "Second Chance",
      description: "Returned to and completed a paused book.",
      image: badgeImage("second-chance"),
      earned: resumed,
      earnedDate: resumed ? "Jul 2026" : undefined,
      progress: { current: snap.pauseStats.resumed, target: 1 },
      accent: badgeAccent("second-chance"),
    },
    {
      id: "hidden-gem-hunter",
      name: "Hidden Gem Hunter",
      description: "Finished lesser-discovered books you loved.",
      image: badgeImage("hidden-gem-hunter"),
      earned: true,
      earnedDate: "Jun 2026",
      accent: badgeAccent("hidden-gem-hunter"),
    },
    {
      id: "audio-adventurer",
      name: "Audio Adventurer",
      description: "Audiobooks represented a meaningful share of time.",
      image: badgeImage("audio-adventurer"),
      earned: audioShare >= 20,
      earnedDate: audioShare >= 20 ? "Aug 2026" : undefined,
      progress: { current: audioShare, target: 40 },
      accent: badgeAccent("audio-adventurer"),
    },
    {
      id: "tbr-tamer",
      name: "TBR Tamer",
      description: "Finished books that waited on your TBR.",
      image: badgeImage("tbr-tamer"),
      earned: snap.tbr.finishedFromTbr >= 3,
      earnedDate: "Aug 2026",
      progress: { current: snap.tbr.finishedFromTbr, target: 5 },
      accent: badgeAccent("tbr-tamer"),
    },
    {
      id: "list-explorer",
      name: "List Explorer",
      description: "Finished books from community reading lists.",
      image: badgeImage("list-explorer"),
      earned: listSources >= 1,
      earnedDate: listSources >= 1 ? "Aug 2026" : undefined,
      progress: { current: listSources, target: 5 },
      accent: badgeAccent("list-explorer"),
    },
    {
      id: "book-bestie",
      name: "Book Bestie",
      description: "Completed multiple books recommended by the same friend.",
      image: badgeImage("book-bestie"),
      earned: minaDone >= 1,
      earnedDate: "May 2026",
      progress: { current: minaDone, target: 5 },
      accent: badgeAccent("book-bestie"),
    },
    {
      id: "marathon-reader",
      name: "Marathon Reader",
      description: "Logged a 90+ minute reading session.",
      image: badgeImage("marathon-reader"),
      earned: snap.sessionStats.longestMinutes >= 90,
      progress: {
        current: Math.min(snap.sessionStats.longestMinutes, 90),
        target: 90,
      },
      accent: badgeAccent("marathon-reader"),
    },
  ];
}

function share(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
