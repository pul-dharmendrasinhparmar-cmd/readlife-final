"use client";

import type { ReactNode } from "react";

export type HotspotId =
  | "bookshelf"
  | "quotes"
  | "window"
  | "journal"
  | "tbr"
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
        const tourPulse = highlightedId === spot.id && hoveredSpot !== spot.id;
        return (
          <button
            key={spot.id}
            type="button"
            style={{
              top: spot.top,
              left: spot.left,
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
            className={`absolute z-30 max-w-[min(100%,14rem)] -translate-x-1/2 -translate-y-1/2 cursor-pointer text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
              active ? "z-40" : ""
            }`}
          >
            <span
              className={`flex items-center gap-2 border-2 border-[#c9a227] bg-[#f7efe3] text-[#2a4032] shadow-[0_8px_20px_rgba(40,30,20,0.35)] transition ${
                active
                  ? "rounded-2xl px-2.5 py-2 ring-2 ring-[#c9a227]/50"
                  : "h-10 w-10 justify-center rounded-full hover:scale-105 hover:bg-[#fff8ee] hover:shadow-[0_10px_24px_rgba(40,30,20,0.4)]"
              } ${tourPulse ? "animate-pulse ring-2 ring-[#c9a227]/70" : ""}`}
            >
              <span
                className={`flex shrink-0 items-center justify-center rounded-full bg-[#2a4032]/8 text-[#2a4032] ${
                  active ? "h-8 w-8" : "h-full w-full"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              {active ? (
                <span className="min-w-0 pr-0.5">
                  <span className="block text-[0.72rem] leading-tight font-semibold text-[#2a4032] sm:text-[0.78rem]">
                    {spot.title}
                  </span>
                  <span className="mt-0.5 block max-w-[9.5rem] text-[0.62rem] leading-snug text-[#2a4032]/70 sm:text-[0.68rem]">
                    {spot.subtitle}
                  </span>
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </>
  );
}
