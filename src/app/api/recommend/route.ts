import { NextResponse } from "next/server";
import { DISCOVER_BOOKS } from "@/components/search/data";
import {
  getOpenAIApiKey,
  missingKeyResponse,
  openaiChatJson,
  resolveOpenAIModel,
} from "@/lib/openai";

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

type RecommendItem = {
  id: string;
  reason: string;
  basedOn: string[];
  explanation: string;
};

const MIN_RECS = 4;
const MAX_RECS = 6;
const MAX_BASED_ON = 4;
const MAX_REASON = 160;
const MAX_EXPLANATION = 520;

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

function firstTitle(ids: string[] | undefined): string | null {
  if (!ids?.length) return null;
  for (const id of ids) {
    const book = DISCOVER_BOOKS.find((b) => b.id === id);
    if (book) return book.title;
  }
  return null;
}

function personalityLabel(blurb: string | undefined): string | null {
  const personality = (blurb ?? "").trim();
  if (!personality) return null;
  const name = personality.split(":")[0]?.trim() || personality;
  return name.length > 52 ? `${name.slice(0, 50)}…` : name;
}

function fallbackBasedOn(body: TastePayload): string[] {
  const labels: string[] = [];
  const finished = firstTitle(body.readIds);
  const loved = firstTitle(body.favoriteIds);
  if (finished) labels.push(`Finished ${finished}`);
  else if (loved) labels.push(`Favorite: ${loved}`);
  const reading = firstTitle(body.readingIds);
  if (reading && labels.length < MAX_BASED_ON) {
    labels.push(`Reading ${reading}`);
  }
  const genres = (body.genres ?? []).slice(0, 2);
  for (const g of genres) {
    if (labels.length >= MAX_BASED_ON) break;
    labels.push(`Genre: ${g}`);
  }
  const personality = personalityLabel(body.personalityBlurb);
  if (personality && labels.length < MAX_BASED_ON) {
    labels.push(`Personality: ${personality}`);
  }
  if ((body.tbrIds ?? []).length > 0 && labels.length < MAX_BASED_ON) {
    const tbrTitle = firstTitle(body.tbrIds);
    labels.push(tbrTitle ? `TBR near ${tbrTitle}` : "On your TBR adjacent");
  }
  if (labels.length === 0) labels.push("Your ReadLife taste");
  return labels.slice(0, MAX_BASED_ON);
}

function fallbackExplanation(
  bookTitle: string,
  body: TastePayload,
  basedOn: string[],
): string {
  const finished = firstTitle(body.readIds);
  const loved = firstTitle(body.favoriteIds);
  const reading = firstTitle(body.readingIds);
  const genres = (body.genres ?? []).slice(0, 2);
  const personality = personalityLabel(body.personalityBlurb);

  const parts: string[] = [];
  parts.push(
    `We picked ${bookTitle} because it lines up with concrete signals from your ReadLife shelf.`,
  );

  const shelfBits: string[] = [];
  if (finished) shelfBits.push(`you finished ${finished}`);
  if (loved && loved !== finished) shelfBits.push(`you favorited ${loved}`);
  if (reading) shelfBits.push(`you're currently reading ${reading}`);
  if (shelfBits.length) {
    parts.push(`It echoes books in your library — ${shelfBits.join(", ")}.`);
  }

  if (genres.length) {
    parts.push(
      `Genre overlap matters here: your taste includes ${genres.join(" and ")}, which this title shares.`,
    );
  }

  if (personality) {
    parts.push(
      `Your reading personality (${personality}) also points toward this kind of story.`,
    );
  }

  if (parts.length < 3 && basedOn.length) {
    parts.push(`Key signals: ${basedOn.slice(0, 3).join("; ")}.`);
  }

  return parts.join(" ").slice(0, MAX_EXPLANATION);
}

function normalizeBasedOn(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((v) => String(v ?? "").trim())
      .filter(Boolean)
      .map((s) => s.slice(0, 48))
      .slice(0, MAX_BASED_ON);
  }
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return [];
    return s
      .split(/[|;,]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => part.slice(0, 48))
      .slice(0, MAX_BASED_ON);
  }
  return [];
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
      .slice(0, MAX_REASON);
    if (!id || !reason) continue;
    const basedOn = normalizeBasedOn((item as { basedOn?: unknown }).basedOn);
    const explanation = String(
      (item as { explanation?: unknown }).explanation ?? "",
    )
      .trim()
      .slice(0, MAX_EXPLANATION);
    out.push({ id, reason, basedOn, explanation });
  }
  return out;
}

function validateAgainstCatalog(
  items: RecommendItem[],
  exclude: Set<string>,
  body: TastePayload,
  tasteFallback: string[],
): RecommendItem[] {
  const catalogIds = new Set(DISCOVER_BOOKS.map((b) => b.id));
  const seen = new Set<string>();
  const valid: RecommendItem[] = [];

  for (const item of items) {
    if (!catalogIds.has(item.id)) continue;
    if (exclude.has(item.id)) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    const book = DISCOVER_BOOKS.find((b) => b.id === item.id);
    const basedOn = item.basedOn.length > 0 ? item.basedOn : tasteFallback;
    const explanation =
      item.explanation ||
      fallbackExplanation(book?.title ?? "this book", body, basedOn);
    valid.push({
      ...item,
      basedOn,
      explanation,
    });
    if (valid.length >= MAX_RECS) break;
  }
  return valid;
}

export async function POST(request: Request) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    return NextResponse.json(missingKeyResponse(), { status: 503 });
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

  const model = resolveOpenAIModel();
  const tasteSummary = {
    recentlyRead: titlesForIds(body.readIds),
    currentlyReading: titlesForIds(body.readingIds),
    tbr: titlesForIds(body.tbrIds),
    favorites: titlesForIds(body.favoriteIds),
    genres: (body.genres ?? []).slice(0, 12),
    personality: (body.personalityBlurb ?? "").slice(0, 400),
  };
  const tasteFallback = fallbackBasedOn(body);

  const system = `You are ReadLife's book recommender. Recommend ONLY from the provided catalog JSON.
Return a JSON object:
{"recommendations":[{"id":"<catalog id>","reason":"<one short sentence why this fits>","basedOn":["<short label>","..."],"explanation":"<2-4 sentence paragraph for a Why? popup>"}]}.

Rules for each recommendation:
- reason: specific, warm, under 140 characters — explain the fit for THIS book, not generic praise.
- basedOn: 1–4 short labels (under 40 chars each) citing CONCRETE signals from the reader's taste payload. Prefer formats like: "Finished Circe", "Favorite: Piranesi", "Genre: Fantasy", "Personality: The Dream Wanderer (EIMO)", "Reading Babel", "TBR near The Night Circus".
- explanation: 2–4 sentences for a "Why we picked this" popup. Name the recommended title, cite real finished/favorite/reading/TBR titles when available, mention genre overlap, and include their personality name/code when present. No filler like "based on your overall tastes" without specifics.
- Never invent ids. Never cite books, genres, or personality traits that are not in the taste signals (light paraphrase of personality blurb is OK).
- Avoid generic fluff. Every sentence should reference a concrete signal or a clear catalog-book trait tied to those signals.
- Pick ${MIN_RECS} to ${MAX_RECS} books. Prefer variety across genres when taste allows.`;

  const user = `Reader taste signals:
${JSON.stringify(tasteSummary, null, 2)}

Catalog (only these ids are valid):
${JSON.stringify(catalog)}`;

  const chat = await openaiChatJson({
    apiKey,
    system,
    user,
    temperature: 0.7,
    model,
  });

  if (!chat.ok) {
    return NextResponse.json(
      { error: chat.error, detail: chat.detail },
      { status: chat.status },
    );
  }

  const parsed = parseRecommendations(chat.content);
  const recommendations = validateAgainstCatalog(
    parsed,
    exclude,
    body,
    tasteFallback,
  );

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
      const basedOn = tasteFallback;
      recommendations.push({
        id: book.id,
        reason: `A catalog match that fits signals like ${basedOn[0] ?? "your shelf"}.`,
        basedOn,
        explanation: fallbackExplanation(book.title, body, basedOn),
      });
    }
  }

  return NextResponse.json({
    recommendations: recommendations.slice(0, MAX_RECS),
    model: chat.model,
  });
}
