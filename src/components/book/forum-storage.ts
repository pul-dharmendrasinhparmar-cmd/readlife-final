"use client";

import { storageKey } from "@/lib/user-storage";
import type { ForumComment, ForumPost } from "./types";

const KEY = "readlife-book-forum-v1";
const REPLIES_KEY = "readlife-book-forum-replies-v1";

type Store = Record<string, ForumPost[]>;
type RepliesStore = Record<string, ForumComment[]>;

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

function readReplies(): RepliesStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(REPLIES_KEY));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as RepliesStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeReplies(store: RepliesStore) {
  localStorage.setItem(storageKey(REPLIES_KEY), JSON.stringify(store));
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

export function loadThreadReplies(threadId: string): ForumComment[] {
  return readReplies()[threadId] ?? [];
}

export function addThreadReply(
  threadId: string,
  input: { username: string; body: string; spoilers?: boolean },
): ForumComment {
  const store = readReplies();
  const comment: ForumComment = {
    id: `reply-${threadId}-${Date.now()}`,
    username: input.username,
    body: input.body.trim(),
    atLabel: "just now",
    score: 1,
    spoilers: input.spoilers,
  };
  store[threadId] = [...(store[threadId] ?? []), comment];
  writeReplies(store);
  return comment;
}
