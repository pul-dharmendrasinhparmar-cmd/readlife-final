/**
 * Namespace client localStorage by Auth.js user id.
 * Guests keep unscoped keys (demo seed). Authenticated users use
 * `${baseKey}::u:${userId}` and never inherit guest demo data.
 */

export type StorageScope = "guest" | (string & {});

export type AuthUserHints = {
  id: string;
  name?: string | null;
  email?: string | null;
};

const ACTIVE_USER_KEY = "readlife-active-user-id";
const AUTH_HINTS_KEY = "readlife-auth-hints-v1";

let scope: StorageScope = "guest";
let hints: AuthUserHints | null = null;

function readPersistedScope(): StorageScope {
  if (typeof window === "undefined") return "guest";
  try {
    const id = localStorage.getItem(ACTIVE_USER_KEY);
    return id && id.length > 0 ? id : "guest";
  } catch {
    return "guest";
  }
}

function readPersistedHints(): AuthUserHints | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_HINTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUserHints;
  } catch {
    return null;
  }
}

if (typeof window !== "undefined") {
  scope = readPersistedScope();
  hints = readPersistedHints();
}

export function getStorageScope(): StorageScope {
  return scope;
}

export function isGuestStorage(): boolean {
  return scope === "guest";
}

/** Alex / marketing demo seeds apply only while browsing as a guest. */
export function shouldSeedDemo(): boolean {
  return scope === "guest";
}

export function getAuthHints(): AuthUserHints | null {
  return hints;
}

/** Guest: original key. Signed-in: per-user namespace (no guest bleed). */
export function storageKey(baseKey: string): string {
  if (scope === "guest") return baseKey;
  return `${baseKey}::u:${scope}`;
}

export function bindUserStorage(user: AuthUserHints) {
  scope = user.id;
  hints = {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
  };
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_USER_KEY, user.id);
    localStorage.setItem(AUTH_HINTS_KEY, JSON.stringify(hints));
  } catch {
    // ignore quota / private mode
  }
}

export function bindGuestStorage() {
  scope = "guest";
  hints = null;
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_USER_KEY);
    localStorage.removeItem(AUTH_HINTS_KEY);
  } catch {
    // ignore
  }
}

export function displayNameFromHints(user?: AuthUserHints | null): string {
  const u = user ?? hints;
  if (!u) return "Reader";
  return u.name?.trim() || u.email?.split("@")[0] || "Reader";
}

export function usernameFromHints(user?: AuthUserHints | null): string {
  const base = displayNameFromHints(user)
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "")
    .slice(0, 24);
  return base || "reader";
}
