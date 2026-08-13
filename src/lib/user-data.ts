/**
 * Server-backed sync for signed-in ReadLife localStorage state.
 * Guest demo keys stay unscoped and are never uploaded.
 */

export const USER_DATA_VERSION = 1 as const;

export type UserDataPayload = {
  version: typeof USER_DATA_VERSION;
  entries: Record<string, string>;
};

const META_BASE_KEYS = new Set([
  "readlife-active-user-id",
  "readlife-auth-hints-v1",
]);

/** Exact base keys we always include when present. */
export const SYNC_BASE_KEYS = [
  "readlife-discovery-v2",
  "readlife-discovery-v1",
  "readlife-profile-v1",
  "readlife-onboarding-v1",
  "readlife-games-profile-v1",
  "readlife-personality-progress-v1",
  "readlife-personality-history-v1",
  "readlife-personality-active-v1",
  "readlife-personality-demo-seeded-v1",
  "readlife-personality-skip-demo",
  "readlife-journal-v1",
  "readlife-quotes-v1",
  "readlife-room-prefs-v1",
  "readlife-today-goal-v1",
  "readlife-mailbox-v1",
  "readlife-book-forum-v1",
  "readlife-lexicon-stats-v1",
  "readlife-uncovered-stats-v1",
  "readlife-pieces-stats-v1",
  "readlife-trolley-stats-v1",
  "readlife-trolley-tutorial",
  "readlife-bookbound-stats-v1",
  "readlife-bookbound-intro",
  "readlife-bookbound-mute",
] as const;

/** Prefixes for dynamic keys (e.g. bookworm per-level progress). */
export const SYNC_KEY_PREFIXES = ["readlife-bookworm:"] as const;

const MAX_PAYLOAD_CHARS = 1_500_000;

export function emptyUserDataPayload(): UserDataPayload {
  return { version: USER_DATA_VERSION, entries: {} };
}

export function isSyncableBaseKey(baseKey: string): boolean {
  if (!baseKey.startsWith("readlife-")) return false;
  if (META_BASE_KEYS.has(baseKey)) return false;
  if ((SYNC_BASE_KEYS as readonly string[]).includes(baseKey)) return true;
  return SYNC_KEY_PREFIXES.some((p) => baseKey.startsWith(p));
}

export function parseUserDataPayload(raw: unknown): UserDataPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const entriesRaw = obj.entries;
  if (!entriesRaw || typeof entriesRaw !== "object") return null;
  const entries: Record<string, string> = {};
  for (const [key, value] of Object.entries(entriesRaw as Record<string, unknown>)) {
    if (typeof key !== "string" || !isSyncableBaseKey(key)) continue;
    if (typeof value !== "string") continue;
    entries[key] = value;
  }
  return { version: USER_DATA_VERSION, entries };
}

export function payloadHasEntries(payload: UserDataPayload | null | undefined): boolean {
  return Boolean(payload && Object.keys(payload.entries).length > 0);
}

export function assertPayloadSize(payload: UserDataPayload): boolean {
  try {
    return JSON.stringify(payload).length <= MAX_PAYLOAD_CHARS;
  } catch {
    return false;
  }
}

/** Collect user-scoped localStorage values as baseKey → raw string. */
export function collectUserEntries(userId: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  const suffix = `::u:${userId}`;
  const entries: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const full = localStorage.key(i);
      if (!full || !full.endsWith(suffix)) continue;
      const baseKey = full.slice(0, -suffix.length);
      if (!isSyncableBaseKey(baseKey)) continue;
      const value = localStorage.getItem(full);
      if (value != null) entries[baseKey] = value;
    }
  } catch {
    // private mode / quota
  }
  return entries;
}

export function collectUserPayload(userId: string): UserDataPayload {
  return { version: USER_DATA_VERSION, entries: collectUserEntries(userId) };
}

/**
 * Replace user-scoped sync keys with server entries.
 * Clears prior syncable user keys so removals don't linger.
 */
export function applyUserEntries(
  userId: string,
  entries: Record<string, string>,
): void {
  if (typeof window === "undefined") return;
  const suffix = `::u:${userId}`;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const full = localStorage.key(i);
      if (!full || !full.endsWith(suffix)) continue;
      const baseKey = full.slice(0, -suffix.length);
      if (isSyncableBaseKey(baseKey)) toRemove.push(full);
    }
    for (const key of toRemove) localStorage.removeItem(key);
    for (const [baseKey, value] of Object.entries(entries)) {
      if (!isSyncableBaseKey(baseKey) || typeof value !== "string") continue;
      localStorage.setItem(`${baseKey}::u:${userId}`, value);
    }
  } catch {
    // ignore
  }
}
