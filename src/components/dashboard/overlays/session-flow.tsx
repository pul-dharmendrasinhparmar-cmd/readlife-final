"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CurrentBookView } from "../dashboard-data";
import { OverlayShell } from "./overlay-shell";

type Props = {
  open: boolean;
  current: CurrentBookView | null;
  onClose: () => void;
  onComplete: (payload: {
    bookId: string;
    minutes: number;
    pagesReadDelta: number;
  }) => void;
};

type Phase = "setup" | "focus" | "done";

const DURATION_PRESETS = [5, 10, 15, 25, 30, 45, 60] as const;

function formatClock(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function suggestedPages(minutes: number) {
  return Math.max(1, Math.round(minutes * 0.7));
}

export function SessionFlow({ open, current, onClose, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [minutes, setMinutes] = useState(25);
  const [pages, setPages] = useState(suggestedPages(25));
  const [remaining, setRemaining] = useState(0);
  const [customOpen, setCustomOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setPhase("setup");
      setMinutes(25);
      setPages(suggestedPages(25));
      setRemaining(0);
      setCustomOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "focus") return;
    if (remaining <= 0) {
      setPhase("done");
      return;
    }
    const t = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(t);
  }, [open, phase, remaining]);

  if (!current) return null;

  const pickMinutes = (next: number) => {
    const clamped = Math.min(120, Math.max(1, next));
    setMinutes(clamped);
    setPages(suggestedPages(clamped));
  };

  const startFocus = () => {
    setRemaining(minutes * 60);
    setPhase("focus");
  };

  const finish = () => {
    onComplete({
      bookId: current.book.id,
      minutes,
      pagesReadDelta: pages,
    });
    onClose();
  };

  const isPreset = (DURATION_PRESETS as readonly number[]).includes(minutes);

  return (
    <OverlayShell
      open={open}
      title={
        phase === "setup"
          ? "Session setup"
          : phase === "focus"
            ? "Focused session"
            : "Session complete"
      }
      subtitle={current.book.title}
      onClose={onClose}
      wide
    >
      {phase === "setup" ? (
        <>
          <div className="flex gap-3">
            <div
              className="relative h-[100px] w-[66px] shrink-0 overflow-hidden rounded-lg shadow"
              style={{ background: current.book.color }}
            >
              <Image
                src={current.book.cover}
                alt=""
                fill
                className="object-cover"
                sizes="66px"
              />
            </div>
            <div>
              <p className="font-semibold text-ink">{current.book.title}</p>
              <p className="text-sm text-muted">
                At {current.progressPct}% · choose how long to read
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-ink">Timer length</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DURATION_PRESETS.map((preset) => {
                const selected = minutes === preset && !customOpen;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setCustomOpen(false);
                      pickMinutes(preset);
                    }}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                      selected
                        ? "bg-forest text-[#2a2438] ring-2 ring-forest/40"
                        : "border border-[#564d6a] bg-[#342c45] text-ink hover:border-forest/60"
                    }`}
                  >
                    {preset} min
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCustomOpen(true)}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  customOpen || !isPreset
                    ? "bg-forest text-[#2a2438] ring-2 ring-forest/40"
                    : "border border-[#564d6a] bg-[#342c45] text-ink hover:border-forest/60"
                }`}
              >
                Custom
              </button>
            </div>

            {customOpen || !isPreset ? (
              <label className="mt-3 block text-sm text-ink">
                Custom minutes
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={minutes}
                  onChange={(e) => pickMinutes(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5 text-ink"
                />
              </label>
            ) : null}

            <p className="mt-3 font-serif text-lg font-semibold text-ink">
              Countdown: {formatClock(minutes * 60)}
            </p>
          </div>

          <label className="mt-4 block text-sm text-ink">
            Expected pages
            <input
              type="number"
              min={1}
              max={200}
              value={pages}
              onChange={(e) => setPages(Number(e.target.value) || 1)}
              className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5 text-ink"
            />
          </label>

          <button
            type="button"
            onClick={startFocus}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-[#2a2438] transition hover:bg-forest-deep"
          >
            Begin {minutes}-minute session
          </button>
        </>
      ) : null}

      {phase === "focus" ? (
        <div className="flex flex-col items-center py-8 text-center">
          <p className="font-serif text-5xl font-semibold text-ink transition-all">
            {formatClock(remaining)}
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Soft focus mode — when the timer ends we&apos;ll log{" "}
            <strong className="text-ink">{minutes} min</strong> and about{" "}
            <strong className="text-ink">{pages} pages</strong>.
          </p>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setPhase("done")}
              className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-[#2a2438]"
            >
              Finish early
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#564d6a] px-5 py-2.5 text-sm font-semibold text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="py-4 text-center">
          <p className="font-serif text-2xl font-semibold text-ink">
            Lovely session.
          </p>
          <p className="mt-2 text-sm text-muted">
            We&apos;ll update {current.book.title} with +{pages} pages and{" "}
            {minutes} minutes.
          </p>
          <button
            type="button"
            onClick={finish}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-[#2a2438] transition hover:bg-forest-deep"
          >
            Save progress
          </button>
        </div>
      ) : null}
    </OverlayShell>
  );
}
