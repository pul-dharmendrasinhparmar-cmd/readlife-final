"use client";

import { useEffect, useState } from "react";
import type { BookFormat, LibraryStatus } from "@/components/search/types";
import { FORMAT_LABELS } from "@/lib/discovery-storage";

export type StatusChoice = LibraryStatus | "none";

export type StatusSaveExtras = {
  format?: BookFormat;
};

/** Formats offered when marking Currently Reading. */
export const READING_FORMATS: BookFormat[] = [
  "physical",
  "ebook",
  "audiobook",
];

/** Dark-theme status chips — never pair pastels with `text-ink` (light). */
export const STATUS_PILL: Record<
  LibraryStatus,
  { label: string; className: string }
> = {
  tbr: {
    label: "TBR",
    className: "bg-[#3d4f42] text-[#d5e8d4] border-[#6a8570]",
  },
  reading: {
    label: "Reading",
    className: "bg-forest text-[#2a2438] border-forest",
  },
  read: {
    label: "Read",
    className: "bg-[#3f3654] text-ink border-[#4a425c]",
  },
  paused: {
    label: "Paused",
    className: "bg-[#4a4032] text-[#f0dfc0] border-[#8a7350]",
  },
  dnf: {
    label: "DNF",
    className: "bg-[#4a3532] text-[#f0d0c8] border-[#8a6058]",
  },
};

const OPTIONS: {
  id: StatusChoice;
  label: string;
  blurb: string;
  className: string;
  labelClass: string;
  blurbClass: string;
  activeClass: string;
}[] = [
  {
    id: "tbr",
    label: "TBR",
    blurb: "On your to-be-read shelf",
    className: "bg-[#3d4f42] border-[#6a8570]",
    labelClass: "text-[#d5e8d4]",
    blurbClass: "text-[#a8c4a6]",
    activeClass: "ring-2 ring-[#9bb89a]",
  },
  {
    id: "reading",
    label: "Currently Reading",
    blurb: "You're in the middle of this one",
    className: "bg-forest border-forest",
    labelClass: "text-[#2a2438]",
    blurbClass: "text-[#2a2438]/75",
    activeClass: "ring-2 ring-forest-deep",
  },
  {
    id: "read",
    label: "Read",
    blurb: "Finished",
    className: "bg-[#3f3654] border-[#4a425c]",
    labelClass: "text-ink",
    blurbClass: "text-muted",
    activeClass: "ring-2 ring-forest",
  },
  {
    id: "paused",
    label: "Paused",
    blurb: "Taking a break",
    className: "bg-[#4a4032] border-[#8a7350]",
    labelClass: "text-[#f0dfc0]",
    blurbClass: "text-[#c4a878]",
    activeClass: "ring-2 ring-[#c4a878]",
  },
  {
    id: "dnf",
    label: "DNF",
    blurb: "Did not finish",
    className: "bg-[#4a3532] border-[#8a6058]",
    labelClass: "text-[#f0d0c8]",
    blurbClass: "text-[#c49488]",
    activeClass: "ring-2 ring-[#c49488]",
  },
  {
    id: "none",
    label: "Not in library",
    blurb: "Remove from your shelves",
    className: "bg-paper border-[#4a425c]",
    labelClass: "text-ink",
    blurbClass: "text-muted",
    activeClass: "ring-2 ring-forest",
  },
];

type Props = {
  open: boolean;
  current: LibraryStatus | null;
  currentFormat?: BookFormat | null;
  onClose: () => void;
  onSave: (status: StatusChoice, extras?: StatusSaveExtras) => void;
  onDelete: () => void;
};

export function LibraryStatusModal({
  open,
  current,
  currentFormat,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [pickingFormat, setPickingFormat] = useState(false);
  const [format, setFormat] = useState<BookFormat>(
    currentFormat && READING_FORMATS.includes(currentFormat)
      ? currentFormat
      : "physical",
  );

  useEffect(() => {
    if (!open) {
      setPickingFormat(false);
      return;
    }
    setFormat(
      currentFormat && READING_FORMATS.includes(currentFormat)
        ? currentFormat
        : "physical",
    );
    setPickingFormat(current === "reading");
  }, [open, current, currentFormat]);

  if (!open) return null;

  const selected: StatusChoice = pickingFormat
    ? "reading"
    : (current ?? "none");

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
            {pickingFormat ? "How are you reading?" : "Update book in library"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-xs font-bold text-ink hover:bg-[#3f3654]"
          >
            Close
          </button>
        </div>

        {pickingFormat ? (
          <div className="space-y-3 px-4 py-4">
            <p className="text-xs text-muted">
              Choose a format for Currently Reading.
            </p>
            <div className="grid gap-2">
              {READING_FORMATS.map((f) => {
                const active = format === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition hover:brightness-110 ${
                      active
                        ? "border-forest bg-forest ring-2 ring-forest-deep"
                        : "border-[#564d6a] bg-[#342c45]"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        active ? "text-[#2a2438]" : "text-ink"
                      }`}
                    >
                      {FORMAT_LABELS[f]}
                    </span>
                    <span
                      className={`text-xs ${
                        active ? "text-[#2a2438]/75" : "text-muted"
                      }`}
                    >
                      {f === "physical"
                        ? "Print copy"
                        : f === "ebook"
                          ? "Kindle, phone, tablet…"
                          : "Listening"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPickingFormat(false)}
                className="flex-1 rounded-full border border-[#564d6a] px-4 py-2.5 text-sm font-bold text-ink hover:bg-[#3f3654]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => onSave("reading", { format })}
                className="flex-1 rounded-full bg-forest px-4 py-2.5 text-sm font-bold text-[#2a2438] hover:bg-forest-deep"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 px-4 py-4">
            {OPTIONS.map((opt) => {
              const active = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (opt.id === "reading") {
                      setPickingFormat(true);
                      return;
                    }
                    onSave(opt.id);
                  }}
                  className={`flex w-full flex-col items-start rounded-2xl border px-4 py-2.5 text-left shadow-sm transition hover:brightness-110 ${opt.className} ${
                    active ? opt.activeClass : ""
                  }`}
                >
                  <span className={`text-sm font-bold ${opt.labelClass}`}>
                    {opt.label}
                  </span>
                  <span className={`text-xs ${opt.blurbClass}`}>
                    {opt.id === "reading" && currentFormat
                      ? `${opt.blurb} · ${FORMAT_LABELS[currentFormat]}`
                      : opt.blurb}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {current && !pickingFormat ? (
          <div className="border-t border-[#564d6a] px-4 py-4">
            <button
              type="button"
              onClick={onDelete}
              className="w-full rounded-full border border-[#b33a3a]/40 bg-[#5a3530] px-4 py-2.5 text-sm font-bold text-[#f0c8c0] hover:brightness-110"
            >
              Delete from library
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
