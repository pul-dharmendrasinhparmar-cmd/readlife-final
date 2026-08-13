import { NextResponse } from "next/server";
import { DISCOVER_BOOKS } from "@/components/search/data";

export const runtime = "nodejs";

type TastePayload = {
  readIds?: string[];
  readingIds?: string[];
  tbrIds?: string[];
  favoriteIds?: string[];
  genres?: string[];
  personalityBlurb?: string;
  /** Book ids the user already owns — never recommend these */
  excludeIds?: string[];
};

type RecommendItem = { id: string; reason: string };

const DEFAULT_MODEL = "gpt-4o-mini";
const MIN_RECS = 4;
const MAX_RECS = 6;

function catalogCompact() {
  return DISCOVER_BOOKS.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    genres: b.genres,
  }));
}

function titlesForIds(ids: string[] | undefined) {
  if (!ids?.length) return [];
  return ids
    .map((id) => {
      const book = DISCOVER_BOOKS.find((b) => b.id === id);
      return book ? `${book.title} (${book.id})` : id;
    })
    .slice(0, 24);
}

function parseRecommendations(raw: string): RecommendItem[] {
  const trimmed = raw.trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\[[\s\S]*\]/);
    if (!match) return [];
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return [];
    }
  }

  const list = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { recommendations?: unknown }).recommendations)
      ? (parsed as { recommendations: unknown[] }).recommendations
      : [];

  const out: RecommendItem[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const id = String((item as { id?: unknown }).id ?? "").trim();
    const reason = String((item as { reason?: unknown }).reason ?? "")
      .trim()
      .slice(0, 160);
    if (!id || !reason) continue;
    out.push({ id, reason });
  }
  return out;
}

function validateAgainstCatalog(
  items: RecommendItem[],
  exclude: Set<string>,
): RecommendItem[] {
  const catalogIds = new Set(DISCOVER_BOOKS.map((b) => b.id));
  const seen = new Set<string>();
  const valid: RecommendItem[] = [];

  for (const item of items) {
    if (!catalogIds.has(item.id)) continue;
    if (exclude.has(item.id)) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    valid.push(item);
    if (valid.length >= MAX_RECS) break;
  }
  return valid;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not set. Add it to .env.local locally, or to Netlify Environment variables for deploy. Restart the dev server after adding it.",
      },
      { status: 503 },
    );
  }

  let body: TastePayload = {};
  try {
    body = (await request.json()) as TastePayload;
  } catch {
    body = {};
  }

  const exclude = new Set<string>([
    ...(body.excludeIds ?? []),
    ...(body.readIds ?? []),
    ...(body.readingIds ?? []),
    ...(body.tbrIds ?? []),
  ]);

  const catalog = catalogCompact().filter((b) => !exclude.has(b.id));
  if (catalog.length < MIN_RECS) {
    return NextResponse.json(
      { error: "Not enough catalog books left to recommend.", recommendations: [] },
      { status: 422 },
    );
  }

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  const tasteSummary = {
    recentlyRead: titlesForIds(body.readIds),
    currentlyReading: titlesForIds(body.readingIds),
    tbr: titlesForIds(body.tbrIds),
    favorites: titlesForIds(body.favoriteIds),
    genres: (body.genres ?? []).slice(0, 12),
    personality: (body.personalityBlurb ?? "").slice(0, 400),
  };

  const system = `You are ReadLife's book recommender. Recommend ONLY from the provided catalog JSON.
Return a JSON object: {"recommendations":[{"id":"<catalog id>","reason":"<one short sentence why this fits the reader>"}]}.
Pick ${MIN_RECS} to ${MAX_RECS} books. Reasons must be specific, warm, and under 140 characters. Never invent ids. Prefer variety across genres when taste allows.`;

  const user = `Reader taste signals:
${JSON.stringify(tasteSummary, null, 2)}

Catalog (only these ids are valid):
${JSON.stringify(catalog)}`;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text().catch(() => "");
      const status = openaiRes.status === 429 ? 429 : 502;
      return NextResponse.json(
        {
          error:
            openaiRes.status === 429
              ? "OpenAI rate limit reached. Try again in a moment."
              : "OpenAI request failed. Try again shortly.",
          detail: process.env.NODE_ENV === "development" ? errText.slice(0, 300) : undefined,
        },
        { status },
      );
    }

    const data = (await openaiRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseRecommendations(content);
    const recommendations = validateAgainstCatalog(parsed, exclude);

    if (recommendations.length < MIN_RECS) {
      // Soft fallback: fill from catalog genres if model under-delivered
      const genreSet = new Set(
        (body.genres ?? []).map((g) => g.toLowerCase()),
      );
      for (const book of DISCOVER_BOOKS) {
        if (recommendations.length >= MIN_RECS) break;
        if (exclude.has(book.id)) continue;
        if (recommendations.some((r) => r.id === book.id)) continue;
        const genreHit =
          genreSet.size === 0 ||
          book.genres.some((g) => genreSet.has(g.toLowerCase()));
        if (!genreHit && genreSet.size > 0) continue;
        recommendations.push({
          id: book.id,
          reason: "A strong catalog match for your shelf.",
        });
      }
    }

    return NextResponse.json({
      recommendations: recommendations.slice(0, MAX_RECS),
      model,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach OpenAI. Check your network and try again." },
      { status: 502 },
    );
  }
}
