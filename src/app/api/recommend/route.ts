import { NextResponse } from "next/server";

/**
 * Book recommendations API stub.
 * Requires OPENAI_API_KEY in .env.local (local) or Netlify env vars (deploy).
 */
export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not set. Add it to .env.local locally, or to Netlify Environment variables for deploy.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    message: "API key configured. Recommendation logic not implemented yet.",
  });
}
