"use client";

export type RoomVibe = "morning" | "afternoon" | "evening" | "rainy";

export type RoomPrefs = {
  vibe: RoomVibe;
  tutorialCompleted: boolean;
};

const KEY = "readlife-room-prefs-v1";

const DEFAULTS: RoomPrefs = {
  vibe: "afternoon",
  tutorialCompleted: false,
};

function hourDefaultVibe(): RoomVibe {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export function loadRoomPrefs(): RoomPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return { ...DEFAULTS, vibe: hourDefaultVibe() };
    }
    const parsed = JSON.parse(raw) as Partial<RoomPrefs>;
    return {
      vibe: parsed.vibe ?? hourDefaultVibe(),
      tutorialCompleted: Boolean(parsed.tutorialCompleted),
    };
  } catch {
    return { ...DEFAULTS, vibe: hourDefaultVibe() };
  }
}

export function saveRoomPrefs(prefs: RoomPrefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
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
  { id: "morning", label: "Morning", blurb: "Soft gold light through the panes" },
  { id: "afternoon", label: "Afternoon", blurb: "Warm daylight, perfect for chapters" },
  { id: "evening", label: "Evening", blurb: "Lamp glow and quiet pages" },
  { id: "rainy", label: "Rainy", blurb: "Soft rain against the glass" },
];
