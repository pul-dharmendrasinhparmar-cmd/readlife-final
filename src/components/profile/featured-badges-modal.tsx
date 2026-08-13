"use client";

import { useEffect, useState } from "react";
import {
  MAX_FEATURED_BADGES,
  type FeaturedBadgeOption,
} from "./featured-badges";

type Props = {
  open: boolean;
  options: FeaturedBadgeOption[];
  selectedIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
};

export function FeaturedBadgesModal({
  open,
  options,
  selectedIds,
  onClose,
  onSave,
}: Props) {
  const [draft, setDraft] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (!open) return;
    const earnedIds = new Set(
      options.filter((b) => b.earned).map((b) => b.id),
    );
    setDraft(
      selectedIds
        .filter((id) => earnedIds.has(id))
        .slice(0, MAX_FEATURED_BADGES),
    );
  }, [open, selectedIds, options]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const earned = options.filter((b) => b.earned);
  const locked = options.filter((b) => !b.earned);

  function toggle(id: string) {
    setDraft((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_FEATURED_BADGES) return prev;
      return [...prev, id];
    });
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-forest/40 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Choose featured badges"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-[#4a425c] bg-[#3a324f] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Featured badges
            </h2>
            <p className="mt-1 text-sm text-muted">
              Pick up to {MAX_FEATURED_BADGES} to show on your profile.
            </p>
          </div>
          <p className="shrink-0 rounded-full bg-paper/60 px-2.5 py-1 text-xs font-semibold text-ink">
            {draft.length}/{MAX_FEATURED_BADGES}
          </p>
        </div>

        {earned.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            Earn reading or games badges to feature them here.
          </p>
        ) : (
          <ul className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {earned.map((badge) => {
              const selected = draft.includes(badge.id);
              const atCap = !selected && draft.length >= MAX_FEATURED_BADGES;
              return (
                <li key={badge.id}>
                  <button
                    type="button"
                    onClick={() => toggle(badge.id)}
                    disabled={atCap}
                    aria-pressed={selected}
                    className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-2xl border p-2 transition ${
                      selected
                        ? "border-forest bg-[#2f2840] shadow-[0_0_0_1px_rgba(126,184,255,0.25)]"
                        : atCap
                          ? "cursor-not-allowed border-[#4a425c]/70 bg-[#2a2438]/40 opacity-50"
                          : "border-[#4a425c] bg-[#2a2438]/60 hover:border-forest/50"
                    }`}
                    title={badge.description}
                  >
                    <BadgeTileArt badge={badge} />
                    <span
                      className="mt-1.5 line-clamp-2 text-center text-[0.62rem] font-semibold leading-tight text-ink"
                      style={selected ? { color: badge.accent } : undefined}
                    >
                      {badge.name}
                    </span>
                    {selected ? (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-forest text-[0.55rem] font-bold text-paper">
                        ✓
                      </span>
                    ) : null}
                    <span className="mt-0.5 text-[0.55rem] font-semibold tracking-wide text-muted uppercase">
                      {badge.source === "games" ? "Games" : "Reading"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {locked.length > 0 ? (
          <div className="mt-5">
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-muted uppercase">
              Not earned yet
            </p>
            <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {locked.slice(0, 8).map((badge) => (
                <li
                  key={badge.id}
                  className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-[#4a425c]/50 bg-[#2a2438]/35 p-2 opacity-55"
                  title={badge.description}
                >
                  <BadgeTileArt badge={badge} muted />
                  <span className="mt-1.5 line-clamp-2 text-center text-[0.58rem] font-semibold leading-tight text-muted">
                    {badge.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-line bg-paper py-2.5 text-sm font-semibold text-ink transition hover:bg-cream"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="flex-1 rounded-full bg-forest py-2.5 text-sm font-semibold text-paper transition hover:bg-forest-deep"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function BadgeTileArt({
  badge,
  muted = false,
}: {
  badge: FeaturedBadgeOption;
  muted?: boolean;
}) {
  if (badge.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={badge.image}
        alt=""
        width={96}
        height={96}
        className={`h-12 w-12 object-contain sm:h-14 sm:w-14 ${
          muted ? "grayscale-[40%] brightness-90" : ""
        }`}
        draggable={false}
      />
    );
  }
  return (
    <span className="text-2xl" aria-hidden>
      {badge.emoji ?? "🏅"}
    </span>
  );
}
