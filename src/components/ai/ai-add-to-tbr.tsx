"use client";

import { useEffect, useState } from "react";
import {
  addToTbr,
  loadDiscoveryState,
} from "@/lib/discovery-storage";

/** Compact Add-to-TBR control for AI book recommendation rows. */
export function AiAddToTbrButton({
  bookId,
  sourceName = "AI recommendation",
  className,
}: {
  bookId: string;
  sourceName?: string;
  className?: string;
}) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    try {
      const discovery = loadDiscoveryState();
      const entry = discovery.entries.find((e) => e.bookId === bookId);
      setAdded(entry?.status === "tbr" || entry?.status === "reading");
    } catch {
      setAdded(false);
    }
  }, [bookId]);

  return (
    <button
      type="button"
      disabled={added}
      onClick={() => {
        const discovery = loadDiscoveryState();
        addToTbr(discovery, {
          bookId,
          priority: "someday",
          note: "",
          sourceType: "recommendation",
          sourceName,
        });
        setAdded(true);
      }}
      className={
        className ??
        "rounded-full border border-forest/40 px-2.5 py-1 text-xs font-semibold text-forest disabled:opacity-70"
      }
    >
      {added ? "On TBR ✓" : "Add to TBR"}
    </button>
  );
}
