"use client";

import { getPersonalityCardAssets } from "./card-assets";
import type { PersonalityCode } from "./types";

export async function downloadPersonalityCard(
  code: PersonalityCode,
  side: "front" | "back" = "front",
): Promise<void> {
  const assets = getPersonalityCardAssets(code);
  const src = side === "front" ? assets.front : assets.back;
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error("Could not download personality card");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ReadLife-${code}-${side}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
