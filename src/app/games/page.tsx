"use client";

import { Suspense } from "react";
import { GamesPage } from "@/components/games/hub/games-page";

export default function GamesRoutePage() {
  return (
    <Suspense fallback={null}>
      <GamesPage />
    </Suspense>
  );
}
