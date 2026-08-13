"use client";

import { storageKey } from "@/lib/user-storage";

export type VoteValue = "up" | "down" | "like";

const KEY = "readlife-book-votes-v1";

type Store = Record<string, VoteValue>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(KEY));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  localStorage.setItem(storageKey(KEY), JSON.stringify(store));
}

export function loadVotes(): Store {
  return readStore();
}

export function getVote(targetId: string): VoteValue | null {
  return readStore()[targetId] ?? null;
}

/**
 * Toggle vote for a target.
 * - up/down: second click on same clears; opposite switches
 * - like: toggles on/off
 */
export function toggleVote(
  targetId: string,
  next: VoteValue,
): { vote: VoteValue | null; delta: number } {
  const store = readStore();
  const prev = store[targetId] ?? null;

  let vote: VoteValue | null;
  if (next === "like") {
    vote = prev === "like" ? null : "like";
  } else if (prev === next) {
    vote = null;
  } else {
    vote = next;
  }

  if (vote) store[targetId] = vote;
  else delete store[targetId];
  writeStore(store);

  const scoreOf = (v: VoteValue | null) =>
    v === "up" || v === "like" ? 1 : v === "down" ? -1 : 0;
  return { vote, delta: scoreOf(vote) - scoreOf(prev) };
}

export function scoreWithVote(base: number, vote: VoteValue | null): number {
  if (vote === "up" || vote === "like") return base + 1;
  if (vote === "down") return Math.max(0, base - 1);
  return base;
}
