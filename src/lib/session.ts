import { auth } from "@/auth";

/** Server-side session helper (App Router Server Components / Route Handlers). */
export async function getSession() {
  return auth();
}

/** Returns the signed-in user id, or null for guests. */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
