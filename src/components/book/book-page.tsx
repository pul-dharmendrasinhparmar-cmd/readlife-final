"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ReviewPolishButton, BookChatPanel } from "@/components/ai/book-ai-panels";
import { AppNav } from "@/components/layout/app-nav";
import { getBookById } from "@/components/search/data";
import { ToastProvider, useToast } from "@/components/search/toast";
import type { DiscoveryState, UserRatingBreakdown } from "@/components/search/types";
import {
  addToTbr,
  getEntry,
  loadDiscoveryState,
  removeFromLibrary,
  saveDiscoveryState,
  setLibraryStatus,
  updateLibraryEntry,
} from "@/lib/discovery-storage";
import { getDashboardState } from "@/lib/onboarding-storage";
import { getBookCommunity } from "./community-data";
import { getDemoComments } from "./forum-comments";
import {
  addThreadReply,
  addUserForumPost,
  loadThreadReplies,
  loadUserForumPosts,
} from "./forum-storage";
import {
  loadVotes,
  scoreWithVote,
  toggleVote,
  type VoteValue,
} from "./forum-votes";
import { SpoilerReveal } from "./spoiler-reveal";
import { StarRating } from "./star-rating";
import { UserRatingEditor } from "./user-rating-editor";
import {
  LibraryStatusModal,
  STATUS_PILL,
  type StatusChoice,
} from "./status-modal";
import { getBookTropes, getBooksWithTrope } from "./tropes";
import type { BookTab, FeedActivity, ForumComment, ForumPost } from "./types";

type Props = {
  bookId: string;
};

export function BookPage({ bookId }: Props) {
  return (
    <ToastProvider>
      <BookPageInner bookId={bookId} />
    </ToastProvider>
  );
}

function BookPageInner({ bookId }: Props) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const aiParam = searchParams.get("ai");
  const book = getBookById(bookId);
  const community = useMemo(
    () => (book ? getBookCommunity(book) : null),
    [book],
  );

  const [discovery, setDiscovery] = useState<DiscoveryState | null>(null);
  const [tab, setTab] = useState<BookTab>("about");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [forumQuery, setForumQuery] = useState("");
  const [forumFilter, setForumFilter] = useState<"all" | "spoilers" | "safe">(
    "all",
  );
  const [forumSort, setForumSort] = useState<"progress-asc" | "progress-desc" | "top">(
    "progress-asc",
  );
  const [startAt, setStartAt] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">(
    "all",
  );
  const [reviewSort, setReviewSort] = useState<"newest" | "highest" | "lowest">(
    "newest",
  );
  const [writtenOnly, setWrittenOnly] = useState(true);
  const [followingOnly, setFollowingOnly] = useState(false);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [openReply, setOpenReply] = useState<string | null>(null);
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [threadReplies, setThreadReplies] = useState<
    Record<string, ForumComment[]>
  >({});
  const [votes, setVotes] = useState<Record<string, VoteValue>>({});
  const [reviewDraft, setReviewDraft] = useState("");
  const [reviewSpoiler, setReviewSpoiler] = useState(false);
  const [reviewEditing, setReviewEditing] = useState(false);
  const [userForumPosts, setUserForumPosts] = useState<ForumPost[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [forumTitle, setForumTitle] = useState("");
  const [forumBody, setForumBody] = useState("");
  const [forumSpoilers, setForumSpoilers] = useState(false);
  const [forumProgress, setForumProgress] = useState(0);
  const [displayName, setDisplayName] = useState("you");
  const [activeTrope, setActiveTrope] = useState<string | null>(null);

  useEffect(() => {
    setDiscovery(loadDiscoveryState());
    setUserForumPosts(loadUserForumPosts(bookId));
    setVotes(loadVotes());
    setExpandedThread(null);
    setOpenReply(null);
    setThreadReplies({});
    const dash = getDashboardState();
    setDisplayName(dash.displayName.trim() || "you");
    setActiveTrope(null);
  }, [bookId]);

  useEffect(() => {
    if (aiParam === "chat") {
      setTab("about");
      setAboutOpen(true);
    } else if (aiParam === "review") {
      setTab("reviews");
      setReviewEditing(true);
    }
  }, [aiParam, bookId]);

  const castVote = (targetId: string, next: VoteValue) => {
    const { vote } = toggleVote(targetId, next);
    setVotes((prev) => {
      const copy = { ...prev };
      if (vote) copy[targetId] = vote;
      else delete copy[targetId];
      return copy;
    });
  };

  const toggleThread = (threadId: string) => {
    setExpandedThread((cur) => {
      const next = cur === threadId ? null : threadId;
      if (next) {
        setThreadReplies((prev) => ({
          ...prev,
          [threadId]: prev[threadId] ?? loadThreadReplies(threadId),
        }));
        setOpenReply(threadId);
      }
      return next;
    });
  };

  const submitThreadReply = (threadId: string) => {
    const text = (replyDraft[threadId] ?? "").trim();
    if (!text) {
      toast({ text: "Write a reply first." });
      return;
    }
    const comment = addThreadReply(threadId, {
      username: displayName,
      body: text,
    });
    setThreadReplies((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] ?? loadThreadReplies(threadId)), comment],
    }));
    setExpandedThread(threadId);
    setReplyDraft((prev) => ({ ...prev, [threadId]: "" }));
    toast({ text: "Reply posted." });
  };

  useEffect(() => {
    if (!discovery) return;
    const e = getEntry(discovery, bookId);
    setReviewDraft(e?.review ?? "");
    setReviewSpoiler(!!e?.reviewSpoiler);
    setReviewEditing(!e?.review);
  }, [discovery, bookId]);

  if (!book || !community) {
    return (
      <div className="min-h-screen bg-cream">
        <AppNav />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-serif text-3xl font-semibold text-ink">
            Book not found
          </h1>
          <p className="mt-3 text-muted">
            That title isn’t in the ReadLife catalog yet.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper"
          >
            Back to Discover
          </Link>
        </main>
      </div>
    );
  }

  const entry = discovery ? getEntry(discovery, book.id) : undefined;
  const userRating = entry?.rating ?? null;
  const userBreakdown = entry?.ratingBreakdown ?? null;

  const persist = (next: DiscoveryState) => {
    saveDiscoveryState(next);
    setDiscovery(loadDiscoveryState());
  };

  const saveRating = (next: {
    rating: number | undefined;
    ratingBreakdown: UserRatingBreakdown | undefined;
  }) => {
    if (!discovery) return;
    const patch = {
      rating: next.rating,
      ratingBreakdown: next.ratingBreakdown,
    };
    const state = entry
      ? updateLibraryEntry(discovery, book.id, patch)
      : setLibraryStatus(discovery, book.id, "tbr", {
          ...patch,
          priority: "someday",
        });
    persist(state);
    if (next.rating != null) {
      setReviewEditing(true);
      toast({ text: `Rated ${book.title} ${next.rating}★` });
    } else {
      toast({ text: "Rating cleared." });
    }
  };

  const saveReview = () => {
    if (!discovery) return;
    const text = reviewDraft.trim();
    if (!text) {
      toast({ text: "Write a few words before posting your review." });
      return;
    }
    const stamp = new Date().toISOString();
    const next = entry
      ? updateLibraryEntry(discovery, book.id, {
          review: text,
          reviewSpoiler,
          reviewDate: stamp,
          rating: entry.rating ?? userRating ?? undefined,
        })
      : setLibraryStatus(discovery, book.id, "read", {
          review: text,
          reviewSpoiler,
          reviewDate: stamp,
          rating: userRating ?? undefined,
        });
    persist(next);
    setReviewEditing(false);
    toast({ text: "Review saved." });
  };

  const applyStatus = (choice: StatusChoice) => {
    if (!discovery) return;
    if (choice === "none") {
      if (entry) {
        persist(removeFromLibrary(discovery, book.id));
        toast({ text: `Removed ${book.title} from library` });
      }
      setStatusOpen(false);
      return;
    }
    const next = setLibraryStatus(discovery, book.id, choice);
    persist(next);
    toast({ text: `Updated · ${STATUS_PILL[choice].label}` });
    setStatusOpen(false);
  };

  const publishForumPost = () => {
    if (!forumBody.trim()) {
      toast({ text: "Write something before posting." });
      return;
    }
    const post = addUserForumPost(book.id, {
      username: displayName,
      title: forumTitle,
      body: forumBody,
      spoilers: forumSpoilers,
      progressPct: forumProgress,
    });
    setUserForumPosts((prev) => [post, ...prev]);
    setForumTitle("");
    setForumBody("");
    setForumSpoilers(false);
    setForumProgress(entry?.progressPct ?? 0);
    setCreateOpen(false);
    toast({ text: "Posted to the forum." });
  };

  const addMatchToTbr = (matchId: string, matchTitle: string) => {
    if (!discovery) return;
    const next = addToTbr(discovery, {
      bookId: matchId,
      priority: "someday",
      note: "",
      sourceType: "recommendation",
      sourceName: activeTrope ? `Trope · ${activeTrope}` : undefined,
    });
    persist(next);
    toast({ text: `Added ${matchTitle} to TBR.` });
  };

  const forumPosts = [...userForumPosts, ...community.forum]
    .filter((p) => {
      if (forumFilter === "spoilers" && !p.spoilers) return false;
      if (forumFilter === "safe" && p.spoilers) return false;
      if (p.progressPct < startAt) return false;
      if (!forumQuery.trim()) return true;
      const q = forumQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (forumSort === "top") return b.score - a.score;
      if (forumSort === "progress-desc") return b.progressPct - a.progressPct;
      return a.progressPct - b.progressPct;
    });

  const reviews = community.reviews
    .filter((r) => {
      if (writtenOnly && !r.body.trim()) return false;
      if (followingOnly && !r.following) return false;
      if (reviewFilter !== "all" && Math.floor(r.rating) !== Number(reviewFilter))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (reviewSort === "highest") return b.rating - a.rating;
      if (reviewSort === "lowest") return a.rating - b.rating;
      return 0;
    });

  const statusMeta = entry ? STATUS_PILL[entry.status] : null;
  const descShort = book.description.slice(0, 220);
  const descLong = book.description;
  const tropes = getBookTropes(book.id);
  const tropeMatches = activeTrope
    ? getBooksWithTrope(activeTrope, book.id)
        .map((id) => getBookById(id))
        .filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#342c45]">
      <AppNav />
      <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-4">
          <Link
            href="/search"
            className="text-sm font-semibold text-ink/70 hover:text-ink"
          >
            ← Discover
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div
              className="relative mx-auto aspect-[2/3] w-full max-w-[220px] overflow-hidden rounded-2xl border border-[#4a425c] shadow-[0_16px_40px_rgba(42,36,56,0.18)]"
              style={{ background: book.color }}
            >
              <Image
                src={book.cover}
                alt={`Cover of ${book.title}`}
                fill
                className="object-cover"
                sizes="220px"
                priority
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusOpen(true)}
                className={`inline-flex flex-1 items-center justify-center rounded-full border px-3 py-2 text-sm font-bold shadow-sm ${
                  statusMeta
                    ? statusMeta.className
                    : "border-[#4a425c] bg-paper text-ink"
                }`}
              >
                {statusMeta?.label ?? "Add to library"}
              </button>
              <button
                type="button"
                onClick={() => setStatusOpen(true)}
                aria-label="Update library status"
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#4a425c] bg-paper text-ink shadow-sm hover:bg-[#3f3654]"
              >
                ▤
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                toast({ text: "Read dates coming soon — track start/finish from Library for now." })
              }
              className="mt-2 w-full rounded-full border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink hover:bg-cream-card"
            >
              + Add read dates
            </button>

            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">Your rating</p>
              <UserRatingEditor
                className="mt-2"
                rating={userRating}
                breakdown={userBreakdown}
                onChange={saveRating}
                size="sm"
              />

              {(userRating || entry?.review || reviewEditing) && (
                <div className="mt-4 rounded-2xl border border-[#4a425c] bg-paper p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold tracking-wide text-ink/70 uppercase">
                      Your review
                    </p>
                    {entry?.review && !reviewEditing ? (
                      <button
                        type="button"
                        onClick={() => setReviewEditing(true)}
                        className="text-xs font-semibold text-accent hover:underline"
                      >
                        Edit
                      </button>
                    ) : null}
                  </div>
                  {reviewEditing ? (
                    <>
                      <div className="mt-2 flex justify-end">
                        <ReviewPolishButton
                          title={book.title}
                          author={book.author}
                          rating={userRating ?? 0}
                          notes={reviewDraft}
                          onPolished={(review, suggestSpoilers) => {
                            setReviewDraft(review);
                            if (suggestSpoilers) setReviewSpoiler(true);
                          }}
                        />
                      </div>
                      <textarea
                        value={reviewDraft}
                        onChange={(e) => setReviewDraft(e.target.value)}
                        rows={4}
                        placeholder="Share your thoughts…"
                        className="mt-2 w-full resize-none rounded-xl border border-[#564d6a] bg-[#3a324f] px-3 py-2 text-sm text-ink outline-none focus:border-forest/40"
                      />
                      <label className="mt-2 flex items-center gap-2 text-xs text-ink">
                        <input
                          type="checkbox"
                          checked={reviewSpoiler}
                          onChange={(e) => setReviewSpoiler(e.target.checked)}
                          className="accent-forest"
                        />
                        Contains spoilers
                      </label>
                      <div className="mt-2 flex justify-end gap-2">
                        {entry?.review ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReviewDraft(entry.review ?? "");
                              setReviewSpoiler(!!entry.reviewSpoiler);
                              setReviewEditing(false);
                            }}
                            className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:bg-[#3f3654]"
                          >
                            Cancel
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={saveReview}
                          className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-paper"
                        >
                          {entry?.review ? "Save review" : "Post review"}
                        </button>
                      </div>
                    </>
                  ) : entry?.review ? (
                    <div className="mt-2 text-sm leading-relaxed text-ink/90">
                      {entry.reviewSpoiler ? (
                        <SpoilerReveal>
                          <p>{entry.review}</p>
                        </SpoilerReveal>
                      ) : (
                        <p>{entry.review}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReviewEditing(true)}
                      className="mt-2 text-xs font-semibold text-accent hover:underline"
                    >
                      Write a review
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0">
            <header>
              <h1 className="font-serif text-[2.1rem] leading-tight font-semibold tracking-[-0.02em] text-ink sm:text-[2.6rem]">
                {book.title}
              </h1>
              <p className="mt-1 text-lg text-ink/80">{book.author}</p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <StarRating value={book.averageRating} size="md" />
                  <span className="text-lg font-semibold text-ink">
                    {book.averageRating.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 text-sm text-ink/85">
                  {(
                    [
                      ["Enjoyment", community.breakdown.enjoyment],
                      ["Quality", community.breakdown.quality],
                      ["Characters", community.breakdown.characters],
                      ["Plot", community.breakdown.plot],
                      ["Audiobook", community.breakdown.audiobook],
                    ] as const
                  ).map(([label, val]) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="w-[5.5rem] shrink-0 text-muted">{label}</span>
                      <StarRating value={val} size="sm" />
                      <span className="tabular-nums">{val.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {tropes.map((trope) => (
                  <button
                    key={trope}
                    type="button"
                    onClick={() =>
                      setActiveTrope((cur) => (cur === trope ? null : trope))
                    }
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                      activeTrope === trope
                        ? "border-forest bg-forest text-[#2a2438]"
                        : "border-accent/35 bg-accent/15 text-accent hover:bg-accent/25"
                    }`}
                  >
                    {trope}
                  </button>
                ))}
              </div>

              {activeTrope ? (
                <div className="mt-3 rounded-2xl border border-[#4a425c] bg-paper p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
                        More with this trope
                      </p>
                      <p className="mt-0.5 font-semibold text-ink">
                        {activeTrope}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTrope(null)}
                      className="text-xs font-semibold text-muted hover:text-ink"
                    >
                      Close
                    </button>
                  </div>
                  {tropeMatches.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {tropeMatches.map((match) => {
                        if (!match) return null;
                        const matchEntry = discovery
                          ? getEntry(discovery, match.id)
                          : undefined;
                        const statusLabel = matchEntry
                          ? STATUS_PILL[matchEntry.status].label
                          : null;
                        const statusClass = matchEntry
                          ? STATUS_PILL[matchEntry.status].className
                          : "";

                        return (
                          <li key={match.id}>
                            <div className="flex items-center gap-3 rounded-xl border border-[#3f3654] px-3 py-2">
                              <Link
                                href={`/books/${match.id}`}
                                className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-90"
                              >
                                <span
                                  className="relative h-14 w-9 shrink-0 overflow-hidden rounded-md"
                                  style={{ background: match.color }}
                                >
                                  <Image
                                    src={match.cover}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="36px"
                                  />
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate font-semibold text-ink">
                                    {match.title}
                                  </span>
                                  <span className="block truncate text-sm text-muted">
                                    {match.author}
                                  </span>
                                </span>
                              </Link>
                              {matchEntry && statusLabel ? (
                                <span
                                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.7rem] font-bold ${statusClass}`}
                                >
                                  {statusLabel}
                                  {matchEntry.status === "reading" ||
                                  matchEntry.status === "paused" ||
                                  matchEntry.status === "dnf"
                                    ? ` · ${matchEntry.progressPct ?? 0}%`
                                    : ""}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    addMatchToTbr(match.id, match.title)
                                  }
                                  className="shrink-0 rounded-full border border-forest/25 bg-forest px-3 py-1.5 text-xs font-semibold text-paper hover:bg-forest-deep"
                                >
                                  + Add to TBR
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-muted">
                      No other books in the catalog share this trope yet.
                    </p>
                  )}
                </div>
              ) : null}

              <p className="mt-3 text-sm font-semibold text-accent">
                <button
                  type="button"
                  className="hover:underline"
                  onClick={() => setTab("reviews")}
                >
                  {community.stats.ratingsCount.toLocaleString()} ratings
                </button>
                {" · "}
                <button
                  type="button"
                  className="hover:underline"
                  onClick={() => setTab("forum")}
                >
                  {community.stats.postsCount.toLocaleString()} posts
                </button>
              </p>
            </header>

            <div className="mt-6 border-b border-[#4a425c]">
              <nav className="flex gap-1 overflow-x-auto" aria-label="Book sections">
                {(
                  [
                    ["about", "About"],
                    ["forum", "Forum"],
                    ["reviews", "Reviews"],
                    ["feed", "Feed"],
                  ] as const
                ).map(([id, label]) => {
                  const active = tab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTab(id)}
                      className={`relative shrink-0 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-paper text-ink"
                          : "text-muted hover:bg-paper/50 hover:text-ink"
                      }`}
                    >
                      {label}
                      {active ? (
                        <span className="absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-[linear-gradient(90deg,var(--accent),var(--forest))]" />
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="mt-5">
              {tab === "about" ? (
                <AboutPanel
                  description={aboutOpen ? descLong : `${descShort}${descLong.length > 220 ? "…" : ""}`}
                  canExpand={descLong.length > 220}
                  expanded={aboutOpen}
                  onToggle={() => setAboutOpen((v) => !v)}
                  publishedLabel={community.publishedLabel}
                  pageCount={book.pageCount}
                  genres={book.genres}
                  formats={book.formats}
                  bookTitle={book.title}
                  bookAuthor={book.author}
                  progressPct={entry?.progressPct ?? 0}
                  openChat={aiParam === "chat"}
                />
              ) : null}

              {tab === "forum" ? (
                <ForumPanel
                  query={forumQuery}
                  onQuery={setForumQuery}
                  filter={forumFilter}
                  onFilter={setForumFilter}
                  sort={forumSort}
                  onSort={setForumSort}
                  startAt={startAt}
                  onStartAt={setStartAt}
                  posts={forumPosts}
                  openReply={openReply}
                  replyDraft={replyDraft}
                  expandedThread={expandedThread}
                  threadReplies={threadReplies}
                  votes={votes}
                  onVote={castVote}
                  onToggleThread={toggleThread}
                  onOpenReply={(id) => {
                    if (id) {
                      setExpandedThread(id);
                      setThreadReplies((prev) => ({
                        ...prev,
                        [id]: prev[id] ?? loadThreadReplies(id),
                      }));
                    }
                    setOpenReply(id);
                  }}
                  onReplyDraft={(id, v) =>
                    setReplyDraft((prev) => ({ ...prev, [id]: v }))
                  }
                  onSubmitReply={submitThreadReply}
                  createOpen={createOpen}
                  onToggleCreate={() => {
                    setCreateOpen((v) => !v);
                    setForumProgress(entry?.progressPct ?? 0);
                  }}
                  forumTitle={forumTitle}
                  forumBody={forumBody}
                  forumSpoilers={forumSpoilers}
                  forumProgress={forumProgress}
                  onForumTitle={setForumTitle}
                  onForumBody={setForumBody}
                  onForumSpoilers={setForumSpoilers}
                  onForumProgress={setForumProgress}
                  onPublish={publishForumPost}
                />
              ) : null}

              {tab === "reviews" ? (
                <ReviewsPanel
                  userRating={userRating}
                  userBreakdown={userBreakdown}
                  onRate={saveRating}
                  myReview={entry?.review ?? null}
                  myReviewSpoiler={!!entry?.reviewSpoiler}
                  reviewDraft={reviewDraft}
                  reviewSpoiler={reviewSpoiler}
                  reviewEditing={reviewEditing}
                  onReviewDraft={setReviewDraft}
                  onReviewSpoiler={setReviewSpoiler}
                  onReviewEditing={setReviewEditing}
                  onSaveReview={saveReview}
                  filter={reviewFilter}
                  onFilter={setReviewFilter}
                  sort={reviewSort}
                  onSort={setReviewSort}
                  writtenOnly={writtenOnly}
                  onWrittenOnly={setWrittenOnly}
                  followingOnly={followingOnly}
                  onFollowingOnly={setFollowingOnly}
                  reviews={reviews}
                  openReply={openReply}
                  replyDraft={replyDraft}
                  expandedThread={expandedThread}
                  threadReplies={threadReplies}
                  votes={votes}
                  onVote={castVote}
                  onToggleThread={toggleThread}
                  onOpenReply={(id) => {
                    if (id) {
                      setExpandedThread(id);
                      setThreadReplies((prev) => ({
                        ...prev,
                        [id]: prev[id] ?? loadThreadReplies(id),
                      }));
                    }
                    setOpenReply(id);
                  }}
                  onReplyDraft={(id, v) =>
                    setReplyDraft((prev) => ({ ...prev, [id]: v }))
                  }
                  onSubmitReply={submitThreadReply}
                />
              ) : null}

              {tab === "feed" ? (
                <FeedPanel
                  bookTitle={book.title}
                  bookAuthor={book.author}
                  cover={book.cover}
                  color={book.color}
                  description={book.description}
                  stats={community.stats}
                  feed={community.feed}
                  votes={votes}
                  onVote={castVote}
                />
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <LibraryStatusModal
        open={statusOpen}
        current={entry?.status ?? null}
        onClose={() => setStatusOpen(false)}
        onSave={applyStatus}
        onDelete={() => {
          if (!discovery || !entry) return;
          persist(removeFromLibrary(discovery, book.id));
          toast({ text: `Removed ${book.title} from library` });
          setStatusOpen(false);
        }}
      />
    </div>
  );
}

function AboutPanel({
  description,
  canExpand,
  expanded,
  onToggle,
  publishedLabel,
  pageCount,
  genres,
  formats,
  bookTitle,
  bookAuthor,
  progressPct,
  openChat = false,
}: {
  description: string;
  canExpand: boolean;
  expanded: boolean;
  onToggle: () => void;
  publishedLabel: string;
  pageCount: number;
  genres: string[];
  formats: string[];
  bookTitle: string;
  bookAuthor: string;
  progressPct: number;
  openChat?: boolean;
}) {
  return (
    <section className="space-y-5">
      <p className="text-[1.02rem] leading-relaxed text-ink/90">{description}</p>
      {canExpand ? (
        <button
          type="button"
          onClick={onToggle}
          className="text-sm font-semibold text-accent hover:underline"
        >
          {expanded ? "Show less ↑" : "Read More ↓"}
        </button>
      ) : null}
      <p className="text-sm text-muted">
        Published: {publishedLabel} | Est. Pages: {pageCount} | Formats:{" "}
        {formats.join(", ")}
      </p>
      <div className="flex flex-wrap gap-2">
        {genres.map((g) => (
          <span
            key={g}
            className="rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent"
          >
            {g}
          </span>
        ))}
      </div>
      <BookChatPanel
        title={bookTitle}
        author={bookAuthor}
        progressPct={progressPct}
        defaultOpen={openChat}
      />
    </section>
  );
}

function ForumPanel({
  query,
  onQuery,
  filter,
  onFilter,
  sort,
  onSort,
  startAt,
  onStartAt,
  posts,
  openReply,
  replyDraft,
  expandedThread,
  threadReplies,
  votes,
  onVote,
  onToggleThread,
  onOpenReply,
  onReplyDraft,
  onSubmitReply,
  createOpen,
  onToggleCreate,
  forumTitle,
  forumBody,
  forumSpoilers,
  forumProgress,
  onForumTitle,
  onForumBody,
  onForumSpoilers,
  onForumProgress,
  onPublish,
}: {
  query: string;
  onQuery: (v: string) => void;
  filter: "all" | "spoilers" | "safe";
  onFilter: (v: "all" | "spoilers" | "safe") => void;
  sort: "progress-asc" | "progress-desc" | "top";
  onSort: (v: "progress-asc" | "progress-desc" | "top") => void;
  startAt: number;
  onStartAt: (v: number) => void;
  posts: ForumPost[];
  openReply: string | null;
  replyDraft: Record<string, string>;
  expandedThread: string | null;
  threadReplies: Record<string, ForumComment[]>;
  votes: Record<string, VoteValue>;
  onVote: (id: string, next: VoteValue) => void;
  onToggleThread: (id: string) => void;
  onOpenReply: (id: string | null) => void;
  onReplyDraft: (id: string, v: string) => void;
  onSubmitReply: (id: string) => void;
  createOpen: boolean;
  onToggleCreate: () => void;
  forumTitle: string;
  forumBody: string;
  forumSpoilers: boolean;
  forumProgress: number;
  onForumTitle: (v: string) => void;
  onForumBody: (v: string) => void;
  onForumSpoilers: (v: boolean) => void;
  onForumProgress: (v: number) => void;
  onPublish: () => void;
}) {
  return (
    <div className="space-y-4">
      <label className="relative block">
        <span className="sr-only">Search forum</span>
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
          ⌕
        </span>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search forum..."
          className="w-full rounded-full border border-[#4a425c] bg-paper py-2.5 pr-4 pl-9 text-sm text-ink outline-none focus:border-forest/40"
        />
      </label>

      <div className="rounded-[1.5rem] border border-line bg-cream-card p-4 sm:p-5">
        <button
          type="button"
          onClick={onToggleCreate}
          className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-[#3f3654]"
        >
          {createOpen ? "Close composer" : "Create post"}
        </button>

        {createOpen ? (
          <div className="mt-3 space-y-3 rounded-2xl border border-[#4a425c] bg-paper p-4">
            <input
              value={forumTitle}
              onChange={(e) => onForumTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full rounded-xl border border-[#564d6a] bg-[#3a324f] px-3 py-2 text-sm outline-none focus:border-forest/40"
            />
            <textarea
              value={forumBody}
              onChange={(e) => onForumBody(e.target.value)}
              rows={5}
              placeholder="What’s on your mind about this book?"
              className="w-full resize-none rounded-xl border border-[#564d6a] bg-[#3a324f] px-3 py-2 text-sm outline-none focus:border-forest/40"
            />
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="inline-flex items-center gap-2">
                Progress %
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={forumProgress}
                  onChange={(e) => onForumProgress(Number(e.target.value) || 0)}
                  className="w-16 rounded-lg border border-[#564d6a] bg-[#3a324f] px-2 py-1"
                />
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={forumSpoilers}
                  onChange={(e) => onForumSpoilers(e.target.checked)}
                  className="accent-forest"
                />
                Spoilers
              </label>
              <button
                type="button"
                onClick={onPublish}
                className="ml-auto rounded-full bg-forest px-4 py-1.5 text-sm font-semibold text-paper"
              >
                Post
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => onFilter(e.target.value as typeof filter)}
            className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink"
          >
            <option value="all">All posts</option>
            <option value="safe">No spoilers</option>
            <option value="spoilers">Spoilers only</option>
          </select>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as typeof sort)}
            className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink"
          >
            <option value="progress-asc">% progress - asc</option>
            <option value="progress-desc">% progress - desc</option>
            <option value="top">Top scored</option>
          </select>
          <label className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink">
            Start at:
            <input
              type="number"
              min={0}
              max={100}
              value={startAt}
              onChange={(e) => onStartAt(Number(e.target.value) || 0)}
              className="w-14 bg-transparent outline-none"
            />
            %
          </label>
        </div>

        <div className="mt-4 space-y-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-[#4a425c] bg-paper p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-muted">
                  <span className="font-semibold text-ink">{post.username}</span>
                  {post.edited ? (
                    <span className="ml-2 text-xs">Edited</span>
                  ) : null}
                </p>
                <button
                  type="button"
                  className="text-muted"
                  aria-label="Post options"
                >
                  ···
                </button>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-ink">{post.title}</h3>
                {post.spoilers ? (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[0.7rem] font-bold tracking-wide text-accent uppercase">
                    spoilers
                  </span>
                ) : null}
              </div>
              <div className="mt-3 text-sm leading-relaxed text-ink/90">
                {post.spoilers ? (
                  <SpoilerReveal>
                    <p>{post.body}</p>
                  </SpoilerReveal>
                ) : (
                  <p>{post.body}</p>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                <VoteControls
                  mode="arrow"
                  base={post.score}
                  vote={votes[post.id] ?? null}
                  onVote={(v) => onVote(post.id, v)}
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
                  onClick={() => onToggleThread(post.id)}
                  aria-expanded={expandedThread === post.id}
                >
                  <span aria-hidden>💬</span>
                  {post.commentCount + (threadReplies[post.id]?.length ?? 0)}
                  <span className="font-semibold">
                    {expandedThread === post.id ? "Hide comments" : "Comments"}
                  </span>
                </button>
                <button
                  type="button"
                  className="font-semibold text-accent hover:underline"
                  onClick={() =>
                    onOpenReply(openReply === post.id ? null : post.id)
                  }
                >
                  Reply
                </button>
              </div>
              {expandedThread === post.id ? (
                <CommentThread
                  threadId={post.id}
                  demoCount={post.commentCount}
                  userReplies={threadReplies[post.id] ?? []}
                  votes={votes}
                  onVote={onVote}
                />
              ) : null}
              {openReply === post.id ? (
                <ReplyBox
                  value={replyDraft[post.id] ?? ""}
                  onChange={(v) => onReplyDraft(post.id, v)}
                  onSubmit={() => onSubmitReply(post.id)}
                />
              ) : null}
            </article>
          ))}
          {posts.length === 0 ? (
            <p className="rounded-2xl bg-paper/70 px-4 py-8 text-center text-sm text-muted">
              No posts match these filters.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ReviewsPanel({
  userRating,
  userBreakdown,
  onRate,
  myReview,
  myReviewSpoiler,
  reviewDraft,
  reviewSpoiler,
  reviewEditing,
  onReviewDraft,
  onReviewSpoiler,
  onReviewEditing,
  onSaveReview,
  filter,
  onFilter,
  sort,
  onSort,
  writtenOnly,
  onWrittenOnly,
  followingOnly,
  onFollowingOnly,
  reviews,
  openReply,
  replyDraft,
  expandedThread,
  threadReplies,
  votes,
  onVote,
  onToggleThread,
  onOpenReply,
  onReplyDraft,
  onSubmitReply,
}: {
  userRating: number | null;
  userBreakdown: UserRatingBreakdown | null;
  onRate: (next: {
    rating: number | undefined;
    ratingBreakdown: UserRatingBreakdown | undefined;
  }) => void;
  myReview: string | null;
  myReviewSpoiler: boolean;
  reviewDraft: string;
  reviewSpoiler: boolean;
  reviewEditing: boolean;
  onReviewDraft: (v: string) => void;
  onReviewSpoiler: (v: boolean) => void;
  onReviewEditing: (v: boolean) => void;
  onSaveReview: () => void;
  filter: "all" | "5" | "4" | "3" | "2" | "1";
  onFilter: (v: "all" | "5" | "4" | "3" | "2" | "1") => void;
  sort: "newest" | "highest" | "lowest";
  onSort: (v: "newest" | "highest" | "lowest") => void;
  writtenOnly: boolean;
  onWrittenOnly: (v: boolean) => void;
  followingOnly: boolean;
  onFollowingOnly: (v: boolean) => void;
  reviews: ReturnType<typeof getBookCommunity>["reviews"];
  openReply: string | null;
  replyDraft: Record<string, string>;
  expandedThread: string | null;
  threadReplies: Record<string, ForumComment[]>;
  votes: Record<string, VoteValue>;
  onVote: (id: string, next: VoteValue) => void;
  onToggleThread: (id: string) => void;
  onOpenReply: (id: string | null) => void;
  onReplyDraft: (id: string, v: string) => void;
  onSubmitReply: (id: string) => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#564d6a] bg-[#3a324f] p-4 sm:p-5">
      <div className="rounded-2xl border border-[#4a425c] bg-paper px-4 py-3">
        <p className="text-sm font-semibold text-ink">Your rating</p>
        <UserRatingEditor
          className="mt-2"
          rating={userRating}
          breakdown={userBreakdown}
          onChange={onRate}
          size="sm"
        />
        <div className="mt-3 border-t border-[#3f3654] pt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-ink/70 uppercase">
              Your review
            </p>
            {myReview && !reviewEditing ? (
              <button
                type="button"
                onClick={() => onReviewEditing(true)}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Edit
              </button>
            ) : null}
          </div>
          {reviewEditing || !myReview ? (
            <>
              <textarea
                value={reviewDraft}
                onChange={(e) => onReviewDraft(e.target.value)}
                rows={4}
                placeholder="Write your review…"
                className="mt-2 w-full resize-none rounded-xl border border-[#564d6a] bg-[#3a324f] px-3 py-2 text-sm outline-none focus:border-forest/40"
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-ink">
                <input
                  type="checkbox"
                  checked={reviewSpoiler}
                  onChange={(e) => onReviewSpoiler(e.target.checked)}
                  className="accent-forest"
                />
                Contains spoilers
              </label>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onSaveReview}
                  className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-paper"
                >
                  {myReview ? "Save review" : "Post review"}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-2 text-sm leading-relaxed text-ink/90">
              {myReviewSpoiler ? (
                <SpoilerReveal>
                  <p>{myReview}</p>
                </SpoilerReveal>
              ) : (
                <p>{myReview}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={filter}
          onChange={(e) => onFilter(e.target.value as typeof filter)}
          className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as typeof sort)}
          className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink"
        >
          <option value="newest">Newest</option>
          <option value="highest">Highest</option>
          <option value="lowest">Lowest</option>
        </select>
        <label className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={writtenOnly}
            onChange={(e) => onWrittenOnly(e.target.checked)}
            className="accent-forest"
          />
          Written reviews only
        </label>
        <label className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={followingOnly}
            onChange={(e) => onFollowingOnly(e.target.checked)}
            className="accent-forest"
          />
          People I follow
        </label>
      </div>

      <div className="mt-4 space-y-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border border-[#4a425c] bg-paper p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm">
                  <span className="font-semibold text-ink">
                    {review.username}
                  </span>
                  <span className="ml-2 text-muted">{review.dateLabel}</span>
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StarRating value={review.rating} size="sm" />
                  <span className="text-sm font-semibold tabular-nums text-ink">
                    {review.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {review.spoilers ? (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[0.7rem] font-bold tracking-wide text-accent uppercase">
                    spoilers
                  </span>
                ) : null}
                <button type="button" className="text-muted" aria-label="Review options">
                  ···
                </button>
              </div>
            </div>

            <div className="mt-3 text-sm leading-relaxed text-ink/90">
              {review.spoilers ? (
                <SpoilerReveal>
                  <p>{review.body}</p>
                </SpoilerReveal>
              ) : (
                <p>{review.body}</p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
              <VoteControls
                mode="like"
                base={review.likes}
                vote={votes[review.id] ?? null}
                onVote={(v) => onVote(review.id, v)}
              />
              <button
                type="button"
                className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
                onClick={() => onToggleThread(review.id)}
                aria-expanded={expandedThread === review.id}
              >
                <span aria-hidden>💬</span>
                {review.commentCount + (threadReplies[review.id]?.length ?? 0)}
                <span>
                  {expandedThread === review.id ? "Hide comments" : "Comments"}
                </span>
              </button>
              <button
                type="button"
                className="font-semibold text-accent hover:underline"
                onClick={() =>
                  onOpenReply(openReply === review.id ? null : review.id)
                }
              >
                Reply
              </button>
            </div>
            {expandedThread === review.id ? (
              <CommentThread
                threadId={review.id}
                demoCount={review.commentCount}
                userReplies={threadReplies[review.id] ?? []}
                votes={votes}
                onVote={onVote}
              />
            ) : null}
            {openReply === review.id ? (
              <ReplyBox
                value={replyDraft[review.id] ?? ""}
                onChange={(v) => onReplyDraft(review.id, v)}
                onSubmit={() => onSubmitReply(review.id)}
              />
            ) : null}
          </article>
        ))}
        {reviews.length === 0 ? (
          <p className="rounded-2xl bg-paper/70 px-4 py-8 text-center text-sm text-muted">
            No reviews match these filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FeedPanel({
  bookTitle,
  bookAuthor,
  cover,
  color,
  description,
  stats,
  feed,
  votes,
  onVote,
}: {
  bookTitle: string;
  bookAuthor: string;
  cover: string;
  color: string;
  description: string;
  stats: ReturnType<typeof getBookCommunity>["stats"];
  feed: FeedActivity[];
  votes: Record<string, VoteValue>;
  onVote: (id: string, next: VoteValue) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm text-ink">
        <Stat icon="🏁" value={stats.finished} label="Finished" />
        <Stat icon="📖" value={stats.reading} label="Reading" />
        <Stat icon="👁" value={stats.reading} label="Currently reading" />
        <Stat icon="💡" value={stats.interested} label="Interested" />
        <Stat icon="🏷" value={stats.dnf} label="DNF" />
        <Stat icon="⏸" value={stats.paused} label="Paused" />
      </div>

      <div className="space-y-3">
        {feed.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.35rem] border border-line bg-cream-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="text-sm text-ink/90">
                <span className="font-semibold text-ink">{item.username}</span>{" "}
                <span className="text-muted">{feedVerb(item)}</span>
              </p>
              <span className="text-xs text-muted">{item.timeAgo}</span>
            </div>

            <div className="rounded-2xl border border-[#4a425c] bg-paper p-3">
              {item.kind === "progress" ? (
                <div className="flex gap-3">
                  <CoverThumb cover={cover} color={color} title={bookTitle} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{bookTitle}</p>
                    <p className="text-sm text-muted">{bookAuthor}</p>
                    <div className="mt-3 h-8 overflow-hidden rounded-full border border-line bg-[#2a2438]">
                      <div
                        className="flex h-full items-center bg-[#f5e28a] px-3 text-xs font-bold text-[#5c4a18]"
                        style={{ width: `${item.progressPct ?? 0}%` }}
                      >
                        {item.progressPct}%
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <CoverThumb cover={cover} color={color} title={bookTitle} />
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{bookTitle}</p>
                    <p className="text-sm text-muted">{bookAuthor}</p>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/85">
                      {description}
                    </p>
                    {item.kind === "interested" ? (
                      <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#5c4a18]/25 bg-[#f5e6a8] px-3 py-1 text-xs font-bold text-[#5c4a18]">
                        💡 interested
                      </span>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-3 text-sm">
              <VoteControls
                mode="like"
                base={item.likes}
                vote={votes[item.id] ?? null}
                onVote={(v) => onVote(item.id, v)}
              />
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2.5 py-1 text-ink/85">
                💬 {item.commentCount}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function feedVerb(item: FeedActivity) {
  switch (item.kind) {
    case "interested":
      return "is interested in reading...";
    case "progress":
      return "made progress on...";
    case "started":
      return "started reading...";
    case "finished":
      return "finished...";
    case "tbr":
      return "added to TBR...";
  }
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5" title={label}>
      <span aria-hidden>{icon}</span>
      <span className="font-semibold tabular-nums">{value.toLocaleString()}</span>
    </div>
  );
}

function CoverThumb({
  cover,
  color,
  title,
}: {
  cover: string;
  color: string;
  title: string;
}) {
  return (
    <div
      className="relative h-[88px] w-[58px] shrink-0 overflow-hidden rounded-lg border border-[#4a425c]"
      style={{ background: color }}
    >
      <Image src={cover} alt="" fill className="object-cover" sizes="58px" />
      <span className="sr-only">{title}</span>
    </div>
  );
}

function CommentThread({
  threadId,
  demoCount,
  userReplies,
  votes,
  onVote,
}: {
  threadId: string;
  demoCount: number;
  userReplies: ForumComment[];
  votes: Record<string, VoteValue>;
  onVote: (id: string, next: VoteValue) => void;
}) {
  const comments = [...getDemoComments(threadId, demoCount), ...userReplies];
  if (comments.length === 0) {
    return (
      <p className="mt-3 rounded-xl border border-dashed border-[#4a425c] bg-[#3a324f]/50 px-3 py-3 text-sm text-muted">
        No comments yet — be the first to reply.
      </p>
    );
  }
  return (
    <ul className="mt-3 space-y-2 border-t border-[#3f3654] pt-3">
      {comments.map((c) => (
        <li
          key={c.id}
          className="rounded-xl border border-[#4a425c] bg-[#3a324f]/70 px-3 py-2.5"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-semibold text-ink">{c.username}</span>
            <span>· {c.atLabel}</span>
            {c.spoilers ? (
              <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[0.62rem] font-bold tracking-wide text-accent uppercase">
                spoilers
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 text-sm leading-relaxed text-ink/90">
            {c.spoilers ? (
              <SpoilerReveal>
                <p>{c.body}</p>
              </SpoilerReveal>
            ) : (
              <p>{c.body}</p>
            )}
          </div>
          <div className="mt-2">
            <VoteControls
              mode="arrow"
              size="sm"
              base={c.score ?? 1}
              vote={votes[c.id] ?? null}
              onVote={(v) => onVote(c.id, v)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function VoteControls({
  mode,
  base,
  vote,
  onVote,
  size = "md",
}: {
  mode: "arrow" | "like";
  base: number;
  vote: VoteValue | null;
  onVote: (next: VoteValue) => void;
  size?: "sm" | "md";
}) {
  const display = scoreWithVote(base, vote);
  const compact = size === "sm";

  if (mode === "like") {
    const liked = vote === "like";
    return (
      <button
        type="button"
        onClick={() => onVote("like")}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold transition ${
          liked
            ? "border-[#b85a4a]/50 bg-[#b85a4a]/15 text-[#e8a090]"
            : "border-line bg-paper text-ink/85 hover:bg-[#3f3654]"
        } ${compact ? "text-xs" : "text-sm"}`}
        aria-pressed={liked}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <span aria-hidden>{liked ? "♥" : "♡"}</span>
        <span className="tabular-nums">{display}</span>
      </button>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border border-line bg-paper ${
        compact ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
      }`}
    >
      <button
        type="button"
        onClick={() => onVote("up")}
        className={`rounded px-1.5 py-0.5 font-semibold transition ${
          vote === "up"
            ? "bg-forest/25 text-forest"
            : "text-muted hover:bg-[#3f3654] hover:text-ink"
        }`}
        aria-pressed={vote === "up"}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span className="min-w-[1.5rem] text-center font-semibold tabular-nums text-ink">
        {display}
      </span>
      <button
        type="button"
        onClick={() => onVote("down")}
        className={`rounded px-1.5 py-0.5 font-semibold transition ${
          vote === "down"
            ? "bg-[#b85a4a]/25 text-[#e8a090]"
            : "text-muted hover:bg-[#3f3654] hover:text-ink"
        }`}
        aria-pressed={vote === "down"}
        aria-label="Downvote"
      >
        ▼
      </button>
    </span>
  );
}

function ReplyBox({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-3 rounded-2xl border border-[#4a425c] bg-[#3a324f] p-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Write a reply..."
        className="w-full resize-none bg-transparent text-sm text-ink outline-none"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-paper"
        >
          Post reply
        </button>
      </div>
    </div>
  );
}
