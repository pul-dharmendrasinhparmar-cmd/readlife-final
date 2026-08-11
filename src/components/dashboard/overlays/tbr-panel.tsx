"use client";

import Image from "next/image";
import Link from "next/link";
import type { DiscoverBook, LibraryEntry } from "@/components/search/types";
import { OverlayShell } from "./overlay-shell";

type Props = {
  open: boolean;
  items: { entry: LibraryEntry; book: DiscoverBook }[];
  onClose: () => void;
};

export function TbrPanel({ open, items, onClose }: Props) {
  return (
    <OverlayShell
      open={open}
      title="TBR Cart"
      subtitle="What you're saving for later"
      onClose={onClose}
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted">
          Cart&apos;s empty — add something delicious from Search.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map(({ entry, book }) => (
            <li
              key={entry.bookId}
              className="flex items-center gap-3 rounded-2xl border border-[#e8dccb] bg-[#f7f0e6] px-3 py-2.5"
            >
              <span
                className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md shadow"
                style={{ background: book.color }}
              >
                <Image
                  src={book.cover}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-forest">
                  {book.title}
                </span>
                <span className="block truncate text-sm text-muted">
                  {book.author}
                  {entry.priority ? ` · ${entry.priority.replace(/-/g, " ")}` : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/library"
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
      >
        View TBR in Library
      </Link>
    </OverlayShell>
  );
}
