"use client";

export type MailItem = {
  id: string;
  kind: "buddy" | "badge" | "list" | "wrapped" | "party";
  title: string;
  body: string;
  at: string;
  unread: boolean;
  href?: string;
};

const KEY = "readlife-mailbox-v1";

const SEED: MailItem[] = [
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
    id: "m-badge-1",
    kind: "badge",
    title: "Night Owl unlocked",
    body: "You logged three evening sessions this week. Soft lamp energy.",
    at: "2026-08-10T22:05:00.000Z",
    unread: true,
    href: "/profile",
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

export function loadMailbox(): MailItem[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    const parsed = JSON.parse(raw) as MailItem[];
    return Array.isArray(parsed) && parsed.length ? parsed : [...SEED];
  } catch {
    return [...SEED];
  }
}

export function markMailboxRead(id?: string): MailItem[] {
  const items = loadMailbox().map((m) =>
    !id || m.id === id ? { ...m, unread: false } : m,
  );
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
  return items;
}

export function unreadCount(items: MailItem[] = loadMailbox()) {
  return items.filter((m) => m.unread).length;
}
