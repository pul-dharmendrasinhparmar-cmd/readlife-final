"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppNav } from "@/components/layout/app-nav";
import { LeafIcon } from "@/components/icons";
import { loadDiscoveryState } from "@/lib/discovery-storage";
import type { DiscoveryState } from "@/components/search/types";
import { buildBadges } from "./badges";
import { buildPeriodSnapshot } from "./calculate";
import { generateReaderDna } from "./reader-dna";
import type {
  InsightPeriod,
  PeriodSnapshot,
  ReaderDna,
  SharePrivacy,
  WrappedSlide,
} from "./types";
import { HabitCoachCard } from "@/components/ai/habit-coach";
import { aiFetch } from "@/lib/ai/client";
import { getBookById } from "@/components/search/data";
import {
  buildMonthlyWrapped,
  buildYearlyWrapped,
  mergeWrappedSlides,
} from "./wrapped";

const WRAPPED_BG = {
  month: "/rooms/dashboard-scene-clean.png",
  year: "/rooms/dark-academia.png",
} as const;

/** Atmospheric backgrounds for pattern cards — keyed by pattern id, else cycled. */
const PATTERN_BG_BY_ID: Record<string, string> = {
  night: "/rooms/dashboard-scene-night.png",
  fantasy: "/rooms/dark-academia.png",
  friends: "/hero-nook.png",
  audio: "/rooms/cozy-nook.png",
  tbr: "/rooms/sunny-loft.png",
  mina: "/rooms/dashboard-scene-day.png",
};

const PATTERN_BG_FALLBACK = [
  "/rooms/dashboard-scene-rainy.png",
  "/rooms/rainy-night.png",
  "/rooms/dashboard-scene-snowy.png",
  "/rooms/dashboard-scene-clean.png",
  "/hero-nook.png",
  "/rooms/cozy-nook.png",
] as const;

function patternBackground(id: string, index: number): string {
  return (
    PATTERN_BG_BY_ID[id] ??
    PATTERN_BG_FALLBACK[index % PATTERN_BG_FALLBACK.length]!
  );
}

type MainTab = "insights" | "dna";

export function InsightsPage() {
  const searchParams = useSearchParams();
  const aiParam = searchParams.get("ai");
  const [state, setState] = useState<DiscoveryState | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>("insights");
  const [period, setPeriod] = useState<InsightPeriod>("month");
  const [monthOffset, setMonthOffset] = useState(0); // 0 = Aug 2026
  const [activityMode, setActivityMode] = useState<"minutes" | "pages">(
    "minutes",
  );
  const [whyId, setWhyId] = useState<string | null>(null);
  const [traitId, setTraitId] = useState<string | null>(null);
  const [wrappedOpen, setWrappedOpen] = useState<"month" | "year" | null>(null);
  const [wrappedStep, setWrappedStep] = useState(0);
  const [aiWrappedSlides, setAiWrappedSlides] = useState<WrappedSlide[] | null>(
    null,
  );
  const [wrappedAiLoading, setWrappedAiLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareFormat, setShareFormat] = useState<
    "story" | "post" | "square"
  >("story");
  const [privacy, setPrivacy] = useState<SharePrivacy>({
    booksRead: true,
    minutes: true,
    readerDna: true,
    favoriteBook: true,
    dnfs: false,
    goals: false,
  });
  const [shareToast, setShareToast] = useState<string | null>(null);

  useEffect(() => {
    setState(loadDiscoveryState());
  }, []);

  useEffect(() => {
    if (aiParam !== "habit") return;
    window.setTimeout(() => {
      document
        .getElementById("ai-habit-coach")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }, [aiParam]);

  const year = 2026;
  const month = 7 - monthOffset; // Aug=7, July=6 when offset 1
  const safeMonth = ((month % 12) + 12) % 12;
  const safeYear = month < 0 ? year - 1 : year;

  const snap = useMemo(() => {
    if (!state) return null;
    return buildPeriodSnapshot(state, period, safeYear, safeMonth);
  }, [state, period, safeYear, safeMonth]);

  const dna = useMemo(() => {
    if (!state || !snap) return null;
    return generateReaderDna(state, snap);
  }, [state, snap]);

  const badges = useMemo(() => {
    if (!state || !snap) return [];
    return buildBadges(state, snap);
  }, [state, snap]);

  const wrappedSlides = useMemo(() => {
    if (!snap || !dna) return [];
    const base =
      wrappedOpen === "year"
        ? buildYearlyWrapped(snap)
        : buildMonthlyWrapped(snap, dna);
    return mergeWrappedSlides(base, aiWrappedSlides ?? []);
  }, [snap, dna, wrappedOpen, aiWrappedSlides]);

  useEffect(() => {
    if (!wrappedOpen || !snap || !dna || !state) return;
    const cacheKey = `readlife-wrapped-ai-${wrappedOpen}-${snap.year}-${snap.month}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as WrappedSlide[];
        if (Array.isArray(parsed) && parsed.length) {
          setAiWrappedSlides(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }

    const allowedTitles = state.entries
      .filter((e) => e.status === "read" || (e.rating ?? 0) >= 4)
      .map((e) => getBookById(e.bookId)?.title)
      .filter(Boolean)
      .slice(0, 20) as string[];

    void (async () => {
      setWrappedAiLoading(true);
      const res = await aiFetch<{ slides: WrappedSlide[] }>("wrapped", {
        kind: wrappedOpen,
        label: snap.label,
        dnaTitle: dna.title,
        allowedTitles,
        stats: {
          booksFinished: snap.booksFinished.value,
          minutesRead: snap.minutesRead.value,
          streakDays: snap.streakDays.value,
          avgRating: snap.avgRating.value,
          sessions: snap.sessions.value,
          topGenres: snap.genreShare.slice(0, 5),
          timeOfDay: snap.timeOfDay,
          sourcePerformance: snap.sourcePerformance.slice(0, 3),
          narrativeFallback: snap.monthlyNarrative,
        },
      });
      setWrappedAiLoading(false);
      if (!res.ok) {
        setAiWrappedSlides(null);
        return;
      }
      const slides = res.data.slides ?? [];
      setAiWrappedSlides(slides);
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(slides));
      } catch {
        // ignore
      }
    })();
  }, [wrappedOpen, snap, dna, state]);

  if (!state || !snap || !dna) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#2a2438] text-muted">
        Opening your insights…
      </div>
    );
  }

  const isNewUser = state.entries.filter((e) => e.status === "read").length < 2;

  return (
    <div className="min-h-screen bg-[#2a2438] text-ink">
      <AppNav />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="relative max-w-3xl">
          <div
            className="pointer-events-none absolute -top-1 left-0 text-gold/70"
            aria-hidden
          >
            <LeafIcon className="h-5 w-5" />
          </div>
          <h1 className="insights-display text-[2.6rem] tracking-[0.04em] text-ink sm:text-[3.1rem]">
            Insights
          </h1>
          <p className="insights-body mt-2 text-[1.05rem] text-muted">
            See the story behind your reading.
          </p>
          <p className="insights-body mt-1 text-sm text-ink/70">
            Your reading habits, patterns, milestones, and evolving Reader DNA.
          </p>
        </header>

        {/* Main tabs */}
        <div
          className="mt-8 flex gap-1"
          role="tablist"
          aria-label="Insights sections"
        >
          {(
            [
              ["insights", "Reading Insights"],
              ["dna", "Reader DNA"],
            ] as const
          ).map(([id, label]) => {
            const active = mainTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMainTab(id)}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "text-ink"
                    : "text-ink/60 hover:bg-[#3f3654] hover:text-ink"
                }`}
              >
                {label}
                {active ? (
                  <span className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-forest" />
                ) : null}
              </button>
            );
          })}
        </div>

        {isNewUser ? (
          <NewUserState />
        ) : mainTab === "insights" ? (
          <ReadingInsights
            snap={snap}
            dna={dna}
            period={period}
            setPeriod={setPeriod}
            monthOffset={monthOffset}
            setMonthOffset={setMonthOffset}
            activityMode={activityMode}
            setActivityMode={setActivityMode}
            whyId={whyId}
            setWhyId={setWhyId}
            badges={badges}
            onOpenWrapped={(kind) => {
              setWrappedStep(0);
              setAiWrappedSlides(null);
              setWrappedOpen(kind);
            }}
          />
        ) : (
          <ReaderDnaPanel
            dna={dna}
            snap={snap}
            traitId={traitId}
            setTraitId={setTraitId}
            onShare={() => setShareOpen(true)}
          />
        )}
      </main>

      {wrappedOpen ? (
        <WrappedModal
          kind={wrappedOpen}
          slides={wrappedSlides}
          step={wrappedStep}
          setStep={setWrappedStep}
          aiLoading={wrappedAiLoading}
          onClose={() => setWrappedOpen(null)}
          onShare={() => {
            setWrappedOpen(null);
            setShareOpen(true);
          }}
        />
      ) : null}

      {shareOpen && dna ? (
        <ShareModal
          dna={dna}
          snap={snap}
          format={shareFormat}
          setFormat={setShareFormat}
          privacy={privacy}
          setPrivacy={setPrivacy}
          onClose={() => setShareOpen(false)}
          onAction={(msg) => {
            setShareToast(msg);
            window.setTimeout(() => setShareToast(null), 3200);
          }}
        />
      ) : null}

      {shareToast ? (
        <div className="fixed right-4 bottom-4 z-[80] rounded-2xl border border-[#4a425c] bg-[#3a324f] px-4 py-3 text-sm text-ink shadow-lg">
          {shareToast}
        </div>
      ) : null}
    </div>
  );
}

function ReadingInsights({
  snap,
  dna,
  period,
  setPeriod,
  monthOffset,
  setMonthOffset,
  activityMode,
  setActivityMode,
  whyId,
  setWhyId,
  badges,
  onOpenWrapped,
}: {
  snap: PeriodSnapshot;
  dna: ReaderDna;
  period: InsightPeriod;
  setPeriod: (p: InsightPeriod) => void;
  monthOffset: number;
  setMonthOffset: (n: number | ((p: number) => number)) => void;
  activityMode: "minutes" | "pages";
  setActivityMode: (m: "minutes" | "pages") => void;
  whyId: string | null;
  setWhyId: (id: string | null) => void;
  badges: ReturnType<typeof buildBadges>;
  onOpenWrapped: (k: "month" | "year") => void;
}) {
  const maxDayMinutes = Math.max(
    1,
    ...snap.activityByDay.map((d) => d.minutes),
  );
  const calendarGoldByLevel = [
    "#3f3654", // empty
    "#6b5210", // ~0–25% of max day
    "#8a6a12", // ~25–50%
    "#d4a017", // ~50–75%
    "#ffd54f", // ~75–100%
  ] as const;

  return (
    <div className="mt-8 space-y-12">
      {/* Period control */}
      <div className="flex flex-wrap items-center gap-3">
        {(
          [
            ["week", "This Week"],
            ["month", "This Month"],
            ["year", "This Year"],
            ["all", "All Time"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPeriod(id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              period === id
                ? "bg-forest text-paper"
                : "bg-[#3a324f] text-ink/70 hover:bg-[#3f3654]"
            }`}
          >
            {label}
          </button>
        ))}
        {period === "month" ? (
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              disabled={monthOffset >= 2}
              onClick={() => setMonthOffset((n) => Math.min(2, n + 1))}
              className="rounded-full border border-[#564d6a] px-3 py-1.5 text-sm font-semibold text-ink disabled:opacity-40"
            >
              ←
            </button>
            <span className="insights-display min-w-[9rem] text-center text-sm tracking-[0.06em] text-ink">
              {snap.label}
            </span>
            <button
              type="button"
              aria-label="Next month"
              disabled={monthOffset <= 0}
              onClick={() => setMonthOffset((n) => Math.max(0, n - 1))}
              className="rounded-full border border-[#564d6a] px-3 py-1.5 text-sm font-semibold text-ink disabled:opacity-40"
            >
              →
            </button>
          </div>
        ) : (
          <span className="insights-display ml-auto text-sm tracking-[0.06em] text-ink">
            {snap.label}
          </span>
        )}
      </div>

      <OverviewCarousel snap={snap} dna={dna} />

      {/* Goals */}
      <section className="grid gap-4 md:grid-cols-3">
        <GoalCard
          title="Monthly goal"
          current={snap.goalBooks.current}
          target={snap.goalBooks.target}
          unit="books"
          note={
            snap.goalBooks.current >= snap.goalBooks.target
              ? "You made it."
              : `${snap.goalBooks.target - snap.goalBooks.current} books to go.`
          }
        />
        <GoalCard
          title="Reading time"
          current={snap.goalMinutes.current}
          target={snap.goalMinutes.target}
          unit="min"
          note="You're nearly there."
        />
        <GoalCard
          title="Reading days"
          current={snap.goalDays.current}
          target={snap.goalDays.target}
          unit="days"
          note={
            snap.goalDays.current >= snap.goalDays.target
              ? "Habit goal complete."
              : `${snap.goalDays.target - snap.goalDays.current} more reading days would complete this month's habit goal.`
          }
        />
      </section>

      {/* Wrapped — above metrics + calendar */}
      <section>
        <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
          Your Wrapped
        </h2>
        <p className="insights-body mt-1 text-sm text-muted">
          Story-shaped months and years — private until you share.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <WrappedEntryCard
            kind="month"
            eyebrow="Monthly"
            title="August Wrapped"
            onClick={() => onOpenWrapped("month")}
          />
          <WrappedEntryCard
            kind="year"
            eyebrow="Yearly"
            title="2026 Wrapped"
            onClick={() => onOpenWrapped("year")}
          />
        </div>
      </section>

      <div id="ai-habit-coach">
        <HabitCoachCard snap={snap} />
      </div>

      {/* Metrics bar carousel + reading calendar */}
      <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
        <MetricsBarCarousel
          snap={snap}
          activityMode={activityMode}
          setActivityMode={setActivityMode}
        />

        <section className="flex h-full flex-col">
          <h2 className="font-serif text-xl font-semibold text-ink">
            Reading calendar
          </h2>
          <p className="mt-1 text-sm text-muted">Depth by minutes read.</p>
          <div className="mt-3 grid flex-1 grid-cols-7 content-start gap-1.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span
                key={`${d}-${i}`}
                className="text-center text-[0.65rem] font-semibold text-muted"
              >
                {d}
              </span>
            ))}
            {snap.activityByDay.map((d) => {
              const intensity =
                d.minutes <= 0
                  ? 0
                  : Math.min(
                      4,
                      Math.max(1, Math.ceil((d.minutes / maxDayMinutes) * 4)),
                    );
              return (
                <div
                  key={d.date}
                  title={`${fmtDay(d.date)} · ${d.minutes} min · ${d.pages} pages · ${d.sessions} session(s)`}
                  className="aspect-square rounded-md"
                  style={{ background: calendarGoldByLevel[intensity] }}
                />
              );
            })}
          </div>
          <p className="mt-2 text-[0.65rem] text-muted">
            Dimmer = shorter · bright gold = longer.
          </p>
        </section>
      </div>

      {/* Genres: same lg:grid-cols-2 / gap-8 band as Metrics + calendar above */}
      <section className="w-full min-w-0">
        <h2 className="font-serif text-lg font-semibold text-ink">
          Your genres
        </h2>
        <div className="mt-3 flex w-full min-w-0 flex-col items-stretch gap-5 sm:flex-row sm:items-start sm:gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="min-w-0 w-full">
              <GenreTreemap genres={snap.genreShare.slice(0, 6)} />
            </div>
            <ul className="mt-3 space-y-1 text-sm text-ink/85">
              <li>
                <span className="text-muted">Most read:</span>{" "}
                {snap.genreShare[0]?.genre ?? "—"}
              </li>
              <li>
                <span className="text-muted">Highest rated:</span>{" "}
                {snap.highestRatedGenre
                  ? `${snap.highestRatedGenre.genre} — ${snap.highestRatedGenre.avgRating}★`
                  : "—"}
              </li>
              <li>
                <span className="text-muted">Fastest finished:</span>{" "}
                {snap.fastestGenre
                  ? `${snap.fastestGenre.genre} (~${snap.fastestGenre.avgDays}d)`
                  : "Not enough data yet."}
              </li>
            </ul>
          </div>
          <div className="insights-mini-stats mx-auto grid w-auto max-w-full shrink-0 grid-cols-2 content-center gap-3 sm:mx-0 sm:gap-4 lg:content-center lg:justify-self-start">
            <MiniStat
              label="Avg session"
              value={`${snap.sessionStats.avgMinutes} min`}
              tone="#ffd54f"
            />
            <MiniStat
              label="Longest session"
              value={fmtDuration(snap.sessionStats.longestMinutes)}
              tone="#f5c842"
            />
            <MiniStat
              label="Typical range"
              value={`${snap.sessionStats.typicalMin}–${snap.sessionStats.typicalMax} min`}
              tone="#e8b923"
            />
            <MiniStat
              label="Pace"
              value={`${snap.sessionStats.pagesPerHour} pages/hr`}
              tone="#ffcc33"
            />
          </div>
        </div>
      </section>

      {/* Sources + influencers + TBR */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section className="rounded-[1.35rem] border border-[#4a425c]/80 bg-[#3a324f]/55 p-5">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Where your best reads come from
          </h2>
          {snap.sourcePerformance.length ? (
            <div className="mt-4 space-y-2">
              {snap.sourcePerformance.slice(0, 5).map((s) => (
                <div
                  key={s.source}
                  className="flex items-center gap-3 rounded-2xl border border-[#4a425c]/70 bg-[#342c45]/90 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{s.source}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {s.books} completed · {s.completionRate}% completion
                    </p>
                  </div>
                  <p className="shrink-0 font-serif text-lg font-semibold tabular-nums text-ink">
                    {s.avgRating}★
                  </p>
                </div>
              ))}
              <p className="pt-1 text-sm leading-snug text-ink/80">
                {snap.sourcePerformance[0]
                  ? `${snap.sourcePerformance[0].source} is currently your strongest recommendation source.`
                  : null}
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <Partial
                text="Finish a few books from different recommendation sources to unlock this insight."
                href="/search"
                cta="Explore Books"
              />
            </div>
          )}

          {snap.influencers.length ? (
            <div className="mt-6 border-t border-[#4a425c]/60 pt-5">
              <h3 className="font-serif text-base font-semibold text-ink">
                Your reading influences
              </h3>
              <ul className="mt-3 divide-y divide-[#4a425c]/50">
                {snap.influencers.slice(0, 3).map((i) => (
                  <li
                    key={i.username}
                    className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                  >
                    <Link
                      href={`/readers/${i.username}`}
                      className="truncate text-sm font-semibold text-ink hover:underline"
                    >
                      @{i.username}
                    </Link>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums text-muted sm:justify-end sm:text-sm">
                      <span>{i.completed} done</span>
                      <span className="text-ink/25" aria-hidden>
                        ·
                      </span>
                      <span>{i.avgRating}★</span>
                      <span className="text-ink/25" aria-hidden>
                        ·
                      </span>
                      <span>{i.onTbr} on TBR</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="rounded-[1.35rem] border border-[#4a425c]/80 bg-[#3a324f]/55 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-lg font-semibold text-ink">
              Your TBR
            </h2>
            <p className="text-sm text-muted">
              {snap.tbr.total} books waiting
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {Object.entries(snap.tbr.byPriority).map(([k, n]) => (
              <div
                key={k}
                className="rounded-2xl border border-[#4a425c]/70 bg-[#342c45]/90 px-3.5 py-3"
              >
                <p className="text-[0.65rem] font-semibold tracking-[0.08em] text-muted uppercase">
                  {k.replace("-", " ")}
                </p>
                <p className="mt-1 font-serif text-2xl font-semibold tabular-nums text-ink">
                  {n}
                </p>
              </div>
            ))}
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-snug text-ink/85">
            <li>
              Oldest TBR book has been waiting {snap.tbr.oldestDays} days.
            </li>
            <li>
              Fantasy makes up {snap.tbr.fantasyShare}% of your current TBR.
            </li>
            <li>
              {snap.tbr.somedayOverYear} books have been in Someday for over a
              year.
            </li>
          </ul>
          <Link
            href="/library"
            className="mt-4 inline-flex text-sm font-semibold text-ink underline-offset-2 hover:underline"
          >
            Review Your TBR →
          </Link>
        </section>
      </div>

      <section className="rounded-[1.35rem] border border-[#4a425c]/80 bg-[#3a324f]/55 p-5">
        <h2 className="font-serif text-lg font-semibold text-ink">
          What length works for you?
        </h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {snap.lengthBands.map((b) => (
            <div
              key={b.band}
              className="flex flex-col rounded-2xl border border-[#4a425c]/70 bg-[#342c45]/90 px-4 py-4"
            >
              <p className="text-xs font-medium text-muted">{b.band} pages</p>
              <p className="mt-2 font-serif text-2xl font-semibold tabular-nums text-ink">
                {b.count ? `${b.avgRating}★` : "—"}
              </p>
              <p className="mt-1 text-xs text-muted">{b.count} books</p>
            </div>
          ))}
        </div>
      </section>

      {/* Patterns */}
      <section>
        <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
          Patterns ReadLife noticed
        </h2>
        <p className="insights-body mt-1 text-sm text-muted">
          Small things hiding in your reading history.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {snap.patterns.map((p, index) => (
            <PatternCard
              key={p.id}
              pattern={p}
              index={index}
              expanded={whyId === p.id}
              onToggleWhy={() => setWhyId(whyId === p.id ? null : p.id)}
            />
          ))}
        </div>
      </section>

      {/* Compare + narrative */}
      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f]/80 p-5">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Compare to last month
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            <li>
              Books: {snap.comparePrevious.books[0]} →{" "}
              {snap.comparePrevious.books[1]}
            </li>
            <li>
              Minutes: {snap.comparePrevious.minutes[0]} →{" "}
              {snap.comparePrevious.minutes[1]}
            </li>
            <li>
              Genres: {snap.comparePrevious.genres[0]} →{" "}
              {snap.comparePrevious.genres[1]}
            </li>
          </ul>
          <p className="mt-3 text-sm text-muted">
            You read more books and spent more time per stretch — not a race,
            just a fuller month.
          </p>
        </div>
        <div className="rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f]/80 p-5">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Your month in a nutshell
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/90">
            {snap.monthlyNarrative}
          </p>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
          Badges & milestones
        </h2>
        <p className="insights-body mt-1 text-sm text-muted">
          Earned from behavior — not grind.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {badges.map((b) => (
            <article
              key={b.id}
              className={`flex aspect-square flex-col items-center rounded-2xl border p-2.5 text-center transition hover:-translate-y-0.5 sm:p-3 ${
                b.earned ? "bg-[#3a324f]" : "bg-[#2a2438]/50 opacity-75"
              }`}
              style={
                b.earned
                  ? {
                      borderColor: `${b.accent}88`,
                      boxShadow: `0 0 0 1px ${b.accent}22, 0 10px 28px ${b.accent}12`,
                      background: `linear-gradient(165deg, ${b.accent}14, #3a324f 48%)`,
                    }
                  : {
                      borderColor: `${b.accent}40`,
                    }
              }
            >
              <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                <img
                  src={b.image}
                  alt={b.name}
                  width={342}
                  height={342}
                  className={`h-full max-h-[7.75rem] w-auto max-w-full object-contain ${
                    b.earned ? "" : "grayscale-[35%] brightness-90"
                  }`}
                  draggable={false}
                />
              </div>
              <div className="mt-1.5 w-full shrink-0">
                <h3
                  className="insights-display text-[0.78rem] leading-tight tracking-[0.04em] text-ink sm:text-[0.88rem]"
                  style={b.earned ? { color: b.accent } : undefined}
                >
                  {b.name}
                </h3>
                {b.earned && b.earnedDate ? (
                  <p
                    className="mt-0.5 text-[0.6rem] font-semibold"
                    style={{ color: b.accent }}
                  >
                    Earned {b.earnedDate}
                  </p>
                ) : b.progress ? (
                  <p className="mt-0.5 text-[0.6rem] text-muted">
                    {b.progress.current}/{b.progress.target}
                  </p>
                ) : (
                  <p className="mt-0.5 text-[0.6rem] text-muted">In progress</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}

function ReaderDnaPanel({
  dna,
  snap,
  traitId,
  setTraitId,
  onShare,
}: {
  dna: ReaderDna;
  snap: PeriodSnapshot;
  traitId: string | null;
  setTraitId: (id: string | null) => void;
  onShare: () => void;
}) {
  const [aiTitle, setAiTitle] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiWhy, setAiWhy] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiFetched, setAiFetched] = useState(false);
  const autoTried = useRef(false);

  const loadAiStory = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/insights-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleHint: dna.title,
          summaryFallback: dna.summary,
          personality: dna.quizPersonality,
          stats: {
            booksFinished: snap.booksFinished.value,
            streakDays: snap.streakDays.value,
            avgRating: snap.avgRating.value,
            minutesRead: snap.minutesRead.value,
            sessions: snap.sessions.value,
            topGenres: snap.genreShare.slice(0, 5).map((g) => ({
              genre: g.genre,
              share: g.share,
            })),
            timeOfDay: snap.timeOfDay,
            traits: dna.traits.map((t) => ({
              label: t.label,
              value: t.value,
            })),
            confidencePct: dna.confidencePct,
          },
        }),
      });
      const data = (await res.json()) as {
        title?: string;
        summary?: string;
        why?: string;
        error?: string;
      };
      if (!res.ok || !data.summary) {
        setAiError(data.error ?? "AI story unavailable — showing your template DNA.");
        setAiFetched(true);
        return;
      }
      setAiTitle(data.title ?? null);
      setAiSummary(data.summary);
      setAiWhy(data.why ?? null);
      setAiFetched(true);
    } catch {
      setAiError("Network error — showing your template DNA.");
      setAiFetched(true);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (autoTried.current) return;
    autoTried.current = true;
    void loadAiStory();
    // Auto-load once when the DNA panel mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayTitle = aiTitle ?? dna.title;
  const displaySummary = aiSummary ?? dna.summary;

  return (
    <div className="mt-8 space-y-10">
      <section className="max-w-3xl">
        <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
          Your Reader DNA
        </p>
        <h2 className="mt-2 font-serif text-[2rem] font-semibold text-ink">
          {aiLoading && !aiSummary ? (
            <span className="inline-block min-h-[2.4rem] w-[min(18rem,90%)] animate-pulse rounded-lg bg-[#3a324f]/90" />
          ) : (
            displayTitle
          )}
        </h2>
        <p className="mt-3 text-[1.05rem] leading-relaxed text-ink/90">
          {aiLoading && !aiSummary
            ? "Writing your AI reader narrative…"
            : displaySummary}
        </p>
        {aiWhy && aiSummary ? (
          <p className="mt-2 text-xs text-muted">
            Why this summary: {aiWhy}
          </p>
        ) : null}
        {aiError ? (
          <p className="mt-2 text-xs text-muted">{aiError}</p>
        ) : null}
        <p className="mt-3 text-sm text-muted">
          Last updated: {dna.generatedAt} · {dna.dataPoints}
          {aiFetched && aiSummary ? " · AI narrative" : ""}
        </p>
        <p className="mt-1 text-xs font-semibold text-ink/70">
          {dna.confidence === "high"
            ? "High-confidence Reader DNA"
            : dna.confidence === "medium"
              ? "Medium-confidence Reader DNA"
              : "Your Reader DNA is still forming"}{" "}
          · {dna.confidencePct}% developed
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadAiStory()}
            disabled={aiLoading}
            className="rounded-full border border-forest/40 bg-[#2a2438] px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-forest/60 hover:bg-[#342c45] disabled:cursor-wait disabled:opacity-70"
          >
            {aiLoading
              ? "Refreshing…"
              : aiSummary
                ? "Refresh AI story"
                : "Generate AI story"}
          </button>
          <button
            type="button"
            onClick={onShare}
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            Share
          </button>
        </div>
      </section>

      {/* Trait map */}
      <section>
        <h3 className="font-serif text-xl font-semibold text-ink">
          Current reading tendencies
        </h3>
        <p className="mt-1 text-sm text-muted">
          Reader DNA signals — preference indicators, not clinical scores.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {dna.traits.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTraitId(traitId === t.id ? null : t.id)}
              className="rounded-[1.25rem] border border-[#4a425c] bg-[#3a324f] p-4 text-left transition hover:border-forest/30"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-serif font-semibold text-ink">
                  {t.label}
                </span>
                <span className="text-sm font-bold text-ink">{t.value}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#564d6a]">
                <div
                  className="h-full rounded-full bg-forest"
                  style={{ width: `${t.value}%` }}
                />
              </div>
              <p className="mt-2 text-[0.7rem] text-muted">
                Was {t.previous}% · {t.value - t.previous >= 0 ? "+" : ""}
                {t.value - t.previous}%
              </p>
              {traitId === t.id ? (
                <p className="mt-3 rounded-xl bg-[#2a2438] px-3 py-2 text-xs leading-relaxed text-ink/85">
                  {t.why}
                </p>
              ) : (
                <p className="mt-2 text-[0.7rem] font-semibold text-ink/60">
                  Why?
                </p>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f] p-5">
          <h3 className="font-serif text-lg font-semibold text-ink">
            How your DNA changed
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            {dna.traits
              .filter((t) => t.value !== t.previous)
              .slice(0, 4)
              .map((t) => (
                <li key={t.id}>
                  {t.label}: {t.previous}% → {t.value}%{" "}
                  <span className="text-muted">
                    ({t.value - t.previous >= 0 ? "+" : ""}
                    {t.value - t.previous}%)
                  </span>
                </li>
              ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            You explored more genres than usual this month, especially literary
            fiction beside your fantasy home base.
          </p>
        </div>
        <div className="rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f] p-5">
          <h3 className="font-serif text-lg font-semibold text-ink">
            DNA history
          </h3>
          <ol className="mt-3 space-y-2 text-sm">
            <li className="text-muted">July 2026 — {dna.previousTitle}</li>
            <li className="font-semibold text-ink">
              August 2026 — {dna.title}
            </li>
          </ol>
          <div className="mt-5 border-t border-[#564d6a] pt-4">
            <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
              Quiz personality vs DNA
            </p>
            <p className="mt-2 text-sm text-ink">
              Quiz: 🌙 {dna.quizPersonality}
            </p>
            <p className="text-sm text-ink">
              Behavioral DNA: 🧬 {dna.title}
            </p>
            <p className="mt-2 text-sm text-muted">{dna.quizComparison}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function PatternCard({
  pattern,
  index,
  expanded,
  onToggleWhy,
}: {
  pattern: PeriodSnapshot["patterns"][number];
  index: number;
  expanded: boolean;
  onToggleWhy: () => void;
}) {
  const bg = patternBackground(pattern.id, index);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={onToggleWhy}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleWhy();
        }
      }}
      className="insights-pattern-card group relative cursor-pointer overflow-hidden rounded-[1.35rem] border border-white/15 text-left shadow-lg outline-none transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-white/30 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-white/50"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${bg})` }}
        aria-hidden
      />
      <div
        className={`absolute inset-0 transition duration-300 ${
          expanded
            ? "bg-black/45"
            : "bg-black/62 group-hover:bg-black/48"
        }`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[11.5rem] flex-col p-4 sm:p-5">
        <p className="text-xl drop-shadow-sm" aria-hidden>
          {pattern.icon}
        </p>
        <p className="insights-body mt-2 text-sm leading-relaxed text-white/95 sm:text-[0.95rem]">
          {pattern.text}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWhy();
            }}
            className="insights-body text-xs font-semibold tracking-wide text-white/85 underline-offset-2 transition hover:text-white hover:underline"
          >
            {expanded ? "Hide why" : "Why am I seeing this?"}
          </button>
          {pattern.action ? (
            <Link
              href={pattern.action.href}
              onClick={(e) => e.stopPropagation()}
              className="insights-body text-xs font-semibold tracking-wide text-white underline-offset-2 transition hover:text-white hover:underline"
            >
              {pattern.action.label} →
            </Link>
          ) : null}
        </div>

        <div
          className={`insights-pattern-why grid transition-[grid-template-rows] duration-300 ease-out ${
            expanded ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <p className="insights-body rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-xs leading-relaxed text-white/85 backdrop-blur-sm">
              {pattern.why}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function WrappedEntryCard({
  kind,
  eyebrow,
  title,
  onClick,
}: {
  kind: "month" | "year";
  eyebrow: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-[1.35rem] border border-white/15 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${WRAPPED_BG[kind]})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/55" aria-hidden />
      <div className="relative z-10 flex min-h-[11rem] flex-col justify-end p-5">
        <p className="insights-body text-[0.68rem] font-semibold tracking-[0.16em] text-white/70 uppercase">
          {eyebrow}
        </p>
        <p className="insights-display mt-2 text-[1.85rem] leading-none tracking-[0.06em] text-white">
          {title}
        </p>
        <p className="insights-body mt-2 text-sm text-white/80">
          View Wrapped →
        </p>
      </div>
    </button>
  );
}

function WrappedModal({
  kind,
  slides,
  step,
  setStep,
  onClose,
  onShare,
  aiLoading,
}: {
  kind: "month" | "year";
  slides: WrappedSlide[];
  step: number;
  setStep: (n: number | ((p: number) => number)) => void;
  onClose: () => void;
  onShare: () => void;
  aiLoading?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setStep((s) => Math.min(slides.length - 1, s + 1));
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStep((s) => Math.max(0, s - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, setStep, slides.length]);

  const slide = slides[step];
  if (!slide) return null;

  const bg = WRAPPED_BG[kind];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#2a2438]/55"
        aria-label="Close wrapped"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex h-[min(80vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-white/20 shadow-2xl"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/60" aria-hidden />

        <div className="relative z-10 flex gap-1 px-4 pt-4">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full ${
                i <= step ? "bg-white" : "bg-white/25"
              }`}
            />
          ))}
        </div>
        {aiLoading ? (
          <p className="relative z-10 px-4 pt-2 text-center text-xs text-white/70">
            Writing your Wrapped with AI…
          </p>
        ) : (
          <p className="relative z-10 px-4 pt-2 text-center text-[0.65rem] text-white/50">
            Generated · may be wrong
          </p>
        )}
        <div
          key={slide.id}
          className="insights-carousel-slide relative z-10 flex flex-1 flex-col justify-center px-8 py-10 text-center"
        >
          {slide.eyebrow ? (
            <p className="insights-body text-[0.72rem] font-semibold tracking-[0.18em] text-white/70 uppercase">
              {slide.eyebrow}
            </p>
          ) : null}
          <h2 className="insights-display mt-3 text-[2.35rem] leading-[1.05] tracking-[0.05em] text-white">
            {slide.title}
          </h2>
          {slide.emphasis ? (
            <p className="insights-display mt-5 text-[2.8rem] leading-none tracking-[0.04em] text-[#f6e8ff]">
              {slide.emphasis}
            </p>
          ) : null}
          {slide.body ? (
            <p className="insights-body mx-auto mt-5 max-w-sm text-base leading-relaxed text-white/85">
              {slide.body}
            </p>
          ) : null}
        </div>
        <div className="relative z-10 flex items-center justify-between gap-2 border-t border-white/15 bg-black/35 px-4 py-3 backdrop-blur-sm">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-sm font-semibold text-white/75"
          >
            Close
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              className="rounded-full border border-white/30 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Back
            </button>
            {step < slides.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1a1524]"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={onShare}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1a1524]"
              >
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareModal({
  dna,
  snap,
  format,
  setFormat,
  privacy,
  setPrivacy,
  onClose,
  onAction,
}: {
  dna: ReaderDna;
  snap: PeriodSnapshot;
  format: "story" | "post" | "square";
  setFormat: (f: "story" | "post" | "square") => void;
  privacy: SharePrivacy;
  setPrivacy: (p: SharePrivacy) => void;
  onClose: () => void;
  onAction: (msg: string) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const aspect =
    format === "story" ? "aspect-[9/16]" : format === "post" ? "aspect-[4/5]" : "aspect-square";

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#2a2438]/40"
        aria-label="Close share"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border border-[#4a425c] bg-[#3a324f] p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-ink">Share</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink hover:bg-[#3f3654]"
          >
            Close
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">
          Insights stay private until you choose to share.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["story", "Story 9:16"],
              ["post", "Post 4:5"],
              ["square", "Square 1:1"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFormat(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                format === id
                  ? "bg-forest text-paper"
                  : "border border-[#564d6a] text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className={`mx-auto mt-5 w-full max-w-[220px] overflow-hidden rounded-2xl border border-[#b08fce]/40 bg-[#342c45] p-4 shadow-inner ${aspect}`}
        >
          <p className="text-[0.6rem] font-semibold tracking-[0.14em] text-ink/70 uppercase">
            My August Reader DNA
          </p>
          {privacy.readerDna ? (
            <>
              <p className="mt-3 font-serif text-lg font-semibold text-ink">
                {dna.title}
              </p>
              <ul className="mt-3 space-y-1 text-[0.7rem] text-ink/85">
                {dna.traits.slice(0, 3).map((t) => (
                  <li key={t.id}>
                    {t.value}% {t.label}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {privacy.booksRead ? (
            <p className="mt-3 text-[0.7rem] text-ink">
              {snap.booksFinished.value} books finished
            </p>
          ) : null}
          {privacy.minutes ? (
            <p className="text-[0.7rem] text-ink">
              {snap.minutesRead.value.toLocaleString()} minutes
            </p>
          ) : null}
          {privacy.favoriteBook ? (
            <p className="mt-2 text-[0.7rem] italic text-ink/80">
              Favorite energy: Hamnet
            </p>
          ) : null}
          <p className="mt-auto pt-4 font-serif text-sm font-semibold text-ink">
            ReadLife
          </p>
        </div>

        <div className="mt-5">
          <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
            Include
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {(
              [
                ["booksRead", "Books read"],
                ["minutes", "Reading minutes"],
                ["readerDna", "Reader DNA"],
                ["favoriteBook", "Favorite book"],
                ["dnfs", "DNFs"],
                ["goals", "Goal progress"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-ink">
                <input
                  type="checkbox"
                  checked={privacy[key]}
                  onChange={(e) =>
                    setPrivacy({ ...privacy, [key]: e.target.checked })
                  }
                  className="accent-forest"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {[
            "Instagram Story",
            "Instagram Post",
            "TikTok / Reel",
            "YouTube Short",
            "Download Image",
            "Copy Link",
          ].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() =>
                onAction(
                  label.includes("Copy")
                    ? "Link copied (prototype)."
                    : label.includes("Download")
                      ? "Image download simulated."
                      : `${label} share simulated.`,
                )
              }
              className="rounded-full border border-forest/30 py-2.5 text-xs font-semibold text-ink hover:bg-[#3f3654]"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewUserState() {
  return (
    <div className="mt-12 max-w-lg">
      <p className="font-serif text-2xl font-semibold text-ink">
        Your reading story is just beginning.
      </p>
      <p className="mt-2 text-muted">
        Log books and reading sessions to start uncovering your patterns.
      </p>
      <p className="mt-4 text-sm font-semibold text-ink/80">
        Reader DNA is forming · 2 / 5 books logged
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/home"
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper"
        >
          Start Reading
        </Link>
        <Link
          href="/library"
          className="rounded-full border border-forest/35 px-5 py-2.5 text-sm font-semibold text-ink"
        >
          Add Past Reads
        </Link>
        <Link
          href="/search"
          className="rounded-full border border-forest/35 px-5 py-2.5 text-sm font-semibold text-ink"
        >
          Explore Books
        </Link>
      </div>
    </div>
  );
}

type OverviewSlide = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  stats: { value: string; label: string }[];
  tint: string;
};

type MetricsSlideId =
  | "activity"
  | "when"
  | "format"
  | "ratings"
  | "outcomes"
  | "dnf";

type MetricsSlide = {
  id: MetricsSlideId;
  title: string;
  subtitle?: string;
  note?: string;
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function MetricsBarCarousel({
  snap,
  activityMode,
  setActivityMode,
}: {
  snap: PeriodSnapshot;
  activityMode: "minutes" | "pages";
  setActivityMode: (m: "minutes" | "pages") => void;
}) {
  const slides = useMemo<MetricsSlide[]>(() => {
    const list: MetricsSlide[] = [
      {
        id: "activity",
        title: "Reading activity",
        subtitle: "When the pages actually moved.",
        note: `Hover a bar for day details. Unit: ${activityMode}.`,
      },
      {
        id: "when",
        title: "When do you read?",
        note: `${snap.timeOfDay.evening + snap.timeOfDay.lateNight}% of your reading happens after 5 PM.`,
      },
      {
        id: "format",
        title: "How you read",
        subtitle: "By books finished",
        note: formatTimeInsight(snap),
      },
      {
        id: "ratings",
        title: "What worked for you",
        subtitle: `Average rating ${snap.avgRating.value}★`,
        note: `You gave 5 stars to ${snap.ratingDist[5]} of your finishes in this view.`,
      },
      {
        id: "outcomes",
        title: "Your reading outcomes",
        note: `Paused is waiting — not abandoned. You usually return within about ${snap.pauseStats.avgResumeDays} days.`,
      },
    ];
    if (snap.dnfReasons.length) {
      list.push({
        id: "dnf",
        title: "Why you DNF",
        note: `${snap.dnfReasons[0]?.reason} was your most common DNF reason.`,
      });
    }
    return list;
  }, [snap, activityMode]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchX = useRef<number | null>(null);
  const autoplayMs = 5500;
  const indexRef = useRef(index);
  indexRef.current = index;

  const maxActivity = Math.max(
    1,
    ...snap.activityByDay.map((d) =>
      activityMode === "minutes" ? d.minutes : d.pages,
    ),
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [paused, reducedMotion, slides.length, index, autoplayMs]);

  const go = (next: number) => {
    const len = slides.length;
    setIndex(((next % len) + len) % len);
  };

  // Arrow keys while Reading Insights is active (skip inputs/modals; yield if already handled)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (isTypingTarget(e.target)) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      e.preventDefault();
      const i = indexRef.current;
      go(e.key === "ArrowRight" ? i + 1 : i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const slide = slides[Math.min(index, slides.length - 1)];
  const progressKey = `${slide.id}-${index}`;

  return (
    <section
      className="insights-metrics-carousel relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[1.35rem] border border-[#4a425c]/90 bg-[#3a324f]/85"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onTouchStart={(e) => {
        touchX.current = e.changedTouches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        setPaused(false);
        if (start == null || end == null) return;
        const delta = end - start;
        if (Math.abs(delta) < 40) return;
        go(delta < 0 ? index + 1 : index - 1);
      }}
      aria-roledescription="carousel"
      aria-label="Reading metrics"
    >
      <div className="relative flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <p className="insights-body text-[0.68rem] font-semibold tracking-[0.16em] text-ink/65 uppercase">
            Metrics
          </p>
          <h2 className="insights-display mt-1 text-[1.55rem] leading-none tracking-[0.05em] text-ink sm:text-[1.75rem]">
            {slide.title}
          </h2>
          {slide.subtitle ? (
            <p className="insights-body mt-1 text-xs text-muted">
              {slide.subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {slide.id === "activity" ? (
            <div className="mr-1 flex rounded-full border border-[#564d6a] bg-[#2a2438]/55 p-0.5">
              {(["minutes", "pages"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setActivityMode(m)}
                  className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold capitalize ${
                    activityMode === m
                      ? "bg-forest text-paper"
                      : "text-ink/70"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            aria-label="Previous metrics slide"
            onClick={() => go(index - 1)}
            className="rounded-full border border-[#564d6a] bg-[#2a2438]/55 px-2.5 py-1 text-sm font-semibold text-ink hover:bg-[#3f3654]"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next metrics slide"
            onClick={() => go(index + 1)}
            className="rounded-full border border-[#564d6a] bg-[#2a2438]/55 px-2.5 py-1 text-sm font-semibold text-ink hover:bg-[#3f3654]"
          >
            →
          </button>
        </div>
      </div>

      <div
        key={slide.id}
        className="insights-carousel-slide relative flex flex-1 flex-col px-4 pt-3 sm:px-5"
      >
        {slide.id === "activity" ? (
          <div className="insights-activity-chart flex flex-1 items-end gap-1 rounded-xl border border-[#4a425c]/60 bg-[#2a2438]/40 p-3">
            {snap.activityByDay.map((d) => {
              const val = activityMode === "minutes" ? d.minutes : d.pages;
              const h =
                val <= 0
                  ? 0
                  : Math.max(8, Math.round((val / maxActivity) * 100));
              return (
                <div
                  key={d.date}
                  className="insights-activity-col group relative flex flex-1 flex-col items-center justify-end"
                >
                  <div
                    className="w-full max-w-[14px] rounded-t-md bg-forest/80 transition group-hover:bg-forest"
                    style={{ height: h > 0 ? `${h}%` : "0px" }}
                    title={`${d.date}: ${d.minutes} min · ${d.pages} pages · ${d.sessions} sessions`}
                  />
                  <span className="pointer-events-none absolute bottom-full mb-1 hidden rounded-md bg-forest px-2 py-1 text-[0.65rem] whitespace-nowrap text-paper group-hover:block">
                    {fmtDay(d.date)}
                    <br />
                    {d.minutes} min · {d.pages} pages
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center space-y-2.5 py-1">
            {slide.id === "when"
              ? (
                  [
                    ["Morning", snap.timeOfDay.morning],
                    ["Afternoon", snap.timeOfDay.afternoon],
                    ["Evening", snap.timeOfDay.evening],
                    ["Late Night", snap.timeOfDay.lateNight],
                  ] as const
                ).map(([label, pct]) => (
                  <BarRow key={label} label={label} pct={pct} />
                ))
              : null}
            {slide.id === "format"
              ? Object.entries(snap.formatByBooks).map(([k, n]) => {
                  const total =
                    Object.values(snap.formatByBooks).reduce(
                      (a, b) => a + b,
                      0,
                    ) || 1;
                  return (
                    <BarRow
                      key={k}
                      label={cap(k)}
                      pct={Math.round((n / total) * 100)}
                    />
                  );
                })
              : null}
            {slide.id === "ratings"
              ? ([5, 4, 3, 2, 1] as const).map((star) => {
                  const n = snap.ratingDist[star];
                  const total =
                    Object.values(snap.ratingDist).reduce((a, b) => a + b, 0) ||
                    1;
                  return (
                    <BarRow
                      key={star}
                      label={"★".repeat(star)}
                      pct={Math.round((n / total) * 100)}
                      suffix={`${n}`}
                    />
                  );
                })
              : null}
            {slide.id === "outcomes" ? (
              <>
                <BarRow label="Finished" pct={snap.outcomes.finished} />
                <BarRow label="Paused" pct={snap.outcomes.paused} />
                <BarRow label="DNF" pct={snap.outcomes.dnf} />
              </>
            ) : null}
            {slide.id === "dnf"
              ? snap.dnfReasons.map((r) => (
                  <BarRow key={r.reason} label={r.reason} pct={r.share} />
                ))
              : null}
          </div>
        )}
        {slide.note ? (
          <p className="insights-body mt-3 text-xs leading-relaxed text-ink/80">
            {slide.note}
          </p>
        ) : null}
      </div>

      <div className="relative flex items-center justify-center gap-2 px-4 pb-4 pt-3 sm:px-5">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to metrics slide ${i + 1}: ${s.title}`}
              aria-current={active ? "true" : undefined}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all ${
                active ? "w-6 bg-forest" : "w-2 bg-[#564d6a] opacity-55 hover:opacity-90"
              }`}
              style={{
                animation:
                  active && !reducedMotion
                    ? "insights-pulse-dot 2.4s ease-in-out infinite"
                    : undefined,
              }}
            />
          );
        })}
      </div>

      {!reducedMotion && !paused ? (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2a2438]/80"
          aria-hidden
        >
          <div
            key={progressKey}
            className="insights-carousel-progress h-full bg-forest"
            style={{ animationDuration: `${autoplayMs}ms` }}
          />
        </div>
      ) : !reducedMotion ? (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2a2438]/80"
          aria-hidden
        />
      ) : null}
    </section>
  );
}

function OverviewCarousel({
  snap,
  dna,
}: {
  snap: PeriodSnapshot;
  dna: ReaderDna;
}) {
  const slides = useMemo<OverviewSlide[]>(() => {
    const topGenre = snap.genreShare[0];
    const nightShare = snap.timeOfDay.evening + snap.timeOfDay.lateNight;
    return [
      {
        id: "pulse",
        eyebrow: `Overview · ${snap.label}`,
        title: "Your reading pulse",
        body: "Books, pages, and minutes that actually moved this period.",
        tint: "#b08fce",
        stats: [
          { value: String(snap.booksFinished.value), label: "Books finished" },
          {
            value: snap.pagesRead.value.toLocaleString(),
            label: "Pages read",
          },
          {
            value: snap.minutesRead.value.toLocaleString(),
            label: "Minutes",
          },
        ],
      },
      {
        id: "streak",
        eyebrow: "Habit",
        title: "Streak & rhythm",
        body: "Consistency is the quiet plot twist.",
        tint: "#7dd3c0",
        stats: [
          { value: `${snap.streakDays.value}d`, label: "Current streak" },
          { value: String(snap.readingDays.value), label: "Reading days" },
          { value: String(snap.sessions.value), label: "Sessions" },
        ],
      },
      {
        id: "genre",
        eyebrow: "Taste",
        title: "Top genre energy",
        body: topGenre
          ? `${topGenre.genre} is carrying ${topGenre.share}% of your shelf gravity.`
          : "Genre signals are still forming.",
        tint: "#f0a6ca",
        stats: [
          {
            value: topGenre?.genre ?? "—",
            label: "Most read",
          },
          {
            value: snap.highestRatedGenre
              ? `${snap.highestRatedGenre.avgRating}★`
              : "—",
            label: snap.highestRatedGenre?.genre ?? "Highest rated",
          },
          {
            value: `${nightShare}%`,
            label: "After 5 PM",
          },
        ],
      },
      {
        id: "dna",
        eyebrow: "Reader DNA",
        title: dna.title,
        body: dna.summary,
        tint: "#7eb8ff",
        stats: [
          {
            value: `${dna.confidencePct}%`,
            label: "DNA developed",
          },
          {
            value: `${dna.traits[0]?.value ?? 0}%`,
            label: dna.traits[0]?.label ?? "Trait",
          },
          {
            value: `${snap.avgRating.value}★`,
            label: "Avg rating",
          },
        ],
      },
      {
        id: "goals",
        eyebrow: "Goals",
        title: "How close you are",
        body:
          snap.goalBooks.current >= snap.goalBooks.target
            ? "Monthly book goal already cleared — savor it."
            : `${snap.goalBooks.target - snap.goalBooks.current} books left on the monthly goal.`,
        tint: "#f0c27a",
        stats: [
          {
            value: `${snap.goalBooks.current}/${snap.goalBooks.target}`,
            label: "Books",
          },
          {
            value: `${snap.goalMinutes.current}/${snap.goalMinutes.target}`,
            label: "Minutes",
          },
          {
            value: `${snap.goalDays.current}/${snap.goalDays.target}`,
            label: "Days",
          },
        ],
      },
    ];
  }, [snap, dna]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchX = useRef<number | null>(null);
  const autoplayMs = 4500;
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, autoplayMs);
    return () => window.clearInterval(id);
    // Reset the timer whenever the visible slide changes (manual or auto)
    // so each slide gets a full interval.
  }, [paused, reducedMotion, slides.length, index, autoplayMs]);

  const go = (next: number) => {
    const len = slides.length;
    setIndex(((next % len) + len) % len);
  };

  // When hovered/focused, steal arrows (capture) so metrics carousel yields
  useEffect(() => {
    if (!paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (isTypingTarget(e.target)) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      e.preventDefault();
      const i = indexRef.current;
      go(e.key === "ArrowRight" ? i + 1 : i - 1);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [paused, slides.length]);

  const slide = slides[index];
  const progressKey = `${slide.id}-${index}`;

  return (
    <section
      className="relative overflow-hidden rounded-[1.6rem] border border-[#4a425c]/90"
      style={{
        background: `linear-gradient(135deg, ${slide.tint}22, #342c45 48%, #2a2438)`,
      }}
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onTouchStart={(e) => {
        touchX.current = e.changedTouches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        setPaused(false);
        if (start == null || end == null) return;
        const delta = end - start;
        if (Math.abs(delta) < 40) return;
        go(delta < 0 ? index + 1 : index - 1);
      }}
      aria-roledescription="carousel"
      aria-label="Insights overview"
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full opacity-40 blur-3xl"
        style={{ background: slide.tint }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3 px-5 pt-5 sm:px-7">
        <div>
          <p className="insights-body text-[0.68rem] font-semibold tracking-[0.16em] text-ink/65 uppercase">
            {slide.eyebrow}
          </p>
          <p className="insights-body mt-1 text-xs text-muted">
            {reducedMotion
              ? "Arrows or dots to browse · autoplay off"
              : "Autoplays · pause on hover · arrows & dots work"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous overview slide"
            onClick={() => go(index - 1)}
            className="rounded-full border border-[#564d6a] bg-[#2a2438]/55 px-3 py-1.5 text-sm font-semibold text-ink hover:bg-[#3f3654]"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next overview slide"
            onClick={() => go(index + 1)}
            className="rounded-full border border-[#564d6a] bg-[#2a2438]/55 px-3 py-1.5 text-sm font-semibold text-ink hover:bg-[#3f3654]"
          >
            →
          </button>
        </div>
      </div>

      <div
        key={slide.id}
        className="insights-carousel-slide relative px-5 pb-5 pt-4 sm:px-7 sm:pb-6"
      >
        <h2 className="insights-display text-[2.15rem] leading-none tracking-[0.05em] text-ink sm:text-[2.55rem]">
          {slide.title}
        </h2>
        <p className="insights-body mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-ink/85">
          {slide.body}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {slide.stats.map((s) => (
            <div
              key={`${slide.id}-${s.label}`}
              className="rounded-2xl border border-white/10 bg-[#2a2438]/55 px-4 py-3 backdrop-blur-[2px]"
            >
              <p className="insights-display text-[1.85rem] leading-none tracking-[0.04em] text-ink">
                {s.value}
              </p>
              <p className="insights-body mt-1.5 text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-center gap-2 pb-5">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}: ${s.title}`}
              aria-current={active ? "true" : undefined}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all ${
                active ? "w-7" : "w-2 opacity-55 hover:opacity-90"
              }`}
              style={{
                background: active ? slide.tint : "#564d6a",
                animation:
                  active && !reducedMotion
                    ? "insights-pulse-dot 2.4s ease-in-out infinite"
                    : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Autoplay progress — subtle cue that slides advance */}
      {!reducedMotion && !paused ? (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2a2438]/80"
          aria-hidden
        >
          <div
            key={progressKey}
            className="insights-carousel-progress h-full"
            style={{
              background: slide.tint,
              animationDuration: `${autoplayMs}ms`,
            }}
          />
        </div>
      ) : !reducedMotion ? (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2a2438]/80"
          aria-hidden
        />
      ) : null}

      <p className="insights-body px-5 pb-4 text-[0.7rem] text-muted-soft sm:px-7">
        Metrics from library history are calculated; session charts use demo
        logs for August depth.
      </p>
    </section>
  );
}

function GoalCard({
  title,
  current,
  target,
  unit,
  note,
}: {
  title: string;
  current: number;
  target: number;
  unit: string;
  note: string;
}) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="rounded-[1.25rem] border border-[#4a425c] bg-[#3a324f]/90 p-4">
      <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
        {title}
      </p>
      <p className="mt-2 font-serif text-xl font-semibold text-ink">
        {current.toLocaleString()} / {target.toLocaleString()} {unit}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#564d6a]">
        <div
          className="h-full rounded-full bg-forest-soft"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">{note}</p>
    </div>
  );
}

function BarRow({
  label,
  pct,
  suffix,
}: {
  label: string;
  pct: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 text-xs">
        <span className="text-ink/90">{label}</span>
        <span className="font-semibold text-ink">
          {suffix ?? `${pct}%`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#564d6a]">
        <div
          className="h-full rounded-full bg-forest"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

const GENRE_TREEMAP_COLORS = [
  "#FF5C8A", // hot pink
  "#FFB020", // amber gold
  "#3DDC97", // mint
  "#4DA3FF", // sky
  "#FF7A45", // coral
  "#C77DFF", // violet (accent only, not whole chart)
] as const;

type TreemapCell = {
  genre: string;
  share: number;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

function layoutGenreTreemap(
  items: { genre: string; share: number; color: string }[],
  x: number,
  y: number,
  w: number,
  h: number,
  horizontal: boolean,
): TreemapCell[] {
  if (items.length === 0) return [];
  if (items.length === 1) {
    const only = items[0];
    return [{ ...only, x, y, w, h }];
  }

  const total = items.reduce((s, n) => s + Math.max(n.share, 1), 0);
  let acc = 0;
  let splitIdx = 1;
  for (let i = 0; i < items.length - 1; i++) {
    acc += Math.max(items[i].share, 1);
    splitIdx = i + 1;
    if (acc >= total / 2) break;
  }

  const left = items.slice(0, splitIdx);
  const right = items.slice(splitIdx);
  const leftShare = left.reduce((s, n) => s + Math.max(n.share, 1), 0);
  const ratio = leftShare / total;

  if (horizontal) {
    const leftW = w * ratio;
    return [
      ...layoutGenreTreemap(left, x, y, leftW, h, false),
      ...layoutGenreTreemap(right, x + leftW, y, w - leftW, h, false),
    ];
  }

  const leftH = h * ratio;
  return [
    ...layoutGenreTreemap(left, x, y, w, leftH, true),
    ...layoutGenreTreemap(right, x, y + leftH, w, h - leftH, true),
  ];
}

function GenreTreemap({
  genres,
}: {
  genres: { genre: string; share: number }[];
}) {
  const items = genres.filter((g) => g.share > 0);
  // Measure the constrained card only (left col of Metrics-aligned grid), not a parent.
  const wrapRef = useRef<HTMLDivElement>(null);
  // Initial h matches Metrics carousel min-h (22rem ≈ 352px)
  const [size, setSize] = useState({ w: 1, h: 352 });
  const gap = 3;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      // content-box width of the card — matches carousel column after layout
      const w = Math.max(1, Math.round(el.clientWidth));
      // Card height matches Metrics (22rem); do not stretch to gold circles column
      const h = Math.max(1, Math.round(el.clientHeight));
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    update();
    const ro = new ResizeObserver(() => {
      // rAF so we read after grid/flex has applied the constrained width
      requestAnimationFrame(update);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!items.length) {
    return (
      <p className="insights-body text-sm text-muted">
        Genre mix will appear as you finish more books.
      </p>
    );
  }

  const colored = items.map((g, i) => ({
    ...g,
    color: GENRE_TREEMAP_COLORS[i % GENRE_TREEMAP_COLORS.length],
  }));
  const cells = layoutGenreTreemap(colored, 0, 0, size.w, size.h, true);

  return (
    <div
      ref={wrapRef}
      className="insights-genre-treemap-card h-[22rem] min-h-[22rem] w-full max-w-full overflow-hidden rounded-[1.35rem] border border-[#4a425c]/90 bg-[#3a324f]/85"
    >
      <svg
        viewBox={`0 0 ${size.w} ${size.h}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        className="insights-genre-treemap block h-full w-full max-w-full"
        role="img"
        aria-label="Genre share treemap"
      >
        {cells.map((c) => {
          const rx = c.x + gap / 2;
          const ry = c.y + gap / 2;
          const rw = Math.max(0, c.w - gap);
          const rh = Math.max(0, c.h - gap);
          const showLabel = rw > 72 && rh > 36;
          const showPctOnly = !showLabel && rw > 40 && rh > 24;
          const darkText = ["#FFB020", "#3DDC97", "#FF7A45"].includes(c.color);
          const textFill = darkText ? "#1a1524" : "#f7f2ea";
          return (
            <g key={c.genre}>
              <title>
                {c.genre}: {c.share}%
              </title>
              <rect
                x={rx}
                y={ry}
                width={rw}
                height={rh}
                rx={6}
                fill={c.color}
                opacity={0.95}
              />
              {showLabel ? (
                <>
                  <text
                    x={rx + 10}
                    y={ry + 20}
                    fill={textFill}
                    className="insights-body"
                    style={{ fontSize: 13, fontWeight: 700 }}
                  >
                    {c.genre.length > 16
                      ? `${c.genre.slice(0, 15)}…`
                      : c.genre}
                  </text>
                  <text
                    x={rx + 10}
                    y={ry + 38}
                    fill={textFill}
                    opacity={0.9}
                    className="insights-body"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    {c.share}%
                  </text>
                </>
              ) : showPctOnly ? (
                <text
                  x={rx + rw / 2}
                  y={ry + rh / 2 + 5}
                  textAnchor="middle"
                  fill={textFill}
                  className="insights-body"
                  style={{ fontSize: 12, fontWeight: 700 }}
                >
                  {c.share}%
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div
      className="insights-mini-stat flex aspect-square w-[min(36vw,7rem)] shrink-0 flex-col items-center justify-center rounded-full px-2.5 text-center sm:w-[7.5rem] lg:w-[7rem] xl:w-[7.75rem]"
      style={{ backgroundColor: tone }}
    >
      <p className="text-[0.6rem] font-semibold tracking-wide text-[#3a2e0a]/90 uppercase sm:text-[0.65rem]">
        {label}
      </p>
      <p className="mt-1 font-serif text-sm font-semibold text-[#2a2208] sm:text-base">
        {value}
      </p>
    </div>
  );
}

function Partial({
  text,
  href,
  cta,
}: {
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-[#564d6a] bg-[#2a2438]/60 px-4 py-5">
      <p className="text-sm text-muted">{text}</p>
      <Link
        href={href}
        className="mt-3 inline-flex text-sm font-semibold text-ink underline-offset-2 hover:underline"
      >
        {cta} →
      </Link>
    </div>
  );
}

function formatTimeInsight(snap: PeriodSnapshot) {
  const audio = snap.formatByMinutes.audiobook ?? 0;
  const total =
    Object.values(snap.formatByMinutes).reduce((a, b) => a + b, 0) || 1;
  const audioTime = Math.round((audio / total) * 100);
  const audioBooks = snap.formatByBooks.audiobook ?? 0;
  const bookTotal =
    Object.values(snap.formatByBooks).reduce((a, b) => a + b, 0) || 1;
  const audioBookPct = Math.round((audioBooks / bookTotal) * 100);
  if (!audio) return "Physical still carries most of your shelf.";
  return `Audiobooks accounted for ${audioBookPct}% of books but ${audioTime}% of reading time.`;
}

function fmtDay(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtDuration(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
