"use client";

import Image from "next/image";
import Link from "next/link";
import { LeafIcon } from "@/components/icons";
import { ONBOARDING_STEPS } from "./data";

type Props = {
  stepIndex: number;
  onSkip?: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
  note?: string;
  immersive?: boolean;
  roomImage?: string;
};

export function OnboardingShell({
  stepIndex,
  onSkip,
  children,
  footer,
  note,
  immersive = false,
  roomImage,
}: Props) {
  const bgSrc = immersive && roomImage ? roomImage : "/setup/background.jpg";

  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      {/* Full illustrated bookish background */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={bgSrc}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Soft center veil so UI stays readable without hiding the sides */}
        <div
          className="absolute inset-0"
          style={{
            background:
              immersive
                ? "linear-gradient(90deg, rgba(243,230,214,0.35) 0%, rgba(249,241,230,0.72) 28%, rgba(249,241,230,0.78) 72%, rgba(243,230,214,0.35) 100%)"
                : "linear-gradient(90deg, rgba(249,241,230,0.15) 0%, rgba(249,241,230,0.55) 22%, rgba(252,247,240,0.72) 50%, rgba(249,241,230,0.55) 78%, rgba(249,241,230,0.15) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5 sm:px-6 md:px-10 lg:px-14">
        <header className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 text-ink">
            <LeafIcon className="h-6 w-6" />
            <span className="font-serif text-[1.65rem] font-semibold tracking-[-0.02em]">
              ReadLife
            </span>
          </Link>

          <div className="mx-2 hidden min-w-0 flex-1 md:block">
            <div className="mx-auto flex max-w-2xl items-end justify-between gap-1 px-1">
              {ONBOARDING_STEPS.map((s, i) => {
                const active = i === stepIndex;
                const done = i < stepIndex;
                return (
                  <div key={s.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        active
                          ? "bg-forest text-paper"
                          : done
                            ? "bg-forest/20 text-ink"
                            : "bg-cream-deep/90 text-muted"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span
                      className={`truncate text-[0.95rem] font-semibold sm:text-[1.05rem] ${
                        active
                          ? "text-ink"
                          : done
                            ? "text-ink/80"
                            : "text-muted-soft"
                      }`}
                    >
                      {s.short}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mx-auto mt-3 h-2 max-w-2xl overflow-hidden rounded-full bg-cream-deep/90">
              <div
                className="h-full rounded-full bg-forest transition-all duration-500"
                style={{
                  width: `${((stepIndex + 1) / ONBOARDING_STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 text-base font-semibold text-muted transition hover:text-ink"
          >
            Skip
          </button>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-7 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <nav className="sticky top-6 space-y-1.5 rounded-[1.75rem] border border-line/40 bg-paper/85 p-4 shadow-[0_10px_30px_rgba(42,36,56,0.08)] backdrop-blur-md">
              {ONBOARDING_STEPS.map((step, i) => {
                const active = i === stepIndex;
                const done = i < stepIndex;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3.5 rounded-2xl px-3.5 py-3.5 transition ${
                      active
                        ? "bg-forest text-paper shadow-sm"
                        : done
                          ? "text-ink"
                          : "text-muted-soft"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        active
                          ? "bg-paper/20 text-paper"
                          : done
                            ? "bg-forest/15 text-ink"
                            : "bg-cream-deep text-muted-soft"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className="text-[1.05rem] font-semibold tracking-[-0.01em]">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </nav>

            {note ? (
              <div className="relative mt-7 rotate-[-2.5deg] rounded-md border border-[#e2cfa8] bg-[#f7ebc8]/95 px-4 py-4 shadow-[0_8px_18px_rgba(42,36,56,0.1)] backdrop-blur-sm">
                <div className="absolute -top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 rounded-sm bg-[#d4b896]/85 shadow-sm" />
                <p className="font-serif text-[1rem] leading-snug text-[#2a2438] italic">
                  {note}
                </p>
              </div>
            ) : null}
          </aside>

          <div className="flex min-h-0 flex-1 flex-col pb-6">
            <div className="mb-4 md:hidden">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-base font-semibold text-ink">
                  {ONBOARDING_STEPS[stepIndex].label}
                </span>
                <span className="text-sm text-muted">
                  {stepIndex + 1} / {ONBOARDING_STEPS.length}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-cream-deep">
                <div
                  className="h-full rounded-full bg-forest transition-all duration-500"
                  style={{
                    width: `${((stepIndex + 1) / ONBOARDING_STEPS.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="relative z-[5] flex-1 rounded-[2rem] border border-line/30 bg-paper/88 p-6 shadow-[0_18px_50px_rgba(42,36,56,0.1)] backdrop-blur-md sm:p-8 lg:p-10">
              {children}
            </div>

            <div className="relative z-[5] mt-5 flex items-center justify-between gap-3 pb-3">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border-2 border-forest/35 bg-paper/85 px-6 py-3 text-base font-semibold text-ink backdrop-blur-sm transition hover:bg-forest/5"
    >
      ← Back
    </button>
  );
}

export function NextButton({
  onClick,
  label = "Next →",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-auto rounded-full bg-forest px-8 py-3 text-base font-semibold text-paper shadow-[0_10px_24px_rgba(176,143,206,0.25)] transition hover:bg-forest-deep"
    >
      {label}
    </button>
  );
}
