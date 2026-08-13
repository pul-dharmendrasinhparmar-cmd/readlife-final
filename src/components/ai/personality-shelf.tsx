"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AiAddToTbrButton } from "@/components/ai/ai-add-to-tbr";
import { AiAssistButton, AiBanner } from "@/components/ai/ai-banner";
import { getBookById } from "@/components/search/data";
import { aiFetch } from "@/lib/ai/client";
import { loadDiscoveryState } from "@/lib/discovery-storage";

export function PersonalityShelfBridge({
  personalityLabel,
  genres = [],
}: {
  personalityLabel: string;
  genres?: string[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headline, setHeadline] = useState<string | null>(null);
  const [picks, setPicks] = useState<{ id: string; reason: string }[]>([]);

  async function run() {
    setLoading(true);
    setError(null);
    const discovery = loadDiscoveryState();
    const excludeIds = (discovery.entries ?? []).map((e) => e.bookId);
    const res = await aiFetch<{
      picks: { id: string; reason: string }[];
      headline: string;
    }>("personality-shelf", {
      personality: personalityLabel,
      genres,
      excludeIds,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setPicks(res.data.picks ?? []);
    setHeadline(res.data.headline ?? "A shelf for your type");
  }

  return (
    <div className="mt-4 rounded-[1.25rem] border border-forest/30 bg-forest/10 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
            Shelf for your type
          </p>
          <p className="text-sm text-muted">AI picks from the catalog</p>
        </div>
        <AiAssistButton onClick={() => void run()} disabled={loading}>
          {loading ? "Curating…" : "Build my shelf"}
        </AiAssistButton>
      </div>
      <AiBanner
        loading={loading}
        error={error}
        showDisclaimer={picks.length > 0}
        className="mt-2"
      />
      {headline && picks.length > 0 ? (
        <p className="mt-2 font-serif text-base font-semibold text-ink">
          {headline}
        </p>
      ) : null}
      <ul className="mt-3 space-y-2">
        {picks.map((p) => {
          const book = getBookById(p.id);
          if (!book) return null;
          return (
            <li
              key={p.id}
              className="flex gap-3 rounded-xl border border-line bg-paper/70 p-2"
            >
              <Link
                href={`/books/${book.id}`}
                className="relative h-14 w-9 shrink-0 overflow-hidden rounded-md"
              >
                <Image
                  src={book.cover}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/books/${book.id}`}
                  className="font-semibold text-ink hover:underline"
                >
                  {book.title}
                </Link>
                <p className="text-xs text-muted">{book.author}</p>
                <p className="mt-0.5 text-sm text-ink/85">{p.reason}</p>
                <div className="mt-2">
                  <AiAddToTbrButton
                    bookId={book.id}
                    sourceName="Personality shelf"
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
