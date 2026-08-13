"use client";

import { useEffect, useState } from "react";
import { AiAddToTbrButton } from "@/components/ai/ai-add-to-tbr";
import { AiAssistButton, AiBanner } from "@/components/ai/ai-banner";
import { aiFetch } from "@/lib/ai/client";

type Challenge = {
  date: string;
  emojis: string;
  clue: string;
  blurb: string;
  options: { id: string; title: string; author: string }[];
  answerId: string;
};

const STORAGE_KEY = "readlife-daily-challenge-v1";

export function DailyChallengeCard() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { date?: string; picked?: string };
      if (parsed.date === today && parsed.picked) {
        setPicked(parsed.picked);
        setDone(true);
      }
    } catch {
      // ignore
    }
  }, [today]);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await aiFetch<Challenge>("daily-challenge", { date: today });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setChallenge(res.data);
  }

  function choose(id: string) {
    if (done || !challenge) return;
    setPicked(id);
    setDone(true);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date: today,
          picked: id,
          answerId: challenge.answerId,
        }),
      );
    } catch {
      // ignore
    }
  }

  const correct = done && picked === challenge?.answerId;

  return (
    <article className="games-card rounded-[1.35rem] border border-[#d4c4e8] bg-[#f3f4f8] p-4 text-[#2a2438] shadow-[0_12px_32px_rgba(20,16,30,0.24)] sm:p-5">
      <p className="text-[0.62rem] font-semibold tracking-[0.14em] text-[#5c5f6a] uppercase">
        Daily challenge
      </p>
      <h3 className="mt-2 font-serif text-2xl font-semibold">Guess the book</h3>
      <p className="mt-1.5 text-sm text-[#5c5f6a]">
        AI emoji riddle from the catalog — one try per day.
      </p>
      {!challenge ? (
        <div className="mt-4">
          <AiAssistButton onClick={() => void load()} disabled={loading}>
            {loading ? "Loading…" : "Play today’s challenge"}
          </AiAssistButton>
          <AiBanner
            loading={loading}
            error={error}
            showDisclaimer={false}
            className="mt-2"
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-3xl" aria-hidden>
            {challenge.emojis}
          </p>
          <p className="text-sm text-[#2a2438]/85">{challenge.clue}</p>
          <p className="text-xs italic text-[#5c5f6a]">{challenge.blurb}</p>
          <div className="grid gap-2">
            {challenge.options.map((o) => {
              const selected = picked === o.id;
              const isAnswer = o.id === challenge.answerId;
              let cls =
                "rounded-xl border border-[#d4c4e8] bg-white px-3 py-2 text-left text-sm";
              if (done && isAnswer) cls += " ring-2 ring-forest";
              if (done && selected && !isAnswer) cls += " opacity-60";
              return (
                <div key={o.id} className={cls}>
                  <button
                    type="button"
                    disabled={done}
                    onClick={() => choose(o.id)}
                    className="w-full text-left disabled:cursor-default"
                  >
                    <span className="font-semibold">{o.title}</span>
                    <span className="block text-xs text-[#5c5f6a]">
                      {o.author}
                    </span>
                  </button>
                  {done ? (
                    <div className="mt-2">
                      <AiAddToTbrButton
                        bookId={o.id}
                        sourceName="Daily challenge"
                        className="rounded-full border border-[#7a9a6a] px-2.5 py-1 text-xs font-semibold text-[#3d5a32] disabled:opacity-70"
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          {done ? (
            <p className="text-sm font-semibold text-[#2a2438]">
              {correct
                ? "Correct — nice catch."
                : "Not quite — try again tomorrow."}
            </p>
          ) : null}
          <p className="text-[0.65rem] text-[#6b6e78]">
            Generated · may be wrong
          </p>
        </div>
      )}
    </article>
  );
}
