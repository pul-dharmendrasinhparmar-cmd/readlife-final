import { NextResponse } from "next/server";
import { DISCOVER_BOOKS } from "@/components/search/data";
import {
  getOpenAIApiKey,
  missingKeyResponse,
  openaiChatJson,
  parseJsonObject,
} from "@/lib/openai";

export const runtime = "nodejs";

const MAX_RESULTS = 8;
const MAX_REASON = 160;
const MIN_QUERY = 8;
const MAX_QUERY = 280;

type SearchHit = { id: string; reason: string };

function catalogCompact() {
  return DISCOVER_BOOKS.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    genres: b.genres,
    blurb: b.description.slice(0, 180),
  }));
}

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
    out.push({ id, reason });
  }
  return out;
}

function validateHits(items: SearchHit[]): SearchHit[] {
  const catalogIds = new Set(DISCOVER_BOOKS.map((b) => b.id));
  const seen = new Set<string>();
  const valid: SearchHit[] = [];
  for (const item of items) {
    if (!catalogIds.has(item.id)) continue;
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
  try {
    const body = (await request.json()) as { query?: unknown };
    query = String(body.query ?? "").trim();
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

  const catalog = catalogCompact();
  const system = `You are ReadLife's natural-language book search for the Discover catalog.
Match the reader's vibe query to books ONLY from the provided catalog JSON.
Return a JSON object:
{"results":[{"id":"<catalog id>","reason":"<one short sentence why this fits the query>"}]}.

Rules:
- Rank best matches first. Return 4–${MAX_RESULTS} books when possible.
- reason: specific, warm, under 140 characters — tie THIS book to the query (mood, tropes, tone, pace). No generic praise.
- Never invent ids. Prefer variety when several books fit.
- Respect soft negatives in the query (e.g. "not too dark", "no romance") by down-ranking or skipping mismatches.
- If almost nothing fits, still return the closest 2–3 with honest reasons.`;

  const user = `Vibe query:
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

  const results = validateHits(parseHits(result.content));
  return NextResponse.json({ results, model: result.model, query });
}
