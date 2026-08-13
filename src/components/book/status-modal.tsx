"use client";

import type { LibraryStatus } from "@/components/search/types";

export type StatusChoice = LibraryStatus | "none";

const OPTIONS: {
  id: StatusChoice;
  label: string;
  blurb: string;
  className: string;
  activeClass: string;
}[] = [
  {
    id: "tbr",
    label: "TBR",
    blurb: "On your to-be-read shelf",
    className: "bg-[#e8f0e6] text-ink",
    activeClass: "ring-2 ring-forest",
  },
  {
    id: "reading",
    label: "Currently Reading",
    blurb: "You're in the middle of this one",
    className: "bg-forest text-paper",
    activeClass: "ring-2 ring-[#1a2e20]",
  },
  {
    id: "read",
    label: "Read",
    blurb: "Finished",
    className: "bg-[#3f3654] text-ink",
    activeClass: "ring-2 ring-forest",
  },
  {
    id: "paused",
    label: "Paused",
    blurb: "Taking a break",
    className: "bg-[#f0e8d8] text-[#7a5a30]",
    activeClass: "ring-2 ring-[#7a5a30]",
  },
  {
    id: "dnf",
    label: "DNF",
    blurb: "Did not finish",
    className: "bg-[#f3e4e0] text-[#8a4a3a]",
    activeClass: "ring-2 ring-[#8a4a3a]",
  },
  {
    id: "none",
    label: "Not in library",
    blurb: "Remove from your shelves",
    className: "bg-paper text-ink",
    activeClass: "ring-2 ring-forest",
  },
];

type Props = {
  open: boolean;
  current: LibraryStatus | null;
  onClose: () => void;
  onSave: (status: StatusChoice) => void;
  onDelete: () => void;
};

export function LibraryStatusModal({
  open,
  current,
  onClose,
  onSave,
  onDelete,
}: Props) {
  if (!open) return null;

  const selected: StatusChoice = current ?? "none";

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]">
      <button
        type="button"
        className="absolute inset-0 bg-[#2a2438]/35 backdrop-blur-[1px]"
        aria-label="Close status picker"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-status-title"
        className="relative w-full max-w-sm overflow-hidden rounded-[1.6rem] border border-[#4a425c] bg-[#3a324f] shadow-[0_18px_50px_rgba(42,36,56,0.28)]"
      >
        <div className="flex items-center justify-between border-b border-[#564d6a] px-4 py-3">
          <h2
            id="library-status-title"
            className="text-sm font-bold tracking-wide text-ink"
          >
            Update book in library
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-xs font-bold text-ink hover:bg-[#3f3654]"
          >
            Close
          </button>
        </div>

        <div className="space-y-2 px-4 py-4">
          {OPTIONS.map((opt) => {
            const active = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSave(opt.id)}
                className={`flex w-full flex-col items-start rounded-2xl border border-[#4a425c] px-4 py-2.5 text-left shadow-sm transition ${opt.className} ${
                  active ? opt.activeClass : "hover:brightness-[0.98]"
                }`}
              >
                <span className="text-sm font-bold">{opt.label}</span>
                <span
                  className={`text-xs ${
                    opt.id === "reading" ? "text-paper/80" : "opacity-75"
                  }`}
                >
                  {opt.blurb}
                </span>
              </button>
            );
          })}
        </div>

        {current ? (
          <div className="border-t border-[#564d6a] px-4 py-4">
            <button
              type="button"
              onClick={onDelete}
              className="w-full rounded-full border border-[#b33a3a]/30 bg-[#f3e4e0] px-4 py-2.5 text-sm font-bold text-[#8a4a3a] hover:brightness-105"
            >
              Delete from library
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const STATUS_PILL: Record<
  LibraryStatus,
  { label: string; className: string }
> = {
  tbr: {
    label: "TBR",
    className: "bg-[#e8f0e6] text-ink border-forest/20",
  },
  reading: {
    label: "Reading",
    className: "bg-forest text-paper border-forest",
  },
  read: {
    label: "Read",
    className: "bg-[#3f3654] text-ink border-[#4a425c]",
  },
  paused: {
    label: "Paused",
    className: "bg-[#f0e8d8] text-[#7a5a30] border-[#4a425c]",
  },
  dnf: {
    label: "DNF",
    className: "bg-[#f3e4e0] text-[#8a4a3a] border-[#e0c4bc]",
  },
};
