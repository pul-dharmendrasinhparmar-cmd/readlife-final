"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { resolveAvatarImage } from "@/components/onboarding/data";
import { formatPersonalityCode } from "@/components/personality/personalities";
import type { FeaturedBadgeOption } from "./featured-badges";
import type { UserProfile } from "./types";

const PET_EMOJI: Record<string, string> = {
  bookwyrm: "🐉",
  mimic: "📦",
  ghost: "👻",
  owl: "🦉",
  crow: "🐦‍⬛",
  cat: "🐱",
};

type Goal = {
  year: number;
  current: number;
  target: number;
};

type ReadingEra = {
  title: string;
  blurb: string;
  chips: string[];
};

type Props = {
  profile: UserProfile;
  personality: { emoji: string; name: string; code?: string } | null;
  goal: Goal;
  readingEra?: ReadingEra | null;
  featuredBadges?: FeaturedBadgeOption[];
  isOwner: boolean;
  onEdit: () => void;
  onEditGoal?: (target: number) => void;
  onChooseBadges?: () => void;
  onFollowers: (mode: "followers" | "following") => void;
  onFollow?: () => void;
  following?: boolean;
  onBuddy?: () => void;
};

export function ProfileHero({
  profile,
  personality,
  goal,
  readingEra = null,
  featuredBadges = [],
  isOwner,
  onEdit,
  onEditGoal,
  onChooseBadges,
  onFollowers,
  onFollow,
  following,
  onBuddy,
}: Props) {
  const avatar = resolveAvatarImage(profile.avatarId);
  const petEmoji = PET_EMOJI[profile.shelfPetId] ?? "✨";
  const [editingGoal, setEditingGoal] = useState(false);
  const [draftTarget, setDraftTarget] = useState(String(goal.target));

  useEffect(() => {
    if (!editingGoal) setDraftTarget(String(goal.target));
  }, [goal.target, editingGoal]);

  const pct =
    goal.target > 0
      ? Math.min(100, Math.round((goal.current / goal.target) * 100))
      : 0;

  function saveGoal() {
    const next = Math.round(Number(draftTarget));
    if (!Number.isFinite(next) || next < 1) return;
    const clamped = Math.min(500, Math.max(1, next));
    onEditGoal?.(clamped);
    setEditingGoal(false);
  }

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-line bg-gradient-to-br from-paper via-cream to-[#322a45] p-5 sm:p-7">
      <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-forest/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
          <button
            type="button"
            onClick={isOwner ? onEdit : undefined}
            disabled={!isOwner}
            className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-line shadow-lg sm:h-32 sm:w-32"
            aria-label={isOwner ? "Edit avatar" : undefined}
          >
            <Image
              src={avatar}
              alt=""
              fill
              className="object-cover object-top"
              sizes="128px"
            />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {profile.displayName}
              </h1>
              <span
                className="text-2xl leading-none"
                title={profile.petName}
                aria-label={`Shelf pet: ${profile.petName}`}
              >
                {petEmoji}
              </span>
            </div>
            <p className="mt-0.5 text-muted">@{profile.username}</p>

            {personality ? (
              <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-cream-card px-3 py-1 text-sm font-semibold text-ink">
                <span aria-hidden>{personality.emoji}</span>
                <span>{personality.name}</span>
                {personality.code ? (
                  <span className="font-sans text-xs font-semibold tracking-wide text-muted">
                    {formatPersonalityCode(personality.code)}
                  </span>
                ) : null}
              </p>
            ) : null}

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/85">
              {profile.bio}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <button
                type="button"
                className="font-semibold text-ink underline-offset-2 hover:underline"
                onClick={() => onFollowers("followers")}
              >
                {profile.followersCount.toLocaleString()} followers
              </button>
              <span className="text-muted-soft" aria-hidden>
                ·
              </span>
              <button
                type="button"
                className="font-semibold text-ink underline-offset-2 hover:underline"
                onClick={() => onFollowers("following")}
              >
                {profile.followingCount.toLocaleString()} following
              </button>
            </div>

            <FeaturedBadgesStrip
              badges={featuredBadges}
              isOwner={isOwner}
              onChoose={onChooseBadges}
            />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2.5 lg:w-[220px] xl:w-[236px]">
          <div className="rounded-[1.15rem] border border-line/80 bg-cream-card/80 px-3.5 py-3 shadow-[0_8px_24px_rgba(20,16,30,0.25)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.62rem] font-semibold tracking-[0.14em] text-muted uppercase">
                {goal.year} Goal
              </p>
              {isOwner && onEditGoal && !editingGoal ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraftTarget(String(goal.target));
                    setEditingGoal(true);
                  }}
                  className="text-[0.65rem] font-semibold text-forest-soft underline-offset-2 hover:underline"
                >
                  Edit
                </button>
              ) : null}
            </div>

            {editingGoal ? (
              <div className="mt-1.5">
                <p className="font-serif text-lg font-semibold text-ink">
                  {goal.current} /{" "}
                  <label className="sr-only" htmlFor="profile-goal-target">
                    Books goal target
                  </label>
                  <input
                    id="profile-goal-target"
                    type="number"
                    min={1}
                    max={500}
                    inputMode="numeric"
                    value={draftTarget}
                    onChange={(e) => setDraftTarget(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveGoal();
                      if (e.key === "Escape") setEditingGoal(false);
                    }}
                    className="inline-block w-14 rounded-lg border border-line bg-paper px-1.5 py-0.5 text-center font-serif text-lg font-semibold text-ink outline-none focus:border-forest"
                    autoFocus
                  />{" "}
                  <span className="text-sm font-medium text-muted">books</span>
                </p>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingGoal(false)}
                    className="flex-1 rounded-full border border-line bg-paper py-1 text-[0.65rem] font-semibold text-ink transition hover:bg-cream"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveGoal}
                    disabled={
                      !Number.isFinite(Number(draftTarget)) ||
                      Number(draftTarget) < 1
                    }
                    className="flex-1 rounded-full bg-forest py-1 text-[0.65rem] font-semibold text-paper transition hover:bg-forest-deep disabled:opacity-40"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-1 font-serif text-lg font-semibold leading-tight text-ink">
                  {goal.current} / {goal.target}{" "}
                  <span className="text-sm font-medium text-muted">books</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line/70">
                  <div
                    className="h-full rounded-full bg-forest transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs font-semibold text-forest-soft">
                  {pct}%
                </p>
              </>
            )}
          </div>

          {readingEra ? (
            <div className="rounded-[1.15rem] border border-line/80 bg-cream-card/80 px-3.5 py-3 shadow-[0_8px_24px_rgba(20,16,30,0.25)]">
              <p className="text-[0.62rem] font-semibold tracking-[0.14em] text-muted uppercase">
                Your reading era
              </p>
              <p className="mt-1 font-serif text-base font-semibold leading-snug text-ink">
                ✨ {readingEra.title}
              </p>
              <p className="mt-1 text-[0.75rem] leading-snug text-muted">
                {readingEra.blurb}
              </p>
              {readingEra.chips.length > 0 ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {readingEra.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-line bg-paper/70 px-2 py-0.5 text-[0.62rem] font-semibold text-ink"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2">
            {isOwner ? (
              <>
                {onBuddy ? (
                  <button
                    type="button"
                    onClick={onBuddy}
                    className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:bg-cream-card"
                  >
                    Read with friends
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-full bg-forest px-4 py-1.5 text-xs font-semibold text-paper transition hover:bg-forest-deep"
                >
                  Edit profile
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onFollow}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  following
                    ? "bg-cream-card text-ink"
                    : "bg-forest text-paper hover:bg-forest-deep"
                }`}
              >
                {following ? "Following ✓" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedBadgesStrip({
  badges,
  isOwner,
  onChoose,
}: {
  badges: FeaturedBadgeOption[];
  isOwner: boolean;
  onChoose?: () => void;
}) {
  if (!isOwner && badges.length === 0) return null;

  return (
    <div className="mt-4 max-w-md">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.62rem] font-semibold tracking-[0.14em] text-muted uppercase">
          Featured badges
        </p>
        {isOwner && onChoose ? (
          <button
            type="button"
            onClick={onChoose}
            className="text-[0.65rem] font-semibold text-forest-soft underline-offset-2 hover:underline"
          >
            Choose badges
          </button>
        ) : null}
      </div>

      {badges.length > 0 ? (
        <ul
          className={`mt-2.5 grid w-fit gap-2 ${
            badges.length <= 3 ? "grid-cols-3" : "grid-cols-4"
          }`}
        >
          {badges.map((badge) => (
            <li key={badge.id} className="w-[4.5rem]">
              <div
                className="flex aspect-square flex-col items-center justify-center rounded-xl border border-line/80 bg-cream-card/70 p-1.5 shadow-[0_6px_18px_rgba(20,16,30,0.2)]"
                style={{
                  borderColor: `${badge.accent}66`,
                  background: `linear-gradient(165deg, ${badge.accent}18, rgba(58,50,79,0.72) 55%)`,
                }}
                title={badge.name}
              >
                {badge.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={badge.image}
                    alt={badge.name}
                    width={72}
                    height={72}
                    className="h-full max-h-[3.25rem] w-auto max-w-full object-contain"
                    draggable={false}
                  />
                ) : (
                  <span className="text-xl" aria-hidden>
                    {badge.emoji ?? "🏅"}
                  </span>
                )}
              </div>
              <p
                className="mt-1 line-clamp-2 text-center text-[0.58rem] font-semibold leading-tight text-ink/90"
                style={{ color: badge.accent }}
              >
                {badge.name}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <button
          type="button"
          onClick={onChoose}
          className="mt-2.5 rounded-xl border border-dashed border-line/80 bg-cream-card/40 px-3 py-4 text-center text-xs font-semibold text-muted transition hover:border-forest/40 hover:text-ink"
        >
          Choose up to 4 badges to feature
        </button>
      )}
    </div>
  );
}
