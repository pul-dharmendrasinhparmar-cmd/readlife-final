"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { DISCOVER_BOOKS } from "@/components/search/data";
import type { CreateListInput } from "./profile-storage";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreateListInput) => void;
};

export function CreateListModal({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setVisibility("public");
    setQuery("");
    setSelected([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = DISCOVER_BOOKS;
    if (!q) return pool.slice(0, 12);
    return pool
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q),
      )
      .slice(0, 16);
  }, [query]);

  if (!open) return null;

  const canSave = title.trim().length >= 2;

  const toggleBook = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-forest/40 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Create a new list"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-[#4a425c] bg-[#3a324f] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Create a list
        </h2>
        <p className="mt-1 text-sm text-muted">
          Curate books for yourself — or share them with readers who trust your
          taste.
        </p>

        <label className="mt-4 block text-sm text-ink">
          Title
          <input
            className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Rainy-day comfort reads"
            maxLength={80}
            autoFocus
          />
        </label>

        <label className="mt-3 block text-sm text-ink">
          Description
          <textarea
            className="mt-1 w-full resize-none rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5 outline-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What ties these books together?"
            maxLength={280}
          />
        </label>

        <fieldset className="mt-3">
          <legend className="text-sm text-ink">Visibility</legend>
          <div className="mt-2 flex gap-2">
            {(
              [
                ["public", "Public"],
                ["private", "Private"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setVisibility(id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  visibility === id
                    ? "bg-forest text-paper"
                    : "border border-[#564d6a] bg-[#342c45] text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4">
          <p className="text-sm text-ink">
            Add books{" "}
            <span className="text-muted">
              ({selected.length} selected · optional)
            </span>
          </p>
          <input
            className="mt-1.5 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5 text-sm outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or author…"
          />
          <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {results.map((book) => {
              const on = selected.includes(book.id);
              return (
                <li key={book.id}>
                  <button
                    type="button"
                    onClick={() => toggleBook(book.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl border px-2 py-1.5 text-left transition ${
                      on
                        ? "border-forest/50 bg-forest/15"
                        : "border-[#564d6a] bg-[#342c45] hover:border-forest/30"
                    }`}
                  >
                    <span
                      className="relative h-10 w-7 shrink-0 overflow-hidden rounded-sm"
                      style={{ background: book.color }}
                    >
                      <Image
                        src={book.cover}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {book.title}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {book.author}
                      </span>
                    </span>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        on
                          ? "bg-forest text-paper"
                          : "border border-[#564d6a] text-muted"
                      }`}
                      aria-hidden
                    >
                      {on ? "✓" : "+"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              onCreate({
                title: title.trim(),
                description: description.trim(),
                visibility,
                bookIds: selected,
              });
            }}
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-40"
          >
            Create list
          </button>
        </div>
      </div>
    </div>
  );
}
