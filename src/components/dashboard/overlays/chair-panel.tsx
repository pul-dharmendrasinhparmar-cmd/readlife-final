"use client";

import Image from "next/image";
import type { CurrentBookView } from "../dashboard-data";
import { OverlayShell } from "./overlay-shell";

type Props = {
  open: boolean;
  current: CurrentBookView | null;
  petName: string;
  onClose: () => void;
  onStart: () => void;
};

export function ChairPanel({
  open,
  current,
  petName,
  onClose,
  onStart,
}: Props) {
  return (
    <OverlayShell
      open={open}
      title="Reading Chair"
      subtitle="Your cozy spot"
      onClose={onClose}
    >
      <p className="font-serif text-xl font-semibold text-ink">
        Ready for another chapter?
      </p>
      <p className="mt-1 text-sm text-muted">
        Settle in — {petName} will keep the soft watch.
      </p>

      {current ? (
        <div className="mt-4 flex gap-3 rounded-2xl border border-[#564d6a] bg-[#342c45] p-3">
          <div
            className="relative h-[88px] w-[58px] shrink-0 overflow-hidden rounded-lg shadow"
            style={{ background: current.book.color }}
          >
            <Image
              src={current.book.cover}
              alt=""
              fill
              className="object-cover"
              sizes="58px"
            />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="font-semibold text-ink">{current.book.title}</p>
            <p className="text-sm text-muted">{current.book.author}</p>
            <p className="mt-2 text-[0.78rem] text-ink/80">
              {current.progressPct}% · {current.pagesRead}/{current.pagesTotal}{" "}
              pages
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-[#564d6a] bg-[#342c45] px-4 py-3 text-sm text-muted">
          No currently reading book — start one from Library or pick from TBR.
        </p>
      )}

      <button
        type="button"
        onClick={onStart}
        disabled={!current}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep disabled:opacity-40"
      >
        Start Reading
      </button>
    </OverlayShell>
  );
}
