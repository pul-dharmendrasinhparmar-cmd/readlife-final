"use client";

import type { UserRatingBreakdown } from "@/components/search/types";
import { StarRating, formatStarValue } from "@/components/book/star-rating";

export const RATING_ASPECTS: ReadonlyArray<{
  key: keyof UserRatingBreakdown;
  label: string;
  optional?: boolean;
}> = [
  { key: "enjoyment", label: "Enjoyment" },
  { key: "quality", label: "Quality" },
  { key: "characters", label: "Characters" },
  { key: "plot", label: "Plot" },
  { key: "audiobook", label: "Audiobook", optional: true },
];

export function averageFromBreakdown(
  breakdown: UserRatingBreakdown | undefined | null,
): number | null {
  if (!breakdown) return null;
  const values = RATING_ASPECTS.map((a) => breakdown[a.key]).filter(
    (n): n is number => typeof n === "number" && n > 0,
  );
  if (values.length === 0) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  // Snap to nearest quarter so it matches StarRating step.
  return Math.round(avg * 4) / 4;
}

type Props = {
  rating: number | null;
  breakdown?: UserRatingBreakdown | null;
  onChange: (next: {
    rating: number | undefined;
    ratingBreakdown: UserRatingBreakdown | undefined;
  }) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function UserRatingEditor({
  rating,
  breakdown,
  onChange,
  size = "sm",
  className = "",
}: Props) {
  const parts = breakdown ?? {};
  const derived = averageFromBreakdown(parts);
  const overall = derived ?? rating ?? 0;
  const hasAspects = RATING_ASPECTS.some(
    (a) => typeof parts[a.key] === "number",
  );

  function setAspect(key: keyof UserRatingBreakdown, value: number | undefined) {
    const next: UserRatingBreakdown = { ...parts };
    if (value == null) delete next[key];
    else next[key] = value;
    const avg = averageFromBreakdown(next);
    const empty = !RATING_ASPECTS.some((a) => typeof next[a.key] === "number");
    onChange({
      rating: avg ?? undefined,
      ratingBreakdown: empty ? undefined : next,
    });
  }

  function setOverall(value: number) {
    // Quick overall score clears aspect breakdown so they stay in sync.
    onChange({ rating: value, ratingBreakdown: undefined });
  }

  function clearAll() {
    onChange({ rating: undefined, ratingBreakdown: undefined });
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-ink">Overall</span>
        <StarRating
          value={overall}
          interactive={!hasAspects}
          size={size === "lg" ? "lg" : "md"}
          onChange={hasAspects ? undefined : setOverall}
          label="Overall rating"
        />
        {overall > 0 ? (
          <span className="text-sm font-semibold tabular-nums text-ink">
            {formatStarValue(overall)}★
          </span>
        ) : null}
        {overall > 0 || hasAspects ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-muted underline-offset-2 hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>
      {hasAspects ? (
        <p className="mt-1 text-xs text-muted">
          Overall is the average of your aspect ratings.
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted">
          Rate overall, or break it down by aspect below.
        </p>
      )}

      <div className="mt-3 space-y-1.5">
        {RATING_ASPECTS.map(({ key, label, optional }) => {
          const value = parts[key];
          return (
            <div key={key} className="flex flex-wrap items-center gap-2">
              <span className="w-[5.5rem] shrink-0 text-sm text-muted">
                {label}
              </span>
              <StarRating
                value={value ?? 0}
                interactive
                size={size}
                onChange={(n) => setAspect(key, n)}
                label={`${label} rating`}
              />
              {typeof value === "number" ? (
                <span className="text-xs tabular-nums text-ink/80">
                  {formatStarValue(value)}
                </span>
              ) : optional ? (
                <span className="text-xs text-muted">Optional</span>
              ) : null}
              {typeof value === "number" ? (
                <button
                  type="button"
                  onClick={() => setAspect(key, undefined)}
                  className="text-[0.65rem] font-semibold text-muted hover:text-ink"
                >
                  Clear
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
