"use client";

import { useState } from "react";

type Props = {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  /** Snap increment when picking a rating. Default 0.25 (quarters). */
  step?: 0.25 | 0.5 | 1;
  onChange?: (value: number) => void;
  label?: string;
};

function snap(value: number, step: number, max: number) {
  const snapped = Math.round(value / step) * step;
  return Math.min(max, Math.max(step, Math.round(snapped * 100) / 100));
}

function fractionFromPointer(clientX: number, el: HTMLElement, step: number) {
  const rect = el.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1)));
  const steps = Math.round(1 / step);
  return Math.max(step, Math.ceil(ratio * steps) / steps);
}

export function formatStarValue(value: number) {
  const n = Math.round(value * 100) / 100;
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/0$/, "");
}

export function StarRating({
  value,
  max = 5,
  size = "md",
  interactive = false,
  step = 0.25,
  onChange,
  label,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  const px =
    size === "lg"
      ? "text-[1.35rem]"
      : size === "sm"
        ? "text-[0.85rem]"
        : "text-[1.05rem]";

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${px}`}
      role={interactive ? "slider" : "img"}
      aria-label={label ?? `${formatStarValue(value)} out of ${max} stars`}
      aria-valuemin={interactive ? step : undefined}
      aria-valuemax={interactive ? max : undefined}
      aria-valuenow={interactive ? value : undefined}
      aria-valuetext={interactive ? `${formatStarValue(value)} stars` : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                onChange?.(snap(value + step, step, max));
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                onChange?.(snap(Math.max(step, value - step), step, max));
              } else if (e.key === "Home") {
                e.preventDefault();
                onChange?.(step);
              } else if (e.key === "End") {
                e.preventDefault();
                onChange?.(max);
              }
            }
          : undefined
      }
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: max }, (_, i) => {
        const fill = Math.min(1, Math.max(0, display - i));
        return (
          <span
            key={i}
            className={`relative inline-block w-[1em] text-center leading-none ${
              interactive ? "cursor-pointer" : ""
            }`}
            onMouseMove={
              interactive
                ? (e) => {
                    const frac = fractionFromPointer(e.clientX, e.currentTarget, step);
                    setHover(snap(i + frac, step, max));
                  }
                : undefined
            }
            onClick={
              interactive
                ? (e) => {
                    const frac = fractionFromPointer(e.clientX, e.currentTarget, step);
                    onChange?.(snap(i + frac, step, max));
                  }
                : undefined
            }
            role={interactive ? "presentation" : undefined}
          >
            <span className="text-[#d7c7b2]" aria-hidden>
              ★
            </span>
            <span
              className="absolute inset-0 overflow-hidden text-gold"
              style={{ width: `${fill * 100}%` }}
              aria-hidden
            >
              ★
            </span>
          </span>
        );
      })}
    </div>
  );
}
