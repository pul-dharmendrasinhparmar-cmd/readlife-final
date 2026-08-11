"use client";

import Image from "next/image";
import { useEffect, useId, useState, type ReactNode } from "react";
import type { DiscoverBook } from "@/components/search/types";
import type {
  BookFormat,
  DiscoveryState,
  LibraryEntry,
  LibraryStatus,
  TbrPriority,
} from "@/components/search/types";
import {
  DNF_REASONS,
  FORMAT_LABELS,
  PAUSE_REASONS,
  PRIORITY_LABELS,
  SOURCE_OPTIONS,
} from "@/lib/discovery-storage";

type Props = {
  open: boolean;
  book: DiscoverBook | null;
  entry: LibraryEntry | null;
  discovery: DiscoveryState;
  onClose: () => void;
  onSave: (patch: Partial<LibraryEntry>) => void;
  onStatus: (status: LibraryStatus, extras?: Partial<LibraryEntry>) => void;
  onRemove: () => void;
};

export function LibraryDrawer({
  open,
  book,
  entry,
  onClose,
  onSave,
  onStatus,
  onRemove,
}: Props) {
  const titleId = useId();
  const [note, setNote] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const [pauseReason, setPauseReason] = useState(PAUSE_REASONS[0]);
  const [dnfReason, setDnfReason] = useState(DNF_REASONS[0]);
  const [confirmDnf, setConfirmDnf] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (!open || !entry) return;
    setNote(entry.note ?? "");
    setReview(entry.review ?? "");
    setRating(entry.rating ?? "");
    setPauseReason(entry.pauseReason ?? PAUSE_REASONS[0]);
    setDnfReason(entry.dnfReason ?? DNF_REASONS[0]);
    setConfirmDnf(false);
    setShowReviewForm(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, entry, onClose]);

  if (!open || !book || !entry) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-[#2a342c]/30"
        aria-label="Close book details"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-[#e4d5c3] bg-[#fbf6ee] shadow-[-16px_0_48px_rgba(40,30,20,0.18)]"
      >
        <div className="flex items-center justify-between border-b border-[#e8dccb] px-5 py-4">
          <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-forest/65 uppercase">
            Library card
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-forest hover:bg-[#efe4d4]"
          >
            Close
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="flex gap-4">
            <div
              className="relative h-[150px] w-[100px] shrink-0 overflow-hidden rounded-xl shadow-lg"
              style={{ background: book.color }}
            >
              <Image
                src={book.cover}
                alt={`Cover of ${book.title}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </div>
            <div className="min-w-0">
              <h2
                id={titleId}
                className="font-serif text-[1.3rem] leading-snug font-semibold text-forest"
              >
                {book.title}
              </h2>
              <p className="mt-1 text-sm text-muted">{book.author}</p>
              <StatusBadge entry={entry} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {book.genres.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-[#efe4d4] px-2 py-0.5 text-[0.65rem] font-medium text-forest/80"
                  >
                    {g}
                  </span>
                ))}
              </div>
              {entry.format ? (
                <p className="mt-2 text-xs text-muted">
                  Format: {FORMAT_LABELS[entry.format]}
                </p>
              ) : null}
            </div>
          </div>

          {(entry.status === "reading" || entry.status === "paused") && (
            <div className="mt-5">
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>Progress</span>
                <span className="font-semibold text-forest">
                  {entry.progressPct ?? 0}%
                  {entry.pagesRead != null
                    ? ` · ${entry.pagesRead} / ${book.pageCount} pages`
                    : ""}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#e8dccb]">
                <div
                  className="h-full rounded-full bg-forest"
                  style={{ width: `${entry.progressPct ?? 0}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-muted">
            <Meta label="Added" value={fmtDate(entry.dateAdded)} />
            {entry.dateStarted ? (
              <Meta label="Started" value={fmtDate(entry.dateStarted)} />
            ) : null}
            {entry.dateFinished ? (
              <Meta label="Finished" value={fmtDate(entry.dateFinished)} />
            ) : null}
            {entry.datePaused ? (
              <Meta label="Paused" value={fmtDate(entry.datePaused)} />
            ) : null}
            {entry.dateDnf ? (
              <Meta label="DNFed" value={fmtDate(entry.dateDnf)} />
            ) : null}
            {entry.timesRead && entry.timesRead > 1 ? (
              <Meta label="Rereads" value={`×${entry.timesRead}`} />
            ) : null}
          </div>

          {(entry.sourceUser || entry.sourceName || entry.sourceType) && (
            <div className="mt-4 rounded-2xl border border-[#e4d5c3] bg-[#f3ebe0]/80 px-3.5 py-3 text-sm">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
                How you found it
              </p>
              {entry.sourceUser ? (
                <p className="mt-1 text-forest">Recommended by @{entry.sourceUser}</p>
              ) : null}
              {entry.sourceName ? (
                <p className="text-forest/80">From “{entry.sourceName}”</p>
              ) : null}
              {entry.sourceType ? (
                <p className="mt-0.5 text-xs text-muted">
                  {SOURCE_OPTIONS.find((s) => s.id === entry.sourceType)?.label ??
                    entry.sourceType}
                </p>
              ) : null}
            </div>
          )}

          <label className="mt-5 block">
            <span className="text-[0.65rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
              Why you added this
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => onSave({ note })}
              rows={2}
              placeholder="Remind yourself what made you want to read it..."
              className="mt-2 w-full resize-none rounded-2xl border border-[#e0d1bf] bg-[#f7f0e6] px-3 py-2.5 text-sm text-forest outline-none focus:border-forest/45"
            />
          </label>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
                Your rating
              </p>
              <button
                type="button"
                onClick={() =>
                  onSave({ isFavorite: !entry.isFavorite })
                }
                className={`text-sm font-semibold ${
                  entry.isFavorite ? "text-[#b85a4a]" : "text-muted"
                }`}
              >
                {entry.isFavorite ? "♥ Favorite" : "♡ Favorite"}
              </button>
            </div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setRating(n);
                    onSave({ rating: n });
                  }}
                  className={`h-9 w-9 rounded-full text-sm font-bold ${
                    typeof rating === "number" && rating >= n
                      ? "bg-forest text-paper"
                      : "bg-[#efe4d4] text-forest/50"
                  }`}
                  aria-label={`${n} stars`}
                >
                  ★
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setRating("");
                  onSave({ rating: undefined });
                }}
                className="ml-1 text-xs font-semibold text-muted underline-offset-2 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
                Review
              </p>
              <button
                type="button"
                onClick={() => setShowReviewForm((v) => !v)}
                className="text-xs font-semibold text-forest underline-offset-2 hover:underline"
              >
                {entry.review ? "Edit Review" : "Write Review"}
              </button>
            </div>
            {entry.review && !showReviewForm ? (
              <p className="mt-2 text-sm leading-relaxed text-forest/85 italic">
                “{entry.review}”
              </p>
            ) : null}
            {showReviewForm ? (
              <div className="mt-2">
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                  placeholder="What stayed with you?"
                  className="w-full resize-none rounded-2xl border border-[#e0d1bf] bg-[#f7f0e6] px-3 py-2.5 text-sm text-forest outline-none focus:border-forest/45"
                />
                <button
                  type="button"
                  onClick={() => {
                    onSave({
                      review,
                      reviewDate: new Date().toISOString(),
                    });
                    setShowReviewForm(false);
                  }}
                  className="mt-2 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper"
                >
                  Save Review
                </button>
              </div>
            ) : null}
          </div>

          {entry.tags && entry.tags.length > 0 ? (
            <div className="mt-5">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
                Shelves / tags
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {entry.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#e0d1bf] px-2.5 py-0.5 text-[0.7rem] text-forest"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {entry.history && entry.history.length > 0 ? (
            <div className="mt-5">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
                Reading journey
              </p>
              <ol className="mt-2 space-y-2 border-l border-[#e0d1bf] pl-3">
                {entry.history.map((h, i) => (
                  <li key={`${h.at}-${i}`} className="text-xs text-forest/85">
                    <span className="text-muted">{fmtDate(h.at)}</span>
                    <br />
                    {h.label}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {/* Status actions */}
          <div className="mt-6 space-y-2 border-t border-[#e8dccb] pt-5">
            <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
              Change status
            </p>

            {entry.status === "tbr" ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PRIORITY_LABELS) as TbrPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onStatus("tbr", { priority: p })}
                      className={`rounded-xl border px-2.5 py-2 text-left text-xs font-semibold ${
                        entry.priority === p
                          ? "border-forest bg-forest text-paper"
                          : "border-[#e0d1bf] text-forest hover:bg-[#efe4d4]"
                      }`}
                    >
                      {PRIORITY_LABELS[p].emoji} {PRIORITY_LABELS[p].label}
                    </button>
                  ))}
                </div>
                <Action onClick={() => onStatus("reading")}>
                  Mark as Reading
                </Action>
              </>
            ) : null}

            {entry.status === "reading" ? (
              <>
                <Action onClick={() => onStatus("read", { rating: entry.rating ?? 4 })}>
                  Mark Complete
                </Action>
                <div className="rounded-2xl border border-[#e0d1bf] p-3">
                  <p className="text-xs font-semibold text-forest">Pause</p>
                  <select
                    value={pauseReason}
                    onChange={(e) => setPauseReason(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e0d1bf] bg-[#f7f0e6] px-2 py-2 text-xs"
                  >
                    {PAUSE_REASONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      onStatus("paused", { pauseReason })
                    }
                    className="mt-2 w-full rounded-full border border-forest/35 py-2 text-xs font-semibold text-forest"
                  >
                    Pause Reading
                  </button>
                </div>
                {!confirmDnf ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDnf(true)}
                    className="w-full rounded-full py-2 text-xs font-semibold text-[#9a4a3a] hover:bg-[#f5e6e0]"
                  >
                    DNF…
                  </button>
                ) : (
                  <DnfForm
                    reason={dnfReason}
                    setReason={setDnfReason}
                    progress={entry.progressPct ?? 0}
                    onConfirm={() =>
                      onStatus("dnf", {
                        dnfReason,
                        progressPct: entry.progressPct,
                      })
                    }
                    onCancel={() => setConfirmDnf(false)}
                  />
                )}
              </>
            ) : null}

            {entry.status === "paused" ? (
              <>
                <Action onClick={() => onStatus("reading")}>Resume Reading</Action>
                <Action onClick={() => onStatus("tbr", { priority: "read-soon" })}>
                  Move to TBR
                </Action>
                <Action onClick={() => onStatus("read")}>Mark Complete</Action>
                {!confirmDnf ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDnf(true)}
                    className="w-full rounded-full py-2 text-xs font-semibold text-[#9a4a3a]"
                  >
                    DNF…
                  </button>
                ) : (
                  <DnfForm
                    reason={dnfReason}
                    setReason={setDnfReason}
                    progress={entry.progressPct ?? 0}
                    onConfirm={() =>
                      onStatus("dnf", { dnfReason })
                    }
                    onCancel={() => setConfirmDnf(false)}
                  />
                )}
              </>
            ) : null}

            {entry.status === "dnf" ? (
              <>
                <Action onClick={() => onStatus("tbr", { priority: "someday" })}>
                  Move to TBR
                </Action>
                <Action onClick={() => onStatus("reading")}>Try Again (Reading)</Action>
              </>
            ) : null}

            {entry.status === "read" ? (
              <Action
                onClick={() =>
                  onStatus("reading", {
                    timesRead: (entry.timesRead ?? 1) + 1,
                    progressPct: 0,
                    pagesRead: 0,
                  })
                }
              >
                Start Reread
              </Action>
            ) : null}

            <label className="mt-2 block text-xs">
              <span className="font-semibold text-forest/70">Preferred format</span>
              <select
                value={entry.preferredFormat ?? entry.format ?? "physical"}
                onChange={(e) =>
                  onSave({
                    preferredFormat: e.target.value as BookFormat,
                    format: e.target.value as BookFormat,
                  })
                }
                className="mt-1 w-full rounded-xl border border-[#e0d1bf] bg-[#f7f0e6] px-2 py-2"
              >
                {(Object.keys(FORMAT_LABELS) as BookFormat[]).map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_LABELS[f]}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={onRemove}
              className="mt-3 w-full rounded-full py-2.5 text-xs font-semibold text-[#9a4a3a] hover:bg-[#f5e6e0]"
            >
              Remove from Library
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Action({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-full bg-forest py-2.5 text-xs font-semibold text-paper hover:bg-forest-deep"
    >
      {children}
    </button>
  );
}

function DnfForm({
  reason,
  setReason,
  progress,
  onConfirm,
  onCancel,
}: {
  reason: string;
  setReason: (r: string) => void;
  progress: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#e0c4b8] bg-[#faf0eb] p-3">
      <p className="text-xs font-semibold text-forest">Move to DNF?</p>
      <p className="mt-1 text-[0.7rem] text-muted">
        Stopped around {progress}%. Not every book has to be finished.
      </p>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-2 w-full rounded-xl border border-[#e0d1bf] bg-[#fbf6ee] px-2 py-2 text-xs"
      >
        {DNF_REASONS.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full py-2 text-xs font-semibold text-forest"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-full bg-[#8a4a3a] py-2 text-xs font-semibold text-paper"
        >
          Confirm DNF
        </button>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.6rem] tracking-wide text-muted-soft uppercase">
        {label}
      </p>
      <p className="font-medium text-forest">{value}</p>
    </div>
  );
}

export function StatusBadge({ entry }: { entry: LibraryEntry }) {
  const map: Record<
    LibraryStatus,
    { label: string; className: string }
  > = {
    reading: {
      label: `READING · ${entry.progressPct ?? 0}%`,
      className: "bg-forest text-paper",
    },
    read: {
      label: entry.rating ? `READ · ${"★".repeat(Math.round(entry.rating))}` : "READ",
      className: "bg-[#efe4d4] text-forest",
    },
    tbr: {
      label: entry.priority
        ? `TBR · ${PRIORITY_LABELS[entry.priority].label}`
        : "TBR",
      className: "bg-[#e8f0e6] text-forest",
    },
    paused: {
      label: `PAUSED · ${entry.progressPct ?? 0}%`,
      className: "bg-[#f0e8d8] text-[#7a5a30]",
    },
    dnf: {
      label: `DNF · stopped at ${entry.progressPct ?? 0}%`,
      className: "bg-[#f3e4e0] text-[#8a4a3a]",
    },
  };
  const s = map[entry.status];
  return (
    <span
      className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wide ${s.className}`}
    >
      {s.label}
    </span>
  );
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
