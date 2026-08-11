"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { getPersonalityCardAssets } from "./card-assets";
import type { PersonalityCode } from "./types";

type Props = {
  code: PersonalityCode;
  name: string;
  className?: string;
  /** Compact reveal size vs full result hero */
  size?: "reveal" | "full";
};

export function PersonalityResultCard({
  code,
  name,
  className = "",
  size = "full",
}: Props) {
  const [showingBack, setShowingBack] = useState(false);
  const statusId = useId();
  const assets = getPersonalityCardAssets(code);
  const label = name.replace(/^The /, "");

  const flip = () => setShowingBack((v) => !v);

  const maxW = size === "reveal" ? "max-w-[220px]" : "max-w-[280px]";

  return (
    <div className={`mx-auto w-full ${maxW} ${className}`}>
      <div
        className="relative mx-auto w-full [perspective:1200px]"
        style={{ aspectRatio: "2 / 3" }}
      >
        {/* Animated 3D flip — hidden when reduced motion */}
        <div
          className={`absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] motion-reduce:hidden ${
            showingBack ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <CardFace
            src={assets.front}
            alt={`${label} personality card — front`}
            side="front"
            priority={size === "full"}
          />
          <CardFace
            src={assets.back}
            alt={`${label} personality card — back`}
            side="back"
            priority={false}
          />
        </div>

        {/* Instant swap for prefers-reduced-motion */}
        <div className="absolute inset-0 hidden motion-reduce:block">
          <div className="relative h-full w-full overflow-hidden rounded-[1.25rem] shadow-[0_16px_40px_rgba(40,30,20,0.22)]">
            <Image
              src={showingBack ? assets.back : assets.front}
              alt={
                showingBack
                  ? `${label} personality card — back`
                  : `${label} personality card — front`
              }
              fill
              className="object-cover"
              sizes={size === "reveal" ? "220px" : "280px"}
              priority={size === "full"}
            />
          </div>
        </div>
      </div>

      <p id={statusId} className="sr-only" aria-live="polite">
        Showing {showingBack ? "back" : "front"} of card
      </p>

      <button
        type="button"
        onClick={flip}
        aria-pressed={showingBack}
        aria-describedby={statusId}
        className="mt-3 w-full rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-forest-deep"
      >
        {showingBack ? "See the front" : "See the other side"}
      </button>
    </div>
  );
}

function CardFace({
  src,
  alt,
  side,
  priority,
}: {
  src: string;
  alt: string;
  side: "front" | "back";
  priority: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden rounded-[1.25rem] shadow-[0_16px_40px_rgba(40,30,20,0.22)] [backface-visibility:hidden] ${
        side === "back" ? "[transform:rotateY(180deg)]" : ""
      }`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="280px"
        priority={priority}
      />
    </div>
  );
}
