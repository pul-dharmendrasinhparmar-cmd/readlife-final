"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import type { DiscoverBook, DiscoverySourceType, TbrPriority } from "./types";
import { PRIORITY_LABELS, SOURCE_OPTIONS } from "@/lib/discovery-storage";

type Props = {
  book: DiscoverBook;
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    priority: TbrPriority;
    note: string;
    sourceType: DiscoverySourceType;
  }) => void;
  defaultSourceType?: DiscoverySourceType;
  sourceName?: string;
  sourceUser?: string;
};

export function TbrModal({
  book,
  open,
  onClose,
  onConfirm,
  defaultSourceType = "recommendation",
  sourceName,
  sourceUser,
}: Props) {
  const titleId = useId();
  const [priority, setPriority] = useState<TbrPriority>("read-soon");
  const [note, setNote] = useState("");
  const [sourceType, setSourceType] =
    useState<DiscoverySourceType>(defaultSourceType);

  useEffect(() => {
    if (!open) return;
    setPriority("read-soon");
    setNote("");
    setSourceType(defaultSourceType);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, defaultSourceType, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#2a342c]/35 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-[1.5rem] border border-[#e4d5c3] bg-[#fbf6ee] p-5 shadow-[0_24px_60px_rgba(40,30,20,0.25)] sm:p-6"
      >
        <h2 id={titleId} className="font-serif text-xl font-semibold text-forest">
          Add to your TBR
        </h2>

        <div className="mt-4 flex gap-3">
          <div
            className="relative h-[88px] w-[60px] shrink-0 overflow-hidden rounded-lg shadow-md"
            style={{ background: book.color }}
          >
            <Image src={book.cover} alt="" fill className="object-cover" sizes="60px" />
          </div>
          <div className="min-w-0">
            <p className="font-serif text-base font-semibold text-forest">
              {book.title}
            </p>
            <p className="text-sm text-muted">{book.author}</p>
            {(sourceUser || sourceName) && (
              <p className="mt-1 text-xs text-forest/70">
                {sourceUser ? `Recommended by @${sourceUser}` : null}
                {sourceUser && sourceName ? " · " : null}
                {sourceName ? `From “${sourceName}”` : null}
              </p>
            )}
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-[0.68rem] font-semibold tracking-[0.12em] text-forest/70 uppercase">
            When do you want to read it?
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(PRIORITY_LABELS) as TbrPriority[]).map((key) => {
              const meta = PRIORITY_LABELS[key];
              const selected = priority === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPriority(key)}
                  className={`rounded-2xl border px-3 py-2.5 text-left transition ${
                    selected
                      ? "border-forest bg-forest text-paper"
                      : "border-[#e0d1bf] bg-[#f7f0e6] text-forest hover:border-forest/40"
                  }`}
                >
                  <span className="block text-sm font-semibold">
                    {meta.emoji} {meta.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-[0.7rem] ${
                      selected ? "text-paper/75" : "text-muted"
                    }`}
                  >
                    {meta.blurb}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="mt-5 block">
          <span className="text-[0.68rem] font-semibold tracking-[0.12em] text-forest/70 uppercase">
            Why did you add this?
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Remind yourself why this caught your attention..."
            className="mt-2 w-full resize-none rounded-2xl border border-[#e0d1bf] bg-[#f7f0e6] px-3.5 py-2.5 text-sm text-forest outline-none placeholder:text-muted-soft focus:border-forest/45 focus:shadow-[0_0_0_3px_rgba(47,74,54,0.12)]"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-[0.68rem] font-semibold tracking-[0.12em] text-forest/70 uppercase">
            How did you find it?
          </span>
          <select
            value={sourceType}
            onChange={(e) =>
              setSourceType(e.target.value as DiscoverySourceType)
            }
            className="mt-2 w-full rounded-2xl border border-[#e0d1bf] bg-[#f7f0e6] px-3.5 py-2.5 text-sm text-forest outline-none focus:border-forest/45"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-forest/80 hover:bg-[#efe4d4]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ priority, note, sourceType })}
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            Add to TBR
          </button>
        </div>
      </div>
    </div>
  );
}
