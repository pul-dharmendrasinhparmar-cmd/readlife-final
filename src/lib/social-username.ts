/** Shared username helpers for registration + social profiles. */

export function slugifyUsername(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

export function usernameFromIdentity(name?: string | null, email?: string | null) {
  const fromName = slugifyUsername(name ?? "");
  if (fromName.length >= 3) return fromName;
  const local = email?.split("@")[0] ?? "reader";
  const fromEmail = slugifyUsername(local);
  return fromEmail.length >= 3 ? fromEmail : `reader${Date.now().toString(36).slice(-4)}`;
}
