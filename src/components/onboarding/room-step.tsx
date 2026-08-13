"use client";

import Image from "next/image";
import type { OnboardingState } from "./data";
import { ROOMS } from "./data";

type Props = {
  state: OnboardingState;
  onChange: (next: Partial<OnboardingState>) => void;
};

export function RoomStep({ state, onChange }: Props) {
  return (
    <div>
      <h1 className="font-serif text-[2.15rem] leading-tight font-semibold tracking-[-0.025em] text-ink sm:text-[2.55rem]">
        Choose your reading room
      </h1>
      <p className="mt-2.5 text-lg text-muted">
        Pick a space that feels like home — you can redecorate anytime.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ROOMS.map((room) => {
          const selected = state.room === room.id;
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onChange({ room: room.id })}
              className={`group relative overflow-hidden rounded-[1.5rem] border-2 text-left transition ${
                selected
                  ? "border-forest shadow-[0_0_0_1px_rgba(176,143,206,0.4)]"
                  : "border-transparent hover:border-forest/30"
              }`}
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={room.image}
                  alt={room.label}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 45vw, 220px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {selected ? (
                  <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-forest text-sm text-paper">
                    ✓
                  </span>
                ) : null}
                <span className="absolute right-3 bottom-3 left-3 font-serif text-base font-semibold text-paper sm:text-lg">
                  {room.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-[1.25rem] border-2 border-dashed border-forest/40 bg-[#342c45] px-4 py-4 text-base font-semibold text-ink transition hover:bg-cream-card"
      >
        <span aria-hidden>✏️</span>
        Build my own — Customize everything
      </button>
    </div>
  );
}
