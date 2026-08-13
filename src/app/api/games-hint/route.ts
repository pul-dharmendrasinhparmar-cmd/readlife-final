import { NextResponse } from "next/server";
import {
  getOpenAIApiKey,
  missingKeyResponse,
  openaiChatJson,
  parseJsonObject,
} from "@/lib/openai";

export const runtime = "nodejs";

const MAX_HINT = 180;

type GameKind = "bookle" | "uncovered-cover" | "uncovered-emoji";

type HintBody = {
  game?: string;
  /** Bookle: literary theme title/tagline + secret answer (server-only; never echo back). */
  themeTitle?: string;
  themeTagline?: string;
  themeAuthor?: string;
  answer?: string;
  /** Uncovered: secret book metadata for a soft clue. */
  title?: string;
  author?: string;
  genre?: string;
  difficulty?: string;
  /** Optional emoji sequence for emoji mode (no title in client prompt needed). */
  emojis?: string[];
  /** Adaptive: how many AI hints already used this round (0+). */
  hintsUsed?: number;
  /** Adaptive: guess/attempt count so far. */
  attempt?: number;
};

function parseHint(raw: string): string | null {
  const parsed = parseJsonObject(raw);
  if (!parsed || typeof parsed !== "object") return null;
  const hint = String((parsed as { hint?: unknown }).hint ?? "").trim();
  return hint ? hint.slice(0, MAX_HINT) : null;
}

function normalizeGame(raw: string | undefined): GameKind | null {
  const g = (raw ?? "").trim().toLowerCase();
  if (g === "bookle") return "bookle";
  if (g === "uncovered-cover" || g === "uncovered") return "uncovered-cover";
  if (g === "uncovered-emoji" || g === "emoji") return "uncovered-emoji";
  return null;
}

export async function POST(request: Request) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    return NextResponse.json(missingKeyResponse(), { status: 503 });
  }

  let body: HintBody = {};
  try {
    body = (await request.json()) as HintBody;
  } catch {
    body = {};
  }

  const game = normalizeGame(body.game);
  if (!game) {
    return NextResponse.json(
      { error: "Unknown game. Use bookle, uncovered-cover, or uncovered-emoji." },
      { status: 400 },
    );
  }

  const hintsUsed = Math.max(0, Math.min(5, Number(body.hintsUsed) || 0));
  const attempt = Math.max(0, Math.min(12, Number(body.attempt) || 0));
  const adaptNote = `Hint strength level ${hintsUsed + 1} (0=vague vibe, higher=more specific still without spoilers). Player attempts so far: ${attempt}.`;

  let system = "";
  let user = "";

  if (game === "bookle") {
    const answer = String(body.answer ?? "").trim().toUpperCase();
    const themeTitle = String(body.themeTitle ?? "").trim();
    if (!answer || answer.length < 3 || !themeTitle) {
      return NextResponse.json(
        { error: "Bookle hints need themeTitle and answer." },
        { status: 400 },
      );
    }

    system = `You write ONE soft spoiler-safe hint for Bookle (a book-themed Wordle).
Return JSON: {"hint":"<one short sentence>"}.

HARD RULES — never break these:
- NEVER reveal, spell, anagram, rhyme with, or partially quote the secret answer word.
- NEVER mention any letter, letter count, first/last letter, or keyboard position.
- Do NOT say the answer is a character, place, or title if that would uniquely identify the exact word.
- Give a vibe-only clue: genre feel, era atmosphere, literary mood, or how the word relates to the theme book in a fuzzy way.
- Keep under 140 characters. Warm, playful, no spoilers for book plots beyond tone.
- Adapt specificity: early hints (level 1) are very vague; later levels may name era/genre more clearly but still never the word.`;

    user = `Theme book: ${themeTitle}
Author: ${String(body.themeAuthor ?? "").slice(0, 80)}
Tagline: ${String(body.themeTagline ?? "").slice(0, 160)}
Secret answer word (DO NOT reveal): ${answer}
${adaptNote}`;
  } else {
    const title = String(body.title ?? "").trim();
    const author = String(body.author ?? "").trim();
    if (!title || !author) {
      return NextResponse.json(
        { error: "Uncovered hints need title and author." },
        { status: 400 },
      );
    }

    const modeLabel =
      game === "uncovered-emoji" ? "emoji-plot" : "hidden-cover";

    system = `You write ONE soft spoiler-safe hint for Uncovered (${modeLabel} mode).
Return JSON: {"hint":"<one short sentence>"}.

HARD RULES:
- NEVER reveal the book title, subtitle, series name, or distinctive proper nouns from the title.
- NEVER quote unique title words. Author surname only if the player already has author-level hints elsewhere — prefer not naming the author.
- Give genre / era / tone / setting vibe only (e.g. "cozy found-family fantasy with a gentle magic school feel").
- Keep under 140 characters. Useful but not a giveaway.
- Adapt: level 1 ultra-vague mood; higher levels may add setting/era but never the title.`;

    user = `Secret book (DO NOT name it): ${title} by ${author}
Genre: ${String(body.genre ?? "fiction").slice(0, 60)}
Difficulty: ${String(body.difficulty ?? "medium").slice(0, 20)}
${
  game === "uncovered-emoji" && Array.isArray(body.emojis)
    ? `Emoji plot shown to player: ${body.emojis.slice(0, 5).join(" ")}`
    : "Player sees a cropped cover only."
}
${adaptNote}`;
  }

  const result = await openaiChatJson({
    apiKey,
    system,
    user,
    temperature: 0.85,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, detail: result.detail },
      { status: result.status },
    );
  }

  const hint = parseHint(result.content);
  if (!hint) {
    return NextResponse.json(
      { error: "Could not craft a hint. Try again." },
      { status: 502 },
    );
  }

  // Extra safety: strip accidental answer leakage for Bookle
  if (game === "bookle") {
    const answer = String(body.answer ?? "").trim().toUpperCase();
    const upper = hint.toUpperCase();
    if (answer && upper.includes(answer)) {
      return NextResponse.json({
        hint: "Think literary atmosphere for this theme — mood over spelling.",
        model: result.model,
      });
    }
  }

  if (game !== "bookle") {
    const title = String(body.title ?? "").trim();
    const upper = hint.toUpperCase();
    const titleWords = title
      .toUpperCase()
      .split(/[^A-Z0-9]+/)
      .filter((w) => w.length >= 4);
    if (titleWords.some((w) => upper.includes(w))) {
      return NextResponse.json({
        hint: "Lean on genre and era vibes — the cover art is whispering, not shouting.",
        model: result.model,
      });
    }
  }

  return NextResponse.json({ hint, model: result.model });
}
