"use client";

import Image from "next/image";
import { useEffect, useId } from "react";
import type { DiscoverBook } from "./types";
import type { DiscoveryState } from "./types";
import { getBookStatus } from "@/lib/discovery-storage";

type Props = {
  book: DiscoverBook | null;
  open: boolean;
  onClose: () => void;
  discovery: DiscoveryState;
  onAddTbr: () => void;
  onMarkReading: () => void;
};

export function BookDrawer({
  book,
  open,
  onClose,
  discovery,
  onAddTbr,
  onMarkReading,
}: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !book) return null;

  const status = getBookStatus(discovery, book.id);

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-[#2a2438]/30 backdrop-blur-[1px]"
        aria-label="Close book details"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-[#4a425c] bg-[#3a324f] shadow-[-16px_0_48px_rgba(42,36,56,0.18)]"
      >
        <div className="flex items-center justify-between border-b border-[#564d6a] px-5 py-4">
          <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
            Book details
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink hover:bg-[#3f3654]"
          >
            Close
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="flex gap-4">
            <div
              className="relative h-[160px] w-[108px] shrink-0 overflow-hidden rounded-xl shadow-lg"
              style={{ background: book.color }}
            >
              <Image
                src={book.cover}
                alt={`Cover of ${book.title}`}
                fill
                className="object-cover"
                sizes="108px"
              />
            </div>
            <div className="min-w-0 pt-1">
              <h2
                id={titleId}
                className="font-serif text-[1.35rem] leading-snug font-semibold text-ink"
              >
                {book.title}
              </h2>
              <p className="mt-1 text-sm text-muted">{book.author}</p>
              <p className="mt-3 text-sm text-ink">
                ★ {book.averageRating.toFixed(1)}
                {book.friendRating ? (
                  <span className="text-muted">
                    {" "}
                    · Friends {book.friendRating.toFixed(1)}
                  </span>
                ) : null}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {book.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-[#3f3654] px-2.5 py-0.5 text-[0.7rem] font-medium text-ink/80"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">
                {book.pageCount} pages · {book.formats.join(" · ")}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink/85">
            {book.description}
          </p>

          {book.recommendationReason ? (
            <div className="mt-5 rounded-2xl border border-[#4a425c] bg-[#2a2438]/80 px-4 py-3">
              <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
                Why ReadLife thinks you may like it
              </p>
              <p className="mt-1.5 text-sm text-ink/90 italic">
                “{book.recommendationReason}”
              </p>
            </div>
          ) : null}

          <div className="mt-5">
            <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
              Community
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink/85">
              <li>
                {(book.readLifeReaders / 1000).toFixed(
                  book.readLifeReaders >= 1000 ? 1 : 0,
                )}
                K ReadLife readers
              </li>
              <li>{book.reviewCount.toLocaleString()} reviews</li>
              {book.followedReadersCount ? (
                <li>
                  {book.followedReadersCount} people you follow have read it
                </li>
              ) : null}
            </ul>
          </div>

          <p className="mt-4 text-xs font-semibold text-muted">
            Status: {status}
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={onAddTbr}
              className="rounded-full bg-forest py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
            >
              Add to TBR
            </button>
            <button
              type="button"
              onClick={onMarkReading}
              className="rounded-full border border-forest/40 py-3 text-sm font-semibold text-ink hover:bg-[#3f3654]"
            >
              Mark as Reading
            </button>
            <button
              type="button"
              className="rounded-full py-2.5 text-sm font-semibold text-ink/70 hover:text-ink"
            >
              View Reviews
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
