"use client";

import { useState } from "react";
import type { CurrentBookView } from "../dashboard-data";
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
};

export function LogSessionPanel({ open, current, onClose, onSave }: Props) {
  const [minutes, setMinutes] = useState(30);
  const [pages, setPages] = useState(20);

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
            Logging for <strong className="text-forest">{current.book.title}</strong>
          </p>
          <label className="mt-4 block text-sm text-forest">
            Minutes read
            <input
              type="number"
              min={1}
              max={240}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value) || 1)}
              className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5"
            />
          </label>
          <label className="mt-3 block text-sm text-forest">
            Pages read
            <input
              type="number"
              min={0}
              max={200}
              value={pages}
              onChange={(e) => setPages(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5"
            />
          </label>
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
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
          >
            Save session
          </button>
        </>
      )}
    </OverlayShell>
  );
}
