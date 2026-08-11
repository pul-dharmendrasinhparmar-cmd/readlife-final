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
import { getPersonality } from "@/components/personality/personalities";
import {
  ensureDemoPersonalitySeed,
  loadActiveAssessment,
} from "@/components/personality/quiz-storage";
import type { PersonalityCode } from "@/components/personality/types";
import { BuddyReadModal } from "./buddy-read-modal";
import { loadProfileState } from "./profile-storage";
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
};

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
  const reader = useMemo(() => getReaderByUsername(username), [username]);
  const [discovery, setDiscovery] = useState<DiscoveryState | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [buddyOpen, setBuddyOpen] = useState(false);
  const [myAssessmentReady, setMyAssessmentReady] = useState(false);

  useEffect(() => {
    setDiscovery(loadDiscoveryState());
    ensureDemoPersonalitySeed();
    setMyAssessmentReady(true);
  }, []);

  if (!reader) {
    return (
      <div className="min-h-screen bg-[#f3ebe0]">
        <AppNav />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <p className="font-serif text-2xl font-semibold text-forest">
            No readers found under that name.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-block font-semibold text-forest underline"
          >
            Back to Discover
          </Link>
        </main>
      </div>
    );
  }

  const following = discovery?.followingIds.includes(reader.id) ?? false;
  const lists = DISCOVER_LISTS.filter((l) => l.creatorId === reader.id);
  const code = VISITOR_CODES[reader.id] ?? "LAMS";
  const personality = getPersonality(code);
  const myAssessment = myAssessmentReady ? loadActiveAssessment() : null;
  const ownerProfile = loadProfileState();
  const friends: FollowPerson[] = [
    {
      id: reader.id,
      displayName: reader.displayName,
      username: reader.username,
      avatar: reader.avatar,
      personality: personality.name,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3ebe0] text-ink">
      <AppNav />
      <main className="mx-auto max-w-[960px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start gap-5 rounded-[1.75rem] border border-[#e4d5c3] bg-gradient-to-br from-[#fbf6ee] to-[#efe2d2] p-5 sm:p-7">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border border-[#dccab4]">
            <Image
              src={reader.avatar}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-3xl font-semibold text-forest">
              {reader.displayName}
            </h1>
            <p className="text-muted">@{reader.username}</p>
            <p className="mt-2 text-sm font-semibold text-forest">
              {personality.emoji} {personality.name} · {personality.code}
            </p>
            <p className="mt-1 text-sm text-muted">
              {reader.favoriteGenres.join(" · ")}
            </p>
            <p className="mt-2 text-sm text-forest">
              {reader.readingMatch}% Reading Match · Currently reading{" "}
              {reader.currentBook}
            </p>
            <p className="mt-1 text-xs text-muted">
              {reader.followers.toLocaleString()} followers · {reader.following}{" "}
              following
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {discovery ? (
                <button
                  type="button"
                  onClick={() => setDiscovery(toggleFollow(discovery, reader.id))}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold ${
                    following
                      ? "bg-[#efe4d4] text-forest"
                      : "bg-forest text-paper hover:bg-forest-deep"
                  }`}
                >
                  {following ? "Following ✓" : "Follow"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setBuddyOpen(true)}
                className="rounded-full bg-[#efe4d4] px-4 py-2.5 text-sm font-semibold text-forest"
              >
                Read With Me
              </button>
              {myAssessment?.addedToProfile ? (
                <button
                  type="button"
                  onClick={() => setCompareOpen(true)}
                  className="rounded-full border border-[#e0d1bf] px-4 py-2.5 text-sm font-semibold text-forest"
                >
                  Compare Personality
                </button>
              ) : null}
              <Link
                href="/home"
                className="rounded-full border border-[#e0d1bf] px-4 py-2.5 text-sm font-semibold text-forest"
              >
                Visit Reading Room
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-[1.5rem] border border-[#e4d5c3] bg-[#fbf6ee] p-5">
          <h2 className="font-serif text-xl font-semibold text-forest">
            Reading Personality
          </h2>
          <p className="mt-2 font-serif italic text-forest">
            &ldquo;{personality.motto}&rdquo;
          </p>
          <p className="mt-2 text-sm text-muted">{personality.summary}</p>
        </section>

        <section className="mt-6">
          <h2 className="font-serif text-xl font-semibold text-forest">
            Lists by {reader.displayName}
          </h2>
          {lists.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No public lists yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {lists.map((list) => (
                <li
                  key={list.id}
                  className="rounded-[1.25rem] border border-[#e4d5c3] bg-[#fbf6ee] px-4 py-3"
                >
                  <p className="font-serif font-semibold text-forest">
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
                        className="rounded-full bg-[#efe4d4] px-3 py-1.5 text-xs font-semibold text-forest"
                        onClick={() => {
                          let next = discovery;
                          list.bookIds.forEach((bookId) => {
                            next = addToTbr(next, {
                              bookId,
                              priority: "someday",
                              note: "",
                              sourceType: "reading_list",
                              sourceName: list.title,
                              sourceUser: reader.username,
                            });
                          });
                          setDiscovery(next);
                          toast({
                            text: `Added from ${reader.displayName}'s “${list.title}”`,
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

        {following ? (
          <section className="mt-6 rounded-[1.5rem] border border-[#e4d5c3] bg-[#fbf6ee] p-5">
            <h2 className="font-serif text-xl font-semibold text-forest">
              You two
            </h2>
            <p className="mt-2 text-sm text-muted">
              Shared-shelf overlap is a soft estimate from demo favorites — use
              Compare Personality for dimension overlap.
            </p>
          </section>
        ) : null}
      </main>

      {myAssessment && (
        <PersonalityCompare
          assessment={myAssessment}
          followingIds={discovery?.followingIds ?? [reader.id]}
          open={compareOpen}
          onClose={() => setCompareOpen(false)}
        />
      )}

      {discovery ? (
        <BuddyReadModal
          open={buddyOpen}
          friends={friends}
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

      {/* keep owner username available for future shared books */}
      <span className="sr-only">{ownerProfile.profile.username}</span>
    </div>
  );
}
