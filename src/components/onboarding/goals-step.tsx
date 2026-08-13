"use client";

import type { OnboardingState } from "./data";
import { REMINDERS } from "./data";

type Props = {
  state: OnboardingState;
  onChange: (next: Partial<OnboardingState>) => void;
};

function Stepper({
  value,
  onChange,
  suffix,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={`mt-4 inline-flex items-center gap-3 rounded-full border-2 border-line/60 bg-paper px-2.5 py-1.5 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-semibold text-ink hover:bg-cream"
      >
        −
      </button>
      <span className="min-w-[4.5rem] text-center font-serif text-xl font-semibold text-ink">
        {value}
        {suffix ? (
          <span className="ml-1 text-sm font-normal text-muted">{suffix}</span>
        ) : null}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-semibold text-ink hover:bg-cream"
      >
        +
      </button>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? "bg-forest" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-paper shadow transition ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

export function GoalsStep({ state, onChange }: Props) {
  const { goals } = state;
  const locked = goals.noPressure;

  const patchGoal = (
    key: "books" | "time" | "pages" | "streak",
    patch: Partial<(typeof goals)[typeof key]>,
  ) => {
    onChange({
      goals: {
        ...goals,
        [key]: { ...goals[key], ...patch },
      },
    });
  };

  return (
    <div>
      <h1 className="font-serif text-[2.15rem] leading-tight font-semibold tracking-[-0.025em] text-ink sm:text-[2.55rem]">
        Set your reading goals
      </h1>
      <p className="mt-2.5 text-lg text-muted">
        Keep yourself gently accountable — or skip goals entirely.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(
          [
            { key: "books" as const, title: "Books", emoji: "📚", suffix: "/yr" },
            {
              key: "time" as const,
              title: "Reading time",
              emoji: "⏱️",
              suffix: "min/day",
            },
            { key: "pages" as const, title: "Pages", emoji: "📄", suffix: "/day" },
          ] as const
        ).map((card) => (
          <div
            key={card.key}
            className="rounded-[1.5rem] border border-line/50 bg-[#342c45] p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-3xl" aria-hidden>
                  {card.emoji}
                </span>
                <h3 className="mt-2 font-serif text-xl font-semibold text-ink">
                  {card.title}
                </h3>
              </div>
              <Toggle
                checked={goals[card.key].enabled && !locked}
                onChange={(v) => patchGoal(card.key, { enabled: v })}
              />
            </div>
            <Stepper
              value={goals[card.key].value}
              suffix={card.suffix}
              disabled={locked || !goals[card.key].enabled}
              onChange={(n) => patchGoal(card.key, { value: n })}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-line/50 bg-[#342c45] p-5 shadow-sm sm:max-w-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-3xl" aria-hidden>
              🔥
            </span>
            <h3 className="mt-2 font-serif text-xl font-semibold text-ink">
              Reading streak
            </h3>
            <p className="text-sm text-muted">Days per week</p>
          </div>
          <Toggle
            checked={goals.streak.enabled && !locked}
            onChange={(v) => patchGoal("streak", { enabled: v })}
          />
        </div>
        <Stepper
          value={goals.streak.value}
          suffix="days"
          disabled={locked || !goals.streak.enabled}
          onChange={(n) => patchGoal("streak", { value: Math.min(7, n) })}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-[1.5rem] border border-forest/20 bg-cream-card px-5 py-5">
        <div>
          <h3 className="font-serif text-xl font-semibold text-ink">
            Just let me read
          </h3>
          <p className="mt-0.5 text-base text-muted">
            No pressure mode — goals optional.
          </p>
        </div>
        <Toggle
          checked={goals.noPressure}
          onChange={(v) => onChange({ goals: { ...goals, noPressure: v } })}
        />
      </div>

      <h2 className="mt-10 font-serif text-[1.45rem] font-semibold text-ink">
        How do you like reminders?
      </h2>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {REMINDERS.map((r) => {
          const selected = state.reminder === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange({ reminder: r.id })}
              className={`rounded-full border-2 px-5 py-2.5 text-base font-semibold transition ${
                selected
                  ? "border-forest bg-forest text-paper"
                  : "border-line/70 bg-paper text-ink hover:border-forest/40"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
