"use client";

import { storageKey } from "@/lib/user-storage";

export type RoomVibe = "day" | "night" | "rainy" | "snowy";

export type RoomPrefs = {
  vibe: RoomVibe;
  tutorialCompleted: boolean;
};

const KEY = "readlife-room-prefs-v1";

const DEFAULTS: RoomPrefs = {
  vibe: "day",
  tutorialCompleted: false,
};

const VALID_VIBES = new Set<RoomVibe>(["day", "night", "rainy", "snowy"]);

/** Map legacy Morning/Afternoon/Evening prefs onto the new Day/Night set. */
function migrateVibe(raw: unknown): RoomVibe | null {
  if (typeof raw !== "string") return null;
  if (VALID_VIBES.has(raw as RoomVibe)) return raw as RoomVibe;
  if (raw === "morning" || raw === "afternoon") return "day";
  if (raw === "evening") return "night";
  return null;
}

function hourDefaultVibe(): RoomVibe {
  const h = new Date().getHours();
  if (h >= 6 && h < 18) return "day";
  return "night";
}

export function loadRoomPrefs(): RoomPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(storageKey(KEY));
    if (!raw) {
      return { ...DEFAULTS, vibe: hourDefaultVibe() };
    }
    const parsed = JSON.parse(raw) as Partial<RoomPrefs>;
    return {
      vibe: migrateVibe(parsed.vibe) ?? hourDefaultVibe(),
      tutorialCompleted: Boolean(parsed.tutorialCompleted),
    };
  } catch {
    return { ...DEFAULTS, vibe: hourDefaultVibe() };
  }
}

export function saveRoomPrefs(prefs: RoomPrefs) {
  try {
    localStorage.setItem(storageKey(KEY), JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function setRoomVibe(vibe: RoomVibe): RoomPrefs {
  const next = { ...loadRoomPrefs(), vibe };
  saveRoomPrefs(next);
  return next;
}

export function setTutorialCompleted(done = true): RoomPrefs {
  const next = { ...loadRoomPrefs(), tutorialCompleted: done };
  saveRoomPrefs(next);
  return next;
}

export const VIBE_OPTIONS: {
  id: RoomVibe;
  label: string;
  blurb: string;
}[] = [
  { id: "day", label: "Day", blurb: "Sunlit panes and a clear view of town" },
  { id: "night", label: "Night", blurb: "Moonlight, stars, and quiet lamp glow" },
  { id: "rainy", label: "Rainy", blurb: "Soft rain against the glass" },
  { id: "snowy", label: "Snowy", blurb: "Fresh snowfall and a warm mug" },
];

export const VIBE_SCENE: Record<RoomVibe, string> = {
  day: "/rooms/dashboard-scene-day.png",
  night: "/rooms/dashboard-scene-night.png",
  rainy: "/rooms/dashboard-scene-rainy.png",
  snowy: "/rooms/dashboard-scene-snowy.png",
};

const VIBE_SCENE_MALE: Record<RoomVibe, string> = {
  day: "/rooms/dashboard-scene-day-male.jpg",
  night: "/rooms/dashboard-scene-night-male.jpg",
  rainy: "/rooms/dashboard-scene-rainy-male.jpg",
  snowy: "/rooms/dashboard-scene-snowy-male.jpg",
};

export function resolveVibeScene(
  vibe: RoomVibe,
  avatar: "male" | "female" | "custom" | null | undefined,
): string {
  if (avatar === "male") return VIBE_SCENE_MALE[vibe];
  return VIBE_SCENE[vibe];
}
