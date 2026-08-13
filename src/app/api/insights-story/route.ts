import { NextResponse } from "next/server";
import {
  getOpenAIApiKey,
  missingKeyResponse,
  openaiChatJson,
  parseJsonObject,
} from "@/lib/openai";

export const runtime = "nodejs";

const MAX_TITLE = 64;
const MAX_SUMMARY = 520;
const MAX_WHY = 220;

type StoryBody = {
  titleHint?: string;
  summaryFallback?: string;
  personality?: string;
  stats?: {
    booksFinished?: number;
    streakDays?: number;
    avgRating?: number;
    minutesRead?: number;
    sessions?: number;
    topGenres?: { genre: string; share: number }[];
    timeOfDay?: {
      morning?: number;
      afternoon?: number;
      evening?: number;
      lateNight?: number;
    };
    traits?: { label: string; value: number }[];
    confidencePct?: number;
  };
};

type StoryResult = {
  title: string;
  summary: string;
  why: string;
};

function parseStory(raw: string): StoryResult | null {
  const parsed = parseJsonObject(raw);
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as {
    title?: unknown;
    summary?: unknown;
    why?: unknown;
  };
  const title = String(o.title ?? "").trim().slice(0, MAX_TITLE);
  const summary = String(o.summary ?? "").trim().slice(0, MAX_SUMMARY);
  const why = String(o.why ?? "").trim().slice(0, MAX_WHY);
  if (!title || !summary) return null;
  return {
    title,
    summary,
    why: why || "Drawn from your recent finishes, pace, ratings, and genre mix.",
  };
}

export async function POST(request: Request) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    return NextResponse.json(missingKeyResponse(), { status: 503 });
  }

  let body: StoryBody = {};
  try {
    body = (await request.json()) as StoryBody;
  } catch {
    body = {};
  }

  const stats = body.stats ?? {};
  const topGenres = (stats.topGenres ?? []).slice(0, 5);
  if (
    typeof stats.booksFinished !== "number" &&
    topGenres.length === 0 &&
    !(body.personality ?? "").trim()
  ) {
    return NextResponse.json(
      { error: "Not enough reading signals for a story yet." },
      { status: 422 },
    );
  }

  const system = `You are ReadLife's Reader DNA narrator for the Insights page.
Write a personal, warm reading-identity blurb from the stats JSON.
Return JSON:
{"title":"<evocative 2–5 word reader archetype>","summary":"<2–4 sentences>","why":"<one short sentence naming the key signals used>"}.

Rules:
- title: poetic archetype name (not clinical). May riff on titleHint but can invent a better fit.
- summary: second person ("You…"). Cite concrete stats (genres, streak, ratings, night reading %). No medical/personality-disorder framing.
- why: under 160 chars — e.g. "Based on your fantasy share, evening minutes, and 5★ cluster."
- If personality is present, weave it lightly; do not contradict the behavioral stats.
- No markdown. No bullet lists.`;

  const user = `Templated title hint: ${String(body.titleHint ?? "").slice(0, 80)}
Templated summary (fallback voice): ${String(body.summaryFallback ?? "").slice(0, 400)}
Quiz personality: ${String(body.personality ?? "").slice(0, 400)}

Stats:
${JSON.stringify(
  {
    booksFinished: stats.booksFinished ?? 0,
    streakDays: stats.streakDays ?? 0,
    avgRating: stats.avgRating ?? 0,
    minutesRead: stats.minutesRead ?? 0,
    sessions: stats.sessions ?? 0,
    topGenres,
    timeOfDay: stats.timeOfDay ?? {},
    traits: (stats.traits ?? []).slice(0, 8),
    confidencePct: stats.confidencePct ?? 0,
  },
  null,
  2,
)}`;

  const result = await openaiChatJson({
    apiKey,
    system,
    user,
    temperature: 0.75,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, detail: result.detail },
      { status: result.status },
    );
  }

  const story = parseStory(result.content);
  if (!story) {
    return NextResponse.json(
      { error: "Could not shape your Reader DNA story. Try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ...story, model: result.model });
}
