"use client";

import type { ReactNode } from "react";

export type HotspotId =
  | "bookshelf"
  | "quotes"
  | "window"
  | "journal"
  | "tbr"
  | "companion"
  | "chair"
  | "mailbox";

export type HotspotDef = {
  id: HotspotId;
  title: string;
  subtitle: string;
  top: string;
  left: string;
  width?: string;
  height?: string;
  icon: (props: { className?: string }) => ReactNode;
};

type Props = {
  spots: HotspotDef[];
  hoveredSpot: string | null;
  highlightedId?: HotspotId | null;
  onHover: (id: string | null) => void;
  onActivate: (id: HotspotId) => void;
};

export function Hotspots({
  spots,
  hoveredSpot,
  highlightedId,
  onHover,
  onActivate,
}: Props) {
  return (
    <>
      {spots.map((spot) => {
        const Icon = spot.icon;
        const active = hoveredSpot === spot.id || highlightedId === spot.id;
        return (
          <button
            key={spot.id}
            type="button"
            style={{
              top: spot.top,
              left: spot.left,
              width: spot.width,
              height: spot.height,
            }}
            aria-label={`${spot.title}: ${spot.subtitle}`}
            onMouseEnter={() => onHover(spot.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(spot.id)}
            onBlur={() => onHover(null)}
            onClick={() => onActivate(spot.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onActivate(spot.id);
              }
            }}
            className={`absolute z-20 flex max-w-[11rem] -translate-x-1/2 -translate-y-1/2 items-start gap-2 rounded-2xl bg-[#2a4032]/92 px-2.5 py-2 text-left text-paper shadow-[0_8px_22px_rgba(20,30,22,0.35)] backdrop-blur-[2px] transition duration-200 hover:scale-[1.03] hover:bg-[#24382c] focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none sm:max-w-[12rem] sm:px-3 ${
              active ? "z-30 scale-[1.03] ring-2 ring-gold/80" : ""
            } ${highlightedId === spot.id ? "animate-pulse" : ""}`}
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper/10">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.72rem] leading-tight font-semibold sm:text-[0.78rem]">
                {spot.title}
              </span>
              <span className="mt-0.5 block text-[0.62rem] leading-snug text-paper/75 sm:text-[0.68rem]">
                {spot.subtitle}
              </span>
            </span>
          </button>
        );
      })}
    </>
  );
}
