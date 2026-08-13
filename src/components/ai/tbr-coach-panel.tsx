"use client";

import Link from "next/link";
import { useState } from "react";
import { AiAssistButton, AiBanner } from "@/components/ai/ai-banner";
import { getBookById } from "@/components/search/data";
import { aiFetch } from "@/lib/ai/client";

const MOODS = ["cozy", "tense", "literary", "fast", "any"] as const;

export function TbrCoachPanel({
  tbrIds,
  defaultOpen = false,
}: {
  tbrIds: string[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [mood, setMood] = useState<(typeof MOODS)[number]>("any");
  const [minutes, setMinutes] = useState(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [picks, setPicks] = useState<
    { id: string; reason: string; fit: string }[]
  >([]);

  async function run() {
    setLoading(true);
    setError(null);
    const res = await aiFetch<{
      picks: { id: string; reason: string; fit: string }[];
      plan: string;
    }>("tbr-coach", { tbrIds, mood, minutes });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setPicks(res.data.picks ?? []);
    setPlan(res.data.plan ?? null);
  }

  return (
    <div className="mt-4 rounded-[1.25rem] border border-forest/30 bg-forest/10 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
            What next?
          </p>
          <p className="text-sm text-muted">AI ranks your TBR for right now</p>
        </div>
        <AiAssistButton onClick={() => setOpen((v) => !v)}>
          {open ? "Hide coach" : "TBR coach"}
        </AiAssistButton>
      </div>
      {open ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  mood === m
                    ? "bg-forest text-[#2a2438]"
                    : "bg-paper text-muted hover:text-ink"
                }`}
              >
                {m}
              </button>
            ))}
            <label className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink">
              Minutes
              <input
                type="number"
                min={10}
                max={240}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value) || 45)}
                className="w-12 bg-transparent outline-none"
              />
            </label>
            <AiAssistButton onClick={() => void run()} disabled={loading || !tbrIds.length}>
              {loading ? "Ranking…" : "Rank my TBR"}
            </AiAssistButton>
          </div>
          <AiBanner loading={loading} error={error} showDisclaimer={picks.length > 0} />
          {plan ? <p className="text-sm text-ink/90">{plan}</p> : null}
          <ul className="space-y-2">
            {picks.map((p) => {
              const book = getBookById(p.id);
              if (!book) return null;
              return (
                <li
                  key={p.id}
                  className="rounded-xl border border-line bg-paper/70 px-3 py-2"
                >
                  <Link
                    href={`/books/${book.id}`}
                    className="font-semibold text-ink hover:underline"
                  >
                    {book.title}
                  </Link>
                  <p className="text-xs text-muted">{book.author}</p>
                  <p className="mt-1 text-sm text-ink/85">{p.reason}</p>
                  {p.fit ? (
                    <p className="text-xs text-accent">{p.fit}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
