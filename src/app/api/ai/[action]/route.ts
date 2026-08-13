import { NextResponse } from "next/server";
import {
  catalogCompact,
  filterValidIds,
  getCatalogBook,
  readersCompact,
  titlesForIds,
} from "@/lib/ai/catalog";
import {
  getOpenAIApiKey,
  missingKeyResponse,
  openaiChatJson,
  parseJsonObject,
} from "@/lib/openai";

export const runtime = "nodejs";

const ACTIONS = new Set([
  "review-polish",
  "tbr-coach",
  "session-companion",
  "book-chat",
  "personality-shelf",
  "taste-twins",
  "gift-recs",
  "list-curator",
  "habit-coach",
  "wrapped",
  "daily-challenge",
]);

type Ctx = { apiKey: string; body: Record<string, unknown> };

function clamp(s: unknown, max: number) {
  return String(s ?? "")
    .trim()
    .slice(0, max);
}

function asStringArray(v: unknown, max = 24) {
  if (!Array.isArray(v)) return [] as string[];
  return v.map((x) => String(x ?? "").trim()).filter(Boolean).slice(0, max);
}

async function chatJson(
  apiKey: string,
  system: string,
  user: string,
  temperature = 0.7,
) {
  return openaiChatJson({ apiKey, system, user, temperature });
}

function fail(result: Awaited<ReturnType<typeof openaiChatJson>>) {
  if (result.ok) return null;
  return NextResponse.json(
    { error: result.error, detail: result.detail },
    { status: result.status },
  );
}

/* ---------- handlers ---------- */

async function reviewPolish({ apiKey, body }: Ctx) {
  const notes = clamp(body.notes, 1200);
  const title = clamp(body.title, 120);
  const author = clamp(body.author, 80);
  const rating = Number(body.rating) || 0;
  if (!notes && !rating) {
    return NextResponse.json(
      { error: "Add a rating or a few notes to polish." },
      { status: 422 },
    );
  }

  const system = `You polish book reviews for ReadLife.
Return JSON: {"review":"<polished review 2-5 sentences>","suggestSpoilers":<boolean>,"tone":"<cozy|critical|short>"}.
Rules: keep the reader's opinions; warm literary voice; no invented plot facts; if notes are sparse, expand lightly from rating only; never claim quotes.`;

  const user = `Book: ${title} by ${author}
Rating: ${rating || "none"}/5
Notes: ${notes || "(none — expand from rating)"}
Preferred tone: ${clamp(body.tone, 24) || "cozy"}`;

  const result = await chatJson(apiKey, system, user, 0.65);
  const err = fail(result);
  if (err) return err;
  const parsed = parseJsonObject(result.ok ? result.content : "");
  if (!parsed || typeof parsed !== "object") {
    return NextResponse.json({ error: "Could not polish review." }, { status: 502 });
  }
  const o = parsed as Record<string, unknown>;
  return NextResponse.json({
    review: clamp(o.review, 1200),
    suggestSpoilers: Boolean(o.suggestSpoilers),
    tone: clamp(o.tone, 24) || "cozy",
    model: result.ok ? result.model : undefined,
  });
}

async function tbrCoach({ apiKey, body }: Ctx) {
  const tbrIds = filterValidIds(body.tbrIds);
  if (tbrIds.length === 0) {
    return NextResponse.json(
      { error: "Add books to your TBR first." },
      { status: 422 },
    );
  }
  const mood = clamp(body.mood, 40) || "any";
  const minutes = Math.min(240, Math.max(10, Number(body.minutes) || 45));
  const books = tbrIds.map((id) => {
    const b = getCatalogBook(id)!;
    return {
      id,
      title: b.title,
      author: b.author,
      genres: b.genres,
      pageCount: b.pageCount,
    };
  });

  const system = `You are ReadLife's TBR coach. Rank ONLY from the provided TBR list.
Return JSON: {"picks":[{"id":"<id>","reason":"<one sentence>","fit":"<why now>"}],"plan":"<one short reading plan sentence>"}.
Rules: never invent ids; respect mood and available minutes (shorter books for low minutes); warm, practical tone.`;

  const user = `Mood: ${mood}
Minutes available: ${minutes}
Goal hint: ${clamp(body.goalHint, 120)}
TBR:
${JSON.stringify(books)}`;

  const result = await chatJson(apiKey, system, user, 0.6);
  const err = fail(result);
  if (err) return err;
  const parsed = parseJsonObject(result.ok ? result.content : "");
  const o = (parsed && typeof parsed === "object" ? parsed : {}) as {
    picks?: unknown;
    plan?: unknown;
  };
  const valid = new Set(tbrIds);
  const picks: { id: string; reason: string; fit: string }[] = [];
  if (Array.isArray(o.picks)) {
    for (const p of o.picks) {
      if (!p || typeof p !== "object") continue;
      const id = clamp((p as { id?: unknown }).id, 64);
      if (!valid.has(id) || picks.some((x) => x.id === id)) continue;
      picks.push({
        id,
        reason: clamp((p as { reason?: unknown }).reason, 180),
        fit: clamp((p as { fit?: unknown }).fit, 180),
      });
      if (picks.length >= 5) break;
    }
  }
  if (!picks.length) {
    picks.push({
      id: tbrIds[0],
      reason: "Top of your shelf — a solid default when signals are thin.",
      fit: `Fits a ~${minutes}m window.`,
    });
  }
  return NextResponse.json({
    picks,
    plan: clamp(o.plan, 240) || `Start with ${getCatalogBook(picks[0].id)?.title}.`,
    model: result.ok ? result.model : undefined,
  });
}

async function sessionCompanion({ apiKey, body }: Ctx) {
  const title = clamp(body.title, 120);
  const author = clamp(body.author, 80);
  const minutes = Number(body.minutes) || 20;
  const pages = Number(body.pages) || 0;
  const progressPct = Math.min(100, Math.max(0, Number(body.progressPct) || 0));
  const notes = clamp(body.notes, 600);

  const system = `You are a cozy post-reading companion for ReadLife.
Return JSON: {"prompts":["<q1>","<q2>","<q3>"],"journalDraft":"<short reflection paragraph>","quoteIdea":"<optional vibe line, not a fake book quote>"}.
Rules: spoiler-safe for progressPct; do not invent plot beyond that; no fake attributed quotes from the book.`;

  const user = `Book: ${title} by ${author}
Minutes: ${minutes}; pages: ${pages}; progress: ${progressPct}%
Notes: ${notes || "(none)"}`;

  const result = await chatJson(apiKey, system, user, 0.7);
  const err = fail(result);
  if (err) return err;
  const parsed = parseJsonObject(result.ok ? result.content : "");
  const o = (parsed && typeof parsed === "object" ? parsed : {}) as Record<
    string,
    unknown
  >;
  const prompts = asStringArray(o.prompts, 3).map((p) => p.slice(0, 160));
  while (prompts.length < 3) {
    prompts.push("What lingered after you closed the book?");
  }
  return NextResponse.json({
    prompts,
    journalDraft: clamp(o.journalDraft, 800),
    quoteIdea: clamp(o.quoteIdea, 200),
    model: result.ok ? result.model : undefined,
  });
}

async function bookChat({ apiKey, body }: Ctx) {
  const title = clamp(body.title, 120);
  const author = clamp(body.author, 80);
  const message = clamp(body.message, 500);
  const progressPct = Math.min(100, Math.max(0, Number(body.progressPct) || 0));
  if (!message) {
    return NextResponse.json({ error: "Type a question first." }, { status: 422 });
  }
  const history = Array.isArray(body.history)
    ? body.history
        .slice(-8)
        .map((h) => {
          if (!h || typeof h !== "object") return null;
          const role = (h as { role?: string }).role === "assistant" ? "assistant" : "user";
          return { role, content: clamp((h as { content?: unknown }).content, 400) };
        })
        .filter(Boolean)
    : [];

  const system = `You are ReadLife's spoiler-gated book companion.
Return JSON: {"reply":"<helpful answer>","refusedSpoilers":<boolean>}.
HARD RULES:
- Reader is at ${progressPct}% — do NOT reveal plot, twists, or endings beyond that progress.
- If asked for later spoilers, refuse warmly and set refusedSpoilers true.
- Do not invent quotes as factual. Themes/vibes/general craft talk is OK.
- Keep reply under 120 words. Warm, concise.`;

  const user = `Book: ${title} by ${author}
Progress: ${progressPct}%
History: ${JSON.stringify(history)}
Question: ${message}`;

  const result = await chatJson(apiKey, system, user, 0.55);
  const err = fail(result);
  if (err) return err;
  const parsed = parseJsonObject(result.ok ? result.content : "");
  const o = (parsed && typeof parsed === "object" ? parsed : {}) as Record<
    string,
    unknown
  >;
  const reply = clamp(o.reply, 700);
  if (!reply) {
    return NextResponse.json({ error: "Could not answer right now." }, { status: 502 });
  }
  return NextResponse.json({
    reply,
    refusedSpoilers: Boolean(o.refusedSpoilers),
    model: result.ok ? result.model : undefined,
  });
}

async function personalityShelf({ apiKey, body }: Ctx) {
  const personality = clamp(body.personality, 400);
  const exclude = new Set(asStringArray(body.excludeIds, 80));
  const catalog = catalogCompact([...exclude]).slice(0, 80);
  if (catalog.length < 5) {
    return NextResponse.json(
      { error: "Not enough catalog left for a shelf." },
      { status: 422 },
    );
  }

  const system = `You build a 5-book shelf for a ReadLife reading personality.
Return JSON: {"picks":[{"id":"<catalog id>","reason":"<one sentence>"}],"headline":"<short shelf name>"}.
Only use catalog ids.`;

  const user = `Personality: ${personality || "curious literary explorer"}
Genres liked: ${JSON.stringify(asStringArray(body.genres, 12))}
Catalog: ${JSON.stringify(catalog)}`;

  const result = await chatJson(apiKey, system, user, 0.7);
  const err = fail(result);
  if (err) return err;
  const parsed = parseJsonObject(result.ok ? result.content : "");
  const o = (parsed && typeof parsed === "object" ? parsed : {}) as {
    picks?: unknown;
    headline?: unknown;
  };
  const valid = new Set(catalog.map((c) => c.id));
  const picks: { id: string; reason: string }[] = [];
  if (Array.isArray(o.picks)) {
    for (const p of o.picks) {
      if (!p || typeof p !== "object") continue;
      const id = clamp((p as { id?: unknown }).id, 64);
      if (!valid.has(id) || picks.some((x) => x.id === id)) continue;
      picks.push({ id, reason: clamp((p as { reason?: unknown }).reason, 180) });
      if (picks.length >= 5) break;
    }
  }
  return NextResponse.json({
    picks,
    headline: clamp(o.headline, 80) || "A shelf for your type",
    model: result.ok ? result.model : undefined,
  });
}

async function tasteTwins({ apiKey, body }: Ctx) {
  const genres = asStringArray(body.genres, 12);
  const readers = readersCompact();
  const system = `Rank ReadLife demo readers by taste overlap.
Return JSON: {"twins":[{"id":"<reader id>","blurb":"<why they match>","overlap":"<short label>"}]}.
Only use provided reader ids. Pick 3-5.`;

  const user = `My genres: ${JSON.stringify(genres)}
Personality: ${clamp(body.personality, 200)}
Favorite titles: ${JSON.stringify(titlesForIds(asStringArray(body.favoriteIds, 12), 12))}
Readers: ${JSON.stringify(readers)}`;

  const result = await chatJson(apiKey, system, user, 0.55);
  const err = fail(result);
  if (err) return err;
  const parsed = parseJsonObject(result.ok ? result.content : "");
  const o = (parsed && typeof parsed === "object" ? parsed : {}) as {
    twins?: unknown;
  };
  const valid = new Set(readers.map((r) => r.id));
  const twins: { id: string; blurb: string; overlap: string }[] = [];
  if (Array.isArray(o.twins)) {
    for (const t of o.twins) {
      if (!t || typeof t !== "object") continue;
      const id = clamp((t as { id?: unknown }).id, 64);
      if (!valid.has(id) || twins.some((x) => x.id === id)) continue;
      twins.push({
        id,
        blurb: clamp((t as { blurb?: unknown }).blurb, 200),
        overlap: clamp((t as { overlap?: unknown }).overlap, 80),
      });
      if (twins.length >= 5) break;
    }
  }
  if (!twins.length) {
    for (const r of readers.slice(0, 3)) {
      twins.push({
        id: r.id,
        blurb: `Shares ${r.favoriteGenres.slice(0, 2).join(" & ") || "curious"} tastes.`,
        overlap: r.favoriteGenres[0] ?? "Taste adjacent",
      });
    }
  }
  return NextResponse.json({
    twins,
    model: result.ok ? result.model : undefined,
  });
}

async function giftRecs({ apiKey, body }: Ctx) {
  const prefs = clamp(body.prefs, 600);
  if (!prefs) {
    return NextResponse.json(
      { error: "Describe what your friend likes." },
      { status: 422 },
    );
  }
  const exclude = new Set(asStringArray(body.excludeIds, 40));
  const catalog = catalogCompact([...exclude]).slice(0, 80);

  const system = `Recommend gift books from the catalog only.
Return JSON: {"gifts":[{"id":"<id>","reason":"<why>","note":"<short gift note>"}],"message":"<one gift card message>"}.
Pick 4-6.`;

  const user = `Friend prefs: ${prefs}
Catalog: ${JSON.stringify(catalog)}`;

  const result = await chatJson(apiKey, system, user, 0.7);
  const err = fail(result);
  if (err) return err;
  const parsed = parseJsonObject(result.ok ? result.content : "");
  const o = (parsed && typeof parsed === "object" ? parsed : {}) as {
    gifts?: unknown;
    message?: unknown;
  };
  const valid = new Set(catalog.map((c) => c.id));
  const gifts: { id: string; reason: string; note: string }[] = [];
  if (Array.isArray(o.gifts)) {
    for (const g of o.gifts) {
      if (!g || typeof g !== "object") continue;
      const id = clamp((g as { id?: unknown }).id, 64);
      if (!valid.has(id) || gifts.some((x) => x.id === id)) continue;
      gifts.push({
        id,
        reason: clamp((g as { reason?: unknown }).reason, 180),
        note: clamp((g as { note?: unknown }).note, 160),
      });
      if (gifts.length >= 6) break;
    }
  }
  return NextResponse.json({
    gifts,
    message: clamp(o.message, 280),
    model: result.ok ? result.model : undefined,
  });
}

async function listCurator({ apiKey, body }: Ctx) {
  const brief = clamp(body.brief, 400);
  if (!brief) {
    return NextResponse.json(
      { error: "Describe the list you want." },
      { status: 422 },
    );
  }
  const catalog = catalogCompact(asStringArray(body.excludeIds, 40)).slice(0, 80);

  const system = `Curate a named reading list from the catalog only.
Return JSON: {"title":"<list title>","description":"<1-2 sentences>","books":[{"id":"<id>","blurb":"<why on this list>"}]}.
Pick 5-8 books.`;

  const user = `Brief: ${brief}
Catalog: ${JSON.stringify(catalog)}`;

  const result = await chatJson(apiKey, system, user, 0.7);
  const err = fail(result);
  if (err) return err;
  const parsed = parseJsonObject(result.ok ? result.content : "");
  const o = (parsed && typeof parsed === "object" ? parsed : {}) as Record<
    string,
    unknown
  >;
  const valid = new Set(catalog.map((c) => c.id));
  const books: { id: string; blurb: string }[] = [];
  if (Array.isArray(o.books)) {
    for (const b of o.books) {
      if (!b || typeof b !== "object") continue;
      const id = clamp((b as { id?: unknown }).id, 64);
      if (!valid.has(id) || books.some((x) => x.id === id)) continue;
      books.push({
        id,
        blurb: clamp((b as { blurb?: unknown }).blurb, 160),
      });
      if (books.length >= 8) break;
    }
  }
  return NextResponse.json({
    title: clamp(o.title, 80) || "Curated list",
    description: clamp(o.description, 280),
    books,
    model: result.ok ? result.model : undefined,
  });
}

async function habitCoach({ apiKey, body }: Ctx) {
  const stats = body.stats && typeof body.stats === "object" ? body.stats : {};
  const system = `You are a gentle ReadLife habit coach (no guilt).
Return JSON: {"risk":"<one sentence risk or opportunity>","plan":"<concrete 20-minute plan>","nudge":"<short encouraging nudge>","focusBookHint":"<optional title from payload or empty>"}.`;

  const user = `Stats: ${JSON.stringify(stats).slice(0, 2500)}
Stalled / TBR notes: ${clamp(body.notes, 300)}`;

  const result = await chatJson(apiKey, system, user, 0.6);
  const err = fail(result);
  if (err) return err;
  const parsed = parseJsonObject(result.ok ? result.content : "");
  const o = (parsed && typeof parsed === "object" ? parsed : {}) as Record<
    string,
    unknown
  >;
  return NextResponse.json({
    risk: clamp(o.risk, 220),
    plan: clamp(o.plan, 320),
    nudge: clamp(o.nudge, 180),
    focusBookHint: clamp(o.focusBookHint, 120),
    model: result.ok ? result.model : undefined,
  });
}

async function wrapped({ apiKey, body }: Ctx) {
  const kind = body.kind === "year" ? "year" : "month";
  const stats = body.stats && typeof body.stats === "object" ? body.stats : {};
  const allowedTitles = asStringArray(body.allowedTitles, 24);

  const system =
    kind === "month"
      ? `Write ReadLife monthly Wrapped slide copy.
Return JSON: {"slides":[{"id":"intro"|"books"|"minutes"|"genre"|"highest"|"surprise"|"era"|"dna"|"sentence","eyebrow":"<opt>","title":"<str>","emphasis":"<opt>","body":"<str>"}]}.
Rules: warm Instagram-story voice; only cite book titles from allowedTitles; use real stats; do not invent finishes; skip share slide.`
      : `Write ReadLife yearly Wrapped slide copy.
Return JSON: {"slides":[{"id":"y1"|"y2"|"y3"|"y4"|"y5"|"y6"|"sentence","eyebrow":"<opt>","title":"<str>","emphasis":"<opt>","body":"<str>"}]}.
Rules: warm year-in-review voice; only cite allowedTitles; use real stats; skip share slide.`;

  const user = `Kind: ${kind}
Label: ${clamp(body.label, 40)}
DNA title: ${clamp(body.dnaTitle, 80)}
Allowed titles: ${JSON.stringify(allowedTitles)}
Stats: ${JSON.stringify(stats).slice(0, 3000)}`;

  const result = await chatJson(apiKey, system, user, 0.75);
  const err = fail(result);
  if (err) return err;
  const parsed = parseJsonObject(result.ok ? result.content : "");
  const o = (parsed && typeof parsed === "object" ? parsed : {}) as {
    slides?: unknown;
  };
  const slides: {
    id: string;
    eyebrow?: string;
    title: string;
    emphasis?: string;
    body?: string;
  }[] = [];
  if (Array.isArray(o.slides)) {
    for (const s of o.slides) {
      if (!s || typeof s !== "object") continue;
      const id = clamp((s as { id?: unknown }).id, 32);
      const title = clamp((s as { title?: unknown }).title, 80);
      if (!id || !title) continue;
      slides.push({
        id,
        title,
        eyebrow: clamp((s as { eyebrow?: unknown }).eyebrow, 40) || undefined,
        emphasis: clamp((s as { emphasis?: unknown }).emphasis, 80) || undefined,
        body: clamp((s as { body?: unknown }).body, 280) || undefined,
      });
    }
  }
  if (!slides.length) {
    return NextResponse.json(
      { error: "Could not shape Wrapped slides." },
      { status: 502 },
    );
  }
  return NextResponse.json({
    slides,
    model: result.ok ? result.model : undefined,
  });
}

function hashDate(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

async function dailyChallenge({ apiKey, body }: Ctx) {
  const date = clamp(body.date, 12) || new Date().toISOString().slice(0, 10);
  const catalog = catalogCompact().slice(0, 60);
  const seed = hashDate(date);
  const answer = catalog[seed % catalog.length];
  const distractors: typeof catalog = [];
  for (let i = 1; distractors.length < 3 && i < catalog.length; i++) {
    const b = catalog[(seed + i * 7) % catalog.length];
    if (b.id !== answer.id && !distractors.some((d) => d.id === b.id)) {
      distractors.push(b);
    }
  }

  const system = `Create a daily book guess challenge.
Return JSON: {"emojis":"<3-6 emoji string>","clue":"<one spoiler-light sentence>","blurb":"<ultra-short vibe without naming the book>"}.
The secret book is given; never name it in clue/blurb.`;

  const user = `Date: ${date}
Secret book: ${answer.title} by ${answer.author} genres=${answer.genres.join(",")}`;

  const result = await chatJson(apiKey, system, user, 0.8);
  let emojis = "📚✨🌙";
  let clue = "An atmospheric favorite from the ReadLife shelf.";
  let blurb = "Follow the vibe, not the title.";
  if (result.ok) {
    const parsed = parseJsonObject(result.content);
    if (parsed && typeof parsed === "object") {
      const o = parsed as Record<string, unknown>;
      emojis = clamp(o.emojis, 24) || emojis;
      clue = clamp(o.clue, 180) || clue;
      blurb = clamp(o.blurb, 160) || blurb;
    }
  }

  const options = [answer, ...distractors]
    .map((b) => ({ id: b.id, title: b.title, author: b.author }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return NextResponse.json({
    date,
    emojis,
    clue,
    blurb,
    options,
    answerId: answer.id,
    model: result.ok ? result.model : undefined,
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  if (!ACTIONS.has(action)) {
    return NextResponse.json({ error: "Unknown AI action." }, { status: 404 });
  }

  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    return NextResponse.json(missingKeyResponse(), { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const ctx: Ctx = { apiKey, body };

  switch (action) {
    case "review-polish":
      return reviewPolish(ctx);
    case "tbr-coach":
      return tbrCoach(ctx);
    case "session-companion":
      return sessionCompanion(ctx);
    case "book-chat":
      return bookChat(ctx);
    case "personality-shelf":
      return personalityShelf(ctx);
    case "taste-twins":
      return tasteTwins(ctx);
    case "gift-recs":
      return giftRecs(ctx);
    case "list-curator":
      return listCurator(ctx);
    case "habit-coach":
      return habitCoach(ctx);
    case "wrapped":
      return wrapped(ctx);
    case "daily-challenge":
      return dailyChallenge(ctx);
    default:
      return NextResponse.json({ error: "Unknown AI action." }, { status: 404 });
  }
}
