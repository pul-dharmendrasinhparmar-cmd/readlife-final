"use client";

import { useState } from "react";
import type { FavoriteQuote } from "../quotes-storage";
import { OverlayShell } from "./overlay-shell";

type Props = {
  open: boolean;
  quotes: FavoriteQuote[];
  onClose: () => void;
  onWrite: () => void;
};

export function QuotesPanel({ open, quotes, onClose, onWrite }: Props) {
  return (
    <OverlayShell
      open={open}
      title="Quote Wall"
      subtitle="Lines that stayed with you"
      onClose={onClose}
    >
      {quotes.length === 0 ? (
        <p className="text-sm text-muted">No favorites yet — save a line that hit hard.</p>
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => (
            <li
              key={q.id}
              className="rounded-2xl border border-[#e8dccb] bg-[#f7f0e6] px-4 py-3"
            >
              <p className="font-serif text-[1.05rem] leading-snug text-forest italic">
                “{q.text}”
              </p>
              <p className="mt-2 text-sm text-muted">
                — {q.bookTitle}
                {q.author ? `, ${q.author}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={onWrite}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
      >
        Write Quote
      </button>
    </OverlayShell>
  );
}

type WriteProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: {
    text: string;
    bookTitle: string;
    author: string;
  }) => void;
};

export function WriteQuotePanel({ open, onClose, onSave }: WriteProps) {
  const [text, setText] = useState("");
  const [bookTitle, setBookTitle] = useState("The Night Circus");
  const [author, setAuthor] = useState("Erin Morgenstern");

  return (
    <OverlayShell
      open={open}
      title="Write Quote"
      subtitle="Pin a line to your wall"
      onClose={onClose}
    >
      <label className="block text-sm text-forest">
        Quote
        <textarea
          className="mt-1 min-h-[100px] w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="The line that wouldn’t leave…"
        />
      </label>
      <label className="mt-3 block text-sm text-forest">
        Book
        <input
          className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
        />
      </label>
      <label className="mt-3 block text-sm text-forest">
        Author
        <input
          className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={!text.trim()}
        onClick={() => {
          onSave({
            text: text.trim(),
            bookTitle: bookTitle.trim() || "Unknown",
            author: author.trim(),
          });
          setText("");
        }}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep disabled:opacity-40"
      >
        Save to Quote Wall
      </button>
    </OverlayShell>
  );
}
