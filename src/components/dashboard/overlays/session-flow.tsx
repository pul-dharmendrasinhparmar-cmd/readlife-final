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

export function SessionFlow({ open, current, onClose, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [minutes, setMinutes] = useState(25);
  const [pages, setPages] = useState(18);
  const [remaining, setRemaining] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (!open) {
      setPhase("setup");
      return;
    }
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
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

  const startFocus = () => {
    // Prototype: compress long sessions to a short focus timer
    const demoSeconds = reduceMotion
      ? 2
      : Math.min(90, Math.max(12, Math.round(minutes * 0.6)));
    setRemaining(demoSeconds);
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
              <p className="font-semibold text-forest">{current.book.title}</p>
              <p className="text-sm text-muted">
                At {current.progressPct}% · pick a gentle stretch
              </p>
            </div>
          </div>

          <label className="mt-5 block text-sm text-forest">
            Minutes
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="mt-2 w-full"
            />
            <span className="mt-1 block font-serif text-lg font-semibold">
              {minutes} min
            </span>
          </label>

          <label className="mt-3 block text-sm text-forest">
            Expected pages
            <input
              type="number"
              min={1}
              max={80}
              value={pages}
              onChange={(e) => setPages(Number(e.target.value) || 1)}
              className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5"
            />
          </label>

          <button
            type="button"
            onClick={startFocus}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
          >
            Begin session
          </button>
        </>
      ) : null}

      {phase === "focus" ? (
        <div className="flex flex-col items-center py-8 text-center">
          <p
            className={`font-serif text-5xl font-semibold text-forest ${
              reduceMotion ? "" : "transition-all"
            }`}
          >
            {Math.floor(remaining / 60)}:
            {String(remaining % 60).padStart(2, "0")}
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Soft focus mode — when the timer ends we&apos;ll log{" "}
            <strong className="text-forest">{minutes} min</strong> and about{" "}
            <strong className="text-forest">{pages} pages</strong>.
          </p>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setPhase("done")}
              className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper"
            >
              Finish early
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#dccab4] px-5 py-2.5 text-sm font-semibold text-forest"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="py-4 text-center">
          <p className="font-serif text-2xl font-semibold text-forest">
            Lovely session.
          </p>
          <p className="mt-2 text-sm text-muted">
            We&apos;ll update {current.book.title} with +{pages} pages and{" "}
            {minutes} minutes.
          </p>
          <button
            type="button"
            onClick={finish}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
          >
            Save progress
          </button>
        </div>
      ) : null}
    </OverlayShell>
  );
}
