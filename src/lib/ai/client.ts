export type AiAction =
  | "review-polish"
  | "tbr-coach"
  | "session-companion"
  | "book-chat"
  | "personality-shelf"
  | "taste-twins"
  | "gift-recs"
  | "list-curator"
  | "habit-coach"
  | "wrapped"
  | "daily-challenge";

export type AiFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

export async function aiFetch<T = Record<string, unknown>>(
  action: AiAction,
  body: Record<string, unknown> = {},
): Promise<AiFetchResult<T>> {
  try {
    const res = await fetch(`/api/ai/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as T & {
      error?: string;
    };
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error:
          (typeof data.error === "string" && data.error) ||
          "AI request failed. Try again shortly.",
      };
    }
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      status: 0,
      error: "Network error. Check your connection and try again.",
    };
  }
}
