"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/layout/app-nav";
import {
  resolveAvatarImage,
  SHELF_PETS,
} from "@/components/onboarding/data";
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
import { generateReaderDna } from "@/components/insights/reader-dna";
import { QuizFlow } from "@/components/personality/quiz-flow";
import { getPersonality } from "@/components/personality/personalities";
import { scoreAnswers } from "@/components/personality/score";
import {
  ensureDemoPersonalitySeed,
  loadActiveAssessment,
  loadHistory,
  updateActiveVisibility,
} from "@/components/personality/quiz-storage";
import type { PersonalityAssessment } from "@/components/personality/types";
import { DIMENSIONS } from "@/components/personality/types";
import {
  loadProfileState,
  saveProfileState,
  updateProfile,
} from "./profile-storage";
import type { ProfileState, ProfileTab, RecommendedList } from "./types";
import { EditProfileModal } from "./edit-profile-modal";
import { FollowersModal } from "./followers-modal";
import { BuddyReadModal } from "./buddy-read-modal";

export function ProfilePageView() {
  return (
    <ToastProvider>
      <ProfilePageInner />
    </ToastProvider>
  );
}

function ProfilePageInner() {
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [profileState, setProfileState] = useState<ProfileState | null>(null);
  const [discovery, setDiscovery] = useState<DiscoveryState | null>(null);
  const [assessment, setAssessment] = useState<PersonalityAssessment | null>(
    null,
  );
  const [history, setHistory] = useState<PersonalityAssessment[]>([]);
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
  const [badgeId, setBadgeId] = useState<string | null>(null);

  function refreshIdentity() {
    ensureDemoPersonalitySeed();
    setAssessment(loadActiveAssessment());
    setHistory(loadHistory());
    const ps = loadProfileState();
    const dash = getDashboardState();
    // Keep avatar/pet aligned with onboarding
    const synced = updateProfile(ps, {
      displayName: dash.displayName.trim() || ps.profile.displayName,
      avatarId: dash.avatar === "male" ? "male" : "female",
      shelfPetId: dash.pet ?? ps.profile.shelfPetId,
      petName: dash.petName.trim() || ps.profile.petName,
    });
    setProfileState(synced);
    setDiscovery(loadDiscoveryState());
    setReady(true);
  }

  useEffect(() => {
    refreshIdentity();
  }, []);

  const snap = useMemo(() => {
    if (!discovery) return null;
    return buildPeriodSnapshot(discovery, "month");
  }, [discovery]);

  const dna = useMemo(() => {
    if (!discovery || !snap) return null;
    return generateReaderDna(discovery, snap);
  }, [discovery, snap]);

  const badges = useMemo(() => {
    if (!discovery || !snap) return [];
    return buildBadges(discovery, snap);
  }, [discovery, snap]);

  if (!ready || !profileState || !discovery) {
    return (
      <div className="min-h-screen bg-[#f3ebe0]">
        <AppNav />
        <main className="mx-auto max-w-[1440px] px-4 py-16 text-center text-muted">
          Loading profile…
        </main>
      </div>
    );
  }

  const profile = profileState.profile;
  const avatar = resolveAvatarImage(profile.avatarId);
  const pet =
    SHELF_PETS.find((p) => p.id === profile.shelfPetId) ?? SHELF_PETS[5];
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
    .slice(0, 6);
  const featuredBadges = badges.filter((b) =>
    profile.featuredBadgeIds.includes(b.id),
  );

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "books", label: "Books" },
    { id: "lists", label: "Lists" },
    { id: "identity", label: "Reading Identity" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div className="min-h-screen bg-[#f3ebe0] text-ink">
      <AppNav />
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[1.75rem] border border-[#e4d5c3] bg-gradient-to-br from-[#fbf6ee] via-[#f3ebe0] to-[#e8dcc8] p-5 sm:p-7">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#2f4a36]/10 blur-2xl" />
          <div className="flex flex-wrap items-start gap-5">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-[#dccab4] shadow-md"
              aria-label="Edit avatar"
            >
              <Image src={avatar} alt="" fill className="object-cover object-top" sizes="96px" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-3xl font-semibold text-forest sm:text-4xl">
                  {profile.displayName}
                </h1>
                <Image
                  src={pet.image}
                  alt={profile.petName}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              </div>
              <p className="text-muted">@{profile.username}</p>
              {personality ? (
                <p className="mt-2 text-sm font-semibold text-forest">
                  {personality.emoji} {personality.name} · {personality.code}
                </p>
              ) : null}
              {profile.privacy.readingEraPublic ? (
                <p className="mt-1 text-sm text-muted">
                  ✨ {profile.readingEra.title}
                </p>
              ) : null}
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forest/85">
                {profile.bio}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  className="font-semibold text-forest underline-offset-2 hover:underline"
                  onClick={() => setFollowersOpen("followers")}
                >
                  {profile.followersCount.toLocaleString()} followers
                </button>
                <button
                  type="button"
                  className="font-semibold text-forest underline-offset-2 hover:underline"
                  onClick={() => setFollowersOpen("following")}
                >
                  {profile.followingCount.toLocaleString()} following
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
                {profile.socialLinks.instagram ? (
                  <span>IG @{profile.socialLinks.instagram}</span>
                ) : null}
                {profile.socialLinks.goodreads ? (
                  <span>GR {profile.socialLinks.goodreads}</span>
                ) : null}
                {profile.socialLinks.tiktok ? (
                  <span>TT @{profile.socialLinks.tiktok}</span>
                ) : null}
                {profile.socialLinks.youtube ? (
                  <span>YT {profile.socialLinks.youtube}</span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper"
                >
                  Edit Profile
                </button>
                <Link
                  href="/home"
                  className="rounded-full bg-[#efe4d4] px-4 py-2 text-sm font-semibold text-forest"
                >
                  Enter Reading Room
                </Link>
                <button
                  type="button"
                  onClick={() => setBuddyOpen(true)}
                  className="rounded-full border border-[#e0d1bf] px-4 py-2 text-sm font-semibold text-forest"
                >
                  Read With Friends
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div
          className="mt-6 flex gap-1 overflow-x-auto border-b border-[#e4d5c3] pb-px"
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
              className={`shrink-0 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === t.id
                  ? "bg-[#fbf6ee] text-forest shadow-[0_-1px_0_#fbf6ee]"
                  : "text-muted hover:text-forest"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6" role="tabpanel">
          {tab === "overview" && (
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-5">
                <Section title="Currently reading">
                  {readingBook && readingEntry ? (
                    <div className="flex gap-3">
                      <Cover src={readingBook.cover} />
                      <div>
                        <p className="font-serif font-semibold text-forest">
                          {readingBook.title}
                        </p>
                        <p className="text-sm text-muted">{readingBook.author}</p>
                        <p className="mt-2 text-sm font-semibold text-forest">
                          {readingEntry.progressPct ?? 0}%
                        </p>
                        <div className="mt-1 h-2 w-40 overflow-hidden rounded-full bg-[#eadfce]">
                          <div
                            className="h-full bg-forest"
                            style={{
                              width: `${readingEntry.progressPct ?? 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyOwner text="Nothing currently reading — pick up a book from your Library." />
                  )}
                </Section>

                <Section title="Reader identity">
                  {personality && assessment ? (
                    <div>
                      <p className="font-serif text-xl font-semibold text-forest">
                        {personality.emoji} {personality.name}
                      </p>
                      <p className="text-sm text-muted">
                        {personality.code} · {personality.poles.join(" · ")}
                      </p>
                      <p className="mt-2 font-serif italic text-forest">
                        &ldquo;{personality.motto}&rdquo;
                      </p>
                      <button
                        type="button"
                        className="mt-3 text-sm font-semibold text-forest underline"
                        onClick={() => {
                          setViewAssessment(assessment);
                          setQuizOpen(true);
                        }}
                      >
                        View Personality
                      </button>
                    </div>
                  ) : (
                    <InviteQuiz onTake={() => { setViewAssessment(null); setQuizOpen(true); }} />
                  )}
                  {profile.privacy.readingEraPublic ? (
                    <div className="mt-4 border-t border-[#eadfce] pt-4">
                      <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-forest/65 uppercase">
                        Current reading era
                      </p>
                      <p className="mt-1 font-serif font-semibold text-forest">
                        ✨ {profile.readingEra.title}
                      </p>
                      <p className="text-sm text-muted">{profile.readingEra.blurb}</p>
                    </div>
                  ) : null}
                </Section>

                <Section title="Favorite books">
                  <div className="flex flex-wrap gap-3">
                    {favorites.map((b) =>
                      b ? (
                        <div key={b.id} className="w-16">
                          <Cover src={b.cover} />
                          <p className="mt-1 line-clamp-2 text-[0.65rem] text-muted">
                            {b.title}
                          </p>
                        </div>
                      ) : null,
                    )}
                  </div>
                </Section>

                <Section title="Recent reads">
                  <ul className="space-y-2">
                    {recentReads.map((e) => {
                      const b = getBookById(e.bookId);
                      if (!b) return null;
                      return (
                        <li key={e.bookId} className="flex items-center gap-3 text-sm">
                          <Cover src={b.cover} small />
                          <div>
                            <p className="font-semibold text-forest">{b.title}</p>
                            <p className="text-muted">
                              {e.rating ? `${"★".repeat(e.rating)}` : "Finished"}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Section>
              </div>

              <div className="space-y-5">
                <Section title="Lists preview">
                  <ul className="space-y-3">
                    {profileState.lists.slice(0, 2).map((list) => (
                      <li key={list.id}>
                        <button
                          type="button"
                          className="w-full rounded-[1.1rem] border border-[#e4d5c3] bg-white/50 px-3 py-3 text-left hover:border-forest/40"
                          onClick={() => {
                            setListDetail(list);
                            setTab("lists");
                          }}
                        >
                          <p className="font-serif font-semibold text-forest">
                            {list.title}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {list.books.length} books ·{" "}
                            {list.saveCount.toLocaleString()} saves
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="Badges">
                  <div className="flex flex-wrap gap-2">
                    {featuredBadges.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBadgeId(b.id)}
                        className="rounded-full bg-[#efe4d4] px-3 py-1.5 text-xs font-semibold text-forest"
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                  <Link
                    href="/insights"
                    className="mt-3 inline-block text-sm font-semibold text-forest underline"
                  >
                    View all badges
                  </Link>
                </Section>

                <Section title="Read with friends">
                  {profile.buddyReads
                    .filter((b) => b.status === "active")
                    .map((br) => {
                      const book = getBookById(br.bookId);
                      return (
                        <div key={br.id} className="text-sm">
                          <p className="font-semibold text-forest">
                            You + {br.friendName}
                          </p>
                          <p className="text-muted">{book?.title}</p>
                          <p className="mt-1">
                            You {br.myProgress}% · {br.friendName}{" "}
                            {br.friendProgress}%
                          </p>
                          {br.lockedReactionChapter ? (
                            <p className="mt-2 rounded-xl bg-[#efe4d4] px-3 py-2 text-xs text-forest">
                              🔒 {br.friendName} left a reaction at Chapter{" "}
                              {br.lockedReactionChapter}. Unlock when you reach
                              it.
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  <button
                    type="button"
                    onClick={() => setBuddyOpen(true)}
                    className="mt-3 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper"
                  >
                    Start Buddy Read
                  </button>
                </Section>

                <Section title="Reading Room">
                  <p className="text-sm text-muted">
                    Step into your cozy reading space.
                  </p>
                  <Link
                    href="/home"
                    className="mt-3 inline-flex rounded-full bg-[#efe4d4] px-4 py-2 text-sm font-semibold text-forest"
                  >
                    Enter Reading Room →
                  </Link>
                </Section>
              </div>
            </div>
          )}

          {tab === "books" && (
            <div className="space-y-5">
              <Section title="Currently reading">
                {readingBook ? (
                  <p className="text-sm text-forest">
                    {readingBook.title} · {readingEntry?.progressPct ?? 0}%
                  </p>
                ) : (
                  <EmptyOwner text="No current read." />
                )}
              </Section>
              <Section title="Favorites">
                <BookRow ids={profile.favoriteBookIds} />
              </Section>
              <Section title="Recently read">
                <BookRow ids={recentReads.map((e) => e.bookId)} />
              </Section>
              <Section title="Highly rated">
                <BookRow
                  ids={discovery.entries
                    .filter((e) => (e.rating ?? 0) >= 5)
                    .map((e) => e.bookId)
                    .slice(0, 8)}
                />
              </Section>
              <Link
                href="/library"
                className="inline-flex rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper"
              >
                View Full Library
              </Link>
            </div>
          )}

          {tab === "lists" && (
            <ListsTab
              lists={profileState.lists}
              discovery={discovery}
              detail={listDetail}
              onDetail={setListDetail}
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

          {tab === "identity" && (
            <IdentityTab
              assessment={assessment}
              history={history}
              profile={profile}
              dna={dna}
              badges={badges}
              featuredBadgeIds={profile.featuredBadgeIds}
              onTakeQuiz={() => {
                setViewAssessment(null);
                setQuizOpen(true);
              }}
              onView={(a) => {
                setViewAssessment(a);
                setQuizOpen(true);
              }}
              onTogglePersonalityPublic={(v) => {
                updateActiveVisibility(v);
                const next = updateProfile(profileState, {
                  privacy: { ...profile.privacy, readingPersonalityPublic: v },
                });
                setProfileState(next);
                setAssessment(loadActiveAssessment());
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
                      className="rounded-[1.1rem] border border-[#e4d5c3] bg-white/50 px-4 py-3"
                    >
                      <p className="font-semibold text-forest">{a.text}</p>
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
          setHistory(loadHistory());
        }}
        onComplete={(a) => {
          setAssessment(a);
          setHistory(loadHistory());
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

      {badgeId && (
        <BadgeModal
          badge={badges.find((b) => b.id === badgeId) ?? null}
          onClose={() => setBadgeId(null)}
        />
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-[#e4d5c3] bg-[#fbf6ee] p-4 sm:p-5">
      <h2 className="font-serif text-xl font-semibold text-forest">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Cover({ src, small }: { src: string; small?: boolean }) {
  const size = small ? 40 : 64;
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-md border border-[#e4d5c3] bg-[#eadfce]"
      style={{ width: size, height: size * 1.45 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

function BookRow({ ids }: { ids: string[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {ids.map((id) => {
        const b = getBookById(id);
        if (!b) return null;
        return (
          <div key={id} className="w-16">
            <Cover src={b.cover} />
            <p className="mt-1 line-clamp-2 text-[0.65rem] text-muted">{b.title}</p>
          </div>
        );
      })}
    </div>
  );
}

function EmptyOwner({ text }: { text: string }) {
  return <p className="text-sm text-muted">{text}</p>;
}

function InviteQuiz({ onTake }: { onTake: () => void }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-[#dccab4] bg-[#f7f0e6] px-4 py-5 text-center">
      <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-forest/65 uppercase">
        Discover your Reading Personality
      </p>
      <p className="mt-2 font-serif text-xl font-semibold text-forest">
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
  onSave,
  onAddAll,
  onAddOne,
}: {
  lists: RecommendedList[];
  discovery: DiscoveryState;
  detail: RecommendedList | null;
  onDetail: (l: RecommendedList | null) => void;
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
          className="text-sm font-semibold text-forest underline"
          onClick={() => onDetail(null)}
        >
          ← All lists
        </button>
        <h2 className="mt-3 font-serif text-2xl font-semibold text-forest">
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
            className="rounded-full bg-[#efe4d4] px-4 py-2 text-sm font-semibold text-forest"
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
                className="flex gap-3 rounded-[1.1rem] border border-[#e4d5c3] bg-[#fbf6ee] p-3"
              >
                <Cover src={book.cover} small />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-forest">{book.title}</p>
                  <p className="text-sm italic text-muted">&ldquo;{item.note}&rdquo;</p>
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-forest underline"
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
      <p className="mb-4 text-sm text-muted">
        Your lists · {totalSaves.toLocaleString()} total saves ·{" "}
        {lists.reduce((s, l) => s + l.completionCount, 0)} books completed from
        your recommendations
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {lists.map((list) => (
          <li key={list.id}>
            <button
              type="button"
              onClick={() => onDetail(list)}
              className="h-full w-full rounded-[1.35rem] border border-[#e4d5c3] bg-[#fbf6ee] p-4 text-left hover:border-forest/40"
            >
              <p className="font-serif text-lg font-semibold text-forest">
                {list.title}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">
                {list.description}
              </p>
              <p className="mt-3 text-xs text-muted">
                {list.books.length} books · {list.saveCount.toLocaleString()}{" "}
                saves
              </p>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <h3 className="font-serif text-lg font-semibold text-forest">
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

function IdentityTab({
  assessment,
  history,
  profile,
  dna,
  badges,
  featuredBadgeIds,
  onTakeQuiz,
  onView,
  onTogglePersonalityPublic,
}: {
  assessment: PersonalityAssessment | null;
  history: PersonalityAssessment[];
  profile: ProfileState["profile"];
  dna: ReturnType<typeof generateReaderDna> | null;
  badges: ReturnType<typeof buildBadges>;
  featuredBadgeIds: string[];
  onTakeQuiz: () => void;
  onView: (a: PersonalityAssessment) => void;
  onTogglePersonalityPublic: (v: boolean) => void;
}) {
  const personality = assessment?.addedToProfile
    ? getPersonality(assessment.personalityCode)
    : null;
  const scored = assessment
    ? scoreAnswers(assessment.answers, assessment.tieBreakers)
    : null;

  return (
    <div className="space-y-5">
      <Section title="Reading Personality">
        {personality && assessment && scored ? (
          <div>
            <p className="font-serif text-2xl font-semibold text-forest">
              {personality.emoji} {personality.name}
            </p>
            <p className="text-sm text-muted">{assessment.personalityCode}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {scored.dimensions.map((d) => {
                const def = DIMENSIONS.find((x) => x.id === d.dimension)!;
                const pct =
                  d.winner === def.first.letter
                    ? d.firstPolePercentage
                    : d.secondPolePercentage;
                return (
                  <li key={d.dimension}>
                    {d.winnerLabel} {pct}%
                    {d.balanced ? " · balanced" : ""}
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onView(assessment)}
                className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper"
              >
                View Personality
              </button>
              <button
                type="button"
                onClick={onTakeQuiz}
                className="rounded-full bg-[#efe4d4] px-4 py-2 text-sm font-semibold text-forest"
              >
                Retake
              </button>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-forest">
              <input
                type="checkbox"
                checked={profile.privacy.readingPersonalityPublic}
                onChange={(e) => onTogglePersonalityPublic(e.target.checked)}
              />
              Show Reading Personality on Profile
            </label>
          </div>
        ) : (
          <InviteQuiz onTake={onTakeQuiz} />
        )}
      </Section>

      <Section title="Current Reading Era">
        <p className="font-serif text-xl font-semibold text-forest">
          ✨ {profile.readingEra.title}
        </p>
        <p className="mt-1 text-sm text-muted">{profile.readingEra.blurb}</p>
        <p className="mt-2 text-xs text-muted-soft">
          Short-term & informal — distinct from permanent personality and Reader
          DNA.
        </p>
      </Section>

      <Section title="Reader DNA">
        {dna ? (
          <div>
            <p className="font-serif text-xl font-semibold text-forest">
              {dna.title}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {dna.traits.slice(0, 3).map((t) => (
                <li key={t.id}>
                  {t.label} {t.value}%
                </li>
              ))}
            </ul>
            <Link
              href="/insights"
              className="mt-3 inline-block text-sm font-semibold text-forest underline"
            >
              Explore Reader DNA
            </Link>
          </div>
        ) : null}
      </Section>

      {personality && dna && assessment ? (
        <Section title="Personality vs Reality">
          <p className="text-sm text-muted">
            Quiz says you&apos;re a{" "}
            <span className="font-semibold text-forest">
              {personality.poles[2]}
            </span>
            . Your behavior this month still leans atmospheric and spontaneous —
            Reader DNA ({dna.title}) agrees more than it argues.
          </p>
          <p className="mt-2 text-xs text-muted-soft">
            They measure different things. Playful comparison only.
          </p>
        </Section>
      ) : null}

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          {badges
            .filter((b) => b.earned && featuredBadgeIds.includes(b.id))
            .map((b) => (
              <span
                key={b.id}
                className="rounded-full bg-[#efe4d4] px-3 py-1.5 text-xs font-semibold text-forest"
              >
                {b.name}
              </span>
            ))}
        </div>
      </Section>

      <Section title="Reading Personality History">
        {history.length === 0 ? (
          <p className="text-sm text-muted">No assessments yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => {
              const p = getPersonality(h.personalityCode);
              return (
                <li
                  key={h.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#eadfce] px-3 py-2 text-sm"
                >
                  <span>
                    {p.emoji} {p.name} · {h.personalityCode}
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(h.completedAt).toLocaleDateString()}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}

function BadgeModal({
  badge,
  onClose,
}: {
  badge: ReturnType<typeof buildBadges>[number] | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!badge) return null;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-forest/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[1.5rem] border border-[#e4d5c3] bg-[#fbf6ee] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-2xl font-semibold text-forest">
          {badge.name}
        </h3>
        <p className="mt-2 text-sm text-muted">{badge.description}</p>
        {badge.earnedDate ? (
          <p className="mt-2 text-xs text-muted">Earned: {badge.earnedDate}</p>
        ) : null}
        <Link
          href="/insights"
          className="mt-4 inline-block text-sm font-semibold text-forest underline"
        >
          View All Badges
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 block w-full rounded-full bg-[#efe4d4] py-2 text-sm font-semibold text-forest"
        >
          Close
        </button>
      </div>
    </div>
  );
}
