"use client";

import Image from "next/image";
import Link from "next/link";
import type { SpineBook } from "../dashboard-data";
import { OverlayShell } from "./overlay-shell";

type Props = {
  open: boolean;
  spines: SpineBook[];
  onClose: () => void;
  onOpenBook?: (bookId: string) => void;
};

export function BookshelfPanel({ open, spines, onClose, onOpenBook }: Props) {
  return (
    <OverlayShell
      open={open}
      title="Bookshelf"
      subtitle="Recent reads from your library"
      onClose={onClose}
    >
      {spines.length === 0 ? (
        <p className="text-sm text-muted">
          No finished books yet — your shelf is waiting for the first spine.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {spines.map((s) => (
            <li key={s.bookId}>
              <button
                type="button"
                onClick={() => onOpenBook?.(s.bookId)}
                className="flex w-full items-center gap-3 rounded-2xl border border-[#564d6a] bg-[#342c45] px-3 py-2.5 text-left transition hover:border-forest/30"
              >
                <span
                  className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md shadow"
                  style={{ background: s.color }}
                >
                  <Image
                    src={s.cover}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">
                    {s.title}
                  </span>
                  <span className="block truncate text-sm text-muted">
                    {s.author}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/library"
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
      >
        Open Library
      </Link>
    </OverlayShell>
  );
}
