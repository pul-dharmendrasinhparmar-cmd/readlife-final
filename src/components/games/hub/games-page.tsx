"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AppNav } from "@/components/layout/app-nav";
import { GameModal } from "@/components/search/game-modal";
import { MINI_GAMES } from "@/components/search/data";
import type { MiniGame } from "@/components/search/types";
import { getAchievement } from "./achievements";
import { AchievementBadgeIcon } from "./AchievementBadgeIcon";
import { CuteBookworm } from "./CuteBookworm";
import { CutePip } from "./CutePip";
import { CuteUncovered } from "./CuteUncovered";
import { CuteTrolley } from "./CuteTrolley";
import {
  bookleFriendsLeaderboard,
  bookwormFriendsLeaderboard,
  lexiconFriendsLeaderboard,
  piecesFriendsLeaderboard,
  todayISO,
  trolleyFriendsLeaderboard,
  uncoveredFriendsLeaderboard,
} from "./demo-data";
import "./games.css";
import { loadGameProfile, streakSecuredToday } from "./storage";
import { formatPiecesTime } from "@/components/games/pieces/covers";
import { PiecesIcon } from "@/components/games/pieces/PiecesIcon";
import type {
  GameProfile,
  LeaderboardGame,
  LeaderboardPeriod,
  LeaderboardScope,
} from "./types";

type Panel = "stats" | "achievements" | "leaderboard" | "challenges" | null;

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

const LEADERBOARD_GAMES: readonly [LeaderboardGame, string][] = [
  ["bookle", "Bookle"],
  ["bookworm", "Bookworm"],
  ["lexicon", "Wordsmith"],
  ["uncovered", "Uncovered"],
  ["pieces", "Pieces"],
  ["trolley", "Trolley"],
] as const;

function mondayBasedWeek(): string[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const day = today.getDay(); // 0 Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${dd}`);
  }
  return days;
}

function findGame(id: string): MiniGame | undefined {
  return MINI_GAMES.find((g) => g.id === id);
}

export function GamesPage() {
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [activeGame, setActiveGame] = useState<MiniGame | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [lbGame, setLbGame] = useState<LeaderboardGame>("bookworm");
  const [lbScope, setLbScope] = useState<LeaderboardScope>("friends");
  const [lbPeriod, setLbPeriod] = useState<LeaderboardPeriod>("week");

  useEffect(() => {
    setProfile(loadGameProfile());
  }, []);

  const play = useCallback((id: "bookle" | "bookworm" | "lexicon" | "uncovered" | "pieces" | "trolley" | "bookbound") => {
    const g = findGame(id);
    if (g?.playable) setActiveGame(g);
  }, []);

  const weekDays = useMemo(() => mondayBasedWeek(), []);
  const today = todayISO();
  const secured = profile ? streakSecuredToday(profile) : false;
  const qualifiedSet = useMemo(
    () => new Set(profile?.overallStreak.recentDays ?? []),
    [profile],
  );

  if (!profile) {
    return (
      <div className="games-hub min-h-screen w-full min-w-0 max-w-full">
        <AppNav />
        <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-16 text-center text-muted sm:px-6">
          Opening the arcade…
        </main>
      </div>
    );
  }

  const empty = !profile.hasPlayedAny;

  return (
    <div className="games-hub min-h-screen w-full min-w-0 max-w-full pb-20">
      <AppNav />
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="max-w-2xl">
          <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-ink/55 uppercase">
            Playful reading
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-[2.75rem]">
            Games
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink/70 sm:text-lg">
            Play with books, test your knowledge, and keep your streak alive.
          </p>
          <p className="mt-1 text-sm text-ink/50">
            Five games. Endless chances to beat your best.
          </p>
        </header>

        {empty ? (
          <EmptyShelf onPlay={play} />
        ) : (
          <>
            <section className="mt-10 min-w-0">
              <SectionEyebrow tone="page">Today in Games</SectionEyebrow>
              <div className="mt-3 grid min-w-0 grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="games-card flex h-full w-full min-w-0 max-w-full flex-col rounded-[1.5rem] p-4 sm:p-5">
                  <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-ink/55 uppercase">
                    Your streak
                  </p>
                  {profile.overallStreak.current === 0 && !secured ? (
                    <>
                      <h2 className="mt-2 font-serif text-xl font-semibold text-ink sm:text-2xl">
                        Start your streak
                      </h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
                        Play any game today. Come back tomorrow and keep it
                        going.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-2 font-serif text-xl font-semibold text-ink sm:text-2xl">
                        {profile.overallStreak.current} day streak
                      </h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
                        {secured
                          ? "Today's chapter: complete."
                          : "One game today keeps the story going."}
                      </p>
                    </>
                  )}

                  <ol
                    className="games-streak-week mt-4 flex w-full min-w-0 items-start justify-between gap-0.5 sm:gap-1"
                    aria-label="This week's streak"
                  >
                    {weekDays.map((date, i) => {
                      const isToday = date === today;
                      const done = qualifiedSet.has(date);
                      const future = date > today;
                      const missed =
                        !done && !isToday && !future && date < today;

                      let label = "Upcoming day";
                      let mark = "·";
                      let cls =
                        "border-[#d8d4e0] bg-[#ebe8f2] text-muted-soft";
                      if (done) {
                        label = "Completed";
                        mark = "✓";
                        cls = "border-forest/40 bg-forest text-paper";
                      } else if (isToday && !done) {
                        label = "Today — not yet completed";
                        mark = "●";
                        cls =
                          "border-gold bg-[#ebe6f4] text-ink ring-2 ring-inset ring-gold/50";
                      } else if (missed) {
                        label = "Missed";
                        mark = "–";
                        cls =
                          "border-transparent bg-transparent text-muted-soft";
                      }

                      return (
                        <li
                          key={date}
                          className="games-streak-day flex min-w-0 flex-1 flex-col items-center gap-1"
                        >
                          <span className="text-[0.55rem] font-semibold tracking-wide text-ink/60 uppercase sm:text-[0.6rem]">
                            {WEEK_LABELS[i]}
                          </span>
                          <span
                            className={`games-streak-mark flex aspect-square w-full max-w-7 items-center justify-center rounded-full border text-[0.65rem] font-semibold sm:max-w-7 sm:text-xs ${cls}`}
                            title={label}
                            aria-label={`${WEEK_LABELS[i]}: ${label}`}
                          >
                            {mark}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  <p className="mt-auto pt-3 text-xs text-ink/50">
                    Longest: {profile.overallStreak.longest} days
                  </p>
                </div>

                <BadgesCarousel
                  profile={profile}
                  onViewAll={() => setPanel("achievements")}
                />

                <div className="games-card flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-[1.5rem] p-4 sm:col-span-2 sm:p-5 lg:col-span-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-ink/55 uppercase">
                        Leaderboard
                      </p>
                      <h2 className="mt-2 font-serif text-xl font-semibold text-ink sm:text-2xl">
                        Friends
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPanel("leaderboard")}
                      className="shrink-0 text-xs font-semibold text-ink underline-offset-2 hover:underline"
                    >
                      See all
                    </button>
                  </div>
                  <div className="games-h-scroll mt-2.5 flex gap-1.5 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {LEADERBOARD_GAMES.map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setLbGame(id)}
                        className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
                          lbGame === id
                            ? "bg-forest text-paper"
                            : "games-pill-idle"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-auto min-w-0">
                    <LeaderboardPreview
                      game={lbGame}
                      profile={profile}
                      compact
                    />
                  </div>
                </div>
              </div>

            </section>

            <div className="mt-8 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19.5rem] xl:grid-cols-[minmax(0,1fr)_21rem]">
              {/* Main: play */}
              <div className="min-w-0 space-y-8">
                <section className="min-w-0">
                  <SectionEyebrow tone="page">Play</SectionEyebrow>
                  <div className="mt-4 grid min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-4">
                    <BookboundCard
                      profile={profile}
                      onPlay={() => play("bookbound")}
                    />
                    <BookleCard profile={profile} onPlay={() => play("bookle")} />
                    <BookwormCard
                      profile={profile}
                      onPlay={() => play("bookworm")}
                    />
                    <LexiconCard
                      profile={profile}
                      onPlay={() => play("lexicon")}
                    />
                    <UncoveredCard
                      profile={profile}
                      onPlay={() => play("uncovered")}
                    />
                    <PiecesCard
                      profile={profile}
                      onPlay={() => play("pieces")}
                    />
                    <TrolleyCard
                      profile={profile}
                      onPlay={() => play("trolley")}
                    />
                  </div>
                </section>
              </div>

              {/* Right rail */}
              <aside className="min-w-0 space-y-4 lg:sticky lg:top-[5.25rem]">
                <section className="games-card flex min-h-[18.5rem] flex-col rounded-[1.35rem] p-4 sm:min-h-[20rem]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <SectionEyebrow>Game stats</SectionEyebrow>
                      <h2 className="mt-1 font-serif text-lg font-semibold text-ink">
                        At a glance
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPanel("stats")}
                      className="text-xs font-semibold text-ink underline-offset-2 hover:underline"
                    >
                      Full stats
                    </button>
                  </div>
                  <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto">
                    <GlanceStats profile={profile} focusGame={lbGame} />
                  </div>
                </section>

                <section className="games-card rounded-[1.35rem] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <SectionEyebrow>Challenges</SectionEyebrow>
                      <h2 className="mt-1 font-serif text-lg font-semibold text-ink">
                        This week
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPanel("challenges")}
                      className="text-xs font-semibold text-ink underline-offset-2 hover:underline"
                    >
                      See all
                    </button>
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {profile.challenges.slice(0, 3).map((c) => (
                      <li key={c.id}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink">
                            {c.title}
                          </p>
                          {c.completed ? (
                            <span className="text-[0.65rem] font-semibold text-ink">
                              Done ✓
                            </span>
                          ) : (
                            <span className="text-[0.65rem] text-muted">
                              {Math.min(c.progress, c.target)}/{c.target}
                            </span>
                          )}
                        </div>
                        <div className="games-track mt-1.5 h-1.5 overflow-hidden rounded-full">
                          <div
                            className="h-full rounded-full bg-forest"
                            style={{
                              width: `${Math.min(100, (c.progress / c.target) * 100)}%`,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>
            </div>

          </>
        )}
      </main>

      <GameModal
        game={activeGame}
        open={!!activeGame}
        onClose={() => {
          setActiveGame(null);
          setProfile(loadGameProfile());
        }}
      />

      {panel ? (
        <DetailSheet
          title={
            panel === "stats"
              ? "Full Game Stats"
              : panel === "achievements"
                ? "Achievements"
                : panel === "leaderboard"
                  ? "Leaderboards"
                  : "Challenges"
          }
          onClose={() => setPanel(null)}
        >
          {panel === "stats" ? (
            <FullStats profile={profile} />
          ) : panel === "achievements" ? (
            <FullAchievements profile={profile} />
          ) : panel === "challenges" ? (
            <FullChallenges profile={profile} />
          ) : (
            <FullLeaderboard
              game={lbGame}
              setGame={setLbGame}
              scope={lbScope}
              setScope={setLbScope}
              period={lbPeriod}
              setPeriod={setLbPeriod}
              profile={profile}
            />
          )}
        </DetailSheet>
      ) : null}
    </div>
  );
}

function SectionEyebrow({
  children,
  tone = "card",
}: {
  children: ReactNode;
  tone?: "page" | "card";
}) {
  return (
    <p
      className={`text-[0.68rem] font-semibold tracking-[0.14em] uppercase ${
        tone === "page" ? "text-ink/55" : "text-ink/60"
      }`}
    >
      {children}
    </p>
  );
}

function BadgesCarousel({
  profile,
  onViewAll,
}: {
  profile: GameProfile;
  onViewAll: () => void;
}) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const unlocked = profile.achievements.filter((a) => a.completed);
  const showControls = unlocked.length > 2;

  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(140, Math.floor(el.clientWidth * 0.72));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="games-card flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-[1.5rem] p-4 sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-ink/55 uppercase">
            Badges
          </p>
          <h2 className="mt-2 font-serif text-xl font-semibold text-ink sm:text-2xl">
            Achievements
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {showControls ? (
            <>
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d4cfe0] bg-[#f4f1f8] text-ink hover:border-forest/40"
                aria-label="Previous badges"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d4cfe0] bg-[#f4f1f8] text-ink hover:border-forest/40"
                aria-label="Next badges"
              >
                ›
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-ink underline-offset-2 hover:underline"
          >
            View all
          </button>
        </div>
      </div>

      {unlocked.length === 0 ? (
        <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/70">
          Play a few games to unlock your first badges. They&apos;ll show up
          here.
        </p>
      ) : (
        <ul
          ref={scrollerRef}
          className="games-h-scroll mt-4 flex min-w-0 flex-1 gap-2.5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        >
          {unlocked.map((a) => {
            const def = getAchievement(a.achievementId);
            if (!def) return null;
            return (
              <li
                key={a.achievementId}
                className="games-nest flex w-[min(8.5rem,70%)] shrink-0 snap-start flex-col rounded-xl px-3 py-3 sm:w-[9.5rem]"
              >
                <AchievementBadgeIcon def={def} size="md" />
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-ink">
                  {def.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[0.7rem] leading-snug text-muted">
                  {def.description}
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-auto pt-3 text-xs text-ink/50">
        {unlocked.length} unlocked
      </p>
    </div>
  );
}

/** Orders / highlights At a glance rows to match the leaderboard game tab. */
function GlanceStats({
  profile,
  focusGame,
}: {
  profile: GameProfile;
  focusGame: LeaderboardGame;
}) {
  type GlanceId = LeaderboardGame | "bookbound";
  type GlanceRow = { id: GlanceId; label: string; body: ReactNode };

  const rows: GlanceRow[] = [
    {
      id: "bookle",
      label: "Bookle",
      body: (
        <>
          <strong>{profile.bookle.gamesWon}</strong> wins ·{" "}
          {Math.round(profile.bookle.winRate * 100)}% · best streak{" "}
          {profile.bookle.longestSolveStreak}
        </>
      ),
    },
    {
      id: "bookworm",
      label: "Bookworm",
      body: (
        <>
          Best{" "}
          <strong>{profile.bookworm.personalBest.toLocaleString()}</strong> ·{" "}
          {profile.bookworm.highestLevelReached}
        </>
      ),
    },
  ];

  if (profile.lexicon) {
    rows.push({
      id: "lexicon",
      label: "Wordsmith",
      body: (
        <>
          <strong>{profile.lexicon.gamesWon}</strong> wins · best{" "}
          {profile.lexicon.personalBest.toLocaleString()}
        </>
      ),
    });
  }
  if (profile.uncovered) {
    rows.push({
      id: "uncovered",
      label: "Uncovered",
      body: (
        <>
          Best{" "}
          <strong>{profile.uncovered.personalBest.toLocaleString()}</strong>
          {profile.uncovered.currentPlayStreak
            ? ` · ${profile.uncovered.currentPlayStreak}-day streak`
            : ""}
        </>
      ),
    });
  }
  if (profile.pieces) {
    rows.push({
      id: "pieces",
      label: "Pieces",
      body: (
        <>
          <strong>{profile.pieces.puzzlesCompleted}</strong> restored
          {profile.pieces.bestTimeMs
            ? ` · best ${formatPiecesTime(profile.pieces.bestTimeMs)}`
            : ""}
        </>
      ),
    });
  }
  if (profile.trolley) {
    rows.push({
      id: "trolley",
      label: "Trolley of Tales",
      body: (
        <>
          Best{" "}
          <strong>{profile.trolley.personalBest.toLocaleString()}</strong>
          {profile.trolley.currentPlayStreak
            ? ` · ${profile.trolley.currentPlayStreak}-day streak`
            : ""}
        </>
      ),
    });
  }
  if (profile.bookbound) {
    rows.push({
      id: "bookbound",
      label: "Bookbound",
      body: (
        <>
          Chapter{" "}
          <strong>{profile.bookbound.highestLevelUnlocked} / 3</strong> unlocked
          {profile.bookbound.highestScore
            ? ` · best ${profile.bookbound.highestScore.toLocaleString()}`
            : ""}
        </>
      ),
    });
  }

  const ordered = [
    ...rows.filter((r) => r.id === focusGame),
    ...rows.filter((r) => r.id !== focusGame),
  ];

  return (
    <>
      {ordered.map((row) => {
        const active = row.id === focusGame;
        return (
          <div
            key={row.id}
            className={`rounded-xl px-3 py-2.5 transition ${
              active
                ? "border border-forest/25 bg-forest/[0.08] shadow-[inset_0_0_0_1px_rgba(47,74,54,0.06)]"
                : "game-nest"
            }`}
          >
            <p
              className={`text-xs font-semibold tracking-wide uppercase ${
                active ? "text-forest" : "text-muted"
              }`}
            >
              {row.label}
              {active ? (
                <span className="ml-1.5 text-[0.65rem] font-semibold tracking-normal text-forest/70 normal-case">
                  · leaderboard
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-sm text-ink">{row.body}</p>
          </div>
        );
      })}
    </>
  );
}

function EmptyShelf({
  onPlay,
}: {
  onPlay: (id: "bookle" | "bookworm" | "lexicon" | "uncovered" | "pieces" | "trolley" | "bookbound") => void;
}) {
  return (
    <section className="games-card mt-10 rounded-[1.75rem] px-6 py-10 text-center">
      <h2 className="font-serif text-2xl font-semibold text-ink">
        Your game shelf is empty—for now.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Bookbound, Bookle, Bookworm, Wordsmith, Uncovered, Pieces, and
        Trolley of Tales are waiting. Play your first game to start a streak, unlock
        badges, and appear on the friends board.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => onPlay("bookbound")}
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper hover:bg-forest-deep"
        >
          Play Your First Game
        </button>
        <button
          type="button"
          onClick={() => onPlay("uncovered")}
          className="games-pill-idle rounded-full border border-forest/35 px-5 py-2.5 text-sm font-semibold"
        >
          Try Uncovered
        </button>
      </div>
      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
          <BookboundCard profile={null} onPlay={() => onPlay("bookbound")} />
          <BookleCard profile={null} onPlay={() => onPlay("bookle")} />
          <BookwormCard profile={null} onPlay={() => onPlay("bookworm")} />
          <LexiconCard profile={null} onPlay={() => onPlay("lexicon")} />
          <UncoveredCard profile={null} onPlay={() => onPlay("uncovered")} />
          <PiecesCard profile={null} onPlay={() => onPlay("pieces")} />
          <TrolleyCard profile={null} onPlay={() => onPlay("trolley")} />
      </div>
    </section>
  );
}

function BookleCard({
  profile,
  onPlay,
}: {
  profile: GameProfile | null;
  onPlay: () => void;
  compact?: boolean;
}) {
  const done = profile?.bookle.todayCompleted;
  return (
    <article className="game-card-bookle group relative flex h-full min-h-[18.5rem] flex-col overflow-hidden rounded-[1.35rem] border border-[#d4c4e8] bg-[#f3f4f8] p-4 shadow-[0_12px_32px_rgba(20,16,30,0.24)] sm:min-h-[20rem] sm:p-5">
      <div
        className="pointer-events-none absolute top-4 right-4 flex flex-col items-center gap-1 sm:top-5 sm:right-5"
        aria-hidden
      >
        <p className="text-center text-[0.55rem] font-semibold tracking-[0.08em] text-ink/45 uppercase">
          Guess the
        </p>
        <div className="flex gap-0.5">
          {["W", "O", "R", "D"].map((letter, i) => (
            <span
              key={`${letter}-${i}`}
              className="games-tile flex h-5 w-5 items-center justify-center rounded-[0.25rem] border border-[#cfc8dc] bg-[#ebe6f4] font-serif text-[0.6rem] font-semibold text-ink/85"
              style={{ transform: `rotate(${i % 2 === 0 ? -2.5 : 2}deg)` }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
      <p className="whitespace-nowrap pr-[4.25rem] text-[0.62rem] font-semibold tracking-[0.14em] text-ink/55 uppercase sm:pr-[4.75rem]">
        Word puzzle
      </p>
      <h3 className="mt-2 pr-[4.25rem] font-serif text-2xl font-semibold text-ink sm:pr-[4.75rem] sm:text-[1.65rem]">
        Bookle
      </h3>
      <p className="mt-1.5 line-clamp-3 min-h-[3.75rem] pr-2 text-sm leading-snug text-ink/70">
        Guess the word before you run out of clues.
      </p>

      <div className="mt-auto pt-3">
        <p className="min-h-[1.125rem] text-xs text-muted-soft">
          {profile ? (
            <>
              {done ? "Completed today ✓" : "Not played yet"}
              {" · "}
              {Math.round(profile.bookle.winRate * 100)}% wins
            </>
          ) : (
            "\u00a0"
          )}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPlay}
            className="rounded-full bg-forest px-3.5 py-2 text-sm font-semibold text-[#2a2438] hover:bg-forest-deep"
          >
            {done ? "Play again" : "Play"}
          </button>
          <Link
            href="/games/bookle"
            className="text-center text-xs font-semibold text-ink underline-offset-2 hover:underline"
          >
            View Stats
          </Link>
        </div>
      </div>
    </article>
  );
}

function BookwormCard({
  profile,
  onPlay,
}: {
  profile: GameProfile | null;
  onPlay: () => void;
  compact?: boolean;
}) {
  return (
    <article className="game-card-bookworm group relative flex h-full min-h-[18.5rem] flex-col overflow-hidden rounded-[1.35rem] border border-[#d4c4e8] bg-[#f3f4f8] p-4 shadow-[0_12px_32px_rgba(20,16,30,0.24)] sm:min-h-[20rem] sm:p-5">
      <div
        className="pointer-events-none absolute -top-0.5 right-3 sm:top-0 sm:right-4"
        aria-hidden
      >
        <span className="games-worm inline-flex">
          <CuteBookworm className="h-14 w-14 sm:h-16 sm:w-16" />
        </span>
      </div>
      <p className="whitespace-nowrap pr-[4.25rem] text-[0.62rem] font-semibold tracking-[0.14em] text-ink/55 uppercase sm:pr-[4.75rem]">
        Arcade crawl
      </p>
      <h3 className="mt-2 pr-[4.25rem] font-serif text-2xl font-semibold text-ink sm:pr-[4.75rem] sm:text-[1.65rem]">
        Bookworm
      </h3>
      <p className="mt-1.5 line-clamp-3 min-h-[3.75rem] pr-2 text-sm leading-snug text-ink/70">
        Collect books and beat your high score.
      </p>

      <div className="mt-auto pt-3">
        <p className="game-score-glow min-h-[1.125rem] text-xs text-muted-soft">
          {profile ? (
            <>
              Best{" "}
              <span className="font-semibold text-ink">
                {profile.bookworm.personalBest.toLocaleString()}
              </span>
              {" · "}
              {profile.bookworm.highestLevelReached}
            </>
          ) : (
            "\u00a0"
          )}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPlay}
            className="rounded-full bg-forest px-3.5 py-2 text-sm font-semibold text-[#2a2438] hover:bg-forest-deep"
          >
            Play
          </button>
          <Link
            href="/games/bookworm"
            className="text-center text-xs font-semibold text-ink underline-offset-2 hover:underline"
          >
            View Stats
          </Link>
        </div>
      </div>
    </article>
  );
}

function LexiconCard({
  profile,
  onPlay,
}: {
  profile: GameProfile | null;
  onPlay: () => void;
}) {
  const lx = profile?.lexicon;
  return (
    <article className="game-card-lexicon group relative flex h-full min-h-[18.5rem] flex-col overflow-hidden rounded-[1.35rem] border border-[#d4c4e8] bg-[#f3f4f8] p-4 shadow-[0_12px_32px_rgba(20,16,30,0.24)] sm:min-h-[20rem] sm:p-5">
      <div
        className="games-lex-mini pointer-events-none absolute top-3 right-3 sm:top-4 sm:right-4"
        aria-hidden
      >
        {/* BOOK across × NOVEL down through the second O */}
        <div
          className="games-lex-grid"
          style={{
            gridTemplateColumns: "repeat(4, 0.62rem)",
            gridTemplateRows: "repeat(5, 0.62rem)",
          }}
        >
          {[
            { r: 1, c: 0, L: "B" },
            { r: 1, c: 1, L: "O" },
            { r: 1, c: 2, L: "O" },
            { r: 1, c: 3, L: "K" },
            { r: 0, c: 2, L: "N" },
            { r: 2, c: 2, L: "V" },
            { r: 3, c: 2, L: "E" },
            { r: 4, c: 2, L: "L" },
          ].map(({ r, c, L }) => (
            <span
              key={`${r}-${c}-${L}`}
              className="games-lex-tile"
              style={{ gridRow: r + 1, gridColumn: c + 1 }}
            >
              {L}
            </span>
          ))}
        </div>
      </div>
      <p className="whitespace-nowrap pr-[4.25rem] text-[0.62rem] font-semibold tracking-[0.12em] text-ink/55 uppercase sm:pr-[4.75rem]">
        Bookish Scrabble
      </p>
      <h3 className="mt-2 pr-[4.25rem] font-serif text-2xl font-semibold text-ink sm:pr-[4.75rem] sm:text-[1.65rem]">
        Wordsmith
      </h3>
      <p className="mt-1.5 line-clamp-3 min-h-[3.75rem] pr-2 text-sm leading-snug text-ink/70">
        Any real word scores — bookish jargon pays extra.
      </p>

      <div className="mt-auto pt-3">
        <p className="min-h-[1.125rem] text-xs text-muted-soft">
          {lx ? (
            <>
              {lx.gamesWon} wins · best{" "}
              <span className="font-semibold text-ink">
                {lx.personalBest.toLocaleString()}
              </span>
            </>
          ) : (
            "\u00a0"
          )}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPlay}
            className="rounded-full bg-forest px-3.5 py-2 text-sm font-semibold text-[#2a2438] hover:bg-forest-deep"
          >
            Play
          </button>
          <Link
            href="/games/lexicon"
            className="text-center text-xs font-semibold text-ink underline-offset-2 hover:underline"
          >
            View Stats
          </Link>
        </div>
      </div>
    </article>
  );
}

function UncoveredCard({
  profile,
  onPlay,
}: {
  profile: GameProfile | null;
  onPlay: () => void;
}) {
  const u = profile?.uncovered;
  const done = u?.todayCompleted;
  return (
    <article className="game-card-uncovered group relative flex h-full min-h-[18.5rem] flex-col overflow-hidden rounded-[1.35rem] border border-[#d4c4e8] bg-[#f3f4f8] p-4 shadow-[0_12px_32px_rgba(20,16,30,0.24)] sm:min-h-[20rem] sm:p-5">
      <div
        className="games-unc-mini pointer-events-none absolute top-2 right-2 sm:top-3 sm:right-3"
        aria-hidden
      >
        <CuteUncovered className="h-12 w-12 sm:h-14 sm:w-14" />
      </div>
      <p className="whitespace-nowrap pr-[4.25rem] text-[0.62rem] font-semibold tracking-[0.12em] text-ink/55 uppercase sm:pr-[4.75rem]">
        Cover or emoji
      </p>
      <h3 className="mt-2 pr-[4.25rem] font-serif text-2xl font-semibold text-ink sm:pr-[4.75rem] sm:text-[1.65rem]">
        Uncovered
      </h3>
      <p className="mt-1.5 line-clamp-3 min-h-[3.75rem] pr-2 text-sm leading-snug text-ink/70">
        Guess from a hidden cover, or from the plot in five emojis.
      </p>

      <div className="mt-auto pt-3">
        <p className="min-h-[1.125rem] text-xs text-muted-soft">
          {u ? (
            <>
              {done ? "Completed today ✓" : "Not played yet"}
              {" · "}
              best{" "}
              <span className="font-semibold text-ink">
                {u.personalBest.toLocaleString()}
              </span>
              {u.currentPlayStreak
                ? ` · ${u.currentPlayStreak}-day streak`
                : ""}
            </>
          ) : (
            "\u00a0"
          )}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPlay}
            className="rounded-full bg-forest px-3.5 py-2 text-sm font-semibold text-[#2a2438] hover:bg-forest-deep"
          >
            Play Uncovered
          </button>
          <Link
            href="/games/uncovered"
            className="text-center text-xs font-semibold text-ink underline-offset-2 hover:underline"
          >
            View Stats
          </Link>
        </div>
      </div>
    </article>
  );
}

function PiecesCard({
  profile,
  onPlay,
}: {
  profile: GameProfile | null;
  onPlay: () => void;
}) {
  const p = profile?.pieces;
  const done = p?.todayCompleted;
  return (
    <article className="game-card-pieces group relative flex h-full min-h-[18.5rem] flex-col overflow-hidden rounded-[1.35rem] border border-[#d4c4e8] bg-[#f3f4f8] p-4 shadow-[0_12px_32px_rgba(20,16,30,0.24)] sm:min-h-[20rem] sm:p-5">
      <div
        className="pointer-events-none absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5"
        aria-hidden
      >
        <PiecesIcon className="games-pcs-mini pcs-icon" />
      </div>
      <p className="whitespace-nowrap pr-[4.25rem] text-[0.62rem] font-semibold tracking-[0.12em] text-ink/55 uppercase sm:pr-[4.75rem]">
        Cover jigsaw
      </p>
      <h3 className="mt-2 pr-[4.25rem] font-serif text-2xl font-semibold text-ink sm:pr-[4.75rem] sm:text-[1.65rem]">
        Pieces
      </h3>
      <p className="mt-1.5 line-clamp-3 min-h-[3.75rem] pr-2 text-sm leading-snug text-ink/70">
        Reconstruct a book cover, one jigsaw piece at a time.
      </p>

      <div className="mt-auto pt-3">
        <p className="min-h-[1.125rem] text-xs text-muted-soft">
          {p ? (
            <>
              {done ? "Completed today ✓" : "Not played yet"}
              {p.bestTimeMs
                ? ` · best ${formatPiecesTime(p.bestTimeMs)}`
                : ""}
            </>
          ) : (
            "\u00a0"
          )}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPlay}
            className="rounded-full bg-forest px-3.5 py-2 text-sm font-semibold text-[#2a2438] hover:bg-forest-deep"
          >
            Play Pieces
          </button>
          <Link
            href="/games/pieces"
            className="text-center text-xs font-semibold text-ink underline-offset-2 hover:underline"
          >
            View Stats
          </Link>
        </div>
      </div>
    </article>
  );
}

function TrolleyCard({
  profile,
  onPlay,
}: {
  profile: GameProfile | null;
  onPlay: () => void;
}) {
  const t = profile?.trolley;
  return (
    <article className="game-card-trolley group relative flex h-full min-h-[18.5rem] flex-col overflow-hidden rounded-[1.35rem] border border-[#d4c4e8] bg-[#f3f4f8] p-4 shadow-[0_12px_32px_rgba(20,16,30,0.24)] sm:min-h-[20rem] sm:p-5">
      <div
        className="games-trl-mini pointer-events-none absolute top-2 right-2 sm:top-3 sm:right-3"
        aria-hidden
      >
        <CuteTrolley className="h-12 w-12 sm:h-14 sm:w-14" />
      </div>
      <p className="whitespace-nowrap pr-[4.25rem] text-[0.62rem] font-semibold tracking-[0.12em] text-ink/55 uppercase sm:pr-[4.75rem]">
        Catching arcade
      </p>
      <h3 className="mt-2 pr-[4.25rem] font-serif text-2xl font-semibold text-ink sm:pr-[4.75rem] sm:text-[1.65rem]">
        Trolley of Tales
      </h3>
      <p className="mt-1.5 line-clamp-3 min-h-[3.75rem] pr-2 text-sm leading-snug text-ink/70">
        Catch falling books. Dodge the coffee spills.
      </p>

      <div className="mt-auto pt-3">
        <p className="min-h-[1.125rem] text-xs text-muted-soft">
          {t ? (
            <>
              Best{" "}
              <span className="font-semibold text-ink">
                {t.personalBest.toLocaleString()}
              </span>
              {t.currentPlayStreak ? ` · ${t.currentPlayStreak}-day streak` : ""}
            </>
          ) : (
            "\u00a0"
          )}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPlay}
            className="rounded-full bg-forest px-3.5 py-2 text-sm font-semibold text-[#2a2438] hover:bg-forest-deep"
          >
            Play Trolley
          </button>
          <Link
            href="/games/trolley"
            className="text-center text-xs font-semibold text-ink underline-offset-2 hover:underline"
          >
            View Stats
          </Link>
        </div>
      </div>
    </article>
  );
}

function BookboundCard({
  profile,
  onPlay,
}: {
  profile: GameProfile | null;
  onPlay: () => void;
}) {
  const b = profile?.bookbound;
  return (
    <article className="game-card-bookbound group relative flex h-full min-h-[18.5rem] flex-col overflow-hidden rounded-[1.35rem] border border-[#d4c4e8] bg-[#f3f4f8] p-4 shadow-[0_12px_32px_rgba(20,16,30,0.24)] sm:min-h-[20rem] sm:p-5">
      <div
        className="pointer-events-none absolute top-1.5 right-1.5 sm:top-2 sm:right-2"
        aria-hidden
      >
        <CutePip className="h-14 w-14 sm:h-16 sm:w-16" />
      </div>
      <p className="whitespace-nowrap pr-[4.25rem] text-[0.62rem] font-semibold tracking-[0.12em] text-ink/55 uppercase sm:pr-[4.75rem]">
        Story platformer
      </p>
      <h3 className="mt-2 pr-[4.25rem] font-serif text-2xl font-semibold text-ink sm:pr-[4.75rem] sm:text-[1.65rem]">
        Bookbound
      </h3>
      <p className="mt-1.5 line-clamp-3 min-h-[3.75rem] pr-2 text-sm leading-snug text-ink/70">
        Journey through forgotten stories, collect magical pages, and defeat the
        monsters guarding each chapter.
      </p>

      <div className="mt-auto pt-3">
        <p className="min-h-[1.125rem] text-xs text-muted-soft">
          {b && b.gamesPlayed > 0 ? (
            <>
              Chapter {b.highestLevelUnlocked} / 3 unlocked
              {b.highestScore
                ? ` · best ${b.highestScore.toLocaleString()}`
                : ""}
            </>
          ) : (
            "Not started yet"
          )}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPlay}
            className="rounded-full bg-forest px-3.5 py-2 text-sm font-semibold text-[#2a2438] hover:bg-forest-deep"
          >
            Start Adventure
          </button>
          <Link
            href="/games/bookbound"
            className="text-center text-xs font-semibold text-ink underline-offset-2 hover:underline"
          >
            View Stats
          </Link>
        </div>
      </div>
    </article>
  );
}

function LeaderboardRowShell({
  rank,
  avatar,
  name,
  subtitle,
  metric,
  isYou,
}: {
  rank: number;
  avatar: string;
  name: string;
  subtitle?: string;
  metric?: string;
  isYou?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-2 rounded-xl px-1.5 py-1 ${
        isYou ? "games-nest" : ""
      }`}
    >
      <span className="w-4 text-xs font-semibold text-muted">{rank}</span>
      <span className="games-track relative h-7 w-7 overflow-hidden rounded-full">
        <Image src={avatar} alt="" fill className="object-cover" sizes="28px" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        {subtitle ? (
          <p className="truncate text-[0.65rem] text-ink/50">{subtitle}</p>
        ) : null}
      </div>
      {metric ? (
        <span className="shrink-0 text-sm font-semibold text-ink">{metric}</span>
      ) : null}
    </li>
  );
}

function LeaderboardPreview({
  game,
  profile,
  compact,
}: {
  game: LeaderboardGame;
  profile: GameProfile;
  compact?: boolean;
}) {
  const limit = compact ? 3 : 4;
  const wrap = compact ? "mt-3" : "mt-4";

  if (game === "bookworm") {
    const all = bookwormFriendsLeaderboard(profile.bookworm.personalBest);
    const rows = all.slice(0, limit);
    const youRank = all.findIndex((r) => r.isYou) + 1;
    return (
      <div className={wrap}>
        <p className="text-xs text-muted-soft">
          {compact ? "High score" : `Your rank: #${youRank} among friends · high score`}
        </p>
        <ol className="mt-2 space-y-1.5">
          {rows.map((row, i) => (
            <LeaderboardRowShell
              key={row.userId}
              rank={i + 1}
              avatar={row.avatar}
              name={row.displayName}
              subtitle={!compact ? row.levelReached : undefined}
              metric={row.score.toLocaleString()}
              isYou={row.isYou}
            />
          ))}
        </ol>
      </div>
    );
  }

  if (game === "bookle") {
    const rows = bookleFriendsLeaderboard().slice(0, limit);
    return (
      <div className={wrap}>
        <p className={compact ? "mb-1.5 text-[0.65rem] text-muted-soft" : "mb-2 text-xs text-muted-soft"}>
          {compact ? "This week" : "This week · solved / avg guesses"}
        </p>
        <ol className="space-y-1.5">
          {rows.map((row, i) => (
            <LeaderboardRowShell
              key={row.userId}
              rank={i + 1}
              avatar={row.avatar}
              name={row.displayName}
              subtitle={!compact ? `avg ${row.averageGuesses.toFixed(1)}` : undefined}
              metric={`${row.solvedThisWeek}/${row.puzzlesThisWeek}`}
              isYou={row.isYou}
            />
          ))}
        </ol>
      </div>
    );
  }

  if (game === "lexicon") {
    const all = lexiconFriendsLeaderboard(profile.lexicon.personalBest);
    const rows = all.slice(0, limit);
    const youRank = all.findIndex((r) => r.isYou) + 1;
    return (
      <div className={wrap}>
        <p className="text-xs text-muted-soft">
          {compact ? "Best score" : `Your rank: #${youRank} among friends · best score`}
        </p>
        <ol className="mt-2 space-y-1.5">
          {rows.map((row, i) => (
            <LeaderboardRowShell
              key={row.userId}
              rank={i + 1}
              avatar={row.avatar}
              name={row.displayName}
              metric={row.score.toLocaleString()}
              isYou={row.isYou}
            />
          ))}
        </ol>
      </div>
    );
  }

  if (game === "uncovered") {
    const all = uncoveredFriendsLeaderboard(profile.uncovered.personalBest);
    const rows = all.slice(0, limit);
    const youRank = all.findIndex((r) => r.isYou) + 1;
    return (
      <div className={wrap}>
        <p className="text-xs text-muted-soft">
          {compact ? "Best score" : `Your rank: #${youRank} among friends · best score`}
        </p>
        <ol className="mt-2 space-y-1.5">
          {rows.map((row, i) => (
            <LeaderboardRowShell
              key={row.userId}
              rank={i + 1}
              avatar={row.avatar}
              name={row.displayName}
              metric={row.score.toLocaleString()}
              isYou={row.isYou}
            />
          ))}
        </ol>
      </div>
    );
  }

  if (game === "pieces") {
    const all = piecesFriendsLeaderboard(profile.pieces.bestTimeMs);
    const rows = all.slice(0, limit);
    const youRank = all.findIndex((r) => r.isYou) + 1;
    return (
      <div className={wrap}>
        <p className="text-xs text-muted-soft">
          {compact ? "Best time" : `Your rank: #${youRank} among friends · best time`}
        </p>
        <ol className="mt-2 space-y-1.5">
          {rows.map((row, i) => (
            <LeaderboardRowShell
              key={row.userId}
              rank={i + 1}
              avatar={row.avatar}
              name={row.displayName}
              metric={formatPiecesTime(row.bestTimeMs)}
              isYou={row.isYou}
            />
          ))}
        </ol>
      </div>
    );
  }

  const all = trolleyFriendsLeaderboard(profile.trolley.personalBest);
  const rows = all.slice(0, limit);
  const youRank = all.findIndex((r) => r.isYou) + 1;
  return (
    <div className={wrap}>
      <p className="text-xs text-muted-soft">
        {compact ? "Best score" : `Your rank: #${youRank} among friends · best score`}
      </p>
      <ol className="mt-2 space-y-1.5">
        {rows.map((row, i) => (
          <LeaderboardRowShell
            key={row.userId}
            rank={i + 1}
            avatar={row.avatar}
            name={row.displayName}
            metric={row.score.toLocaleString()}
            isYou={row.isYou}
          />
        ))}
      </ol>
    </div>
  );
}

function DetailSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#141018]/45 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="games-sheet relative z-10 max-h-[85svh] w-full max-w-lg overflow-y-auto rounded-t-[1.5rem] p-5 shadow-[0_24px_60px_rgba(20,16,30,0.35)] sm:rounded-[1.5rem] sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="games-pill-idle rounded-full px-3 py-1.5 text-sm font-semibold"
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function FullStats({ profile }: { profile: GameProfile }) {
  return (
    <div className="space-y-5 text-sm">
      <div>
        <h3 className="font-serif text-lg font-semibold text-ink">Bookle</h3>
        <ul className="mt-2 space-y-1 text-muted">
          <li>Played: {profile.bookle.gamesPlayed}</li>
          <li>Won: {profile.bookle.gamesWon}</li>
          <li>Win rate: {Math.round(profile.bookle.winRate * 100)}%</li>
          <li>Current solve streak: {profile.bookle.currentSolveStreak}</li>
          <li>Longest solve streak: {profile.bookle.longestSolveStreak}</li>
          <li>Average guesses: {profile.bookle.averageGuesses.toFixed(1)}</li>
        </ul>
        <p className="mt-3 font-semibold text-ink">Guess distribution</p>
        <ul className="mt-2 space-y-1">
          {([1, 2, 3, 4, 5, 6] as const).map((n) => {
            const count = profile.bookle.guessDistribution[n];
            const max = Math.max(
              ...Object.values(profile.bookle.guessDistribution),
              1,
            );
            return (
              <li key={n} className="flex items-center gap-2">
                <span className="w-4 font-semibold text-ink">{n}</span>
                <div className="games-track h-2 flex-1 rounded-full">
                  <div
                    className="h-full rounded-full bg-forest/80"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-muted">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <h3 className="font-serif text-lg font-semibold text-ink">
          Bookworm
        </h3>
        <ul className="mt-2 space-y-1 text-muted">
          <li>Games: {profile.bookworm.gamesPlayed}</li>
          <li>
            Personal best: {profile.bookworm.personalBest.toLocaleString()}
          </li>
          <li>
            Last score: {profile.bookworm.lastScore?.toLocaleString() ?? "—"}
          </li>
          <li>Highest level: {profile.bookworm.highestLevelReached}</li>
          <li>
            Books collected:{" "}
            {profile.bookworm.totalBooksCollected.toLocaleString()}
          </li>
          <li>Play streak: {profile.bookworm.currentPlayStreak}</li>
          <li>Longest play streak: {profile.bookworm.longestPlayStreak}</li>
        </ul>
      </div>
      <div>
        <h3 className="font-serif text-lg font-semibold text-ink">Wordsmith</h3>
        <ul className="mt-2 space-y-1 text-muted">
          <li>Played: {profile.lexicon.gamesPlayed}</li>
          <li>Won: {profile.lexicon.gamesWon}</li>
          <li>
            Personal best: {profile.lexicon.personalBest.toLocaleString()}
          </li>
          <li>
            Last score: {profile.lexicon.lastScore?.toLocaleString() ?? "—"}
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-serif text-lg font-semibold text-ink">
          Uncovered
        </h3>
        <ul className="mt-2 space-y-1 text-muted">
          <li>Played: {profile.uncovered?.gamesPlayed ?? 0}</li>
          <li>
            Personal best:{" "}
            {(profile.uncovered?.personalBest ?? 0).toLocaleString()}
          </li>
          <li>
            Last score: {profile.uncovered?.lastScore?.toLocaleString() ?? "—"}
          </li>
          <li>
            Last recognized:{" "}
            {profile.uncovered?.lastRecognized != null
              ? `${profile.uncovered.lastRecognized}/10`
              : "—"}
          </li>
          <li>Play streak: {profile.uncovered?.currentPlayStreak ?? 0}</li>
          <li>
            Best recognize streak:{" "}
            {profile.uncovered?.longestRecognizeStreak ?? 0}
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-serif text-lg font-semibold text-ink">Pieces</h3>
        <ul className="mt-2 space-y-1 text-muted">
          <li>Played: {profile.pieces?.gamesPlayed ?? 0}</li>
          <li>Covers restored: {profile.pieces?.puzzlesCompleted ?? 0}</li>
          <li>
            Best time:{" "}
            {profile.pieces?.bestTimeMs
              ? formatPiecesTime(profile.pieces.bestTimeMs)
              : "—"}
          </li>
          <li>
            Last time:{" "}
            {profile.pieces?.lastTimeMs
              ? formatPiecesTime(profile.pieces.lastTimeMs)
              : "—"}
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-serif text-lg font-semibold text-ink">
          Trolley of Tales
        </h3>
        <ul className="mt-2 space-y-1 text-muted">
          <li>Played: {profile.trolley?.gamesPlayed ?? 0}</li>
          <li>
            Personal best:{" "}
            {(profile.trolley?.personalBest ?? 0).toLocaleString()}
          </li>
          <li>
            Last score: {profile.trolley?.lastScore?.toLocaleString() ?? "—"}
          </li>
          <li>Books caught last run: {profile.trolley?.lastCollected ?? "—"}</li>
          <li>Play streak: {profile.trolley?.currentPlayStreak ?? 0}</li>
          <li>
            Last reader type: {profile.trolley?.lastReaderType ?? "—"}
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-serif text-lg font-semibold text-ink">
          Bookbound
        </h3>
        <ul className="mt-2 space-y-1 text-muted">
          <li>Played: {profile.bookbound?.gamesPlayed ?? 0}</li>
          <li>
            Highest chapter: {profile.bookbound?.highestLevelUnlocked ?? 1} / 3
          </li>
          <li>
            Highest score:{" "}
            {(profile.bookbound?.highestScore ?? 0).toLocaleString()}
          </li>
          <li>
            Pages collected: {profile.bookbound?.totalPagesCollected ?? 0}
          </li>
          <li>
            Golden pages: {profile.bookbound?.totalGoldenPagesCollected ?? 0}
          </li>
          <li>
            Enemies defeated: {profile.bookbound?.totalEnemiesDefeated ?? 0}
          </li>
        </ul>
      </div>
      <p className="text-xs text-muted-soft">
        Leaderboard visibility: {profile.leaderboardVisibility} (default:
        friends only)
      </p>
    </div>
  );
}

function FullAchievements({ profile }: { profile: GameProfile }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {profile.achievements.map((a) => {
        const def = getAchievement(a.achievementId);
        if (!def) return null;
        return (
          <li
            key={a.achievementId}
            className={`flex gap-3 rounded-2xl border px-3 py-3 ${
              a.completed
                ? "games-nest border-[#d8d4e0]"
                : "border-dashed border-[#d8d4e0] opacity-70"
            }`}
          >
            <AchievementBadgeIcon def={def} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-ink">{def.title}</p>
              <p className="text-sm text-muted">{def.description}</p>
              {!a.completed && a.progress != null ? (
                <p className="mt-1 text-xs text-muted-soft">
                  Progress: {Math.round(a.progress * 100)}%
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function FullChallenges({ profile }: { profile: GameProfile }) {
  return (
    <ul className="space-y-3">
      {profile.challenges.map((c) => (
        <li
          key={c.id}
          className="games-nest rounded-2xl border border-[#d8d4e0] px-4 py-3"
        >
          <div className="flex justify-between gap-2">
            <p className="font-semibold text-ink">{c.title}</p>
            <span className="text-xs text-muted">
              {c.completed
                ? "Complete"
                : `${Math.min(c.progress, c.target)}/${c.target}`}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{c.description}</p>
        </li>
      ))}
      <p className="text-xs text-muted-soft">
        Challenges are bonus engagement — they don&apos;t gate your streak.
      </p>
    </ul>
  );
}

function FullLeaderboard({
  game,
  setGame,
  scope,
  setScope,
  period,
  setPeriod,
  profile,
}: {
  game: LeaderboardGame;
  setGame: (g: LeaderboardGame) => void;
  scope: LeaderboardScope;
  setScope: (s: LeaderboardScope) => void;
  period: LeaderboardPeriod;
  setPeriod: (p: LeaderboardPeriod) => void;
  profile: GameProfile;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["friends", "Friends"],
            ["global", "Global"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setScope(id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              scope === id
                ? "bg-forest text-paper"
                : "games-pill-idle"
            }`}
          >
            {label}
          </button>
        ))}
        {(
          [
            ["week", "This Week"],
            ["all", "All Time"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPeriod(id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              period === id
                ? "bg-forest text-paper"
                : "games-pill-idle"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 -mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LEADERBOARD_GAMES.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setGame(id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
              game === id
                ? "bg-forest/25 text-ink"
                : "text-muted hover:bg-[#ebe6f4]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {scope === "global" ? (
        <p className="mt-6 text-sm text-muted">
          Global boards stay quiet until you opt in. Your visibility is set to
          friends-only by default.
        </p>
      ) : (
        <div className="mt-4">
          <LeaderboardPreview game={game} profile={profile} />
          <Link
            href="/search"
            className="mt-4 inline-block text-sm font-semibold text-ink underline-offset-2 hover:underline"
          >
            Find Readers
          </Link>
        </div>
      )}
    </div>
  );
}
