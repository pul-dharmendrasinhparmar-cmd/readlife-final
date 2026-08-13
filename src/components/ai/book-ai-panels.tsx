"use client";

import { useState } from "react";
import { AiAssistButton, AiBanner } from "@/components/ai/ai-banner";
import { aiFetch } from "@/lib/ai/client";

type Msg = { role: "user" | "assistant"; content: string };

export function BookChatPanel({
  title,
  author,
  progressPct,
  defaultOpen = false,
}: {
  title: string;
  author: string;
  progressPct: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const message = input.trim();
    if (!message || loading) return;
    setInput("");
    setError(null);
    const nextHistory = [...history, { role: "user" as const, content: message }];
    setHistory(nextHistory);
    setLoading(true);
    const res = await aiFetch<{ reply: string; refusedSpoilers?: boolean }>(
      "book-chat",
      {
        title,
        author,
        progressPct,
        message,
        history: nextHistory.slice(0, -1),
      },
    );
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setHistory((h) => [
      ...h,
      { role: "assistant", content: res.data.reply },
    ]);
  }

  return (
    <div className="rounded-2xl border border-line bg-cream-card/80 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-wide text-ink/70 uppercase">
            Book chat
          </p>
          <p className="mt-0.5 text-sm text-muted">
            Spoiler-gated to {progressPct}% progress
          </p>
        </div>
        <AiAssistButton onClick={() => setOpen((v) => !v)}>
          {open ? "Close" : "Ask AI"}
        </AiAssistButton>
      </div>
      {open ? (
        <div className="mt-3 space-y-3">
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-line bg-paper/60 p-3 text-sm">
            {history.length === 0 ? (
              <p className="text-muted">
                Ask about themes, craft, or vibes — spoilers stay behind your
                progress.
              </p>
            ) : (
              history.map((m, i) => (
                <p
                  key={`${m.role}-${i}`}
                  className={
                    m.role === "user"
                      ? "font-medium text-ink"
                      : "text-ink/90"
                  }
                >
                  <span className="text-muted">
                    {m.role === "user" ? "You: " : "AI: "}
                  </span>
                  {m.content}
                </p>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void send();
              }}
              placeholder="Ask something…"
              className="min-w-0 flex-1 rounded-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-forest/40"
            />
            <AiAssistButton onClick={() => void send()} disabled={loading}>
              Send
            </AiAssistButton>
          </div>
          <AiBanner loading={loading} error={error} />
        </div>
      ) : null}
    </div>
  );
}

export function ReviewPolishButton({
  title,
  author,
  rating,
  notes,
  onPolished,
}: {
  title: string;
  author: string;
  rating: number;
  notes: string;
  onPolished: (review: string, suggestSpoilers: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    const res = await aiFetch<{
      review: string;
      suggestSpoilers?: boolean;
    }>("review-polish", { title, author, rating, notes, tone: "cozy" });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (res.data.review) {
      onPolished(res.data.review, !!res.data.suggestSpoilers);
    }
  }

  return (
    <div className="space-y-1">
      <AiAssistButton onClick={() => void run()} disabled={loading}>
        {loading ? "Polishing…" : "Polish with AI"}
      </AiAssistButton>
      <AiBanner loading={false} error={error} showDisclaimer={!!error} />
    </div>
  );
}
