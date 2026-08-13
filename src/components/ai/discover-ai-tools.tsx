"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AiAssistButton, AiBanner } from "@/components/ai/ai-banner";
import { getBookById, getReaderById } from "@/components/search/data";
import type { DiscoveryState } from "@/components/search/types";
import { aiFetch } from "@/lib/ai/client";
import {
  createOwnerList,
  loadProfileState,
} from "@/components/profile/profile-storage";

function buildTasteFromDiscovery(discovery: DiscoveryState) {
  const genres = new Set<string>();
  const favoriteIds: string[] = [];
  const excludeIds: string[] = [];
  for (const entry of discovery.entries ?? []) {
    excludeIds.push(entry.bookId);
    const book = getBookById(entry.bookId);
    book?.genres.forEach((g) => genres.add(g));
    if (entry.rating && entry.rating >= 4) favoriteIds.push(entry.bookId);
  }
  return {
    genres: [...genres].slice(0, 12),
    favoriteIds: favoriteIds.slice(0, 12),
    excludeIds,
  };
}

export function DiscoverAiTools({
  discovery,
  onAddTbr,
  onToggleFollow,
  initialTab = null,
}: {
  discovery: DiscoveryState;
  onAddTbr: (bookId: string) => void;
  onToggleFollow: (readerId: string) => void;
  initialTab?: "twins" | "gift" | "list" | "people" | null;
}) {
  const taste = useMemo(() => buildTasteFromDiscovery(discovery), [discovery]);
  const [tab, setTab] = useState<"twins" | "gift" | "list" | "people" | null>(
    initialTab,
  );

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  return (
    <section className="rounded-[1.35rem] border border-line bg-cream-card/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-[1.35rem] font-semibold text-ink">
            AI discovery tools
          </h2>
          <p className="mt-1 text-sm text-muted">
            Taste twins, gifts, lists, and friends on ReadLife.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["twins", "Readers like you"],
              ["people", "Add friends"],
              ["gift", "Gift for a friend"],
              ["list", "Make a list"],
            ] as const
          ).map(([id, label]) => (
            <AiAssistButton
              key={id}
              onClick={() => setTab((t) => (t === id ? null : id))}
            >
              {label}
            </AiAssistButton>
          ))}
        </div>
      </div>

      {tab === "twins" ? (
        <TasteTwinsPanel
          taste={taste}
          followingIds={discovery.followingIds}
          onToggleFollow={onToggleFollow}
        />
      ) : null}
      {tab === "people" ? <PeopleOnReadLifePanel /> : null}
      {tab === "gift" ? (
        <GiftRecsPanel excludeIds={taste.excludeIds} onAddTbr={onAddTbr} />
      ) : null}
      {tab === "list" ? (
        <ListCuratorPanel excludeIds={taste.excludeIds} onAddTbr={onAddTbr} />
      ) : null}
    </section>
  );
}

function TasteTwinsPanel({
  taste,
  followingIds,
  onToggleFollow,
}: {
  taste: { genres: string[]; favoriteIds: string[] };
  followingIds: string[];
  onToggleFollow: (readerId: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twins, setTwins] = useState<
    { id: string; blurb: string; overlap: string }[]
  >([]);

  async function run() {
    setLoading(true);
    setError(null);
    const res = await aiFetch<{
      twins: { id: string; blurb: string; overlap: string }[];
    }>("taste-twins", {
      genres: taste.genres,
      favoriteIds: taste.favoriteIds,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setTwins(res.data.twins ?? []);
  }

  return (
    <div className="mt-4 space-y-3">
      <AiAssistButton onClick={() => void run()} disabled={loading}>
        {loading ? "Matching…" : "Find taste twins"}
      </AiAssistButton>
      <AiBanner loading={loading} error={error} showDisclaimer={twins.length > 0} />
      <ul className="space-y-2">
        {twins.map((t) => {
          const reader = getReaderById(t.id);
          if (!reader) return null;
          const following = followingIds.includes(reader.id);
          return (
            <li
              key={t.id}
              className="flex flex-wrap items-start gap-3 rounded-xl border border-line bg-paper/70 p-3"
            >
              <Link
                href={`/readers/${reader.username}`}
                className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
              >
                <Image
                  src={reader.avatar}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/readers/${reader.username}`}
                  className="font-semibold text-ink hover:underline"
                >
                  {reader.displayName}{" "}
                  <span className="text-sm font-normal text-muted">
                    @{reader.username}
                  </span>
                </Link>
                <p className="text-xs text-accent">{t.overlap}</p>
                <p className="mt-1 text-sm text-ink/85">{t.blurb}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleFollow(reader.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      following
                        ? "bg-cream-card text-ink"
                        : "bg-forest text-[#2a2438]"
                    }`}
                  >
                    {following ? "Following ✓" : "Add friend"}
                  </button>
                  <Link
                    href={`/readers/${reader.username}`}
                    className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink hover:bg-cream-card"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type SocialPerson = {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  youFollow: boolean;
  friends: boolean;
};

function PeopleOnReadLifePanel() {
  const [people, setPeople] = useState<SocialPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/social/people");
      const data = (await res.json()) as {
        people?: SocialPerson[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not load readers.");
        setPeople([]);
        return;
      }
      setPeople(data.people ?? []);
    } catch {
      setError("Network error loading readers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggleFriend(username: string) {
    setBusy(username);
    setError(null);
    try {
      const res = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = (await res.json()) as {
        following?: boolean;
        friends?: boolean;
        user?: { id: string; username: string; displayName: string; avatar: string };
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not update friendship.");
        return;
      }
      setPeople((prev) =>
        prev.map((p) =>
          p.username === username
            ? {
                ...p,
                youFollow: !!data.following,
                friends: !!data.friends,
                followers: data.following
                  ? p.followers + (p.youFollow ? 0 : 1)
                  : Math.max(0, p.followers - (p.youFollow ? 1 : 0)),
              }
            : p,
        ),
      );
      if (data.user) {
        const { toggleLocalFriendPerson } = await import(
          "@/components/profile/profile-storage"
        );
        toggleLocalFriendPerson(
          {
            id: data.user.id,
            displayName: data.user.displayName,
            username: data.user.username,
            avatar: data.user.avatar,
            personality: "ReadLife member",
          },
          !!data.following,
        );
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm text-muted">
        Signed-up readers can add each other as friends and open full profiles.
        Sign in to connect.
      </p>
      <AiBanner loading={loading} error={error} showDisclaimer={false} />
      {!loading && people.length === 0 && !error ? (
        <p className="rounded-xl border border-dashed border-line px-3 py-4 text-sm text-muted">
          No other accounts yet — create a second signup to try friending, or
          follow dummy readers under Readers like you.
        </p>
      ) : null}
      <ul className="space-y-2">
        {people.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-paper/70 p-3"
          >
            <Link
              href={`/readers/${p.username}`}
              className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
            >
              <Image src={p.avatar} alt="" fill className="object-cover" sizes="40px" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/readers/${p.username}`}
                className="font-semibold text-ink hover:underline"
              >
                {p.displayName}{" "}
                <span className="text-sm font-normal text-muted">
                  @{p.username}
                </span>
              </Link>
              <p className="text-xs text-muted">
                {p.followers} followers
                {p.friends ? " · Friends" : p.youFollow ? " · Following" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy === p.username}
                onClick={() => void toggleFriend(p.username)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  p.friends
                    ? "bg-forest/25 text-ink"
                    : p.youFollow
                      ? "bg-cream-card text-ink"
                      : "bg-forest text-[#2a2438]"
                }`}
              >
                {p.friends
                  ? "Friends ✓"
                  : p.youFollow
                    ? "Following ✓"
                    : "Add friend"}
              </button>
              <Link
                href={`/readers/${p.username}`}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-cream-card"
              >
                Profile
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GiftRecsPanel({
  excludeIds,
  onAddTbr,
}: {
  excludeIds: string[];
  onAddTbr: (bookId: string) => void;
}) {
  const [prefs, setPrefs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [gifts, setGifts] = useState<
    { id: string; reason: string; note: string }[]
  >([]);

  async function run() {
    setLoading(true);
    setError(null);
    const res = await aiFetch<{
      gifts: { id: string; reason: string; note: string }[];
      message: string;
    }>("gift-recs", { prefs, excludeIds });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setGifts(res.data.gifts ?? []);
    setMessage(res.data.message ?? "");
  }

  return (
    <div className="mt-4 space-y-3">
      <textarea
        value={prefs}
        onChange={(e) => setPrefs(e.target.value)}
        rows={3}
        placeholder="What does your friend like? (genres, vibes, dealbreakers…)"
        className="w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-forest/40"
      />
      <AiAssistButton onClick={() => void run()} disabled={loading || !prefs.trim()}>
        {loading ? "Picking gifts…" : "Suggest gifts"}
      </AiAssistButton>
      <AiBanner loading={loading} error={error} showDisclaimer={gifts.length > 0} />
      {message ? (
        <div className="rounded-xl border border-line bg-paper/70 px-3 py-2 text-sm text-ink/90">
          <p className="text-xs font-semibold text-muted uppercase">Gift note</p>
          <p className="mt-1">{message}</p>
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-accent hover:underline"
            onClick={() => void navigator.clipboard?.writeText(message)}
          >
            Copy note
          </button>
        </div>
      ) : null}
      <ul className="space-y-2">
        {gifts.map((g) => {
          const book = getBookById(g.id);
          if (!book) return null;
          return (
            <li
              key={g.id}
              className="flex gap-3 rounded-xl border border-line bg-paper/70 p-3"
            >
              <Link
                href={`/books/${book.id}`}
                className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md"
              >
                <Image src={book.cover} alt="" fill className="object-cover" sizes="44px" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{book.title}</p>
                <p className="text-xs text-muted">{book.author}</p>
                <p className="mt-1 text-sm text-ink/85">{g.reason}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onAddTbr(book.id)}
                    className="rounded-full border border-forest/40 px-2.5 py-1 text-xs font-semibold text-forest"
                  >
                    Add to TBR
                  </button>
                  {g.note ? (
                    <button
                      type="button"
                      onClick={() => void navigator.clipboard?.writeText(g.note)}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Copy blurb
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ListCuratorPanel({
  excludeIds,
  onAddTbr,
}: {
  excludeIds: string[];
  onAddTbr: (bookId: string) => void;
}) {
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [books, setBooks] = useState<{ id: string; blurb: string }[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setSavedId(null);
    const res = await aiFetch<{
      title: string;
      description: string;
      books: { id: string; blurb: string }[];
    }>("list-curator", { brief, excludeIds });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setTitle(res.data.title ?? "");
    setDescription(res.data.description ?? "");
    setBooks(res.data.books ?? []);
  }

  function saveList() {
    if (!title || books.length === 0) return;
    const state = loadProfileState();
    const next = createOwnerList(state, {
      title,
      description,
      bookIds: books.map((b) => b.id),
      visibility: "public",
    });
    const created = next.lists[0];
    setSavedId(created?.id ?? null);
  }

  return (
    <div className="mt-4 space-y-3">
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={2}
        placeholder='e.g. "Summer slow-burn fantasy under 350 pages"'
        className="w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-forest/40"
      />
      <AiAssistButton onClick={() => void run()} disabled={loading || !brief.trim()}>
        {loading ? "Curating…" : "Curate list"}
      </AiAssistButton>
      <AiBanner loading={loading} error={error} showDisclaimer={books.length > 0} />
      {title ? (
        <div>
          <p className="font-serif text-lg font-semibold text-ink">{title}</p>
          <p className="text-sm text-muted">{description}</p>
        </div>
      ) : null}
      <ul className="space-y-2">
        {books.map((b) => {
          const book = getBookById(b.id);
          if (!book) return null;
          return (
            <li key={b.id} className="rounded-xl border border-line bg-paper/70 px-3 py-2">
              <Link href={`/books/${book.id}`} className="font-semibold text-ink hover:underline">
                {book.title}
              </Link>
              <p className="text-sm text-ink/85">{b.blurb}</p>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => onAddTbr(book.id)}
                  className="rounded-full border border-forest/40 px-2.5 py-1 text-xs font-semibold text-forest"
                >
                  Add to TBR
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {books.length > 0 ? (
        <button
          type="button"
          onClick={saveList}
          className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-[#2a2438]"
        >
          {savedId ? "Saved to profile ✓" : "Save list to profile"}
        </button>
      ) : null}
    </div>
  );
}
