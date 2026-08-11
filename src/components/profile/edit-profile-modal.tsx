"use client";

import { useEffect, useState } from "react";
import { READER_AVATARS, SHELF_PETS } from "@/components/onboarding/data";
import type { UserProfile } from "./types";

type Props = {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (patch: Partial<UserProfile>) => void;
};

export function EditProfileModal({ open, profile, onClose, onSave }: Props) {
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    if (open) setDraft(profile);
  }, [open, profile]);

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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-forest/40 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-[#e4d5c3] bg-[#fbf6ee] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl font-semibold text-forest">
          Edit Profile
        </h2>

        <label className="mt-4 block text-sm text-forest">
          Display name
          <input
            className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5 outline-none"
            value={draft.displayName}
            onChange={(e) =>
              setDraft({ ...draft, displayName: e.target.value })
            }
          />
        </label>

        <label className="mt-3 block text-sm text-forest">
          Username
          <input
            className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5 outline-none"
            value={draft.username}
            onChange={(e) =>
              setDraft({
                ...draft,
                username: e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase(),
              })
            }
          />
        </label>

        <label className="mt-3 block text-sm text-forest">
          Bio
          <textarea
            className="mt-1 w-full resize-none rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5 outline-none"
            rows={3}
            value={draft.bio}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
          />
        </label>

        <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
          Avatar
        </p>
        <div className="mt-2 flex gap-2">
          {READER_AVATARS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setDraft({ ...draft, avatarId: a.id })}
              className={`rounded-full border-2 p-0.5 ${
                draft.avatarId === a.id ? "border-forest" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.image}
                alt={a.label}
                className="h-14 w-14 rounded-full object-cover object-top"
              />
            </button>
          ))}
        </div>

        <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
          Shelf pet
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SHELF_PETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setDraft({ ...draft, shelfPetId: p.id })}
              className={`rounded-xl border px-2 py-1.5 text-xs ${
                draft.shelfPetId === p.id
                  ? "border-forest bg-white"
                  : "border-[#e0d1bf]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="mx-auto h-8 w-8" />
              {p.label}
            </button>
          ))}
        </div>

        <label className="mt-3 block text-sm text-forest">
          Pet name
          <input
            className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5 outline-none"
            value={draft.petName}
            onChange={(e) => setDraft({ ...draft, petName: e.target.value })}
          />
        </label>

        <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
          Social links
        </p>
        {(["instagram", "tiktok", "youtube", "goodreads"] as const).map(
          (key) => (
            <label key={key} className="mt-2 block text-sm capitalize text-forest">
              {key}
              <input
                className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2 outline-none"
                value={draft.socialLinks[key] ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    socialLinks: {
                      ...draft.socialLinks,
                      [key]: e.target.value,
                    },
                  })
                }
              />
            </label>
          ),
        )}

        <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
          Privacy
        </p>
        <div className="mt-2 space-y-2 text-sm text-forest">
          {(
            [
              ["readingPersonalityPublic", "Show Reading Personality"],
              ["readerDnaPublic", "Show Reader DNA preview"],
              ["readingEraPublic", "Show Reading Era"],
              ["activityPublic", "Show activity"],
              ["readingRoomPublic", "Show Reading Room entry"],
              ["booksPublic", "Show books"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.privacy[key]}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    privacy: { ...draft.privacy, [key]: e.target.checked },
                  })
                }
              />
              {label}
            </label>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="flex-1 rounded-full bg-forest py-2.5 text-sm font-semibold text-paper"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#efe4d4] px-4 py-2.5 text-sm font-semibold text-forest"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
