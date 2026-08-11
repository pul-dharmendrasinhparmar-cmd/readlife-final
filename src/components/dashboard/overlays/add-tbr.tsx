"use client";

import { useMemo, useState } from "react";
import { DISCOVER_BOOKS } from "@/components/search/data";
import type { DiscoveryState, TbrPriority } from "@/components/search/types";
import { OverlayShell } from "./overlay-shell";

type Props = {
  open: boolean;
  discovery: DiscoveryState;
  onClose: () => void;
  onAdd: (payload: {
    bookId: string;
    priority: TbrPriority;
    note: string;
  }) => void;
};

export function AddTbrPanel({ open, discovery, onClose, onAdd }: Props) {
  const owned = useMemo(
    () => new Set(discovery.entries.map((e) => e.bookId)),
    [discovery.entries],
  );
  const candidates = useMemo(
    () => DISCOVER_BOOKS.filter((b) => !owned.has(b.id)).slice(0, 24),
    [owned],
  );
  const [bookId, setBookId] = useState(candidates[0]?.id ?? "starless-sea");
  const [priority, setPriority] = useState<TbrPriority>("read-soon");
  const [note, setNote] = useState("");

  return (
    <OverlayShell
      open={open}
      title="Add to TBR"
      subtitle="Park a book in the cart"
      onClose={onClose}
    >
      {candidates.length === 0 ? (
        <p className="text-sm text-muted">
          Everything nearby is already in your library. Explore Search for more.
        </p>
      ) : (
        <>
          <label className="block text-sm text-forest">
            Book
            <select
              className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
            >
              {candidates.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.author}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm text-forest">
            Priority
            <select
              className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TbrPriority)}
            >
              <option value="read-next">Read next</option>
              <option value="read-soon">Read soon</option>
              <option value="need-to-read">Need to read</option>
              <option value="someday">Someday</option>
            </select>
          </label>
          <label className="mt-3 block text-sm text-forest">
            Note
            <input
              className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why this one?"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              onAdd({ bookId, priority, note });
              onClose();
            }}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
          >
            Add to cart
          </button>
        </>
      )}
    </OverlayShell>
  );
}
