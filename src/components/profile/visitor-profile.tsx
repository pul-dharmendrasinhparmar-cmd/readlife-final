"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/layout/app-nav";
import {
  DISCOVER_LISTS,
  getBookById,
  getReaderByUsername,
} from "@/components/search/data";
import type { DiscoveryState } from "@/components/search/types";
import {
  addToTbr,
  loadDiscoveryState,
  toggleFollow,
  toggleSavedList,
} from "@/lib/discovery-storage";
import { ToastProvider, useToast } from "@/components/search/toast";
import { PersonalityCompare } from "@/components/personality/compare";
import {
  getPersonality,
  formatPersonalityCode,
} from "@/components/personality/personalities";
import {
  ensureDemoPersonalitySeed,
  loadActiveAssessment,
} from "@/components/personality/quiz-storage";
import type { PersonalityCode } from "@/components/personality/types";
import { BuddyReadModal } from "./buddy-read-modal";
import {
  loadProfileState,
  syncFollowingPeopleFromDiscovery,
  toggleLocalFriendPerson,
} from "./profile-storage";
import type { FollowPerson } from "./types";

/** Map discover readers to demo personality codes for visitor display. */
const VISITOR_CODES: Record<string, PersonalityCode> = {
  mina: "LAMS",
  jordan: "LIMS",
  nova: "EIMO",
  leo: "EIPS",
  haze: "EAMS",
  sam: "EAMO",
  priya: "LAPO",
  ellie: "LIMO",
  casey: "EIPO",
  river: "LIPO",
  bookie: "EAMO",
  lucy: "LAMS",
  theo: "EIPS",
  sage: "LIPO",
};

type DemoView = {
  kind: "demo";
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  readingMatch?: number;
};

type UserView = {
  kind: "user";
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
};

type ProfileView = DemoView | UserView;

type Props = { username: string };

export function VisitorProfileView({ username }: Props) {
  return (
    <ToastProvider>
      <VisitorProfileInner username={username} />
    </ToastProvider>
  );
}

function VisitorProfileInner({ username }: Props) {
  const { toast } = useToast();
  const demoReader = useMemo(() => getReaderByUsername(username), [username]);
  const [discovery, setDiscovery] = useState<DiscoveryState | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [buddyOpen, setBuddyOpen] = useState(false);
  const [myAssessmentReady, setMyAssessmentReady] = useState(false);
  const [remote, setRemote] = useState<UserView | null>(null);
  const [youFollow, setYouFollow] = useState(false);
  const [friends, setFriends] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [remoteLoading, setRemoteLoading] = useState(!demoReader);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDiscovery(loadDiscoveryState());
    ensureDemoPersonalitySeed();
    setMyAssessmentReady(true);
  }, []);

  useEffect(() => {
    if (demoReader) {
      setRemoteLoading(false);
      setRemote(null);
      setRemoteError(null);
      return;
    }
    let cancelled = false;
    setRemoteLoading(true);
    setRemoteError(null);
    void (async () => {
      try {
        const res = await fetch(
          `/api/social/profile/${encodeURIComponent(username)}`,
        );
        const data = (await res.json()) as {
          profile?: UserView & { kind?: string };
          youFollow?: boolean;
          friends?: boolean;
          isSelf?: boolean;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.profile) {
          setRemote(null);
          setRemoteError(data.error ?? "No readers found under that name.");
          return;
        }
        setRemote({
          kind: "user",
          id: data.profile.id,
          displayName: data.profile.displayName,
          username: data.profile.username,
          avatar: data.profile.avatar,
          bio: data.profile.bio,
          followers: data.profile.followers,
          following: data.profile.following,
        });
        setYouFollow(!!data.youFollow);
        setFriends(!!data.friends);
        setIsSelf(!!data.isSelf);
      } catch {
        if (!cancelled) {
          setRemoteError("Could not load this profile.");
          setRemote(null);
        }
      } finally {
        if (!cancelled) setRemoteLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demoReader, username]);

  const profile: ProfileView | null = demoReader
    ? {
        kind: "demo",
        id: demoReader.id,
        displayName: demoReader.displayName,
        username: demoReader.username,
        avatar: demoReader.avatar,
        bio: `${demoReader.favoriteGenres.join(", ")}. Currently reading ${demoReader.currentBook}.`,
        followers: demoReader.followers,
        following: demoReader.following,
        readingMatch: demoReader.readingMatch,
      }
    : remote;

  if (remoteLoading && !demoReader) {
    return (
      <div className="min-h-screen bg-[#2a2438]">
        <AppNav />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <p className="text-sm text-muted">Loading profile…</p>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#2a2438]">
        <AppNav />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <p className="font-serif text-2xl font-semibold text-ink">
            {remoteError ?? "No readers found under that name."}
          </p>
          <Link
            href="/search"
            className="mt-4 inline-block font-semibold text-ink underline"
          >
            Back to Discover
          </Link>
        </main>
      </div>
    );
  }

  const view = profile;
  const followingDemo =
    discovery?.followingIds.includes(view.id) ?? false;
  const following = view.kind === "demo" ? followingDemo : youFollow;
  const lists =
    view.kind === "demo"
      ? DISCOVER_LISTS.filter((l) => l.creatorId === view.id)
      : [];
  const code = VISITOR_CODES[view.id] ?? "LAMS";
  const personality = getPersonality(code);
  const myAssessment = myAssessmentReady ? loadActiveAssessment() : null;
  const ownerProfile = loadProfileState();
  const buddyFriends: FollowPerson[] = [
    {
      id: view.id,
      displayName: view.displayName,
      username: view.username,
      avatar: view.avatar,
      personality:
        view.kind === "demo" ? personality.name : "ReadLife member",
    },
  ];

  async function onToggleSocial() {
    if (view.kind === "demo") {
      if (!discovery) return;
      const next = toggleFollow(discovery, view.id);
      setDiscovery(next);
      syncFollowingPeopleFromDiscovery(next.followingIds);
      const nowFollowing = next.followingIds.includes(view.id);
      toast({
        text: nowFollowing
          ? `You're now following ${view.displayName}.`
          : `Unfollowed ${view.displayName}.`,
      });
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: view.username }),
      });
      const data = (await res.json()) as {
        following?: boolean;
        friends?: boolean;
        user?: {
          id: string;
          username: string;
          displayName: string;
          avatar: string;
        };
        error?: string;
      };
      if (!res.ok) {
        toast({ text: data.error ?? "Sign in to add friends." });
        return;
      }
      const nowFollowing = !!data.following;
      const nowFriends = !!data.friends;
      setYouFollow(nowFollowing);
      setFriends(nowFriends);
      setRemote((prev) =>
        prev
          ? {
              ...prev,
              followers: nowFollowing
                ? prev.followers + (youFollow ? 0 : 1)
                : Math.max(0, prev.followers - (youFollow ? 1 : 0)),
            }
          : prev,
      );
      if (data.user) {
        toggleLocalFriendPerson(
          {
            id: data.user.id,
            displayName: data.user.displayName,
            username: data.user.username,
            avatar: data.user.avatar,
            personality: "ReadLife member",
          },
          nowFollowing,
        );
      }
      toast({
        text: nowFriends
          ? `You and ${view.displayName} are friends.`
          : nowFollowing
            ? `Friend request sent to ${view.displayName} — they'll be friends when they add you back.`
            : `Removed ${view.displayName}.`,
      });
    } catch {
      toast({ text: "Network error." });
    } finally {
      setBusy(false);
    }
  }

  const followLabel =
    view.kind === "user"
      ? friends
        ? "Friends ✓"
        : following
          ? "Following ✓"
          : "Add friend"
      : following
        ? "Following ✓"
        : "Follow";

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-clip bg-cream text-ink">
      <AppNav />
      <main className="mx-auto w-full max-w-[1440px] overflow-x-clip px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative max-w-full overflow-hidden rounded-[1.75rem] border border-line bg-gradient-to-br from-paper via-cream to-[#322a45] p-4 sm:p-7">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
            <div className="flex min-w-0 flex-1 gap-3 sm:gap-5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-line shadow-lg sm:h-32 sm:w-32">
                <Image
                  src={profile.avatar}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
                  {profile.displayName}
                </h1>
                <p className="mt-0.5 text-muted">@{profile.username}</p>
                {profile.kind === "demo" ? (
                  <p className="mt-2.5 inline-flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-1 rounded-full bg-cream-card px-3 py-1 text-sm font-semibold text-ink">
                    <span aria-hidden>{personality.emoji}</span>
                    <span className="min-w-0 break-words">
                      {personality.name}
                    </span>
                    <span className="font-sans text-xs font-semibold tracking-wide text-muted">
                      {formatPersonalityCode(personality.code)}
                    </span>
                  </p>
                ) : (
                  <p className="mt-2.5 inline-flex rounded-full bg-cream-card px-3 py-1 text-sm font-semibold text-ink">
                    ReadLife member
                  </p>
                )}
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/85">
                  {profile.bio}
                </p>
                <p className="mt-4 text-sm">
                  <span className="font-semibold text-ink">
                    {profile.followers.toLocaleString()} followers
                  </span>
                  <span className="text-muted-soft"> · </span>
                  <span className="font-semibold text-ink">
                    {profile.following} following
                  </span>
                  {profile.kind === "demo" && profile.readingMatch != null ? (
                    <span className="ml-2 text-muted">
                      · {profile.readingMatch}% match
                    </span>
                  ) : null}
                  {friends ? (
                    <span className="ml-2 font-semibold text-accent">
                      · Friends
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-end justify-end gap-2 lg:w-[260px]">
              {!isSelf && (discovery || profile.kind === "user") ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onToggleSocial()}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    following || friends
                      ? "bg-cream-card text-ink"
                      : "bg-forest text-paper hover:bg-forest-deep"
                  }`}
                >
                  {followLabel}
                </button>
              ) : null}
              {isSelf ? (
                <Link
                  href="/profile"
                  className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-cream-card"
                >
                  Edit your profile
                </Link>
              ) : null}
              {profile.kind === "demo" ? (
                <button
                  type="button"
                  onClick={() => setBuddyOpen(true)}
                  className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-cream-card"
                >
                  Read with me
                </button>
              ) : null}
              {profile.kind === "demo" && myAssessment?.addedToProfile ? (
                <button
                  type="button"
                  onClick={() => setCompareOpen(true)}
                  className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-cream-card"
                >
                  Compare personality
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {profile.kind === "demo" ? (
          <section className="mt-8 rounded-[1.5rem] border border-[#4a425c] bg-[#3a324f] p-5">
            <h2 className="font-serif text-xl font-semibold text-ink">
              Reading Personality
            </h2>
            <p className="mt-2 font-serif italic text-ink">
              &ldquo;{personality.motto}&rdquo;
            </p>
            <p className="mt-2 text-sm text-muted">{personality.summary}</p>
          </section>
        ) : null}

        <section className="mt-6">
          <h2 className="font-serif text-xl font-semibold text-ink">
            Lists by {profile.displayName}
          </h2>
          {lists.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No public lists yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {lists.map((list) => (
                <li
                  key={list.id}
                  className="rounded-[1.25rem] border border-[#4a425c] bg-[#3a324f] px-4 py-3"
                >
                  <p className="font-serif font-semibold text-ink">
                    {list.title}
                  </p>
                  <p className="mt-1 text-sm text-muted">{list.description}</p>
                  <p className="mt-2 text-xs text-muted">
                    {list.bookIds.length} books ·{" "}
                    {list.saveCount.toLocaleString()} saves
                  </p>
                  {discovery ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-paper"
                        onClick={() => {
                          const next = toggleSavedList(discovery, list.id);
                          setDiscovery(next);
                          toast({
                            text: next.savedListIds.includes(list.id)
                              ? `Saved “${list.title}”`
                              : "List unsaved",
                          });
                        }}
                      >
                        {discovery.savedListIds.includes(list.id)
                          ? "Saved ✓"
                          : "Save List"}
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-[#3f3654] px-3 py-1.5 text-xs font-semibold text-ink"
                        onClick={() => {
                          let next = discovery;
                          list.bookIds.forEach((bookId) => {
                            next = addToTbr(next, {
                              bookId,
                              priority: "someday",
                              note: "",
                              sourceType: "reading_list",
                              sourceName: list.title,
                              sourceUser: profile.username,
                            });
                          });
                          setDiscovery(next);
                          toast({
                            text: `Added from ${profile.displayName}'s “${list.title}”`,
                            actionHref: "/library",
                            actionLabel: "Library",
                          });
                        }}
                      >
                        Add All to TBR
                      </button>
                    </div>
                  ) : null}
                  <ul className="mt-3 space-y-1">
                    {list.bookIds.slice(0, 4).map((id) => {
                      const b = getBookById(id);
                      return b ? (
                        <li key={id} className="text-xs text-muted">
                          {b.title}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        {following || friends ? (
          <section className="mt-6 rounded-[1.5rem] border border-[#4a425c] bg-[#3a324f] p-5">
            <h2 className="font-serif text-xl font-semibold text-ink">
              You two
            </h2>
            <p className="mt-2 text-sm text-muted">
              {friends
                ? "You're friends — you follow each other on ReadLife."
                : profile.kind === "demo"
                  ? "Shared-shelf overlap is a soft estimate from demo favorites — use Compare Personality for dimension overlap."
                  : "You're following them. They'll show as Friends once they add you back."}
            </p>
          </section>
        ) : null}
      </main>

      {profile.kind === "demo" && myAssessment ? (
        <PersonalityCompare
          assessment={myAssessment}
          followingIds={discovery?.followingIds ?? [profile.id]}
          open={compareOpen}
          onClose={() => setCompareOpen(false)}
        />
      ) : null}

      {profile.kind === "demo" && discovery ? (
        <BuddyReadModal
          open={buddyOpen}
          friends={buddyFriends}
          discovery={discovery}
          onClose={() => setBuddyOpen(false)}
          onSend={(payload) => {
            toast({
              text: `Buddy read invite sent to ${payload.friendName} (simulated)`,
            });
            setBuddyOpen(false);
          }}
        />
      ) : null}

      <span className="sr-only">{ownerProfile.profile.username}</span>
    </div>
  );
}
