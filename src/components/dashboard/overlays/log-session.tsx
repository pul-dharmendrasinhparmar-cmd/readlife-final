"use client";

import { useEffect, useState } from "react";
import { SessionCompanion } from "@/components/ai/session-companion";
import type { CurrentBookView } from "../dashboard-data";
import type { JournalEntry } from "../journal-storage";
import { OverlayShell } from "./overlay-shell";

type Props = {
  open: boolean;
  current: CurrentBookView | null;
  onClose: () => void;
  onSave: (payload: {
    bookId: string;
    minutes: number;
    pagesReadDelta: number;
  }) => void;
  onJournalSaved?: (entries: JournalEntry[]) => void;
};

const DURATION_PRESETS = [5, 10, 15, 25, 30, 45, 60] as const;

function suggestedPages(minutes: number) {
  return Math.max(1, Math.round(minutes * 0.7));
}

export function LogSessionPanel({
  open,
  current,
  onClose,
  onSave,
  onJournalSaved,
}: Props) {
  const [minutes, setMinutes] = useState(25);
  const [pages, setPages] = useState(suggestedPages(25));
  const [customOpen, setCustomOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setMinutes(25);
      setPages(suggestedPages(25));
      setCustomOpen(false);
    }
  }, [open]);

  const pickMinutes = (next: number) => {
    const clamped = Math.min(240, Math.max(1, next));
    setMinutes(clamped);
    setPages(suggestedPages(clamped));
  };

  const isPreset = (DURATION_PRESETS as readonly number[]).includes(minutes);

  return (
    <OverlayShell
      open={open}
      title="Log Session"
      subtitle="Quick catch-up without a timer"
      onClose={onClose}
    >
      {!current ? (
        <p className="text-sm text-muted">
          Start a book first — then you can log sessions here.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted">
            Logging for{" "}
            <strong className="text-ink">{current.book.title}</strong>
          </p>

          <div className="mt-4">
            <p className="text-sm font-medium text-ink">Minutes read</p>
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
                  max={240}
                  value={minutes}
                  onChange={(e) => pickMinutes(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5 text-ink"
                />
              </label>
            ) : null}
          </div>

          <label className="mt-4 block text-sm text-ink">
            Pages read
            <input
              type="number"
              min={0}
              max={200}
              value={pages}
              onChange={(e) => setPages(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5 text-ink"
            />
          </label>

          <SessionCompanion
            title={current.book.title}
            author={current.book.author}
            minutes={minutes}
            pages={pages}
            progressPct={current.progressPct}
            onSaved={onJournalSaved}
          />

          <button
            type="button"
            onClick={() => {
              onSave({
                bookId: current.book.id,
                minutes,
                pagesReadDelta: pages,
              });
              onClose();
            }}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-[#2a2438] transition hover:bg-forest-deep"
          >
            Save {minutes}-minute session
          </button>
        </>
      )}
    </OverlayShell>
  );
}
