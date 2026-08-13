"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/layout/app-nav";
import { getDashboardState, saveOnboardingState } from "@/lib/onboarding-storage";
import {
  addToTbr,
  loadDiscoveryState,
  listProgress,
  toggleSavedList,
} from "@/lib/discovery-storage";
import type { DiscoveryState } from "@/components/search/types";
import { getBookById, DISCOVER_LISTS } from "@/components/search/data";
import { ToastProvider, useToast } from "@/components/search/toast";
import { buildBadges } from "@/components/insights/badges";
import { buildPeriodSnapshot } from "@/components/insights/calculate";
import { loadGameProfile } from "@/components/games/hub/storage";
import type { GameProfile } from "@/components/games/hub/types";
import { QuizFlow } from "@/components/personality/quiz-flow";
import { getPersonality, formatPersonalityCode } from "@/components/personality/personalities";
import { PersonalityResultCard } from "@/components/personality/result-card";
import { PersonalityShelfBridge } from "@/components/ai/personality-shelf";
import {
  ensureDemoPersonalitySeed,
  loadActiveAssessment,
  updateActiveVisibility,
} from "@/components/personality/quiz-storage";
import type { PersonalityAssessment } from "@/components/personality/types";
import {
  buildSelectableBadges,
  resolveFeaturedBadges,
} from "./featured-badges";
import {
  createOwnerList,
  loadProfileState,
  saveProfileState,
  updateProfile,
} from "./profile-storage";
import type { ProfileState, ProfileTab, RecommendedList } from "./types";
import { CreateListModal } from "./create-list-modal";
import { EditProfileModal } from "./edit-profile-modal";
import { FeaturedBadgesModal } from "./featured-badges-modal";
import { FollowersModal } from "./followers-modal";
import { BuddyReadModal } from "./buddy-read-modal";
import { ProfileHero } from "./profile-hero";

export function ProfilePageView() {
  return (
    <ToastProvider>
      <ProfilePageInner />
    </ToastProvider>
  );
}

function ProfilePageInner() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const aiParam = searchParams.get("ai");
  const [ready, setReady] = useState(false);
  const [profileState, setProfileState] = useState<ProfileState | null>(null);
  const [discovery, setDiscovery] = useState<DiscoveryState | null>(null);
  const [assessment, setAssessment] = useState<PersonalityAssessment | null>(
    null,
  );
  const [tab, setTab] = useState<ProfileTab>("overview");
  const [quizOpen, setQuizOpen] = useState(false);
  const [viewAssessment, setViewAssessment] =
    useState<PersonalityAssessment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [followersOpen, setFollowersOpen] = useState<
    null | "followers" | "following"
  >(null);
  const [buddyOpen, setBuddyOpen] = useState(false);
  const [listDetail, setListDetail] = useState<RecommendedList | null>(null);
  const [createListOpen, setCreateListOpen] = useState(false);
  const [badgesPickerOpen, setBadgesPickerOpen] = useState(false);
  const [gameProfile, setGameProfile] = useState<GameProfile | null>(null);
  const [goalTarget, setGoalTarget] = useState(24);

  function refreshIdentity() {
    ensureDemoPersonalitySeed();
    setAssessment(loadActiveAssessment());
    const ps = loadProfileState();
    const dash = getDashboardState();
    // Keep avatar/pet aligned with onboarding
    const synced = updateProfile(ps, {
      displayName: dash.displayName.trim() || ps.profile.displayName,
      avatarId:
        dash.avatar === "male" ||
        dash.avatar === "female" ||
        dash.avatar === "custom"
          ? dash.avatar
          : ps.profile.avatarId,
      avatarImage: dash.avatarImage ?? ps.profile.avatarImage ?? null,
      shelfPetId: dash.pet ?? ps.profile.shelfPetId,
      petName: dash.petName.trim() || ps.profile.petName,
    });
    setProfileState(synced);
    setDiscovery(loadDiscoveryState());
    setGameProfile(loadGameProfile());
    const booksGoal = dash.goals.books;
    setGoalTarget(
      booksGoal.enabled && booksGoal.value > 0 ? booksGoal.value : 50,
    );
    setReady(true);
  }

  useEffect(() => {
    refreshIdentity();
  }, []);

  useEffect(() => {
    if (aiParam !== "shelf") return;
    window.setTimeout(() => {
      document
        .getElementById("ai-personality-shelf")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
  }, [aiParam, ready]);

  const goalYear = 2026;

  const snap = useMemo(() => {
    if (!discovery) return null;
    return buildPeriodSnapshot(discovery, "month");
  }, [discovery]);

  const yearSnap = useMemo(() => {
    if (!discovery) return null;
    return buildPeriodSnapshot(discovery, "year", goalYear);
  }, [discovery]);

  const badges = useMemo(() => {
    if (!discovery || !snap) return [];
    return buildBadges(discovery, snap);
  }, [discovery, snap]);

  const selectableBadges = useMemo(
    () => buildSelectableBadges(badges, gameProfile),
    [badges, gameProfile],
  );

  const featuredBadges = useMemo(
    () =>
      resolveFeaturedBadges(
        profileState?.profile.featuredBadgeIds,
        selectableBadges,
      ),
    [profileState?.profile.featuredBadgeIds, selectableBadges],
  );

  if (!ready || !profileState || !discovery) {
    return (
      <div className="min-h-screen max-w-[100vw] overflow-x-clip bg-[#2a2438]">
        <AppNav />
        <main className="mx-auto max-w-[1440px] px-4 py-16 text-center text-muted">
          Loading profile…
        </main>
      </div>
    );
  }

  const profile = profileState.profile;
  const personality =
    assessment?.addedToProfile && profile.privacy.readingPersonalityPublic
      ? getPersonality(assessment.personalityCode)
      : null;
  const readingEntry = discovery.entries.find((e) => e.status === "reading");
  const readingBook = readingEntry
    ? getBookById(readingEntry.bookId)
    : null;
  const favorites = profile.favoriteBookIds
    .map((id) => getBookById(id))
    .filter(Boolean);
  const recentReads = discovery.entries
    .filter((e) => e.status === "read")
    .sort((a, b) =>
      (b.dateFinished ?? b.dateUpdated).localeCompare(
        a.dateFinished ?? a.dateUpdated,
      ),
    )
    .slice(0, 8);

  const goalCurrent = yearSnap?.booksFinished.value ?? 0;

  const topGenre = yearSnap?.genreShare[0] ?? snap?.genreShare[0];
  const monthsElapsed = Math.max(
    1,
    new Date().getMonth() + 1, // 1–12; demo year 2026
  );
  const pace =
    Math.round(((yearSnap?.booksFinished.value ?? 0) / monthsElapsed) * 10) /
    10;
  const nightOwl = badges.find((b) => b.id === "night-owl");
  const eraChips = [
    topGenre ? `${topGenre.genre} ${topGenre.share}%` : "Fantasy 48%",
    `${pace > 0 ? pace : 2.4} books/mo`,
    nightOwl?.earned || (snap && snap.timeOfDay.evening + snap.timeOfDay.lateNight >= 50)
      ? "Night Owl"
      : "Steady Pace",
  ];

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "lists", label: "Lists" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-clip bg-cream text-ink">
      <AppNav />
      <main className="mx-auto w-full max-w-[1440px] overflow-x-clip px-4 py-6 sm:px-6 lg:px-8">
        <ProfileHero
          profile={profile}
          personality={
            personality
              ? {
                  emoji: personality.emoji,
                  name: personality.name,
                  code: personality.code,
                }
              : null
          }
          goal={{
            year: goalYear,
            current: goalCurrent,
            target: goalTarget,
          }}
          readingEra={
            profile.privacy.readingEraPublic
              ? {
                  title: profile.readingEra.title,
                  blurb: profile.readingEra.blurb,
                  chips: eraChips,
                }
              : null
          }
          featuredBadges={featuredBadges}
          isOwner
          onEdit={() => setEditOpen(true)}
          onEditGoal={(target) => {
            const dash = getDashboardState();
            saveOnboardingState({
              ...dash,
              goals: {
                ...dash.goals,
                books: { enabled: true, value: target },
                noPressure: false,
              },
            });
            setGoalTarget(target);
            toast({ text: `2026 goal set to ${target} books` });
          }}
          onChooseBadges={() => setBadgesPickerOpen(true)}
          onFollowers={setFollowersOpen}
          onBuddy={() => setBuddyOpen(true)}
        />

        {/* Tabs */}
        <div
          className="mt-6 flex max-w-full gap-1 overflow-x-auto overscroll-x-contain border-b border-line [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Profile sections"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition ${
                tab === t.id
                  ? "text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
              {tab === t.id ? (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-forest" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-6" role="tabpanel">
          {tab === "overview" && (
            <div className="min-w-0 space-y-6">
              <div className="grid min-w-0 gap-5 lg:grid-cols-2">
                <Section title="Currently reading" eyebrow>
                  {readingBook && readingEntry ? (
                    <div className="flex min-w-0 items-start gap-4">
                      <Cover src={readingBook.cover} className="w-20 sm:w-24" />
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-lg font-semibold text-ink">
                          {readingBook.title}
                        </p>
                        <p className="text-sm text-muted">{readingBook.author}</p>
                        <p className="mt-3 text-sm font-semibold text-ink">
                          {readingEntry.progressPct ?? 0}%
                        </p>
                        <div className="mt-1.5 h-2 max-w-[12rem] overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full rounded-full bg-forest"
                            style={{
                              width: `${readingEntry.progressPct ?? 0}%`,
                            }}
                          />
                        </div>
                        <Link
                          href={`/books/${readingBook.id}`}
                          className="mt-4 inline-flex text-sm font-semibold text-forest-soft underline-offset-2 hover:underline"
                        >
                          Continue reading →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <EmptyOwner text="Nothing currently reading — pick up a book from your Library." />
                  )}

                  <div className="mt-6 min-w-0 border-t border-[#4a425c]/80 pt-5">
                    <div className="mb-3 flex items-end justify-between gap-3">
                      <h3 className="text-[0.72rem] font-semibold tracking-[0.14em] text-muted uppercase">
                        Recent reads
                      </h3>
                      <Link
                        href="/library"
                        className="shrink-0 text-sm font-semibold text-forest-soft underline-offset-2 hover:underline"
                      >
                        View all →
                      </Link>
                    </div>
                    <div className="flex max-w-full items-start gap-3 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {recentReads.length === 0 ? (
                        <EmptyOwner text="No finished books yet." />
                      ) : (
                        recentReads.map((e) => {
                          const b = getBookById(e.bookId);
                          if (!b) return null;
                          return (
                            <Link
                              key={e.bookId}
                              href={`/books/${b.id}`}
                              className="flex w-24 shrink-0 flex-col"
                            >
                              <Cover src={b.cover} className="w-24" />
                              <p className="mt-1.5 text-center text-[0.65rem] text-gold">
                                {e.rating
                                  ? "★".repeat(e.rating) +
                                    "☆".repeat(Math.max(0, 5 - e.rating))
                                  : "—"}
                              </p>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="mt-5 min-w-0">
                    <div className="mb-3 flex items-end justify-between gap-3">
                      <h3 className="text-[0.72rem] font-semibold tracking-[0.14em] text-muted uppercase">
                        Favorites
                      </h3>
                      <Link
                        href="/library"
                        className="shrink-0 text-sm font-semibold text-forest-soft underline-offset-2 hover:underline"
                      >
                        View all →
                      </Link>
                    </div>
                    <div className="flex max-w-full items-start gap-3 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {favorites.length === 0 ? (
                        <EmptyOwner text="Pin favorites from your library." />
                      ) : (
                        favorites.map((b) =>
                          b ? (
                            <Link
                              key={b.id}
                              href={`/books/${b.id}`}
                              className="flex w-28 shrink-0 flex-col sm:w-32"
                            >
                              <Cover
                                src={b.cover}
                                className="w-28 sm:w-32"
                              />
                              <p className="mt-2 line-clamp-2 text-xs text-muted">
                                {b.title}
                              </p>
                            </Link>
                          ) : null,
                        )
                      )}
                    </div>
                  </div>
                </Section>

                <Section title="Reader identity" eyebrow>
                  {personality && assessment ? (
                    <div>
                      <PersonalityResultCard
                        code={personality.code}
                        name={personality.name}
                        size="reveal"
                        showDownload
                        tone="light"
                        className="mb-4"
                      />
                      <p className="font-serif text-xl font-semibold text-ink">
                        <span className="mr-1.5" aria-hidden>
                          {personality.emoji}
                        </span>
                        {personality.name}{" "}
                        <span className="font-sans text-sm font-semibold tracking-wide text-muted">
                          {formatPersonalityCode(personality.code)}
                        </span>
                      </p>
                      <p className="mt-3 font-serif text-base italic text-ink/90">
                        &ldquo;{personality.motto}&rdquo;
                      </p>
                      <div id="ai-personality-shelf">
                        <PersonalityShelfBridge
                          personalityLabel={`${personality.name} (${formatPersonalityCode(personality.code)}): ${personality.summary}`}
                        />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                        <button
                          type="button"
                          className="text-sm font-semibold text-forest-soft underline-offset-2 hover:underline"
                          onClick={() => {
                            setViewAssessment(assessment);
                            setQuizOpen(true);
                          }}
                        >
                          View personality →
                        </button>
                        <button
                          type="button"
                          className="text-sm font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
                          onClick={() => {
                            setViewAssessment(null);
                            setQuizOpen(true);
                          }}
                        >
                          Retake test
                        </button>
                        <Link
                          href="/insights"
                          className="text-sm font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
                        >
                          Explore Reader DNA →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <InviteQuiz
                        onTake={() => {
                          setViewAssessment(null);
                          setQuizOpen(true);
                        }}
                      />
                      <Link
                        href="/insights"
                        className="mt-3 inline-flex text-sm font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
                      >
                        Explore Reader DNA →
                      </Link>
                    </div>
                  )}
                </Section>
              </div>
            </div>
          )}

          {tab === "lists" && (
            <ListsTab
              lists={profileState.lists}
              discovery={discovery}
              detail={listDetail}
              onDetail={setListDetail}
              onCreateList={() => setCreateListOpen(true)}
              onSave={(list) => {
                const next = toggleSavedList(discovery, list.id);
                setDiscovery(next);
                toast({
                  text: next.savedListIds.includes(list.id)
                    ? `Saved “${list.title}”`
                    : `Removed “${list.title}”`,
                });
              }}
              onAddAll={(list) => {
                let next = discovery;
                list.books.forEach((b) => {
                  next = addToTbr(next, {
                    bookId: b.bookId,
                    priority: "someday",
                    note: b.note,
                    sourceType: "reading_list",
                    sourceName: list.title,
                    sourceUser: profile.username,
                  });
                });
                setDiscovery(next);
                toast({
                  text: `Added ${list.books.length} books to TBR from “${list.title}”`,
                  actionHref: "/library",
                  actionLabel: "Library",
                });
              }}
              onAddOne={(list, bookId, note) => {
                const next = addToTbr(discovery, {
                  bookId,
                  priority: "someday",
                  note,
                  sourceType: "reading_list",
                  sourceName: list.title,
                  sourceUser: profile.username,
                });
                setDiscovery(next);
                toast({ text: "Added to TBR with list attribution" });
              }}
            />
          )}

          {tab === "activity" && (
            <Section title="Activity">
              {profile.privacy.activityPublic ? (
                <ul className="space-y-3">
                  {profileState.activity.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-[1.1rem] border border-[#4a425c] bg-paper/50 px-4 py-3"
                    >
                      <p className="font-semibold text-ink">{a.text}</p>
                      {a.detail ? (
                        <p className="text-sm text-muted">{a.detail}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-soft">
                        {new Date(a.at).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">
                  Activity is private. Toggle it in Edit Profile.
                </p>
              )}
            </Section>
          )}
        </div>
      </main>

      <QuizFlow
        open={quizOpen}
        onClose={() => {
          setQuizOpen(false);
          setViewAssessment(null);
          setAssessment(loadActiveAssessment());
        }}
        onComplete={(a) => {
          setAssessment(a);
          toast({ text: `${getPersonality(a.personalityCode).emoji} Added to your profile` });
        }}
        followingIds={discovery.followingIds}
        viewAssessment={viewAssessment}
      />

      <EditProfileModal
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSave={(patch) => {
          const next = updateProfile(profileState, patch);
          setProfileState(next);
          // Sync display name / avatar / pet to onboarding for Dashboard consistency
          const dash = getDashboardState();
          saveOnboardingState({
            ...dash,
            displayName: next.profile.displayName,
            avatar: next.profile.avatarId,
            avatarImage: next.profile.avatarImage ?? null,
            pet: next.profile.shelfPetId as typeof dash.pet,
            petName: next.profile.petName,
          });
          if (patch.privacy?.readingPersonalityPublic != null) {
            updateActiveVisibility(patch.privacy.readingPersonalityPublic);
            setAssessment(loadActiveAssessment());
          }
          toast({ text: "Profile updated" });
          setEditOpen(false);
        }}
      />

      <FeaturedBadgesModal
        open={badgesPickerOpen}
        options={selectableBadges}
        selectedIds={profile.featuredBadgeIds}
        onClose={() => setBadgesPickerOpen(false)}
        onSave={(ids) => {
          const next = updateProfile(profileState, { featuredBadgeIds: ids });
          setProfileState(next);
          setBadgesPickerOpen(false);
          toast({ text: "Featured badges updated" });
        }}
      />

      <CreateListModal
        open={createListOpen}
        onClose={() => setCreateListOpen(false)}
        onCreate={(input) => {
          const next = createOwnerList(profileState, input);
          setProfileState(next);
          setCreateListOpen(false);
          setListDetail(next.lists[0] ?? null);
          toast({
            text: `Created “${input.title.trim()}”`,
          });
        }}
      />

      <FollowersModal
        open={followersOpen != null}
        mode={followersOpen ?? "followers"}
        people={
          followersOpen === "following"
            ? profileState.followingPeople
            : profileState.followerPeople
        }
        onClose={() => setFollowersOpen(null)}
      />

      <BuddyReadModal
        open={buddyOpen}
        friends={profileState.followingPeople}
        discovery={discovery}
        onClose={() => setBuddyOpen(false)}
        onSend={(payload) => {
          const next = {
            ...profileState,
            profile: {
              ...profileState.profile,
              buddyReads: [
                {
                  id: `br-${Date.now()}`,
                  ...payload,
                  createdBy: "me" as const,
                  myProgress: 0,
                  friendProgress: 0,
                  status: "pending" as const,
                },
                ...profileState.profile.buddyReads,
              ],
            },
          };
          saveProfileState(next);
          setProfileState(next);
          toast({ text: `Buddy read invite sent to ${payload.friendName} (simulated)` });
          setBuddyOpen(false);
        }}
      />

    </div>
  );
}

function Section({
  title,
  children,
  eyebrow,
}: {
  title: string;
  children: React.ReactNode;
  eyebrow?: boolean;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[1.5rem] border border-line bg-paper p-4 sm:p-5">
      <h2
        className={
          eyebrow
            ? "text-[0.72rem] font-semibold tracking-[0.14em] text-muted uppercase"
            : "font-serif text-xl font-semibold text-ink"
        }
      >
        {title}
      </h2>
      <div className="mt-3 min-w-0">{children}</div>
    </section>
  );
}

function Cover({
  src,
  className = "w-16",
}: {
  src: string;
  /** Fixed width + aspect-[2/3]; img is absolute so intrinsic ratio cannot stretch the frame. */
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[2/3] shrink-0 overflow-hidden rounded-md border border-line bg-line shadow-sm ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );
}

function EmptyOwner({ text }: { text: string }) {
  return <p className="text-sm text-muted">{text}</p>;
}

function InviteQuiz({ onTake }: { onTake: () => void }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-[#564d6a] bg-[#342c45] px-4 py-5 text-center">
      <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
        Discover your Reading Personality
      </p>
      <p className="mt-2 font-serif text-xl font-semibold text-ink">
        What kind of reader are you?
      </p>
      <p className="mt-1 text-sm text-muted">32 questions · About 5 minutes</p>
      <button
        type="button"
        onClick={onTake}
        className="mt-4 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper"
      >
        Take the Quiz
      </button>
    </div>
  );
}

function ListsTab({
  lists,
  discovery,
  detail,
  onDetail,
  onCreateList,
  onSave,
  onAddAll,
  onAddOne,
}: {
  lists: RecommendedList[];
  discovery: DiscoveryState;
  detail: RecommendedList | null;
  onDetail: (l: RecommendedList | null) => void;
  onCreateList: () => void;
  onSave: (l: RecommendedList) => void;
  onAddAll: (l: RecommendedList) => void;
  onAddOne: (l: RecommendedList, bookId: string, note: string) => void;
}) {
  if (detail) {
    const progress = listProgress(
      discovery,
      detail.books.map((b) => b.bookId),
    );
    return (
      <div>
        <button
          type="button"
          className="text-sm font-semibold text-ink underline"
          onClick={() => onDetail(null)}
        >
          ← All lists
        </button>
        <h2 className="mt-3 font-serif text-2xl font-semibold text-ink">
          {detail.title}
        </h2>
        <p className="mt-1 text-sm text-muted">{detail.description}</p>
        <p className="mt-2 text-xs text-muted">
          {detail.books.length} books · {detail.saveCount.toLocaleString()} saves
          · You&apos;ve read {progress.read} of {detail.books.length}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSave(detail)}
            className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper"
          >
            {discovery.savedListIds.includes(detail.id) ? "Saved ✓" : "Save List"}
          </button>
          <button
            type="button"
            onClick={() => onAddAll(detail)}
            className="rounded-full bg-[#3f3654] px-4 py-2 text-sm font-semibold text-ink"
          >
            Add All to TBR
          </button>
        </div>
        <ul className="mt-5 space-y-3">
          {detail.books.map((item) => {
            const book = getBookById(item.bookId);
            if (!book) return null;
            return (
              <li
                key={item.bookId}
                className="flex gap-3 rounded-[1.1rem] border border-[#4a425c] bg-[#3a324f] p-3"
              >
                <Cover src={book.cover} className="w-10" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{book.title}</p>
                  <p className="text-sm italic text-muted">&ldquo;{item.note}&rdquo;</p>
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-ink underline"
                    onClick={() => onAddOne(detail, item.bookId, item.note)}
                  >
                    Add to TBR
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const totalSaves = lists.reduce((s, l) => s + l.saveCount, 0);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Your lists · {totalSaves.toLocaleString()} total saves ·{" "}
          {lists.reduce((s, l) => s + l.completionCount, 0)} books completed from
          your recommendations
        </p>
        <button
          type="button"
          onClick={onCreateList}
          className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper hover:bg-forest-deep"
        >
          + Create list
        </button>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        <li>
          <button
            type="button"
            onClick={onCreateList}
            className="flex h-full min-h-[9.5rem] w-full flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-[#6a6280] bg-[#342c45]/80 p-4 text-center transition hover:border-forest/50 hover:bg-[#3a324f]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6a6280] text-xl font-semibold text-ink">
              +
            </span>
            <span className="mt-3 font-serif text-lg font-semibold text-ink">
              Create a new list
            </span>
            <span className="mt-1 text-sm text-muted">
              Title, vibe, and books you want to recommend
            </span>
          </button>
        </li>
        {lists.map((list) => (
          <li key={list.id}>
            <button
              type="button"
              onClick={() => onDetail(list)}
              className="h-full w-full rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f] p-4 text-left hover:border-forest/40"
            >
              <p className="font-serif text-lg font-semibold text-ink">
                {list.title}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">
                {list.description}
              </p>
              <p className="mt-3 text-xs text-muted">
                {list.books.length} books · {list.saveCount.toLocaleString()}{" "}
                saves
                {list.visibility === "private" ? " · Private" : ""}
              </p>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <h3 className="font-serif text-lg font-semibold text-ink">
          From Discover
        </h3>
        <ul className="mt-2 space-y-2">
          {DISCOVER_LISTS.slice(0, 3).map((l) => (
            <li key={l.id} className="text-sm text-muted">
              {l.title} · {l.saveCount.toLocaleString()} saves
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
