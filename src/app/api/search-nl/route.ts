import { NextResponse } from "next/server";
import { DISCOVER_BOOKS } from "@/components/search/data";
import { catalogCompact } from "@/lib/ai/catalog";
import {
  getOpenAIApiKey,
  missingKeyResponse,
  openaiChatJson,
  parseJsonObject,
} from "@/lib/openai";

export const runtime = "nodejs";

const MAX_RESULTS = 8;
const MAX_REASON = 180;
const MAX_EXPLANATION = 420;
const MIN_QUERY = 5;
const MAX_QUERY = 280;

type SearchHit = {
  id: string;
  reason: string;
  explanation: string;
  vibeTags: string[];
};

function parseHits(raw: string): SearchHit[] {
  const parsed = parseJsonObject(raw);
  if (!parsed || typeof parsed !== "object") return [];
  const list = Array.isArray((parsed as { results?: unknown }).results)
    ? (parsed as { results: unknown[] }).results
    : Array.isArray(parsed)
      ? parsed
      : [];

  const out: SearchHit[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const id = String((item as { id?: unknown }).id ?? "").trim();
    const reason = String((item as { reason?: unknown }).reason ?? "")
      .trim()
      .slice(0, MAX_REASON);
    if (!id || !reason) continue;
    const explanation = String(
      (item as { explanation?: unknown }).explanation ?? "",
    )
      .trim()
      .slice(0, MAX_EXPLANATION);
    const vibeTagsRaw = (item as { vibeTags?: unknown }).vibeTags;
    const vibeTags = Array.isArray(vibeTagsRaw)
      ? vibeTagsRaw
          .map((t) => String(t ?? "").trim())
          .filter(Boolean)
          .map((t) => t.slice(0, 40))
          .slice(0, 4)
      : [];
    out.push({
      id,
      reason,
      explanation: explanation || reason,
      vibeTags,
    });
  }
  return out;
}

function validateHits(items: SearchHit[], exclude: Set<string>): SearchHit[] {
  const catalogIds = new Set(DISCOVER_BOOKS.map((b) => b.id));
  const seen = new Set<string>();
  const valid: SearchHit[] = [];
  for (const item of items) {
    if (!catalogIds.has(item.id)) continue;
    if (exclude.has(item.id)) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    valid.push(item);
    if (valid.length >= MAX_RESULTS) break;
  }
  return valid;
}

export async function POST(request: Request) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    return NextResponse.json(missingKeyResponse(), { status: 503 });
  }

  let query = "";
  let excludeIds: string[] = [];
  try {
    const body = (await request.json()) as {
      query?: unknown;
      excludeIds?: unknown;
    };
    query = String(body.query ?? "").trim();
    if (Array.isArray(body.excludeIds)) {
      excludeIds = body.excludeIds
        .map((id) => String(id ?? "").trim())
        .filter(Boolean)
        .slice(0, 80);
    }
  } catch {
    query = "";
  }

  if (query.length < MIN_QUERY) {
    return NextResponse.json(
      {
        error: `Describe the vibe in at least ${MIN_QUERY} characters.`,
        results: [],
      },
      { status: 400 },
    );
  }
  query = query.slice(0, MAX_QUERY);
  const exclude = new Set(excludeIds);
  const catalog = catalogCompact(excludeIds);

  const system = `You are ReadLife's AI vibe recommender for the Discover catalog.
The reader describes a mood, trope mix, pace, or soft filters. Recommend books ONLY from the catalog JSON.

Return JSON:
{"results":[{
  "id":"<catalog id>",
  "reason":"<one punchy sentence tying THIS book to the vibe>",
  "explanation":"<2-3 sentences: specific plot/tone/genre cues that match the query; honest if it's a soft fit>",
  "vibeTags":["<short tag>","<short tag>"]
}]}

Rules:
- Rank best matches first. Return 5–${MAX_RESULTS} when possible.
- reason: warm, specific, under 160 chars — never generic ("great book").
- explanation: must mention concrete aspects of THIS book that answer the vibe (comfort, tension, found family, humor, etc.).
- vibeTags: 2–4 short chips from the query (e.g. "comfort", "found family", "low stakes").
- Never invent ids. Prefer variety across authors when several fit.
- Honor soft negatives ("not too dark", "no romance") by skipping mismatches.
- If almost nothing fits, still return 2–3 closest with honest reasons.`;

  const user = `Vibe:
${query}

Catalog (only these ids are valid):
${JSON.stringify(catalog)}`;

  const result = await openaiChatJson({
    apiKey,
    system,
    user,
    temperature: 0.55,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, detail: result.detail, results: [] },
      { status: result.status },
    );
  }

  const results = validateHits(parseHits(result.content), exclude);
  return NextResponse.json({ results, model: result.model, query });
}
