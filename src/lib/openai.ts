/**
 * Shared OpenAI chat helpers for ReadLife API routes.
 * OPENAI_API_KEY stays server-side only — never import this from client components.
 */

export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

export type ChatJsonResult =
  | { ok: true; content: string; model: string }
  | { ok: false; status: number; error: string; detail?: string };

export function getOpenAIApiKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || undefined;
}

export function missingKeyResponse() {
  return {
    error:
      "OPENAI_API_KEY is not set. Add it to .env.local locally, or to Netlify Environment variables for deploy. Restart the dev server after adding it.",
  };
}

export function resolveOpenAIModel(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

type ChatJsonOptions = {
  apiKey: string;
  system: string;
  user: string;
  temperature?: number;
  model?: string;
};

/** Chat Completions with JSON object response_format. */
export async function openaiChatJson(
  options: ChatJsonOptions,
): Promise<ChatJsonResult> {
  const model = options.model ?? resolveOpenAIModel();
  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: options.temperature ?? 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: options.system },
          { role: "user", content: options.user },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text().catch(() => "");
      const status = openaiRes.status === 429 ? 429 : 502;
      return {
        ok: false,
        status,
        error:
          openaiRes.status === 429
            ? "OpenAI rate limit reached. Try again in a moment."
            : "OpenAI request failed. Try again shortly.",
        detail:
          process.env.NODE_ENV === "development"
            ? errText.slice(0, 300)
            : undefined,
      };
    }

    const data = (await openaiRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    return { ok: true, content, model };
  } catch {
    return {
      ok: false,
      status: 502,
      error: "Could not reach OpenAI. Check your network and try again.",
    };
  }
}

/** Parse a JSON object from model output, with a loose fallback. */
export function parseJsonObject(raw: string): unknown | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
