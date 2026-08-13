"use client";

import {
  applyUserEntries,
  collectUserPayload,
  emptyUserDataPayload,
  parseUserDataPayload,
  payloadHasEntries,
  type UserDataPayload,
} from "@/lib/user-data";

const PUSH_DEBOUNCE_MS = 800;

let suppressPush = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let hooked = false;
let activeUserId: string | null = null;
let onLocalChange: (() => void) | null = null;

export function setUserDataPushSuppressed(value: boolean) {
  suppressPush = value;
}

export async function fetchServerUserData(): Promise<{
  payload: UserDataPayload;
  updatedAt: string | null;
} | null> {
  try {
    const res = await fetch("/api/user/data", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      payload?: unknown;
      updatedAt?: string | null;
    };
    const payload =
      parseUserDataPayload(json.payload) ?? emptyUserDataPayload();
    return { payload, updatedAt: json.updatedAt ?? null };
  } catch {
    return null;
  }
}

export async function pushUserDataToServer(
  userId: string,
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!userId || userId === "guest") return false;
  const payload = collectUserPayload(userId);
  try {
    const res = await fetch("/api/user/data", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function scheduleUserDataPush(userId: string) {
  if (suppressPush) return;
  if (!userId || userId === "guest") return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    if (suppressPush) return;
    void pushUserDataToServer(userId);
  }, PUSH_DEBOUNCE_MS);
}

function isUserScopedKey(key: string, userId: string) {
  return key.endsWith(`::u:${userId}`);
}

/** Patch localStorage so user-scoped writes trigger a debounced cloud save. */
export function installUserDataStorageHook(
  userId: string,
  notify: () => void,
) {
  activeUserId = userId;
  onLocalChange = notify;

  if (typeof window === "undefined" || hooked) return;
  hooked = true;

  const proto = Storage.prototype;
  const originalSet = proto.setItem;
  const originalRemove = proto.removeItem;

  proto.setItem = function patchedSetItem(key: string, value: string) {
    originalSet.call(this, key, value);
    if (
      this === localStorage &&
      activeUserId &&
      !suppressPush &&
      isUserScopedKey(key, activeUserId)
    ) {
      onLocalChange?.();
    }
  };

  proto.removeItem = function patchedRemoveItem(key: string) {
    originalRemove.call(this, key);
    if (
      this === localStorage &&
      activeUserId &&
      !suppressPush &&
      isUserScopedKey(key, activeUserId)
    ) {
      onLocalChange?.();
    }
  };
}

export function clearUserDataStorageHook() {
  activeUserId = null;
  onLocalChange = null;
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
}

/**
 * On login: restore server blobs into user-scoped localStorage when present.
 * If the server is empty, keep the clean slate (or local writes) and upload.
 */
export async function hydrateUserDataFromServer(
  userId: string,
): Promise<"restored" | "local" | "error"> {
  setUserDataPushSuppressed(true);
  try {
    const remote = await fetchServerUserData();
    if (!remote) return "error";
    if (payloadHasEntries(remote.payload)) {
      applyUserEntries(userId, remote.payload.entries);
      return "restored";
    }
    return "local";
  } finally {
    setUserDataPushSuppressed(false);
  }
}

export { payloadHasEntries };
