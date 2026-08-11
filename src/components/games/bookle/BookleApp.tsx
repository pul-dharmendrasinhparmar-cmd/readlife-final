"use client";

/**
 * Bookle — book-themed Wordle, ported from tmp-sasin-game.
 * Uses static literary themes plus a personalized "From Your Shelf"
 * pool built client-side from finished Library books (no AI).
 */
import { useMemo } from "react";
import { loadDiscoveryState } from "@/lib/discovery-storage";
import { createStaticCatalog } from "./catalog/ThemeCatalog";
import { STATIC_THEMES } from "./catalog/staticThemes";
import {
  buildShelfTheme,
  SHELF_LOCKED_SUMMARY,
} from "./catalog/shelfTheme";
import WordGame from "./game/WordGame";
import { VALID_GUESSES } from "./validGuesses";
import "./bookle.css";

export function BookleApp() {
  const { catalog, shelfLocked } = useMemo(() => {
    const discovery = loadDiscoveryState();
    const shelf = buildShelfTheme(discovery, VALID_GUESSES);
    const themes = shelf ? [shelf, ...STATIC_THEMES] : STATIC_THEMES;
    return {
      catalog: createStaticCatalog(themes),
      shelfLocked: !shelf,
    };
  }, []);

  return (
    <div className="bookle-root">
      <WordGame
        catalog={catalog}
        validGuesses={VALID_GUESSES}
        shelfLocked={shelfLocked}
        lockedShelfSummary={SHELF_LOCKED_SUMMARY}
      />
    </div>
  );
}
