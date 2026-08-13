"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { FollowPerson } from "./types";

type Props = {
  open: boolean;
  mode: "followers" | "following";
  people: FollowPerson[];
  onClose: () => void;
};

export function FollowersModal({ open, mode, people, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-forest/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode}
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-[#4a425c] bg-[#3a324f] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold capitalize text-ink">
            {mode}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#3f3654] px-3 py-1.5 text-sm font-semibold text-ink"
          >
            Close
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {people.map((p) => (
            <li key={p.id}>
              <Link
                href={`/readers/${p.username}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl border border-[#4a425c] bg-paper/60 px-3 py-2.5 hover:border-forest/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{p.displayName}</p>
                  <p className="text-xs text-muted">@{p.username}</p>
                  {p.personality ? (
                    <p className="truncate text-xs text-muted-soft">
                      {p.personality}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
