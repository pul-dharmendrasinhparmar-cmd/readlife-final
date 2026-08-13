"use client";

import { storageKey } from "@/lib/user-storage";
import type { ForumPost } from "./types";

const KEY = "readlife-book-forum-v1";

type Store = Record<string, ForumPost[]>;

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

export function loadUserForumPosts(bookId: string): ForumPost[] {
  return readStore()[bookId] ?? [];
}

export function addUserForumPost(
  bookId: string,
  input: {
    username: string;
    title: string;
    body: string;
    spoilers: boolean;
    progressPct: number;
  },
): ForumPost {
  const store = readStore();
  const post: ForumPost = {
    id: `user-${bookId}-${Date.now()}`,
    username: input.username,
    title: input.title.trim() || `Thoughts from ${input.progressPct}%`,
    body: input.body.trim(),
    spoilers: input.spoilers,
    progressPct: Math.max(0, Math.min(100, input.progressPct)),
    score: 1,
    commentCount: 0,
  };
  store[bookId] = [post, ...(store[bookId] ?? [])];
  writeStore(store);
  return post;
}
