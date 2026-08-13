"use client";

import { useState } from "react";
import { AiAssistButton, AiBanner } from "@/components/ai/ai-banner";
import {
  addJournalEntry,
  type JournalEntry,
} from "@/components/dashboard/journal-storage";
import { aiFetch } from "@/lib/ai/client";

export function SessionCompanion({
  title,
  author,
  minutes,
  pages,
  progressPct,
  onSaved,
}: {
  title: string;
  author: string;
  minutes: number;
  pages: number;
  progressPct: number;
  onSaved?: (entries: JournalEntry[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [quoteIdea, setQuoteIdea] = useState("");
  const [saved, setSaved] = useState(false);

  async function run() {
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await aiFetch<{
      prompts: string[];
      journalDraft: string;
      quoteIdea?: string;
    }>("session-companion", {
      title,
      author,
      minutes,
      pages,
      progressPct,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setPrompts(res.data.prompts ?? []);
    setDraft(res.data.journalDraft ?? "");
    setQuoteIdea(res.data.quoteIdea ?? "");
  }

  function saveJournal() {
    const text = draft.trim();
    if (!text) {
      setError("Write a reflection before saving.");
      return;
    }
    const promptBlock =
      prompts.length > 0
        ? `\n\nPrompts I sat with:\n${prompts.map((p) => `• ${p}`).join("\n")}`
        : "";
    const quoteBlock = quoteIdea.trim()
      ? `\n\nVibe line: ${quoteIdea.trim()}`
      : "";
    const entries = addJournalEntry({
      title: `After ${title}`,
      body: `${text}${promptBlock}${quoteBlock}`,
      mood: "reflective",
    });
    setSaved(true);
    setError(null);
    onSaved?.(entries);
  }

  return (
    <div className="mt-4 rounded-2xl border border-forest/30 bg-forest/10 p-3 text-left">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide text-ink/70 uppercase">
          Session companion
        </p>
        <AiAssistButton onClick={() => void run()} disabled={loading}>
          {loading ? "Reflecting…" : "Reflect with AI"}
        </AiAssistButton>
      </div>
      <AiBanner
        loading={loading}
        error={error}
        showDisclaimer={prompts.length > 0 || !!draft}
        className="mt-2"
      />
      {prompts.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm text-ink/90">
          {prompts.map((p) => (
            <li key={p}>• {p}</li>
          ))}
        </ul>
      ) : null}
      {draft ? (
        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setSaved(false);
          }}
          rows={4}
          className="mt-3 w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none"
        />
      ) : null}
      {quoteIdea ? (
        <p className="mt-2 text-xs italic text-muted">{quoteIdea}</p>
      ) : null}
      {draft ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={saveJournal}
            className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-[#2a2438]"
          >
            {saved ? "Saved to journal ✓" : "Save to journal"}
          </button>
          {saved ? (
            <span className="text-xs text-muted">
              Open Journal from your reading room to read it.
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
