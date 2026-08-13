"use client";

import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon } from "../dash-icons";
import type { FavoriteQuote } from "../quotes-storage";
import { OverlayShell } from "./overlay-shell";

type Props = {
  open: boolean;
  quotes: FavoriteQuote[];
  onClose: () => void;
  onWrite: () => void;
  onUpdate: (
    id: string,
    payload: { text: string; bookTitle: string; author: string },
  ) => void;
  onDelete: (id: string) => void;
};

export function QuotesPanel({
  open,
  quotes,
  onClose,
  onWrite,
  onUpdate,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setConfirmDeleteId(null);
    }
  }, [open]);

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
          {quotes.map((q) =>
            editingId === q.id ? (
              <QuoteEditCard
                key={q.id}
                quote={q}
                onCancel={() => setEditingId(null)}
                onSave={(payload) => {
                  onUpdate(q.id, payload);
                  setEditingId(null);
                }}
              />
            ) : (
              <li
                key={q.id}
                className="rounded-2xl border border-[#564d6a] bg-[#342c45] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-[1.05rem] leading-snug text-ink italic">
                      “{q.text}”
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      — {q.bookTitle}
                      {q.author ? `, ${q.author}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDeleteId(null);
                        setEditingId(q.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ink/70 transition hover:bg-[#3f3654] hover:text-ink"
                      aria-label="Edit quote"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </button>
                    {confirmDeleteId === q.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(q.id);
                          setConfirmDeleteId(null);
                        }}
                        className="rounded-full bg-[#c45c4a]/12 px-2.5 py-1 text-[0.7rem] font-semibold text-[#a34434] transition hover:bg-[#c45c4a]/20"
                      >
                        Delete?
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(q.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ink/70 transition hover:bg-[#3f3654] hover:text-[#a34434]"
                        aria-label="Delete quote"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ),
          )}
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

function QuoteEditCard({
  quote,
  onCancel,
  onSave,
}: {
  quote: FavoriteQuote;
  onCancel: () => void;
  onSave: (payload: {
    text: string;
    bookTitle: string;
    author: string;
  }) => void;
}) {
  const [text, setText] = useState(quote.text);
  const [bookTitle, setBookTitle] = useState(quote.bookTitle);
  const [author, setAuthor] = useState(quote.author);

  return (
    <li className="rounded-2xl border border-[#564d6a] bg-[#342c45] px-4 py-3">
      <label className="block text-sm text-ink">
        Quote
        <textarea
          className="mt-1 min-h-[90px] w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <label className="mt-3 block text-sm text-ink">
        Book
        <input
          className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
        />
      </label>
      <label className="mt-3 block text-sm text-ink">
        Author
        <input
          className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </label>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-[#564d6a] bg-paper py-2.5 text-sm font-semibold text-ink transition hover:bg-[#3f3654]"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!text.trim()}
          onClick={() =>
            onSave({
              text: text.trim(),
              bookTitle: bookTitle.trim() || "Unknown",
              author: author.trim(),
            })
          }
          className="inline-flex flex-1 items-center justify-center rounded-full bg-forest py-2.5 text-sm font-semibold text-paper transition hover:bg-forest-deep disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </li>
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
      <label className="block text-sm text-ink">
        Quote
        <textarea
          className="mt-1 min-h-[100px] w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="The line that wouldn’t leave…"
        />
      </label>
      <label className="mt-3 block text-sm text-ink">
        Book
        <input
          className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
        />
      </label>
      <label className="mt-3 block text-sm text-ink">
        Author
        <input
          className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
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
