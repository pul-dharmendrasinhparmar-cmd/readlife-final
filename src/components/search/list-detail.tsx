"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import {
  getBookById,
  getReaderById,
} from "./data";
import type { DiscoverList, DiscoveryState } from "./types";
import { getBookStatus, listProgress } from "@/lib/discovery-storage";

type Props = {
  list: DiscoverList | null;
  open: boolean;
  onClose: () => void;
  discovery: DiscoveryState;
  onSaveToggle: () => void;
  onAddBookTbr: (bookId: string) => void;
  onAddSelectedTbr: (bookIds: string[]) => void;
  onOpenBook: (bookId: string) => void;
};

export function ListDetail({
  list,
  open,
  onClose,
  discovery,
  onSaveToggle,
  onAddBookTbr,
  onAddSelectedTbr,
  onOpenBook,
}: Props) {
  const titleId = useId();
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setSelectMode(false);
      setSelected([]);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !list) return null;

  const creator = getReaderById(list.creatorId);
  const saved = discovery.savedListIds.includes(list.id);
  const progress = listProgress(discovery, list.bookIds);
  const pct = Math.round((progress.read / Math.max(1, progress.total)) * 100);

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-[#2a342c]/30"
        aria-label="Close list"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col overflow-hidden border-l border-[#e4d5c3] bg-[#fbf6ee] shadow-[-16px_0_48px_rgba(40,30,20,0.18)]"
      >
        <div className="border-b border-[#e8dccb] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-forest/65 uppercase">
                Reading list
              </p>
              <h2
                id={titleId}
                className="mt-1 font-serif text-xl font-semibold text-forest"
              >
                {list.title}
              </h2>
              {creator ? (
                <Link
                  href={`/readers/${creator.username}`}
                  className="mt-1 inline-flex items-center gap-2 text-sm text-muted hover:text-forest"
                >
                  <span className="relative h-6 w-6 overflow-hidden rounded-full">
                    <Image
                      src={creator.avatar}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </span>
                  @{creator.username}
                </Link>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-forest hover:bg-[#efe4d4]"
            >
              Close
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-forest/80">
            {list.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {list.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-[#efe4d4] px-2.5 py-0.5 text-[0.7rem] font-medium text-forest/80"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-[#f3ebe0]/90 px-3.5 py-3">
            <div className="flex justify-between text-xs text-muted">
              <span>
                You&apos;ve read {progress.read} of {progress.total}
              </span>
              <span className="font-semibold text-forest">{pct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8dccb]">
              <div
                className="h-full rounded-full bg-forest"
                style={{ width: `${pct}%` }}
              />
            </div>
            {progress.avgRating ? (
              <p className="mt-2 text-xs text-forest/75">
                You rated these books an average of {progress.avgRating}★.
              </p>
            ) : null}
            {creator && progress.read > 0 ? (
              <p className="mt-1 text-xs text-muted">
                You&apos;ve finished {progress.read} of {creator.displayName}
                &apos;s recommendations.
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSaveToggle}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                saved
                  ? "bg-[#efe4d4] text-forest"
                  : "bg-forest text-paper hover:bg-forest-deep"
              }`}
            >
              {saved ? "Saved ✓" : "Save List"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectMode((v) => !v);
                setSelected([]);
              }}
              className="rounded-full border border-forest/35 px-4 py-2 text-sm font-semibold text-forest hover:bg-[#efe4d4]"
            >
              {selectMode ? "Cancel select" : "Select Books"}
            </button>
            {selectMode && selected.length > 0 ? (
              <button
                type="button"
                onClick={() => onAddSelectedTbr(selected)}
                className="rounded-full border border-forest/35 px-4 py-2 text-sm font-semibold text-forest hover:bg-[#efe4d4]"
              >
                Add Selected to TBR ({selected.length})
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-[0.7rem] text-muted">
            {list.saveCount.toLocaleString()} saves · {list.readerCount} readers
            started · {list.completionCount} completed 5+
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="space-y-3">
            {list.bookIds.map((id) => {
              const book = getBookById(id);
              if (!book) return null;
              const status = getBookStatus(discovery, id);
              const checked = selected.includes(id);
              return (
                <li
                  key={id}
                  className="flex items-center gap-3 rounded-2xl border border-[#e8dccb] bg-[#f7f0e6]/70 p-2.5"
                >
                  {selectMode ? (
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelected((prev) =>
                          checked
                            ? prev.filter((x) => x !== id)
                            : [...prev, id],
                        )
                      }
                      aria-label={`Select ${book.title}`}
                      className="h-4 w-4 accent-forest"
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onOpenBook(id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div
                      className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md"
                      style={{ background: book.color }}
                    >
                      <Image
                        src={book.cover}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-serif text-sm font-semibold text-forest">
                        {book.title}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {book.author} · ★ {book.averageRating.toFixed(1)}
                      </p>
                      <p className="text-[0.65rem] font-semibold text-forest/70">
                        {status}
                        {status === "READ" && discovery.userRatings[id]
                          ? ` · Your ${discovery.userRatings[id]}★`
                          : ""}
                        {status === "TBR"
                          ? ` · ${
                              discovery.tbr.find((t) => t.bookId === id)
                                ?.priority ?? ""
                            }`
                          : ""}
                      </p>
                    </div>
                  </button>
                  {!selectMode && status === "NOT ADDED" ? (
                    <button
                      type="button"
                      onClick={() => onAddBookTbr(id)}
                      className="shrink-0 rounded-full bg-forest/90 px-3 py-1.5 text-[0.7rem] font-semibold text-paper hover:bg-forest"
                    >
                      + Add to TBR
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
