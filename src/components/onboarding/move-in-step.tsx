"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { fileToAvatarDataUrl } from "@/components/profile/avatar-upload";
import type { OnboardingState } from "./data";
import { READER_AVATARS, SHELF_PETS, resolveAvatarImage } from "./data";

type Props = {
  state: OnboardingState;
  onChange: (next: Partial<OnboardingState>) => void;
};

export function MoveInStep({ state, onChange }: Props) {
  const selectedPet = SHELF_PETS.find((p) => p.id === state.pet);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const customPreview = resolveAvatarImage(state.avatar, state.avatarImage);

  const onPickFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      onChange({ avatar: "custom", avatarImage: dataUrl });
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
    <div>
      <h1 className="font-serif text-[2.15rem] leading-tight font-semibold tracking-[-0.025em] text-ink sm:text-[2.55rem]">
        Your reading home is almost ready{" "}
        <span className="text-gold" aria-hidden>
          ✦
        </span>
      </h1>
      <p className="mt-2.5 text-lg text-muted">
        A few optional finishing touches — then settle in.
      </p>

      <section className="mt-8">
        <label
          htmlFor="display-name"
          className="font-serif text-xl font-semibold text-ink"
        >
          Your name
        </label>
        <p className="mt-1 text-sm text-muted">What should we call you?</p>
        <input
          id="display-name"
          value={state.displayName}
          onChange={(e) => onChange({ displayName: e.target.value })}
          placeholder="Write your name…"
          className="mt-3 w-full rounded-full border-2 border-line/60 bg-paper px-5 py-3.5 text-base text-ink outline-none placeholder:text-muted-soft focus:border-forest/45"
        />
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold text-ink">
          Select your avatar
        </h2>
        <p className="mt-1 text-sm text-muted">
          Pick a reader — or upload your own photo.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {READER_AVATARS.map((avatar) => {
            const selected = state.avatar === avatar.id && !state.avatarImage;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() =>
                  onChange({ avatar: avatar.id, avatarImage: null })
                }
                className={`relative flex flex-col items-center rounded-[1.35rem] border-2 bg-paper/80 px-3 pb-4 pt-5 transition ${
                  selected
                    ? "border-forest shadow-[0_0_0_1px_rgba(176,143,206,0.2)]"
                    : "border-line/50 hover:border-forest/35"
                }`}
              >
                {selected ? (
                  <span className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-forest text-xs text-[#2a2438]">
                    ✓
                  </span>
                ) : null}
                <div className="relative h-44 w-full sm:h-48">
                  <Image
                    src={avatar.image}
                    alt={avatar.label}
                    fill
                    className="object-contain object-bottom"
                    sizes="240px"
                  />
                </div>
                <p className="mt-3 text-center font-serif text-base font-semibold text-ink">
                  {avatar.label}
                </p>
              </button>
            );
          })}
        </div>

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
          className={`mt-3 flex w-full items-center gap-4 rounded-[1.35rem] border-2 border-dashed px-5 py-4 text-left transition disabled:opacity-60 ${
            state.avatar === "custom" && state.avatarImage
              ? "border-forest bg-cream-card"
              : "border-forest/35 bg-paper/70 hover:border-forest/55 hover:bg-cream-card/80"
          }`}
        >
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream text-xl shadow-sm">
            {state.avatarImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={customPreview}
                alt=""
                className="h-full w-full object-cover object-top"
              />
            ) : (
              "📷"
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-lg font-semibold text-ink">
              {uploading
                ? "Uploading…"
                : state.avatarImage
                  ? "Photo uploaded"
                  : "Upload your photo"}
            </span>
            <span className="text-sm text-muted">
              JPG, PNG, or WebP — under 8MB.
            </span>
          </span>
          {state.avatar === "custom" && state.avatarImage ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-xs text-[#2a2438]">
              ✓
            </span>
          ) : (
            <span className="text-lg text-muted-soft">→</span>
          )}
        </button>
        {uploadError ? (
          <p className="mt-2 text-sm font-medium text-[#e8a090]">{uploadError}</p>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold text-ink">
          Select a shelf pet
        </h2>
        <p className="mt-1 text-sm text-muted">
          Pets react to your reading, celebrate streaks, and grow with you.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SHELF_PETS.map((pet) => {
            const selected = state.pet === pet.id;
            return (
              <button
                key={pet.id}
                type="button"
                onClick={() =>
                  onChange({
                    pet: pet.id,
                    petName: state.petName || pet.label,
                  })
                }
                className={`relative flex flex-col items-center rounded-[1.25rem] border-2 bg-paper/80 px-2 pb-3 pt-4 transition ${
                  selected
                    ? "border-forest shadow-[0_0_0_1px_rgba(176,143,206,0.2)]"
                    : "border-line/50 hover:border-forest/35"
                }`}
              >
                {selected ? (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-forest text-[0.65rem] text-[#2a2438]">
                    ✓
                  </span>
                ) : null}
                <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-[#342c45] p-2 sm:h-40 sm:p-2.5">
                  <div className="relative h-full w-full">
                    <Image
                      src={pet.image}
                      alt={pet.label}
                      fill
                      className="object-contain object-center"
                      sizes="180px"
                    />
                  </div>
                </div>
                <p className="mt-2 text-center font-serif text-sm font-semibold text-ink">
                  {pet.label}
                </p>
                <p className="mt-0.5 line-clamp-2 px-1 text-center text-[0.7rem] text-muted">
                  {pet.tagline}
                </p>
              </button>
            );
          })}
        </div>

        <label
          htmlFor="pet-name"
          className="mt-5 block font-serif text-lg font-semibold text-ink"
        >
          Name your pet
        </label>
        <p className="mt-1 text-sm text-muted">
          {selectedPet
            ? `Give your ${selectedPet.label} a name.`
            : "Pick a pet first, then give them a name."}
        </p>
        <input
          id="pet-name"
          value={state.petName}
          onChange={(e) => onChange({ petName: e.target.value })}
          placeholder={selectedPet ? `e.g. ${selectedPet.label}` : "Pet name…"}
          disabled={!state.pet}
          className="mt-3 w-full rounded-full border-2 border-line/60 bg-paper px-5 py-3.5 text-base text-ink outline-none placeholder:text-muted-soft focus:border-forest/45 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </section>
    </div>
  );
}
