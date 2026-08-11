"use client";

import type { OnboardingState } from "./data";
import { FORMATS, GENRES } from "./data";

type Props = {
  state: OnboardingState;
  onChange: (next: Partial<OnboardingState>) => void;
};

export function TasteStep({ state, onChange }: Props) {
  const toggleGenre = (id: string) => {
    const has = state.genres.includes(id);
    onChange({
      genres: has ? state.genres.filter((g) => g !== id) : [...state.genres, id],
    });
  };

  const toggleFormat = (id: string) => {
    if (id === "all") {
      onChange({ formats: ["all"] });
      return;
    }
    const withoutAll = state.formats.filter((f) => f !== "all");
    const has = withoutAll.includes(id);
    const next = has ? withoutAll.filter((f) => f !== id) : [...withoutAll, id];
    onChange({ formats: next.length ? next : ["physical"] });
  };

  return (
    <div>
      <h1 className="font-serif text-[2.15rem] leading-tight font-semibold tracking-[-0.025em] text-forest sm:text-[2.55rem]">
        What do you love to read?
      </h1>
      <p className="mt-2.5 text-lg text-muted">
        Pick genres and vibes that feel like you.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 md:gap-3.5">
        {GENRES.map((genre) => {
          const selected = state.genres.includes(genre.id);
          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => toggleGenre(genre.id)}
              className={`relative flex aspect-square flex-col items-center justify-center gap-2.5 rounded-[1.35rem] border-2 px-2 text-center transition ${
                selected
                  ? "border-forest bg-cream-card shadow-[0_8px_20px_rgba(47,74,54,0.12)]"
                  : "border-line/50 bg-[#faf4ea] hover:border-forest/35 hover:bg-cream-card"
              }`}
            >
              {selected ? (
                <span className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-forest text-xs text-paper">
                  ✓
                </span>
              ) : null}
              <span className="text-[2rem] sm:text-[2.35rem]" aria-hidden>
                {genre.emoji}
              </span>
              <span className="text-[0.9rem] leading-tight font-semibold text-forest sm:text-[0.95rem]">
                {genre.label}
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="mt-10 font-serif text-[1.45rem] font-semibold text-forest">
        How do you usually read?
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FORMATS.map((format) => {
          const selected = state.formats.includes(format.id);
          return (
            <button
              key={format.id}
              type="button"
              onClick={() => toggleFormat(format.id)}
              className={`flex min-h-[7.5rem] flex-col items-center justify-center gap-2.5 rounded-[1.35rem] border-2 px-3 py-5 transition ${
                selected
                  ? "border-forest bg-cream-card"
                  : "border-line/50 bg-[#faf4ea] hover:border-forest/35"
              }`}
            >
              <span className="text-[2.1rem]" aria-hidden>
                {format.emoji}
              </span>
              <span className="text-center text-[0.95rem] font-semibold text-forest">
                {format.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
