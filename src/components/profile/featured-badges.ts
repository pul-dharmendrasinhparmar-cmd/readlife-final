import type { BadgeDef } from "@/components/insights/types";
import { ACHIEVEMENT_CATALOG } from "@/components/games/hub/achievements";
import type { GameProfile } from "@/components/games/hub/types";

export const MAX_FEATURED_BADGES = 4;

export type FeaturedBadgeSource = "insights" | "games";

export type FeaturedBadgeOption = {
  id: string;
  name: string;
  description: string;
  /** Square art path under /public when available */
  image?: string;
  emoji?: string;
  accent: string;
  source: FeaturedBadgeSource;
  earned: boolean;
  /** ISO timestamp or sortable date string for recent-first defaults */
  earnedAt?: string;
};

const GAMES_ACCENT = "#c4a1ff";

/** Merge Insights reading badges + Games achievements into one selectable list. */
export function buildSelectableBadges(
  insightsBadges: BadgeDef[],
  gameProfile: GameProfile | null,
): FeaturedBadgeOption[] {
  const reading: FeaturedBadgeOption[] = insightsBadges.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    image: b.image,
    accent: b.accent,
    source: "insights" as const,
    earned: b.earned,
    earnedAt: b.earnedDate
      ? parseLooseEarnedDate(b.earnedDate)
      : undefined,
  }));

  const progressById = new Map(
    (gameProfile?.achievements ?? []).map((a) => [a.achievementId, a]),
  );

  const games: FeaturedBadgeOption[] = ACHIEVEMENT_CATALOG.filter(
    (def) => def.iconSrc,
  ).map((def) => {
    const progress = progressById.get(def.id);
    return {
      id: def.id,
      name: def.title,
      description: def.description,
      image: def.iconSrc,
      emoji: def.icon,
      accent: GAMES_ACCENT,
      source: "games" as const,
      earned: Boolean(progress?.completed),
      earnedAt: progress?.completed && progress.unlockedAt
        ? progress.unlockedAt
        : undefined,
    };
  });

  return sortRecentlyEarnedFirst([...reading, ...games]);
}

/** Prefer saved selection; otherwise show most recently earned (up to max). */
export function resolveFeaturedBadges(
  featuredBadgeIds: string[] | undefined,
  options: FeaturedBadgeOption[],
  max = MAX_FEATURED_BADGES,
): FeaturedBadgeOption[] {
  const byId = new Map(options.map((b) => [b.id, b]));
  const selected = (featuredBadgeIds ?? [])
    .map((id) => byId.get(id))
    .filter((b): b is FeaturedBadgeOption => Boolean(b));

  if (selected.length > 0) {
    return selected.slice(0, max);
  }

  return options.filter((b) => b.earned).slice(0, max);
}

function sortRecentlyEarnedFirst(
  badges: FeaturedBadgeOption[],
): FeaturedBadgeOption[] {
  return [...badges].sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    const at = a.earnedAt ? Date.parse(a.earnedAt) : 0;
    const bt = b.earnedAt ? Date.parse(b.earnedAt) : 0;
    if (at !== bt) return bt - at;
    if (a.source !== b.source) {
      return a.source === "insights" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

/** Convert "Aug 2026" style labels into a sortable ISO-ish date. */
function parseLooseEarnedDate(label: string): string | undefined {
  const m = label.trim().match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (!m) return undefined;
  const months: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  const mm = months[m[1]];
  if (!mm) return undefined;
  return `${m[2]}-${mm}-15T12:00:00.000Z`;
}
