"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppNav } from "@/components/layout/app-nav";
import { GameModal } from "@/components/search/game-modal";
import { MINI_GAMES } from "@/components/search/data";
import type { MiniGame } from "@/components/search/types";
import { loadGameProfile } from "@/components/games/hub/storage";
import type { GameProfile } from "@/components/games/hub/types";
import { formatPiecesTime } from "@/components/games/pieces/covers";
import { uncoveredPuzzleNumber } from "@/components/games/uncovered/questions";

export default function PiecesDetailPage() {
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [open, setOpen] = useState(false);
  const game = MINI_GAMES.find((g) => g.id === "pieces") as MiniGame;
  const puzzle = uncoveredPuzzleNumber();

  useEffect(() => {
    setProfile(loadGameProfile());
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setProfile(loadGameProfile());
  }, []);

  const p = profile?.pieces;

  return (
    <div className="page-shell min-h-screen pb-16">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <Link
          href="/games"
          className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
        >
          ← Games
        </Link>
        <p className="mt-6 text-[0.68rem] font-semibold tracking-[0.14em] text-ink/60 uppercase">
          Cover jigsaw
        </p>
        <h1 className="mt-1 font-serif text-4xl font-semibold text-ink">
          Pieces
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Reconstruct today&apos;s portrait book cover with 35 interlocking
          jigsaw pieces. Drag a piece onto the board — it snaps when it finds
          its home.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper hover:bg-forest-deep"
        >
          {p?.todayCompleted ? "Play Pieces again" : `Play daily #${puzzle}`}
        </button>

        {p ? (
          <section className="mt-10 rounded-[1.5rem] border border-[#4a425c] bg-[#3a324f]/90 p-6">
            <h2 className="font-serif text-xl font-semibold text-ink">
              Your Pieces stats
            </h2>
            <ul className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
              <li>
                <span className="text-muted-soft">Covers restored</span>
                <p className="font-semibold text-ink">
                  {p.puzzlesCompleted}
                </p>
              </li>
              <li>
                <span className="text-muted-soft">Best time</span>
                <p className="font-semibold text-ink">
                  {p.bestTimeMs ? formatPiecesTime(p.bestTimeMs) : "—"}
                </p>
              </li>
              <li>
                <span className="text-muted-soft">Last time</span>
                <p className="font-semibold text-ink">
                  {p.lastTimeMs ? formatPiecesTime(p.lastTimeMs) : "—"}
                </p>
              </li>
              <li>
                <span className="text-muted-soft">Games played</span>
                <p className="font-semibold text-ink">{p.gamesPlayed}</p>
              </li>
              <li>
                <span className="text-muted-soft">Today</span>
                <p className="font-semibold text-ink">
                  {p.todayCompleted ? "Completed" : "Not played yet"}
                </p>
              </li>
            </ul>
          </section>
        ) : null}
      </main>
      <GameModal game={open ? game : null} open={open} onClose={close} />
    </div>
  );
}
