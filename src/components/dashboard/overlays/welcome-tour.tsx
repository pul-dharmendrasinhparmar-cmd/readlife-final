"use client";

import type { HotspotId } from "../hotspots";

const STEPS: {
  id: HotspotId;
  title: string;
  body: string;
}[] = [
  {
    id: "chair",
    title: "Your reading chair",
    body: "Start a focused session anytime — progress syncs to your library.",
  },
  {
    id: "bookshelf",
    title: "The bookshelf",
    body: "Peek at recent spines or hop into your full Library.",
  },
  {
    id: "window",
    title: "The window",
    body: "Change the vibe — morning light, evening glow, or soft rain.",
  },
  {
    id: "tbr",
    title: "TBR cart",
    body: "What you're saving for later, ready when you are.",
  },
];

type Props = {
  step: number;
  onNext: () => void;
  onSkip: () => void;
};

export function WelcomeTour({ step, onNext, onSkip }: Props) {
  const current = STEPS[step];
  if (!current) return null;
  const last = step >= STEPS.length - 1;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:bottom-6">
      <div className="pointer-events-auto w-full max-w-md rounded-[1.5rem] border border-[#e4d5c3] bg-[#fbf6ee]/97 p-4 shadow-[0_16px_40px_rgba(40,30,20,0.25)] backdrop-blur-sm">
        <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-forest/65 uppercase">
          Welcome home · {step + 1}/{STEPS.length}
        </p>
        <h3 className="mt-1 font-serif text-xl font-semibold text-forest">
          {current.title}
        </h3>
        <p className="mt-1 text-sm text-muted">{current.body}</p>
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-semibold text-muted hover:text-forest"
          >
            Skip tour
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper transition hover:bg-forest-deep"
          >
            {last ? "Start exploring" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const TOUR_STEPS = STEPS;
