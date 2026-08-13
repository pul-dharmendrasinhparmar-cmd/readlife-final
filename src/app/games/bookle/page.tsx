"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppNav } from "@/components/layout/app-nav";
import { GameModal } from "@/components/search/game-modal";
import { MINI_GAMES } from "@/components/search/data";
import type { MiniGame } from "@/components/search/types";
import { loadGameProfile } from "@/components/games/hub/storage";
import type { GameProfile } from "@/components/games/hub/types";

export default function BookleDetailPage() {
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [open, setOpen] = useState(false);
  const game = MINI_GAMES.find((g) => g.id === "bookle") as MiniGame;

  useEffect(() => {
    setProfile(loadGameProfile());
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setProfile(loadGameProfile());
  }, []);

  const b = profile?.bookle;

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
          Word puzzle
        </p>
        <h1 className="mt-1 font-serif text-4xl font-semibold text-ink">
          Bookle
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Guess the word before you run out of clues. Daily puzzles, solve
          streaks, and fair weekly rankings among friends.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper hover:bg-forest-deep"
        >
          {b?.todayCompleted ? "Play Bookle" : "Play Today's Bookle"}
        </button>

        {b ? (
          <section className="mt-10 rounded-[1.5rem] border border-[#4a425c] bg-[#3a324f]/90 p-6">
            <h2 className="font-serif text-xl font-semibold text-ink">
              Your Bookle stats
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-muted">
              <li>
                <span className="text-muted-soft">Wins</span>
                <p className="font-semibold text-ink">{b.gamesWon}</p>
              </li>
              <li>
                <span className="text-muted-soft">Win rate</span>
                <p className="font-semibold text-ink">
                  {Math.round(b.winRate * 100)}%
                </p>
              </li>
              <li>
                <span className="text-muted-soft">Solve streak</span>
                <p className="font-semibold text-ink">
                  {b.currentSolveStreak}
                </p>
              </li>
              <li>
                <span className="text-muted-soft">Best streak</span>
                <p className="font-semibold text-ink">
                  {b.longestSolveStreak}
                </p>
              </li>
              <li>
                <span className="text-muted-soft">Avg. guesses</span>
                <p className="font-semibold text-ink">
                  {b.averageGuesses.toFixed(1)}
                </p>
              </li>
              <li>
                <span className="text-muted-soft">Today</span>
                <p className="font-semibold text-ink">
                  {b.todayCompleted ? "Completed ✓" : "Not played yet"}
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
