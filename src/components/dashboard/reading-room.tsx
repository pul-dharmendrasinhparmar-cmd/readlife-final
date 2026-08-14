"use client";

import { useEffect, useState } from "react";
import { resolveVibeScene, type RoomVibe } from "./room-storage";
import { Hotspots, type HotspotDef, type HotspotId } from "./hotspots";

type Props = {
  vibe: RoomVibe;
  /** Reader avatar — male uses the male reading-room art when available. */
  avatar?: "male" | "female" | "custom" | null;
  spots: HotspotDef[];
  greeting: string;
  highlightedId?: HotspotId | null;
  onHotspot: (id: HotspotId) => void;
};

const VIBE_OVERLAY: Record<RoomVibe, string> = {
  day: "bg-[radial-gradient(ellipse_at_80%_18%,rgba(255,220,150,0.18),transparent_55%)]",
  night:
    "bg-[linear-gradient(180deg,rgba(20,24,40,0.16),transparent_45%),radial-gradient(ellipse_at_center,transparent_55%,rgba(12,14,22,0.2)_100%)]",
  rainy:
    "bg-[linear-gradient(180deg,rgba(50,65,85,0.16),rgba(30,40,55,0.1)_50%,transparent)]",
  snowy:
    "bg-[radial-gradient(ellipse_at_80%_15%,rgba(200,220,255,0.12),transparent_45%),linear-gradient(180deg,rgba(30,40,60,0.1),transparent_50%)]",
};

export function ReadingRoom({
  vibe,
  avatar,
  spots,
  greeting,
  highlightedId,
  onHotspot,
}: Props) {
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const sceneSrc = resolveVibeScene(vibe, avatar);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  return (
    <section className="relative flex min-h-0 flex-1 flex-col">
      <div className="mb-3 px-0.5">
        <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
          Reading Room
        </p>
        <h1 className="font-serif text-[1.55rem] leading-tight font-semibold text-ink sm:text-[1.75rem]">
          {greeting}
        </h1>
      </div>

      <div className="relative aspect-[16/11] w-full max-w-full overflow-hidden rounded-[1.75rem] border border-[#564d6a]/70 bg-[#d8c4a8] shadow-[0_18px_50px_rgba(42,36,56,0.12)] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[calc(100vh-5.5rem)] lg:flex-1">
        {/* Room art — swaps with window vibe */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={sceneSrc}
          src={sceneSrc}
          alt={`Your cozy reading room · ${vibe}`}
          className="absolute inset-0 h-full w-full object-cover object-[center_45%]"
        />

        {/* Soft atmosphere wash (images already carry most of the mood) */}
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            reduceMotion ? "" : "motion-safe:animate-[fade-up_0.8s_ease]"
          } ${VIBE_OVERLAY[vibe]}`}
          aria-hidden
        />

        {vibe === "rainy" && !reduceMotion ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            aria-hidden
            style={{
              backgroundImage:
                "repeating-linear-gradient(105deg, transparent, transparent 6px, rgba(200,220,240,0.12) 7px, transparent 9px)",
              animation: "rain-drift 1.8s linear infinite",
            }}
          />
        ) : null}

        {vibe === "snowy" && !reduceMotion ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.85) 1px, transparent 1.5px), radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1.5px)",
              backgroundSize: "48px 48px, 72px 72px",
              backgroundPosition: "0 0, 24px 18px",
              animation: "snow-drift 9s linear infinite",
            }}
          />
        ) : null}

        {/* Soft vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(30,36,28,0.14)_100%)]" />

        <Hotspots
          spots={spots}
          hoveredSpot={hoveredSpot}
          highlightedId={highlightedId}
          onHover={setHoveredSpot}
          onActivate={onHotspot}
        />
      </div>
    </section>
  );
}
