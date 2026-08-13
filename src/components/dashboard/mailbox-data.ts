"use client";

import { shouldSeedDemo, storageKey } from "@/lib/user-storage";

export type MailItem = {
  id: string;
  kind: "buddy" | "badge" | "list" | "wrapped" | "party" | "game" | "book" | "update";
  title: string;
  body: string;
  at: string;
  unread: boolean;
  href?: string;
};

const KEY = "readlife-mailbox-v1";

const SEED: MailItem[] = [
  {
    id: "m-game-1",
    kind: "game",
    title: "Daily Bookle is ready",
    body: "A fresh puzzle is waiting. Keep your game streak going.",
    at: "2026-08-12T08:00:00.000Z",
    unread: true,
    href: "/games",
  },
  {
    id: "m-game-2",
    kind: "game",
    title: "Mina climbed the Bookworm board",
    body: "She's at 4,820 — three spots above you this week.",
    at: "2026-08-12T07:15:00.000Z",
    unread: true,
    href: "/games",
  },
  {
    id: "m-buddy-1",
    kind: "buddy",
    title: "Mina is catching up",
    body: "She's at 39% on The Night Circus — roughly together with you.",
    at: "2026-08-11T09:20:00.000Z",
    unread: true,
    href: "/profile",
  },
  {
    id: "m-book-1",
    kind: "book",
    title: "From your shelf",
    body: "Piranesi is trending with readers who loved The Night Circus.",
    at: "2026-08-11T16:40:00.000Z",
    unread: true,
    href: "/search",
  },
  {
    id: "m-badge-1",
    kind: "badge",
    title: "Night Owl unlocked",
    body: "You logged three evening sessions this week. Soft lamp energy.",
    at: "2026-08-10T22:05:00.000Z",
    unread: true,
    href: "/profile",
  },
  {
    id: "m-update-1",
    kind: "update",
    title: "Games hub is open",
    body: "Bookle and Bookworm now live on their own page — streaks, boards, and badges included.",
    at: "2026-08-10T12:00:00.000Z",
    unread: false,
    href: "/games",
  },
  {
    id: "m-list-1",
    kind: "list",
    title: "Mina shared a list",
    body: "Books That Feel Like Dreams — three titles match your DNA.",
    at: "2026-08-09T14:00:00.000Z",
    unread: false,
    href: "/search",
  },
  {
    id: "m-party-1",
    kind: "party",
    title: "Reading party tonight",
    body: "Cozy Fantasy Hour · 8pm · bring tea and a soft book.",
    at: "2026-08-11T11:00:00.000Z",
    unread: true,
  },
  {
    id: "m-wrapped-1",
    kind: "wrapped",
    title: "August Wrapped is brewing",
    body: "Your month so far: fantasy-heavy, evening-leaning, streak intact.",
    at: "2026-08-08T10:00:00.000Z",
    unread: false,
    href: "/insights",
  },
];

function sortMail(items: MailItem[]) {
  return [...items].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}

/** Merge any new seed messages the user doesn't have yet. */
function mergeSeed(existing: MailItem[]): MailItem[] {
  const ids = new Set(existing.map((m) => m.id));
  const missing = SEED.filter((m) => !ids.has(m.id));
  if (!missing.length) return sortMail(existing);
  return sortMail([...missing, ...existing]);
}

export function loadMailbox(): MailItem[] {
  if (typeof window === "undefined") {
    return shouldSeedDemo() ? sortMail([...SEED]) : [];
  }
  try {
    const raw = localStorage.getItem(storageKey(KEY));
    if (!raw) {
      if (!shouldSeedDemo()) return [];
      const seeded = sortMail([...SEED]);
      localStorage.setItem(storageKey(KEY), JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as MailItem[];
    if (!shouldSeedDemo()) {
      return Array.isArray(parsed) ? sortMail(parsed) : [];
    }
    const base =
      Array.isArray(parsed) && parsed.length ? parsed : [...SEED];
    const merged = mergeSeed(base);
    localStorage.setItem(storageKey(KEY), JSON.stringify(merged));
    return merged;
  } catch {
    return shouldSeedDemo() ? sortMail([...SEED]) : [];
  }
}

export function markMailboxRead(id?: string): MailItem[] {
  const items = loadMailbox().map((m) =>
    !id || m.id === id ? { ...m, unread: false } : m,
  );
  try {
    localStorage.setItem(storageKey(KEY), JSON.stringify(items));
  } catch {
    // ignore
  }
  return items;
}

export function unreadCount(items: MailItem[] = loadMailbox()) {
  return items.filter((m) => m.unread).length;
}
