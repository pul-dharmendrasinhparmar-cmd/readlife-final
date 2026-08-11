import type { DiscoveryState } from "@/components/search/types";
import type { BadgeDef, PeriodSnapshot } from "./types";

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
      earned: night >= 60,
      earnedDate: night >= 60 ? "Aug 2026" : undefined,
      progress: { current: night, target: 70 },
    },
    {
      id: "genre-hopper",
      name: "Genre Hopper",
      description: "Read five different genres in the period.",
      earned: genres >= 5,
      earnedDate: genres >= 5 ? "Aug 2026" : undefined,
      progress: { current: Math.min(genres, 5), target: 5 },
    },
    {
      id: "second-chance",
      name: "Second Chance",
      description: "Returned to and completed a paused book.",
      earned: resumed,
      earnedDate: resumed ? "Jul 2026" : undefined,
      progress: { current: snap.pauseStats.resumed, target: 1 },
    },
    {
      id: "hidden-gem",
      name: "Hidden Gem Hunter",
      description: "Finished lesser-discovered books you loved.",
      earned: true,
      earnedDate: "Jun 2026",
    },
    {
      id: "audio",
      name: "Audio Adventurer",
      description: "Audiobooks represented a meaningful share of time.",
      earned: audioShare >= 20,
      earnedDate: audioShare >= 20 ? "Aug 2026" : undefined,
      progress: { current: audioShare, target: 40 },
    },
    {
      id: "tbr-tamer",
      name: "TBR Tamer",
      description: "Finished books that waited on your TBR.",
      earned: snap.tbr.finishedFromTbr >= 3,
      earnedDate: "Aug 2026",
      progress: { current: snap.tbr.finishedFromTbr, target: 5 },
    },
    {
      id: "list-explorer",
      name: "List Explorer",
      description: "Finished books from community reading lists.",
      earned: listSources >= 1,
      earnedDate: listSources >= 1 ? "Aug 2026" : undefined,
      progress: { current: listSources, target: 5 },
    },
    {
      id: "book-bestie",
      name: "Book Bestie",
      description: "Completed multiple books recommended by the same friend.",
      earned: minaDone >= 1,
      earnedDate: "May 2026",
      progress: { current: minaDone, target: 5 },
    },
    {
      id: "marathon",
      name: "Marathon Reader",
      description: "Logged a 90+ minute reading session.",
      earned: snap.sessionStats.longestMinutes >= 90,
      progress: {
        current: Math.min(snap.sessionStats.longestMinutes, 90),
        target: 90,
      },
    },
  ];
}

function share(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
