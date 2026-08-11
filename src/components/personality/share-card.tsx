"use client";

import { useEffect } from "react";
import { getPersonality } from "./personalities";
import { scoreAnswers } from "./score";
import type { PersonalityAssessment } from "./types";

type Props = {
  assessment: PersonalityAssessment;
  open: boolean;
  onClose: () => void;
};

export function PersonalityShareCard({ assessment, open, onClose }: Props) {
  const p = getPersonality(assessment.personalityCode);
  const scored = scoreAnswers(assessment.answers, assessment.tieBreakers);

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
      className="fixed inset-0 z-[90] flex items-center justify-center bg-forest/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Share personality card"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[#e4d5c3] bg-[#fbf6ee] shadow-[0_24px_60px_rgba(40,30,20,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-[#2f4a36] via-[#3d5a45] to-[#243a2b] px-6 py-8 text-center text-paper">
          <p className="text-4xl" aria-hidden>
            {p.emoji}
          </p>
          <p className="mt-3 text-[0.7rem] font-semibold tracking-[0.18em] uppercase opacity-80">
            I&apos;m a
          </p>
          <h2 className="mt-1 font-serif text-3xl font-semibold">
            {p.name.replace(/^The /, "")}
          </h2>
          <p className="mt-2 text-sm tracking-[0.2em] opacity-90">{p.code}</p>
          <div className="mt-5 grid grid-cols-2 gap-2 text-left text-xs">
            {scored.dimensions.map((d) => (
              <div
                key={d.dimension}
                className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm"
              >
                <p className="font-semibold">
                  {d.firstPolePercentage}% {d.winnerLabel || "—"}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 font-serif text-lg italic opacity-95">
            &ldquo;{p.motto}&rdquo;
          </p>
          <p className="mt-6 text-[0.7rem] tracking-[0.12em] uppercase opacity-75">
            What&apos;s your ReadLife personality?
          </p>
        </div>
        <div className="flex gap-2 px-4 py-4">
          <button
            type="button"
            className="flex-1 rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-paper"
            onClick={() => {
              void navigator.clipboard?.writeText(
                `I'm ${p.emoji} ${p.name} (${p.code}) on ReadLife — "${p.motto}"`,
              );
              onClose();
            }}
          >
            Copy share text
          </button>
          <button
            type="button"
            className="rounded-full bg-[#efe4d4] px-4 py-2.5 text-sm font-semibold text-forest"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
