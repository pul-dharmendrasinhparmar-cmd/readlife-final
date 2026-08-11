"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { RoomVibe } from "./room-storage";
import { Hotspots, type HotspotDef, type HotspotId } from "./hotspots";

type PetInfo = { image: string; label: string };

type Props = {
  pet: PetInfo;
  petName: string;
  avatarSrc: string;
  displayName: string;
  vibe: RoomVibe;
  spots: HotspotDef[];
  greeting: string;
  highlightedId?: HotspotId | null;
  petBubble?: string | null;
  onHotspot: (id: HotspotId) => void;
};

const VIBE_OVERLAY: Record<RoomVibe, string> = {
  morning:
    "bg-[radial-gradient(ellipse_at_80%_18%,rgba(255,214,140,0.42),transparent_55%),linear-gradient(180deg,rgba(255,236,200,0.18),transparent_45%)]",
  afternoon:
    "bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(30,36,28,0.14)_100%)]",
  evening:
    "bg-[radial-gradient(ellipse_at_75%_20%,rgba(255,170,90,0.22),transparent_40%),linear-gradient(180deg,rgba(40,28,50,0.28),rgba(20,24,18,0.18)_60%,transparent)]",
  rainy:
    "bg-[linear-gradient(180deg,rgba(70,90,110,0.28),rgba(40,55,65,0.18)_50%,transparent)]",
};

export function ReadingRoom({
  pet,
  petName,
  avatarSrc,
  displayName,
  vibe,
  spots,
  greeting,
  highlightedId,
  petBubble,
  onHotspot,
}: Props) {
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

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
        <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-forest/65 uppercase">
          Reading Room
        </p>
        <h1 className="font-serif text-[1.55rem] leading-tight font-semibold text-forest sm:text-[1.75rem]">
          {greeting}
        </h1>
      </div>

      <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[1.75rem] border border-[#e0d1bf]/70 bg-[#d8c4a8] shadow-[0_18px_50px_rgba(60,45,30,0.12)] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[calc(100vh-5.5rem)] lg:flex-1">
        {/* Room art — keep PNG */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/rooms/dashboard-scene-clean.png"
          alt="Your cozy reading room"
          className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
        />

        {/* Vibe atmosphere */}
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            reduceMotion ? "" : "motion-safe:animate-[fade-up_0.8s_ease]"
          } ${VIBE_OVERLAY[vibe]}`}
          aria-hidden
        />

        {vibe === "rainy" && !reduceMotion ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              backgroundImage:
                "repeating-linear-gradient(105deg, transparent, transparent 6px, rgba(200,220,240,0.12) 7px, transparent 9px)",
              animation: "rain-drift 1.8s linear infinite",
            }}
          />
        ) : null}

        {/* Soft vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(30,36,28,0.16)_100%)]" />

        {/* Avatar in room (chair area) */}
        <div className="pointer-events-none absolute bottom-[14%] left-[58%] z-10 w-[11%] max-w-[100px] min-w-[56px] drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)] sm:w-[9%]">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[40%_40%_28%_28%/18%_18%_12%_12%]">
            <Image
              src={avatarSrc}
              alt={displayName}
              fill
              className="object-cover object-top"
              sizes="100px"
            />
          </div>
        </div>

        {/* Pet */}
        <div className="pointer-events-none absolute bottom-[8%] left-[36%] z-10 w-[14%] max-w-[120px] min-w-[70px] drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)] sm:w-[12%]">
          <div
            className={`relative aspect-square w-full ${
              reduceMotion ? "" : "motion-safe:animate-[float-soft_4s_ease-in-out_infinite]"
            }`}
          >
            <Image
              src={pet.image}
              alt={petName}
              fill
              className="object-contain object-bottom"
              sizes="120px"
            />
          </div>
          {petBubble ? (
            <div className="absolute -top-8 left-1/2 w-max max-w-[9rem] -translate-x-1/2 rounded-2xl bg-[#2a4032]/92 px-2.5 py-1.5 text-[0.62rem] text-paper shadow-lg">
              {petBubble}
            </div>
          ) : null}
        </div>

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
