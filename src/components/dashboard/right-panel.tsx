"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LeafIcon } from "@/components/icons";
import type { CurrentBookView, MonthPreview } from "./dashboard-data";
import {
  BookIcon,
  BookOpenIcon,
  ClockIcon,
  FlameIcon,
  PeopleIcon,
  PlantIcon,
  PlusBookIcon,
  QuoteIcon,
  StarIcon,
  StatRow,
} from "./dash-icons";

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];

type UpcomingItem = {
  id: string;
  kind: "buddy" | "party";
  title: string;
  subtitle: string;
  targetEndDate?: string;
  bookCover?: string;
  bookColor?: string;
};

type Props = {
  current: CurrentBookView | null;
  streakDays: number;
  todayGoalMins: number;
  todayDoneMins: number;
  month: MonthPreview;
  upcoming: UpcomingItem[];
  readingEra?: { title: string; blurb: string } | null;
  featuredQuote?: string | null;
  onStartReading: () => void;
  onUpdateProgress: () => void;
  onPause: () => void;
  onFinished: () => void;
  onLogSession: () => void;
  onAddTbr: () => void;
  onWriteQuote: () => void;
  onBuddyRead: () => void;
};

export function RightPanel({
  current,
  streakDays,
  todayGoalMins,
  todayDoneMins,
  month,
  upcoming,
  readingEra,
  featuredQuote,
  onStartReading,
  onUpdateProgress,
  onPause,
  onFinished,
  onLogSession,
  onAddTbr,
  onWriteQuote,
  onBuddyRead,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const todayPct = Math.min(
    100,
    Math.round((todayDoneMins / Math.max(1, todayGoalMins)) * 100),
  );

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const actions = [
    { label: "Log Session", icon: ClockIcon, onClick: onLogSession },
    { label: "Add to TBR", icon: PlusBookIcon, onClick: onAddTbr },
    { label: "Write Quote", icon: QuoteIcon, onClick: onWriteQuote },
    { label: "Read With Friend", icon: PeopleIcon, onClick: onBuddyRead },
  ] as const;

  return (
    <aside className="flex flex-col gap-3.5 lg:max-h-[calc(100vh-1.5rem)] lg:overflow-y-auto lg:pr-1">
      {/* Currently reading */}
      <section className="rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f] p-4 shadow-[0_6px_20px_rgba(42,36,56,0.05)] sm:p-5">
        <h2 className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/70 uppercase">
          Currently Reading
        </h2>

        {!current ? (
          <div className="mt-3 rounded-2xl border border-dashed border-[#564d6a] bg-[#342c45] px-4 py-5 text-center">
            <p className="text-sm text-muted">Nothing in progress.</p>
            <Link
              href="/library"
              className="mt-2 inline-block text-sm font-semibold text-ink underline-offset-2 hover:underline"
            >
              Pick from Library →
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-3 flex gap-3.5">
              <div
                className="relative h-[118px] w-[78px] shrink-0 overflow-hidden rounded-lg shadow-[0_8px_18px_rgba(42,36,56,0.18)]"
                style={{ background: current.book.color }}
              >
                <Image
                  src={current.book.cover}
                  alt={current.book.title}
                  fill
                  className="object-cover"
                  sizes="78px"
                />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="font-serif text-[1.05rem] leading-snug font-semibold text-ink">
                  {current.book.title}
                </p>
                <p className="mt-0.5 text-sm text-muted">{current.book.author}</p>
                <div className="mt-3">
                  <div className="mb-1.5 flex justify-between text-[0.72rem] text-muted">
                    <span className="font-semibold text-ink">
                      {current.progressPct}%
                    </span>
                    <span>
                      {current.pagesRead} / {current.pagesTotal} pages
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#564d6a]">
                    <div
                      className="h-full rounded-full bg-forest"
                      style={{ width: `${current.progressPct}%` }}
                    />
                  </div>
                </div>
                {current.entry.lastSessionLabel ? (
                  <p className="mt-2 text-[0.7rem] text-muted">
                    {current.entry.lastSessionLabel}
                  </p>
                ) : null}
              </div>
            </div>

            {featuredQuote ? (
              <div className="mt-3.5 flex gap-2 rounded-xl bg-[#3f3654]/90 px-3 py-2.5">
                <LeafIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/80" />
                <p className="text-[0.78rem] leading-snug text-ink/80 italic">
                  “{featuredQuote}”
                </p>
              </div>
            ) : null}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onStartReading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
              >
                <BookOpenIcon className="h-4 w-4" />
                Start Reading
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label="Book options"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-full min-w-[2.75rem] items-center justify-center rounded-full border border-[#564d6a] bg-[#342c45] text-ink transition hover:bg-[#3f3654]"
                >
                  ···
                </button>
                {menuOpen ? (
                  <div className="absolute right-0 bottom-full z-20 mb-2 w-44 overflow-hidden rounded-2xl border border-[#4a425c] bg-[#3a324f] shadow-lg">
                    <button
                      type="button"
                      className="block w-full px-3.5 py-2.5 text-left text-sm text-ink hover:bg-[#3f3654]"
                      onClick={() => {
                        setMenuOpen(false);
                        onUpdateProgress();
                      }}
                    >
                      Update progress
                    </button>
                    <button
                      type="button"
                      className="block w-full px-3.5 py-2.5 text-left text-sm text-ink hover:bg-[#3f3654]"
                      onClick={() => {
                        setMenuOpen(false);
                        onPause();
                      }}
                    >
                      Pause
                    </button>
                    <button
                      type="button"
                      className="block w-full px-3.5 py-2.5 text-left text-sm text-ink hover:bg-[#3f3654]"
                      onClick={() => {
                        setMenuOpen(false);
                        onFinished();
                      }}
                    >
                      Finished
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Streak + goal */}
      <section className="rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f] p-4 shadow-[0_6px_20px_rgba(42,36,56,0.05)] sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/70 uppercase">
              Reading Streak
            </h2>
            <p className="mt-1 font-serif text-2xl font-semibold text-ink">
              {streakDays} days{" "}
              <span className="text-base font-medium text-muted">
                / Keep it going!
              </span>
            </p>
          </div>
          <FlameIcon className="h-7 w-7 text-[#e07a3a]" />
        </div>
        <div className="mt-4 flex justify-between gap-1">
          {WEEK.map((d, i) => {
            const done = i < Math.min(6, streakDays);
            const today = i === 5;
            return (
              <div
                key={`${d}-${i}`}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[0.7rem] font-bold ${
                    done || today
                      ? "bg-forest text-paper"
                      : "border border-[#564d6a] bg-transparent text-muted-soft"
                  }`}
                >
                  {done || today ? "✓" : ""}
                </span>
                <span className="text-[0.65rem] font-medium text-muted">{d}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-[#564d6a] pt-4">
          <h2 className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/70 uppercase">
            Today&apos;s Goal
          </h2>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="font-serif text-lg font-semibold text-ink">
              Read for {todayGoalMins} minutes
            </p>
            <PlantIcon className="h-8 w-8 text-ink/80" />
          </div>
          <div className="mt-3">
            <div className="mb-1.5 flex justify-between text-[0.72rem] text-muted">
              <span>
                {todayDoneMins}/{todayGoalMins} mins
              </span>
              <span className="font-semibold text-ink">{todayPct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#564d6a]">
              <div
                className="h-full rounded-full bg-forest-soft"
                style={{ width: `${todayPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f] p-4 shadow-[0_6px_20px_rgba(42,36,56,0.05)] sm:p-5">
        <h2 className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/70 uppercase">
          Quick Actions
        </h2>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="flex flex-col items-center gap-2 rounded-xl px-1 py-2 text-center transition hover:bg-[#3f3654]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#564d6a] bg-[#342c45] text-ink shadow-sm">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[0.62rem] leading-tight font-semibold text-ink">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Upcoming */}
      <section className="rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f] p-4 shadow-[0_6px_20px_rgba(42,36,56,0.05)] sm:p-5">
        <h2 className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/70 uppercase">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No buddy reads or parties yet — invite a friend when you&apos;re ready.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {upcoming.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 rounded-xl bg-[#3f3654]/80 px-3 py-2.5"
              >
                {u.bookCover ? (
                  <span
                    className="relative h-11 w-8 shrink-0 overflow-hidden rounded-md"
                    style={{ background: u.bookColor }}
                  >
                    <Image
                      src={u.bookCover}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </span>
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3f3654] text-ink">
                    <PeopleIcon className="h-4 w-4" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {u.title}
                  </span>
                  <span className="block truncate text-[0.72rem] text-muted">
                    {u.subtitle}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* This month */}
      <section className="rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f] p-4 shadow-[0_6px_20px_rgba(42,36,56,0.05)] sm:p-5">
        <h2 className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/70 uppercase">
          This Month
        </h2>
        <p className="mt-2 text-sm leading-snug text-ink/80">
          You&apos;ve finished{" "}
          <strong className="font-semibold">{month.booksFinished} books</strong>{" "}
          in about{" "}
          <strong className="font-semibold">{month.hoursRead}h</strong>
          {month.avgRating > 0 ? (
            <>
              {" "}
              — averaging{" "}
              <strong className="font-semibold">{month.avgRating}★</strong>
            </>
          ) : null}
          . Soft, steady month.
        </p>
        <div className="mt-3 space-y-2.5">
          <StatRow
            icon={BookIcon}
            value={String(month.booksFinished)}
            label="Books read"
          />
          <StatRow
            icon={ClockIcon}
            value={String(month.hoursRead)}
            label="Hours read"
          />
          <StatRow
            icon={StarIcon}
            value={month.avgRating ? String(month.avgRating) : "—"}
            label="Avg. rating"
          />
        </div>
        <Link
          href="/insights"
          className="mt-4 inline-block text-sm font-semibold text-ink underline-offset-2 hover:underline"
        >
          View Insights →
        </Link>
      </section>

      {readingEra ? (
        <section className="rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f] p-4 shadow-[0_6px_20px_rgba(42,36,56,0.05)] sm:p-5">
          <h2 className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/70 uppercase">
            Reading Era
          </h2>
          <p className="mt-2 font-serif text-lg font-semibold text-ink">
            {readingEra.title}
          </p>
          <p className="mt-1 text-sm text-muted">{readingEra.blurb}</p>
        </section>
      ) : null}
    </aside>
  );
}
