"use client";

import { useEffect, useState } from "react";
import { getBookById } from "@/components/search/data";
import type { DiscoveryState } from "@/components/search/types";
import type { FollowPerson } from "./types";

type Props = {
  open: boolean;
  friends: FollowPerson[];
  discovery: DiscoveryState;
  onClose: () => void;
  onSend: (payload: {
    bookId: string;
    friendId: string;
    friendName: string;
    startedAt: string;
    targetEndDate?: string;
    readingStyle: "no-pressure" | "roughly-together" | "checkpoints";
  }) => void;
};

export function BuddyReadModal({
  open,
  friends,
  discovery,
  onClose,
  onSend,
}: Props) {
  const libraryIds = discovery.entries.map((e) => e.bookId);
  const [friendId, setFriendId] = useState(friends[0]?.id ?? "");
  const [bookId, setBookId] = useState(libraryIds[0] ?? "night-circus");
  const [style, setStyle] = useState<
    "no-pressure" | "roughly-together" | "checkpoints"
  >("roughly-together");
  const [targetEndDate, setTargetEndDate] = useState("2026-08-31");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const friend = friends.find((f) => f.id === friendId) ?? friends[0];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-forest/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Start buddy read"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[1.75rem] border border-[#4a425c] bg-[#3a324f] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Read With Friends
        </h2>
        <p className="mt-1 text-sm text-muted">
          Start a buddy read — invitation is simulated in this prototype.
        </p>

        <label className="mt-4 block text-sm text-ink">
          Friend
          <select
            className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
          >
            {friends.map((f) => (
              <option key={f.id} value={f.id}>
                {f.displayName}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block text-sm text-ink">
          Book
          <select
            className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
          >
            {libraryIds.slice(0, 20).map((id) => {
              const b = getBookById(id);
              return (
                <option key={id} value={id}>
                  {b?.title ?? id}
                </option>
              );
            })}
          </select>
        </label>

        <label className="mt-3 block text-sm text-ink">
          Optional finish-by
          <input
            type="date"
            className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
            value={targetEndDate}
            onChange={(e) => setTargetEndDate(e.target.value)}
          />
        </label>

        <fieldset className="mt-3">
          <legend className="text-sm text-ink">Reading style</legend>
          {(
            [
              ["no-pressure", "No pressure"],
              ["roughly-together", "Stay roughly together"],
              ["checkpoints", "Chapter checkpoints"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="mt-1 flex items-center gap-2 text-sm text-ink"
            >
              <input
                type="radio"
                name="style"
                checked={style === value}
                onChange={() => setStyle(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-full bg-forest py-2.5 text-sm font-semibold text-paper"
            onClick={() => {
              if (!friend) return;
              onSend({
                bookId,
                friendId: friend.id,
                friendName: friend.displayName,
                startedAt: new Date().toISOString(),
                targetEndDate,
                readingStyle: style,
              });
            }}
          >
            Send Invite
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#3f3654] px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
