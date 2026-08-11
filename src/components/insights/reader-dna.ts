import type { DiscoveryState } from "@/components/search/types";
import type { PeriodSnapshot, ReaderDna } from "./types";

/**
 * Reader DNA generation (SIMULATED AI interpretation).
 * Arithmetic traits come from PeriodSnapshot + library.
 * Title/summary/explanations are rule-templated "AI-like" copy — not an LLM call.
 */
export function generateReaderDna(
  state: DiscoveryState,
  snap: PeriodSnapshot,
): ReaderDna {
  const finished = state.entries.filter((e) => e.status === "read").length;
  const sessions = snap.sessions.value;
  const confidencePct = Math.min(
    96,
    35 + finished * 4 + Math.min(sessions, 20),
  );
  const confidence =
    confidencePct < 45 ? "forming" : confidencePct < 75 ? "medium" : "high";

  const night = snap.timeOfDay.evening + snap.timeOfDay.lateNight;
  const fantasy = snap.genreShare.find((g) => g.genre === "Fantasy");
  const literary = snap.genreShare.find(
    (g) => g.genre === "Literary" || g.genre === "Magical Realism",
  );
  const favorites = state.entries.filter((e) => e.isFavorite).length;

  const traits = [
    {
      id: "immersion",
      label: "World Immersion",
      value: clamp(78 + (fantasy?.share ?? 0) / 3),
      previous: 82,
      why: `Fantasy and atmospheric titles dominate your finishes (${fantasy?.share ?? 30}% fantasy share). Long evening sessions reinforce deep immersion.`,
    },
    {
      id: "character",
      label: "Character Focus",
      value: clamp(80 + favorites),
      previous: 84,
      why: `You mark favorites and write character-forward reviews (${favorites} favorites logged). Character-driven books sit above your average rating.`,
    },
    {
      id: "emotion",
      label: "Emotional Intensity",
      value: clamp(74 + (snap.ratingDist[5] || 0) * 2),
      previous: 79,
      why: `You awarded ${snap.ratingDist[5] || 3} five-star ratings among recent finishes — intensity shows up in both ratings and review language.`,
    },
    {
      id: "atmosphere",
      label: "Atmosphere Seeking",
      value: clamp(84 + night / 20),
      previous: 82,
      why: `${night}% of reading minutes happen in evening/late night — a pattern that correlates with atmospheric, immersive picks.`,
    },
    {
      id: "exploration",
      label: "Genre Exploration",
      value: clamp(50 + snap.genreShare.length * 3),
      previous: 51,
      why: `You touched ${snap.genreShare.length} genres in this window, including literary and speculative detours beyond core fantasy.`,
    },
    {
      id: "plot",
      label: "Plot Intensity",
      value: clamp(48 + (snap.genreShare.find((g) => g.genre === "Thriller")?.share ?? 8)),
      previous: 52,
      why: "Thrillers and high-stakes fantasy appear, but atmospheric character work still outranks pure plot engines in your ratings.",
    },
    {
      id: "comfort",
      label: "Comfort Reading",
      value: clamp(38 + (snap.genreShare.find((g) => g.genre === "Cozy")?.share ?? 5)),
      previous: 48,
      why: "Cozy and comfort tags appear (Legends & Lattes, House in the Cerulean Sea) but share less of your recent shelf than immersive fantasy.",
    },
    {
      id: "experimental",
      label: "Experimental Taste",
      value: clamp(52 + (literary?.share ?? 10) / 2),
      previous: 55,
      why: "Literary and unconventional structures (Piranesi, Hamnet, Bunny DNFs) show curiosity — with selective follow-through.",
    },
  ];

  const title =
    night >= 60
      ? "The Midnight Worldhopper"
      : fantasy && fantasy.share >= 30
        ? "The Immersive Wanderer"
        : "The Curious Chapter-Keeper";

  const summary = `You read for immersion, atmosphere, and characters you carry after the last page. ${fantasy ? `Fantasy remains a home base (${fantasy.share}% of finishes)` : "Your shelf spans multiple homes"}, while ${night}% of your minutes land after late afternoon — a classic night-reader rhythm.`;

  return {
    title,
    summary,
    generatedAt: "August 2026",
    dataPoints: `Based on ${finished} completed books, ${snap.sessions.value} sessions, ratings, reviews, and reading behavior.`,
    confidence,
    confidencePct,
    traits,
    previousTitle: "The Midnight Dreamer",
    quizPersonality: "The Dream Wanderer",
    quizComparison:
      "Your quiz says you're a Dream Wanderer (mood-led, immersive, solo). Your behavior agrees — atmosphere and character matter even more than genre labels.",
    provenance: "hybrid",
  };
}

function clamp(n: number) {
  return Math.max(5, Math.min(98, Math.round(n)));
}
