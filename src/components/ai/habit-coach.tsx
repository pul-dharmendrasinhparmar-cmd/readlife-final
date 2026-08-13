"use client";

import { useState } from "react";
import { AiAssistButton, AiBanner } from "@/components/ai/ai-banner";
import type { PeriodSnapshot } from "@/components/insights/types";
import { aiFetch } from "@/lib/ai/client";

export function HabitCoachCard({ snap }: { snap: PeriodSnapshot }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [risk, setRisk] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [nudge, setNudge] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    const res = await aiFetch<{
      risk: string;
      plan: string;
      nudge: string;
    }>("habit-coach", {
      stats: {
        booksFinished: snap.booksFinished.value,
        minutesRead: snap.minutesRead.value,
        streakDays: snap.streakDays.value,
        sessions: snap.sessions.value,
        goalBooks: snap.goalBooks,
        goalMinutes: snap.goalMinutes,
        tbrTotal: snap.tbr.total,
        oldestTbrDays: snap.tbr.oldestDays,
        avgSession: snap.sessionStats.avgMinutes,
        timeOfDay: snap.timeOfDay,
      },
      notes: `Outcomes finished/paused/dnf: ${snap.outcomes.finished}/${snap.outcomes.paused}/${snap.outcomes.dnf}`,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setRisk(res.data.risk);
    setPlan(res.data.plan);
    setNudge(res.data.nudge);
  }

  return (
    <section className="rounded-[1.35rem] border border-forest/30 bg-forest/10 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">
            Habit coach
          </h2>
          <p className="mt-1 text-sm text-muted">
            A gentle 20-minute plan from your current signals.
          </p>
        </div>
        <AiAssistButton onClick={() => void run()} disabled={loading}>
          {loading ? "Coaching…" : "Get a plan"}
        </AiAssistButton>
      </div>
      <AiBanner
        loading={loading}
        error={error}
        showDisclaimer={!!plan}
        className="mt-3"
      />
      {risk ? <p className="mt-3 text-sm text-ink/90">{risk}</p> : null}
      {plan ? (
        <p className="mt-2 rounded-xl border border-line bg-paper/60 px-3 py-2 text-sm text-ink">
          {plan}
        </p>
      ) : null}
      {nudge ? <p className="mt-2 text-xs italic text-muted">{nudge}</p> : null}
    </section>
  );
}
