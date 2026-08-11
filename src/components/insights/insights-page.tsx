"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { buildMonthlyWrapped, buildYearlyWrapped } from "./wrapped";

type MainTab = "insights" | "dna";

export function InsightsPage() {
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
    return wrappedOpen === "year"
      ? buildYearlyWrapped(snap)
      : buildMonthlyWrapped(snap, dna);
  }, [snap, dna, wrappedOpen]);

  if (!state || !snap || !dna) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3ebe0] text-muted">
        Opening your insights…
      </div>
    );
  }

  const isNewUser = state.entries.filter((e) => e.status === "read").length < 2;

  return (
    <div className="min-h-screen bg-[#f3ebe0] text-ink">
      <AppNav />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="relative max-w-3xl">
          <div
            className="pointer-events-none absolute -top-1 left-0 text-gold/70"
            aria-hidden
          >
            <LeafIcon className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-[2.35rem] font-semibold tracking-[-0.03em] text-forest sm:text-[2.75rem]">
            Insights
          </h1>
          <p className="mt-2 text-[1.05rem] text-muted">
            See the story behind your reading.
          </p>
          <p className="mt-1 text-sm text-forest/70">
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
                    ? "text-forest"
                    : "text-forest/60 hover:bg-[#efe4d4] hover:text-forest"
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
              setWrappedOpen(kind);
            }}
          />
        ) : (
          <ReaderDnaPanel
            dna={dna}
            traitId={traitId}
            setTraitId={setTraitId}
            onShare={() => setShareOpen(true)}
          />
        )}
      </main>

      {wrappedOpen ? (
        <WrappedModal
          slides={wrappedSlides}
          step={wrappedStep}
          setStep={setWrappedStep}
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
        <div className="fixed right-4 bottom-4 z-[80] rounded-2xl border border-[#e4d5c3] bg-[#fbf6ee] px-4 py-3 text-sm text-forest shadow-lg">
          {shareToast}
        </div>
      ) : null}
    </div>
  );
}

function ReadingInsights({
  snap,
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
  const maxActivity = Math.max(
    1,
    ...snap.activityByDay.map((d) =>
      activityMode === "minutes" ? d.minutes : d.pages,
    ),
  );

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
                : "bg-[#fbf6ee] text-forest/70 hover:bg-[#efe4d4]"
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
              className="rounded-full border border-[#e0d1bf] px-3 py-1.5 text-sm font-semibold text-forest disabled:opacity-40"
            >
              ←
            </button>
            <span className="min-w-[9rem] text-center font-serif text-sm font-semibold text-forest">
              {snap.label}
            </span>
            <button
              type="button"
              aria-label="Next month"
              disabled={monthOffset <= 0}
              onClick={() => setMonthOffset((n) => Math.max(0, n - 1))}
              className="rounded-full border border-[#e0d1bf] px-3 py-1.5 text-sm font-semibold text-forest disabled:opacity-40"
            >
              →
            </button>
          </div>
        ) : (
          <span className="ml-auto font-serif text-sm font-semibold text-forest">
            {snap.label}
          </span>
        )}
      </div>

      {/* Summary */}
      <section>
        <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-forest/65 uppercase">
          Overview · {snap.label}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-4 border-y border-[#e4d5c3]/80 py-5">
          <BigStat value={String(snap.booksFinished.value)} label="Books Finished" />
          <BigStat
            value={snap.pagesRead.value.toLocaleString()}
            label="Pages Read"
          />
          <BigStat
            value={snap.minutesRead.value.toLocaleString()}
            label="Minutes Read"
          />
          <BigStat value={String(snap.sessions.value)} label="Sessions" />
          <BigStat value={`${snap.streakDays.value} days`} label="Streak" />
          <BigStat value={`${snap.avgRating.value}★`} label="Avg Rating" />
        </div>
        <p className="mt-2 text-[0.7rem] text-muted-soft">
          Metrics marked from library history are calculated; session charts use
          demo logs for August depth.
        </p>
      </section>

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

      {/* Activity chart + calendar */}
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-serif text-xl font-semibold text-forest">
                Reading activity
              </h2>
              <p className="text-sm text-muted">When the pages actually moved.</p>
            </div>
            <div className="flex rounded-full border border-[#e0d1bf] bg-[#fbf6ee] p-0.5">
              {(["minutes", "pages"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setActivityMode(m)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    activityMode === m
                      ? "bg-forest text-paper"
                      : "text-forest/70"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[1.35rem] border border-[#e4d5c3]/80 bg-[#fbf6ee]/70 p-4">
            <div className="flex h-40 items-end gap-1">
              {snap.activityByDay.map((d) => {
                const val =
                  activityMode === "minutes" ? d.minutes : d.pages;
                const h = Math.max(4, Math.round((val / maxActivity) * 100));
                return (
                  <div
                    key={d.date}
                    className="group relative flex flex-1 flex-col items-center justify-end"
                  >
                    <div
                      className="w-full max-w-[18px] rounded-t-md bg-forest/80 transition group-hover:bg-forest"
                      style={{ height: `${h}%` }}
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
            <p className="mt-2 text-[0.65rem] text-muted">
              Hover a bar for day details. Unit: {activityMode}.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">
            Reading calendar
          </h2>
          <p className="mt-1 text-sm text-muted">Depth by minutes read.</p>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
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
                d.minutes === 0
                  ? 0
                  : d.minutes < 30
                    ? 1
                    : d.minutes < 50
                      ? 2
                      : 3;
              const bg =
                intensity === 0
                  ? "bg-[#efe4d4]"
                  : intensity === 1
                    ? "bg-forest/30"
                    : intensity === 2
                      ? "bg-forest/55"
                      : "bg-forest";
              return (
                <div
                  key={d.date}
                  title={`${fmtDay(d.date)} · ${d.minutes} min · ${d.pages} pages · ${d.sessions} session(s)`}
                  className={`aspect-square rounded-md ${bg}`}
                />
              );
            })}
          </div>
          <p className="mt-2 text-[0.65rem] text-muted">
            Lighter = shorter · deeper green = longer.
          </p>
        </section>
      </div>

      {/* When / format / genre */}
      <div className="grid gap-8 lg:grid-cols-3">
        <section>
          <h2 className="font-serif text-lg font-semibold text-forest">
            When do you read?
          </h2>
          <div className="mt-3 space-y-2">
            {(
              [
                ["Morning", snap.timeOfDay.morning],
                ["Afternoon", snap.timeOfDay.afternoon],
                ["Evening", snap.timeOfDay.evening],
                ["Late Night", snap.timeOfDay.lateNight],
              ] as const
            ).map(([label, pct]) => (
              <BarRow key={label} label={label} pct={pct} />
            ))}
          </div>
          <p className="mt-3 text-sm text-forest/80">
            {snap.timeOfDay.evening + snap.timeOfDay.lateNight}% of your reading
            happens after 5 PM.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-forest">
            How you read
          </h2>
          <p className="mt-1 text-xs text-muted">By books finished</p>
          <div className="mt-2 space-y-2">
            {Object.entries(snap.formatByBooks).map(([k, n]) => {
              const total =
                Object.values(snap.formatByBooks).reduce((a, b) => a + b, 0) ||
                1;
              return (
                <BarRow
                  key={k}
                  label={cap(k)}
                  pct={Math.round((n / total) * 100)}
                />
              );
            })}
          </div>
          <p className="mt-3 text-sm text-forest/80">
            {formatTimeInsight(snap)}
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-forest">
            Your genres
          </h2>
          <div className="mt-3 space-y-2">
            {snap.genreShare.slice(0, 6).map((g) => (
              <BarRow key={g.genre} label={g.genre} pct={g.share} />
            ))}
          </div>
          <ul className="mt-3 space-y-1 text-sm text-forest/85">
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
        </section>
      </div>

      {/* Ratings + outcomes */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-lg font-semibold text-forest">
            What worked for you
          </h2>
          <p className="mt-1 text-sm text-muted">
            Average rating {snap.avgRating.value}★
          </p>
          <div className="mt-3 space-y-2">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const n = snap.ratingDist[star];
              const total =
                Object.values(snap.ratingDist).reduce((a, b) => a + b, 0) || 1;
              return (
                <BarRow
                  key={star}
                  label={"★".repeat(star)}
                  pct={Math.round((n / total) * 100)}
                  suffix={`${n}`}
                />
              );
            })}
          </div>
          <p className="mt-3 text-sm text-forest/80">
            You gave 5 stars to {snap.ratingDist[5]} of your finishes in this
            view.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-forest">
            Your reading outcomes
          </h2>
          <div className="mt-3 space-y-2">
            <BarRow label="Finished" pct={snap.outcomes.finished} />
            <BarRow label="Paused" pct={snap.outcomes.paused} />
            <BarRow label="DNF" pct={snap.outcomes.dnf} />
          </div>
          <p className="mt-3 text-sm text-forest/80">
            Paused is waiting — not abandoned. You usually return within about{" "}
            {snap.pauseStats.avgResumeDays} days.
          </p>
          {snap.dnfReasons.length ? (
            <div className="mt-4">
              <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
                Why you DNF
              </p>
              <div className="mt-2 space-y-1.5">
                {snap.dnfReasons.map((r) => (
                  <BarRow key={r.reason} label={r.reason} pct={r.share} />
                ))}
              </div>
              <p className="mt-2 text-sm text-forest/80">
                {snap.dnfReasons[0]?.reason} was your most common DNF reason.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Not enough DNF data yet.
            </p>
          )}
        </section>
      </div>

      {/* Sources + influencers + TBR */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-lg font-semibold text-forest">
            Where your best reads come from
          </h2>
          {snap.sourcePerformance.length ? (
            <div className="mt-3 space-y-3">
              {snap.sourcePerformance.slice(0, 5).map((s) => (
                <div
                  key={s.source}
                  className="rounded-2xl border border-[#e4d5c3]/80 bg-[#fbf6ee]/80 px-4 py-3"
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold text-forest">{s.source}</p>
                    <p className="text-sm text-forest">{s.avgRating}★</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {s.books} completed · {s.completionRate}% completion
                  </p>
                </div>
              ))}
              <p className="text-sm text-forest/85">
                {snap.sourcePerformance[0]
                  ? `${snap.sourcePerformance[0].source} is currently your strongest recommendation source.`
                  : null}
              </p>
            </div>
          ) : (
            <Partial
              text="Finish a few books from different recommendation sources to unlock this insight."
              href="/search"
              cta="Explore Books"
            />
          )}

          {snap.influencers.length ? (
            <div className="mt-6">
              <h3 className="font-serif text-base font-semibold text-forest">
                Your reading influences
              </h3>
              <ul className="mt-2 space-y-2">
                {snap.influencers.slice(0, 3).map((i) => (
                  <li
                    key={i.username}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <Link
                      href={`/readers/${i.username}`}
                      className="font-semibold text-forest hover:underline"
                    >
                      @{i.username}
                    </Link>
                    <span className="text-muted">
                      {i.completed} done · {i.avgRating}★ · {i.onTbr} on TBR
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-forest">
            Your TBR
          </h2>
          <p className="mt-1 text-sm text-muted">{snap.tbr.total} books waiting</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {Object.entries(snap.tbr.byPriority).map(([k, n]) => (
              <div
                key={k}
                className="rounded-2xl border border-[#e4d5c3] bg-[#fbf6ee] px-3 py-2.5"
              >
                <p className="text-[0.65rem] font-semibold tracking-wide text-muted uppercase">
                  {k.replace("-", " ")}
                </p>
                <p className="font-serif text-xl font-semibold text-forest">{n}</p>
              </div>
            ))}
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-forest/85">
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
            className="mt-3 inline-flex text-sm font-semibold text-forest underline-offset-2 hover:underline"
          >
            Review Your TBR →
          </Link>
        </section>
      </div>

      {/* Session + length */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat
          label="Avg session"
          value={`${snap.sessionStats.avgMinutes} min`}
        />
        <MiniStat
          label="Longest session"
          value={fmtDuration(snap.sessionStats.longestMinutes)}
        />
        <MiniStat
          label="Typical range"
          value={`${snap.sessionStats.typicalMin}–${snap.sessionStats.typicalMax} min`}
        />
        <MiniStat
          label="Pace"
          value={`${snap.sessionStats.pagesPerHour} pages/hr`}
        />
      </div>

      <section>
        <h2 className="font-serif text-lg font-semibold text-forest">
          What length works for you?
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {snap.lengthBands.map((b) => (
            <div
              key={b.band}
              className="rounded-2xl border border-[#e4d5c3] bg-[#fbf6ee] px-4 py-3"
            >
              <p className="text-xs text-muted">{b.band} pages</p>
              <p className="font-serif text-xl font-semibold text-forest">
                {b.count ? `${b.avgRating}★` : "—"}
              </p>
              <p className="text-xs text-muted">{b.count} books</p>
            </div>
          ))}
        </div>
      </section>

      {/* Patterns */}
      <section>
        <h2 className="font-serif text-[1.45rem] font-semibold text-forest">
          Patterns ReadLife noticed
        </h2>
        <p className="mt-1 text-sm text-muted">
          Small things hiding in your reading history.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {snap.patterns.map((p) => (
            <article
              key={p.id}
              className="rounded-[1.25rem] border border-[#e4d5c3]/80 bg-[#fbf6ee]/90 p-4"
            >
              <p className="text-lg" aria-hidden>
                {p.icon}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-forest">{p.text}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setWhyId(whyId === p.id ? null : p.id)}
                  className="text-xs font-semibold text-forest underline-offset-2 hover:underline"
                >
                  {whyId === p.id ? "Hide why" : "Why am I seeing this?"}
                </button>
                {p.action ? (
                  <Link
                    href={p.action.href}
                    className="text-xs font-semibold text-forest underline-offset-2 hover:underline"
                  >
                    {p.action.label} →
                  </Link>
                ) : null}
              </div>
              {whyId === p.id ? (
                <p className="mt-2 rounded-xl bg-[#f3ebe0] px-3 py-2 text-xs text-forest/80">
                  {p.why}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {/* Compare + narrative */}
      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[1.35rem] border border-[#e4d5c3] bg-[#fbf6ee]/80 p-5">
          <h2 className="font-serif text-lg font-semibold text-forest">
            Compare to last month
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-forest">
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
        <div className="rounded-[1.35rem] border border-[#e4d5c3] bg-[#fbf6ee]/80 p-5">
          <h2 className="font-serif text-lg font-semibold text-forest">
            Your month in a nutshell
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-forest/90">
            {snap.monthlyNarrative}
          </p>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="font-serif text-[1.45rem] font-semibold text-forest">
          Badges & milestones
        </h2>
        <p className="mt-1 text-sm text-muted">
          Earned from behavior — not grind.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b) => (
            <article
              key={b.id}
              className={`rounded-[1.25rem] border px-4 py-4 ${
                b.earned
                  ? "border-[#c9a15b]/50 bg-[#fbf6ee]"
                  : "border-[#e4d5c3]/60 bg-[#f3ebe0]/50 opacity-80"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a15b]/60 bg-[#f0e4d0] font-serif text-sm font-bold text-forest">
                {b.earned ? "✦" : "·"}
              </div>
              <h3 className="mt-3 font-serif text-base font-semibold text-forest">
                {b.name}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {b.description}
              </p>
              {b.earned && b.earnedDate ? (
                <p className="mt-2 text-[0.65rem] font-semibold text-forest/70">
                  Earned {b.earnedDate}
                </p>
              ) : b.progress ? (
                <p className="mt-2 text-[0.65rem] text-muted">
                  {b.progress.current} / {b.progress.target}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {/* Wrapped */}
      <section>
        <h2 className="font-serif text-[1.45rem] font-semibold text-forest">
          Your Wrapped
        </h2>
        <p className="mt-1 text-sm text-muted">
          Story-shaped months and years — private until you share.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onOpenWrapped("month")}
            className="rounded-[1.35rem] border border-[#e4d5c3] bg-[#fbf6ee] p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
              Monthly
            </p>
            <p className="mt-2 font-serif text-xl font-semibold text-forest">
              August Wrapped
            </p>
            <p className="mt-1 text-sm text-muted">View Wrapped →</p>
          </button>
          <button
            type="button"
            onClick={() => onOpenWrapped("year")}
            className="rounded-[1.35rem] border border-[#e4d5c3] bg-[#fbf6ee] p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
              Yearly
            </p>
            <p className="mt-2 font-serif text-xl font-semibold text-forest">
              2026 Wrapped
            </p>
            <p className="mt-1 text-sm text-muted">View Wrapped →</p>
          </button>
        </div>
      </section>
    </div>
  );
}

function ReaderDnaPanel({
  dna,
  traitId,
  setTraitId,
  onShare,
}: {
  dna: ReaderDna;
  traitId: string | null;
  setTraitId: (id: string | null) => void;
  onShare: () => void;
}) {
  return (
    <div className="mt-8 space-y-10">
      <section className="max-w-3xl">
        <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-forest/65 uppercase">
          Your Reader DNA
        </p>
        <h2 className="mt-2 font-serif text-[2rem] font-semibold text-forest">
          {dna.title}
        </h2>
        <p className="mt-3 text-[1.05rem] leading-relaxed text-forest/90">
          {dna.summary}
        </p>
        <p className="mt-3 text-sm text-muted">
          Last updated: {dna.generatedAt} · {dna.dataPoints}
        </p>
        <p className="mt-1 text-xs font-semibold text-forest/70">
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
            onClick={onShare}
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            Share
          </button>
        </div>
      </section>

      {/* Trait map */}
      <section>
        <h3 className="font-serif text-xl font-semibold text-forest">
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
              className="rounded-[1.25rem] border border-[#e4d5c3] bg-[#fbf6ee] p-4 text-left transition hover:border-forest/30"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-serif font-semibold text-forest">
                  {t.label}
                </span>
                <span className="text-sm font-bold text-forest">{t.value}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8dccb]">
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
                <p className="mt-3 rounded-xl bg-[#f3ebe0] px-3 py-2 text-xs leading-relaxed text-forest/85">
                  {t.why}
                </p>
              ) : (
                <p className="mt-2 text-[0.7rem] font-semibold text-forest/60">
                  Why?
                </p>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.35rem] border border-[#e4d5c3] bg-[#fbf6ee] p-5">
          <h3 className="font-serif text-lg font-semibold text-forest">
            How your DNA changed
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-forest">
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
        <div className="rounded-[1.35rem] border border-[#e4d5c3] bg-[#fbf6ee] p-5">
          <h3 className="font-serif text-lg font-semibold text-forest">
            DNA history
          </h3>
          <ol className="mt-3 space-y-2 text-sm">
            <li className="text-muted">July 2026 — {dna.previousTitle}</li>
            <li className="font-semibold text-forest">
              August 2026 — {dna.title}
            </li>
          </ol>
          <div className="mt-5 border-t border-[#e8dccb] pt-4">
            <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
              Quiz personality vs DNA
            </p>
            <p className="mt-2 text-sm text-forest">
              Quiz: 🌙 {dna.quizPersonality}
            </p>
            <p className="text-sm text-forest">
              Behavioral DNA: 🧬 {dna.title}
            </p>
            <p className="mt-2 text-sm text-muted">{dna.quizComparison}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function WrappedModal({
  slides,
  step,
  setStep,
  onClose,
  onShare,
}: {
  slides: WrappedSlide[];
  step: number;
  setStep: (n: number | ((p: number) => number)) => void;
  onClose: () => void;
  onShare: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        setStep((s) => Math.min(slides.length - 1, s + 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, setStep, slides.length]);

  const slide = slides[step];
  if (!slide) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#2a342c]/45"
        aria-label="Close wrapped"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex h-[min(80vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-[#e4d5c3] bg-[#f7f0e6] shadow-2xl"
      >
        <div className="flex gap-1 px-4 pt-4">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full ${
                i <= step ? "bg-forest" : "bg-[#e0d1bf]"
              }`}
            />
          ))}
        </div>
        <div className="flex flex-1 flex-col justify-center px-8 py-10 text-center">
          {slide.eyebrow ? (
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-forest/65 uppercase">
              {slide.eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 font-serif text-2xl font-semibold text-forest">
            {slide.title}
          </h2>
          {slide.emphasis ? (
            <p className="mt-4 font-serif text-3xl font-semibold text-forest">
              {slide.emphasis}
            </p>
          ) : null}
          {slide.body ? (
            <p className="mt-4 text-sm leading-relaxed text-muted">{slide.body}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-[#e8dccb] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-sm font-semibold text-forest/70"
          >
            Close
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              className="rounded-full border border-[#e0d1bf] px-3 py-2 text-sm font-semibold text-forest disabled:opacity-40"
            >
              Back
            </button>
            {step < slides.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={onShare}
                className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper"
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
        className="absolute inset-0 bg-[#2a342c]/40"
        aria-label="Close share"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border border-[#e4d5c3] bg-[#fbf6ee] p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-forest">Share</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-forest hover:bg-[#efe4d4]"
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
                  : "border border-[#e0d1bf] text-forest"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className={`mx-auto mt-5 w-full max-w-[220px] overflow-hidden rounded-2xl border border-[#c9a15b]/40 bg-[#f0e4d0] p-4 shadow-inner ${aspect}`}
        >
          <p className="text-[0.6rem] font-semibold tracking-[0.14em] text-forest/70 uppercase">
            My August Reader DNA
          </p>
          {privacy.readerDna ? (
            <>
              <p className="mt-3 font-serif text-lg font-semibold text-forest">
                {dna.title}
              </p>
              <ul className="mt-3 space-y-1 text-[0.7rem] text-forest/85">
                {dna.traits.slice(0, 3).map((t) => (
                  <li key={t.id}>
                    {t.value}% {t.label}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {privacy.booksRead ? (
            <p className="mt-3 text-[0.7rem] text-forest">
              {snap.booksFinished.value} books finished
            </p>
          ) : null}
          {privacy.minutes ? (
            <p className="text-[0.7rem] text-forest">
              {snap.minutesRead.value.toLocaleString()} minutes
            </p>
          ) : null}
          {privacy.favoriteBook ? (
            <p className="mt-2 text-[0.7rem] italic text-forest/80">
              Favorite energy: Hamnet
            </p>
          ) : null}
          <p className="mt-auto pt-4 font-serif text-sm font-semibold text-forest">
            ReadLife
          </p>
        </div>

        <div className="mt-5">
          <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
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
              <label key={key} className="flex items-center gap-2 text-forest">
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
              className="rounded-full border border-forest/30 py-2.5 text-xs font-semibold text-forest hover:bg-[#efe4d4]"
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
      <p className="font-serif text-2xl font-semibold text-forest">
        Your reading story is just beginning.
      </p>
      <p className="mt-2 text-muted">
        Log books and reading sessions to start uncovering your patterns.
      </p>
      <p className="mt-4 text-sm font-semibold text-forest/80">
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
          className="rounded-full border border-forest/35 px-5 py-2.5 text-sm font-semibold text-forest"
        >
          Add Past Reads
        </Link>
        <Link
          href="/search"
          className="rounded-full border border-forest/35 px-5 py-2.5 text-sm font-semibold text-forest"
        >
          Explore Books
        </Link>
      </div>
    </div>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl font-semibold tracking-tight text-forest">
        {value}
      </p>
      <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
    </div>
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
    <div className="rounded-[1.25rem] border border-[#e4d5c3] bg-[#fbf6ee]/90 p-4">
      <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
        {title}
      </p>
      <p className="mt-2 font-serif text-xl font-semibold text-forest">
        {current.toLocaleString()} / {target.toLocaleString()} {unit}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8dccb]">
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
        <span className="text-forest/90">{label}</span>
        <span className="font-semibold text-forest">
          {suffix ?? `${pct}%`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e8dccb]">
        <div
          className="h-full rounded-full bg-forest"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-[#e4d5c3] bg-[#fbf6ee] px-4 py-3">
      <p className="text-[0.65rem] font-semibold tracking-wide text-muted uppercase">
        {label}
      </p>
      <p className="mt-1 font-serif text-lg font-semibold text-forest">{value}</p>
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
    <div className="mt-3 rounded-2xl border border-dashed border-[#e0d1bf] bg-[#f3ebe0]/60 px-4 py-5">
      <p className="text-sm text-muted">{text}</p>
      <Link
        href={href}
        className="mt-3 inline-flex text-sm font-semibold text-forest underline-offset-2 hover:underline"
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
