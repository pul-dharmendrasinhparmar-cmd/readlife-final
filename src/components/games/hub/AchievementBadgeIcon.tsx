"use client";

import Image from "next/image";
import type { AchievementDef } from "./types";

type Props = {
  def: AchievementDef;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: { px: 36, className: "h-9 w-9", emoji: "text-lg" },
  md: { px: 44, className: "h-11 w-11", emoji: "text-2xl" },
  lg: { px: 56, className: "h-14 w-14", emoji: "text-3xl" },
} as const;

export function AchievementBadgeIcon({
  def,
  size = "sm",
  className = "",
}: Props) {
  const s = SIZES[size];
  if (def.iconSrc) {
    return (
      <span
        className={`relative inline-flex shrink-0 overflow-hidden rounded-full ${s.className} ${className}`}
        aria-hidden
      >
        <Image
          src={def.iconSrc}
          alt=""
          width={s.px}
          height={s.px}
          className="object-contain"
        />
      </span>
    );
  }
  return (
    <span className={`shrink-0 ${s.emoji} ${className}`} aria-hidden>
      {def.icon}
    </span>
  );
}
