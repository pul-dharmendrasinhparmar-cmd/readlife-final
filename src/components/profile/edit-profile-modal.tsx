"use client";

import { useEffect, useRef, useState } from "react";
import { READER_AVATARS, SHELF_PETS, resolveAvatarImage } from "@/components/onboarding/data";
import { fileToAvatarDataUrl } from "./avatar-upload";
import type { UserProfile } from "./types";

type Props = {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (patch: Partial<UserProfile>) => void;
};

export function EditProfileModal({ open, profile, onClose, onSave }: Props) {
  const [draft, setDraft] = useState(profile);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(profile);
      setUploadError(null);
      setUploading(false);
    }
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

  const preview = resolveAvatarImage(draft.avatarId, draft.avatarImage);

  const onPickFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setDraft({
        ...draft,
        avatarId: "custom",
        avatarImage: dataUrl,
      });
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Could not upload that image.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-forest/40 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-[#4a425c] bg-[#3a324f] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Edit Profile
        </h2>

        <label className="mt-4 block text-sm text-ink">
          Display name
          <input
            className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5 text-ink outline-none"
            value={draft.displayName}
            onChange={(e) =>
              setDraft({ ...draft, displayName: e.target.value })
            }
          />
        </label>

        <label className="mt-3 block text-sm text-ink">
          Username
          <input
            className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5 text-ink outline-none"
            value={draft.username}
            onChange={(e) =>
              setDraft({
                ...draft,
                username: e.target.value
                  .replace(/[^a-zA-Z0-9_]/g, "")
                  .toLowerCase(),
              })
            }
          />
        </label>

        <label className="mt-3 block text-sm text-ink">
          Bio
          <textarea
            className="mt-1 w-full resize-none rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5 text-ink outline-none"
            rows={3}
            value={draft.bio}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
          />
        </label>

        <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
          Profile picture
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[#564d6a] bg-[#342c45]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-[#2a2438] transition hover:bg-forest-deep disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload photo"}
            </button>
            {draft.avatarImage ? (
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    avatarId: "female",
                    avatarImage: null,
                  })
                }
                className="ml-2 rounded-full border border-[#564d6a] px-3 py-2 text-sm font-semibold text-ink"
              >
                Remove photo
              </button>
            ) : null}
            <p className="text-xs text-muted">JPG, PNG, or WebP · under 8MB</p>
            {uploadError ? (
              <p className="text-xs font-medium text-[#e8a090]">{uploadError}</p>
            ) : null}
          </div>
        </div>

        <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
          Or pick an avatar
        </p>
        <div className="mt-2 flex gap-2">
          {READER_AVATARS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() =>
                setDraft({
                  ...draft,
                  avatarId: a.id,
                  avatarImage: null,
                })
              }
              className={`rounded-full border-2 p-0.5 ${
                draft.avatarId === a.id && !draft.avatarImage
                  ? "border-forest"
                  : "border-transparent"
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

        <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
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
                  ? "border-forest bg-paper"
                  : "border-[#564d6a]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="mx-auto h-8 w-8" />
              {p.label}
            </button>
          ))}
        </div>

        <label className="mt-3 block text-sm text-ink">
          Pet name
          <input
            className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5 text-ink outline-none"
            value={draft.petName}
            onChange={(e) => setDraft({ ...draft, petName: e.target.value })}
          />
        </label>

        <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
          Social links
        </p>
        {(["instagram", "tiktok", "youtube", "goodreads"] as const).map(
          (key) => (
            <label key={key} className="mt-2 block text-sm capitalize text-ink">
              {key}
              <input
                className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2 text-ink outline-none"
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

        <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
          Privacy
        </p>
        <div className="mt-2 space-y-2 text-sm text-ink">
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
            className="flex-1 rounded-full bg-forest py-2.5 text-sm font-semibold text-[#2a2438]"
          >
            Save
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
