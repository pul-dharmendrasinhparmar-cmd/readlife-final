"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AppNav } from "@/components/layout/app-nav";
import { LeafIcon } from "@/components/icons";
import { SearchIcon } from "@/components/layout/nav-icons";
import {
  addToTbr,
  loadDiscoveryState,
  PRIORITY_LABELS,
  toggleFollow,
  toggleSavedList,
} from "@/lib/discovery-storage";
import {
  autocompleteSuggestions,
  booksByCategory,
  booksByGenre,
  DISCOVER_LISTS,
  DISCOVER_READERS,
  getBookById,
  getReaderById,
  getTop10TodayBooks,
  MOOD_BOOK_MAP,
  MOODS,
  searchAll,
} from "./data";
import { ListDetail } from "./list-detail";
import { TbrModal } from "./tbr-modal";
import { ToastProvider, useToast } from "./toast";
import "./discover.css";
import type {
  DiscoverBook,
  DiscoverList,
  DiscoverReader,
  DiscoverySourceType,
  DiscoveryState,
  TbrPriority,
} from "./types";

type Tab = "books" | "readers" | "lists";
type ResultFilter = "all" | "books" | "readers" | "lists";

export function SearchPage() {
  return (
    <ToastProvider>
      <SearchPageInner />
    </ToastProvider>
  );
}

function SearchPageInner() {
  const { toast } = useToast();
  const router = useRouter();
  const [discovery, setDiscovery] = useState<DiscoveryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [tab, setTab] = useState<Tab>("books");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [mood, setMood] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestIndex, setSuggestIndex] = useState(-1);

  const [tbrBook, setTbrBook] = useState<DiscoverBook | null>(null);
  const [tbrMeta, setTbrMeta] = useState<{
    sourceType: DiscoverySourceType;
    sourceName?: string;
    sourceUser?: string;
  }>({ sourceType: "recommendation" });
  const [activeList, setActiveList] = useState<DiscoverList | null>(null);
  const [matchReader, setMatchReader] = useState<DiscoverReader | null>(null);

  const openBook = useCallback(
    (book: DiscoverBook | string) => {
      const id = typeof book === "string" ? book : book.id;
      router.push(`/books/${id}`);
    },
    [router],
  );

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDiscovery(loadDiscoveryState());
    const t = window.setTimeout(() => setLoading(false), 280);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 180);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeSearch = debounced.length >= 2;
  const results = useMemo(() => searchAll(debounced), [debounced]);
  const suggestions = useMemo(
    () => autocompleteSuggestions(query),
    [query],
  );

  const flatSuggestions = useMemo(() => {
    const items: { type: string; label: string; value: string }[] = [];
    suggestions.books.forEach((b) =>
      items.push({ type: "BOOK", label: b.title, value: b.title }),
    );
    suggestions.authors.forEach((a) =>
      items.push({ type: "AUTHOR", label: a, value: a }),
    );
    suggestions.lists.forEach((l) =>
      items.push({ type: "LIST", label: l.title, value: l.title }),
    );
    return items;
  }, [suggestions]);

  const openTbr = useCallback(
    (
      book: DiscoverBook,
      meta?: {
        sourceType?: DiscoverySourceType;
        sourceName?: string;
        sourceUser?: string;
      },
    ) => {
      setTbrBook(book);
      setTbrMeta({
        sourceType: meta?.sourceType ?? "recommendation",
        sourceName: meta?.sourceName,
        sourceUser: meta?.sourceUser,
      });
    },
    [],
  );

  const confirmTbr = useCallback(
    (data: {
      priority: TbrPriority;
      note: string;
      sourceType: DiscoverySourceType;
    }) => {
      if (!discovery || !tbrBook) return;
      const next = addToTbr(discovery, {
        bookId: tbrBook.id,
        priority: data.priority,
        note: data.note,
        sourceType: data.sourceType,
        sourceName: tbrMeta.sourceName,
        sourceUser: tbrMeta.sourceUser,
      });
      setDiscovery(next);
      const label = PRIORITY_LABELS[data.priority];
      toast({
        text: `Added to ${label.label} ${label.emoji}`,
        actionLabel: "View in Library",
        actionHref: "/library",
      });
      setTbrBook(null);
    },
    [discovery, tbrBook, tbrMeta, toast],
  );

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggest || flatSuggestions.length === 0) {
      if (e.key === "Escape") setShowSuggest(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestIndex((i) => Math.min(i + 1, flatSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && suggestIndex >= 0) {
      e.preventDefault();
      setQuery(flatSuggestions[suggestIndex].value);
      setShowSuggest(false);
      setSuggestIndex(-1);
    } else if (e.key === "Escape") {
      setShowSuggest(false);
      setSuggestIndex(-1);
    }
  };

  if (!discovery) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#2a2438] text-muted">
        Opening discovery…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2a2438] text-ink">
      <AppNav />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <header className="relative max-w-3xl">
          <div className="pointer-events-none absolute -top-2 -left-1 text-gold/70" aria-hidden>
            <LeafIcon className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-[2.35rem] font-semibold tracking-[-0.03em] text-ink sm:text-[2.75rem]">
            Discover
          </h1>
          <p className="mt-2 max-w-xl text-[1.05rem] leading-relaxed text-muted">
            Find your next story, your reading people, or something fun between
            chapters.
          </p>
        </header>

        {/* Search bar */}
        <div className="relative mt-7 max-w-3xl">
          <label className="sr-only" htmlFor="discover-search">
            Search books, authors, readers, or reading lists
          </label>
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-soft">
            <SearchIcon className="h-[1.15rem] w-[1.15rem]" />
          </span>
          <input
            ref={inputRef}
            id="discover-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggest(true);
              setSuggestIndex(-1);
            }}
            onFocus={() => setShowSuggest(true)}
            onBlur={() => window.setTimeout(() => setShowSuggest(false), 140)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search books, authors, readers, or reading lists..."
            className="w-full rounded-full border border-[#564d6a] bg-[#3a324f] py-3.5 pr-16 pl-12 text-[0.98rem] text-ink shadow-[0_6px_20px_rgba(42,36,56,0.05)] outline-none placeholder:text-muted-soft transition focus:border-forest/50 focus:shadow-[0_0_0_4px_rgba(176,143,206,0.12)]"
            autoComplete="off"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 rounded-md border border-[#564d6a] bg-[#2a2438] px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted-soft sm:inline">
            ⌘ K
          </kbd>

          {showSuggest && query.trim().length >= 2 && flatSuggestions.length > 0 ? (
            <div
              className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[#4a425c] bg-[#3a324f] shadow-[0_16px_40px_rgba(42,36,56,0.14)]"
              role="listbox"
            >
              {flatSuggestions.map((item, i) => (
                <button
                  key={`${item.type}-${item.label}`}
                  type="button"
                  role="option"
                  aria-selected={i === suggestIndex}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm ${
                    i === suggestIndex ? "bg-[#3f3654]" : "hover:bg-[#2a2438]"
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQuery(item.value);
                    setShowSuggest(false);
                  }}
                >
                  <span className="w-14 text-[0.65rem] font-semibold tracking-wide text-muted uppercase">
                    {item.type}
                  </span>
                  <span className="font-medium text-ink">{item.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : activeSearch ? (
          <SearchResults
            query={debounced}
            results={results}
            filter={resultFilter}
            setFilter={setResultFilter}
            discovery={discovery}
            onClear={() => {
              setQuery("");
              setDebounced("");
            }}
            onOpenBook={openBook}
            onAddTbr={(b) => openTbr(b, { sourceType: "search" })}
            onOpenList={(l) => setActiveList(l)}
            onSaveList={(list) => {
              const next = toggleSavedList(discovery, list.id);
              setDiscovery(next);
              const saved = next.savedListIds.includes(list.id);
              toast({
                text: saved
                  ? "List saved to your Library."
                  : "Removed from saved lists.",
                actionLabel: saved ? "View in Library" : undefined,
                actionHref: saved ? "/library" : undefined,
              });
            }}
            onToggleFollow={(id) => {
              const reader = getReaderById(id);
              const next = toggleFollow(discovery, id);
              setDiscovery(next);
              const nowFollowing = next.followingIds.includes(id);
              toast({
                text: nowFollowing
                  ? `You're now following ${reader?.displayName ?? "them"}.`
                  : `Unfollowed ${reader?.displayName ?? "them"}.`,
              });
            }}
          />
        ) : (
          <>
            <div
              className="mt-8 flex gap-1 overflow-x-auto pb-1"
              role="tablist"
              aria-label="Discovery categories"
            >
              {(
                [
                  ["books", "Books"],
                  ["readers", "Readers"],
                  ["lists", "Reading Lists"],
                ] as const
              ).map(([id, label]) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(id)}
                    className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
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

            <div className="mt-8" role="tabpanel">
              {tab === "books" ? (
                <BooksDiscover
                  mood={mood}
                  setMood={setMood}
                  onOpenBook={openBook}
                  onAddTbr={(b) =>
                    openTbr(b, { sourceType: "recommendation" })
                  }
                />
              ) : null}
              {tab === "readers" ? (
                <ReadersDiscover
                  discovery={discovery}
                  onToggleFollow={(id) => {
                    const reader = getReaderById(id);
                    const next = toggleFollow(discovery, id);
                    setDiscovery(next);
                    const nowFollowing = next.followingIds.includes(id);
                    toast({
                      text: nowFollowing
                        ? `You're now following ${reader?.displayName ?? "them"}.`
                        : `Unfollowed ${reader?.displayName ?? "them"}.`,
                    });
                  }}
                  onExplainMatch={setMatchReader}
                />
              ) : null}
              {tab === "lists" ? (
                <ListsDiscover
                  discovery={discovery}
                  onView={setActiveList}
                  onSave={(list) => {
                    const next = toggleSavedList(discovery, list.id);
                    setDiscovery(next);
                    const saved = next.savedListIds.includes(list.id);
                    toast({
                      text: saved
                        ? "List saved to your Library."
                        : "Removed from saved lists.",
                      actionLabel: saved ? "View in Library" : undefined,
                      actionHref: saved ? "/library" : undefined,
                    });
                  }}
                />
              ) : null}
            </div>
          </>
        )}
      </main>

      {tbrBook ? (
        <TbrModal
          book={tbrBook}
          open
          onClose={() => setTbrBook(null)}
          onConfirm={confirmTbr}
          defaultSourceType={tbrMeta.sourceType}
          sourceName={tbrMeta.sourceName}
          sourceUser={tbrMeta.sourceUser}
        />
      ) : null}

      <ListDetail
        list={activeList}
        open={!!activeList}
        onClose={() => setActiveList(null)}
        discovery={discovery}
        onSaveToggle={() => {
          if (!activeList) return;
          const next = toggleSavedList(discovery, activeList.id);
          setDiscovery(next);
          const saved = next.savedListIds.includes(activeList.id);
          toast({
            text: saved
              ? "List saved to your Library."
              : "Removed from saved lists.",
          });
        }}
        onAddBookTbr={(bookId) => {
          const book = getBookById(bookId);
          const creator = activeList
            ? getReaderById(activeList.creatorId)
            : undefined;
          if (book && activeList) {
            openTbr(book, {
              sourceType: "reading_list",
              sourceName: activeList.title,
              sourceUser: creator?.username,
            });
          }
        }}
        onAddSelectedTbr={(ids) => {
          if (!activeList || ids.length === 0) return;
          const creator = getReaderById(activeList.creatorId);
          let next = discovery;
          ids.forEach((id) => {
            next = addToTbr(next, {
              bookId: id,
              priority: "read-soon",
              note: "",
              sourceType: "reading_list",
              sourceName: activeList.title,
              sourceUser: creator?.username,
            });
          });
          setDiscovery(next);
          toast({
            text: `Added ${ids.length} books to Read Soon 🌿`,
            actionLabel: "View in Library",
            actionHref: "/library",
          });
        }}
        onOpenBook={openBook}
      />

      {matchReader ? (
        <MatchPopover
          reader={matchReader}
          onClose={() => setMatchReader(null)}
        />
      ) : null}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mt-10 space-y-6" aria-hidden>
      <div className="flex gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-9 w-24 animate-pulse rounded-full bg-[#564d6a]" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="h-72 animate-pulse rounded-[1.25rem] bg-[#564d6a]/80"
          />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  primary,
}: {
  title: string;
  subtitle: string;
  primary?: boolean;
}) {
  return (
    <div className="mb-4 max-w-2xl">
      <h2
        className={`font-semibold text-ink ${
          primary
            ? "font-serif text-[1.65rem] tracking-[-0.02em]"
            : "font-serif text-[1.35rem]"
        }`}
      >
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function CarouselArrow({
  direction,
  disabled,
  onClick,
  label,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  const isLeft = direction === "left";
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`absolute top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-forest/35 bg-[#2a2438]/92 text-white shadow-[0_8px_22px_rgba(42,36,56,0.35)] backdrop-blur-sm transition sm:flex ${
        isLeft ? "left-0 -translate-x-1/3" : "right-0 translate-x-1/3"
      } ${
        disabled
          ? "pointer-events-none opacity-0"
          : "opacity-90 hover:border-forest/55 hover:bg-[#342c45] hover:opacity-100"
      }`}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
        className="h-4 w-4"
      >
        <path
          d={isLeft ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** Netflix-style horizontal row with page-scroll arrows (desktop) + touch swipe. */
function HorizontalCarousel({
  label,
  children,
  className = "",
  trackClassName = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
  trackClassName?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro.disconnect();
    };
  }, [updateEdges, children]);

  const scrollPage = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.85, 260);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className={`relative ${className}`}>
      <CarouselArrow
        direction="left"
        disabled={!canLeft}
        onClick={() => scrollPage(-1)}
        label={`Scroll ${label} left`}
      />
      <div
        ref={scrollerRef}
        className={`-mx-1 flex items-stretch overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${trackClassName}`}
      >
        {children}
      </div>
      <CarouselArrow
        direction="right"
        disabled={!canRight}
        onClick={() => scrollPage(1)}
        label={`Scroll ${label} right`}
      />
    </div>
  );
}

function BookCarousel({
  label,
  books,
  featured,
  footer,
  onOpenBook,
  onAddTbr,
}: {
  label: string;
  books: DiscoverBook[];
  featured?: boolean;
  footer?: (book: DiscoverBook) => ReactNode;
  onOpenBook: (b: DiscoverBook) => void;
  onAddTbr: (b: DiscoverBook) => void;
}) {
  if (books.length === 0) return null;

  return (
    <HorizontalCarousel label={label} trackClassName="items-stretch gap-3">
      {books.map((book) => (
        <div
          key={book.id}
          className={`flex shrink-0 snap-start flex-col ${
            featured
              ? "w-[10.75rem] sm:w-[12rem]"
              : "w-[10.25rem] sm:w-[11.25rem]"
          }`}
        >
          <BookCard
            book={book}
            featured={featured}
            onOpen={() => onOpenBook(book)}
            onAddTbr={() => onAddTbr(book)}
          />
          {footer?.(book)}
        </div>
      ))}
    </HorizontalCarousel>
  );
}

function BookCard({
  book,
  featured,
  onOpen,
  onAddTbr,
}: {
  book: DiscoverBook;
  featured?: boolean;
  onOpen: () => void;
  onAddTbr: () => void;
}) {
  return (
    <article
      className={`discover-card group flex h-full min-h-0 flex-1 flex-col gap-3 rounded-[1.25rem] p-3 transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(42,36,56,0.1)] ${
        featured ? "sm:p-3.5" : ""
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-0 flex-1 flex-col text-left"
      >
        <div
          className="relative mx-auto aspect-[2/3] w-full max-w-[140px] shrink-0 overflow-hidden rounded-lg shadow-md"
          style={{ background: book.color }}
        >
          <Image
            src={book.cover}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="140px"
          />
        </div>
        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <h3 className="line-clamp-2 font-serif text-[0.98rem] leading-snug font-semibold text-ink">
            {book.title}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{book.author}</p>
          <p className="mt-1.5 text-xs font-semibold text-ink">
            ★ {book.averageRating.toFixed(1)}
          </p>
          <p className="mt-1 line-clamp-1 text-[0.7rem] text-muted">
            {book.genres.slice(0, 2).join(" · ")}
          </p>
          <p className="mt-2 line-clamp-2 min-h-[2.75em] text-[0.72rem] leading-snug text-ink/70 italic">
            {book.recommendationReason ?? "\u00A0"}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onAddTbr}
        className="mt-auto shrink-0 rounded-full border border-forest/30 bg-[#2a2438] py-2 text-xs font-semibold text-white opacity-90 transition group-hover:opacity-100 hover:border-forest/50 hover:bg-[#342c45]"
      >
        + Add to TBR
      </button>
    </article>
  );
}

function TopTenToday({
  onOpenBook,
}: {
  onOpenBook: (b: DiscoverBook) => void;
}) {
  const books = getTop10TodayBooks();

  return (
    <section>
      <SectionHeader
        primary
        title="Top 10 Books Today"
        subtitle="Most opened on ReadLife in your region right now."
      />
      <HorizontalCarousel
        label="Top 10 Books Today"
        trackClassName="gap-5 px-2 sm:gap-6"
      >
        {books.map((book, index) => {
          const rank = index + 1;
          const isTen = rank === 10;

          return (
            <div
              key={book.id}
              className={`shrink-0 snap-start ${
                isTen ? "w-[9.25rem] sm:w-[10.1rem]" : "w-[8.15rem] sm:w-[8.85rem]"
              }`}
            >
              <button
                type="button"
                onClick={() => onOpenBook(book)}
                className="group flex w-full flex-col text-left"
                aria-label={`#${rank}: ${book.title} by ${book.author}`}
              >
                <div className="relative h-[9.75rem] w-full sm:h-[10.75rem]">
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute bottom-[-0.1rem] left-0 z-0 select-none font-serif font-bold leading-none text-[#2a2438] ${
                      isTen
                        ? "text-[5.1rem] tracking-[-0.07em] sm:text-[5.7rem]"
                        : "text-[6.85rem] tracking-[-0.03em] sm:text-[7.6rem]"
                    }`}
                    style={{
                      WebkitTextStroke:
                        "3px color-mix(in oklab, var(--forest) 88%, #141018)",
                      paintOrder: "stroke fill",
                    }}
                  >
                    {rank}
                  </span>
                  <div
                    className="absolute top-0 right-0 z-10 h-full w-[5.35rem] overflow-hidden rounded-md shadow-[0_12px_28px_rgba(42,36,56,0.22)] ring-1 ring-[#5b4e8c]/15 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_36px_rgba(42,36,56,0.3)] group-hover:ring-forest/35 sm:w-[5.9rem]"
                    style={{ background: book.color }}
                  >
                    <Image
                      src={book.cover}
                      alt=""
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                      sizes="100px"
                    />
                  </div>
                </div>
                <div className="mt-2.5 w-[5.35rem] self-end sm:w-[5.9rem]">
                  <p className="line-clamp-2 min-h-[2.3rem] font-serif text-[0.78rem] leading-snug font-semibold text-ink">
                    {book.title}
                  </p>
                  <p className="mt-0.5 truncate text-[0.65rem] text-muted">
                    {book.author}
                  </p>
                </div>
              </button>
            </div>
          );
        })}
      </HorizontalCarousel>
    </section>
  );
}

function BooksDiscover({
  mood,
  setMood,
  onOpenBook,
  onAddTbr,
}: {
  mood: string | null;
  setMood: (id: string | null) => void;
  onOpenBook: (b: DiscoverBook) => void;
  onAddTbr: (b: DiscoverBook) => void;
}) {
  const forYou = booksByCategory("for-you");
  const gems = booksByCategory("hidden-gems");
  const trending = booksByCategory("trending");
  const outside = booksByCategory("outside");
  const nonfiction = booksByGenre("Nonfiction").slice(0, 12);
  const moodBooks = mood
    ? (MOOD_BOOK_MAP[mood] ?? [])
        .map((id) => getBookById(id))
        .filter(Boolean) as DiscoverBook[]
    : [];

  return (
    <div className="space-y-12">
      <TopTenToday onOpenBook={onOpenBook} />

      <section>
        <SectionHeader
          title="For You"
          subtitle="Picked from your reading history and Reader DNA."
        />
        <BookCarousel
          label="For You"
          books={forYou}
          featured
          onOpenBook={onOpenBook}
          onAddTbr={onAddTbr}
        />
      </section>

      <section>
        <SectionHeader
          title="Nonfiction Picks"
          subtitle="Memoir, history, science, and ideas worth staying up for."
        />
        <BookCarousel
          label="Nonfiction Picks"
          books={nonfiction}
          onOpenBook={onOpenBook}
          onAddTbr={onAddTbr}
        />
      </section>

      <section>
        <SectionHeader
          title="✨ Hidden Gems"
          subtitle="Books your algorithm thinks deserve a little more attention."
        />
        <BookCarousel
          label="Hidden Gems"
          books={gems}
          onOpenBook={onOpenBook}
          onAddTbr={onAddTbr}
          footer={(book) => (
            <p className="mt-1 px-1 text-[0.68rem] text-muted">
              {book.readLifeReaders < 1000
                ? `Only ${book.readLifeReaders} ReadLife readers`
                : `${(book.readLifeReaders / 1000).toFixed(1)}K ReadLife readers`}
            </p>
          )}
        />
      </section>

      <section>
        <SectionHeader
          title="Trending With Readers Like You"
          subtitle="Popular right now among readers with similar taste."
        />
        <BookCarousel
          label="Trending With Readers Like You"
          books={trending}
          onOpenBook={onOpenBook}
          onAddTbr={onAddTbr}
        />
      </section>

      <section>
        <SectionHeader
          title="Step Outside Your Shelf"
          subtitle="A little different from your usual reads."
        />
        <BookCarousel
          label="Step Outside Your Shelf"
          books={outside}
          onOpenBook={onOpenBook}
          onAddTbr={onAddTbr}
        />
      </section>

      <section>
        <SectionHeader
          title="Browse by Mood"
          subtitle="What kind of story are you in the mood for?"
        />
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => {
            const active = mood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(active ? null : m.id)}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-forest bg-forest text-paper"
                    : "border-[#564d6a] bg-[#3a324f]/80 text-ink hover:border-forest/40"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        {mood && moodBooks.length > 0 ? (
          <div className="mt-5">
            <BookCarousel
              label="Browse by Mood"
              books={moodBooks}
              onOpenBook={onOpenBook}
              onAddTbr={onAddTbr}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ReaderCard({
  reader,
  following,
  onToggleFollow,
  onExplainMatch,
}: {
  reader: DiscoverReader;
  following: boolean;
  onToggleFollow: () => void;
  onExplainMatch: () => void;
}) {
  return (
    <article className="discover-card flex flex-col rounded-[1.25rem] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(42,36,56,0.08)]">
      <Link href={`/readers/${reader.username}`} className="flex gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#564d6a]">
          <Image
            src={reader.avatar}
            alt=""
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="min-w-0">
          <p className="font-serif text-base font-semibold text-ink">
            {reader.displayName}
          </p>
          <p className="text-xs text-muted">@{reader.username}</p>
          <p className="mt-1 text-xs text-ink/75">
            🌙 {reader.readingPersonality}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={onExplainMatch}
        className="mt-3 self-start rounded-full bg-[#5b4e8c] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#4a3d73]"
      >
        {reader.readingMatch}% Reading Match
      </button>
      <p className="mt-2 text-[0.72rem] text-muted">
        {reader.favoriteGenres.join(" · ")}
      </p>
      <p className="mt-1 text-[0.72rem] text-ink/75">
        Currently reading: {reader.currentBook}
      </p>
      <button
        type="button"
        onClick={onToggleFollow}
        className={`mt-3 rounded-full py-2 text-xs font-semibold ${
          following
            ? "bg-[#2a2438]/10 text-[#2a2438]"
            : "bg-forest text-paper hover:bg-forest-deep"
        }`}
      >
        {following ? "Following ✓" : "Follow"}
      </button>
    </article>
  );
}

function ReadersDiscover({
  discovery,
  onToggleFollow,
  onExplainMatch,
}: {
  discovery: DiscoveryState;
  onToggleFollow: (id: string) => void;
  onExplainMatch: (r: DiscoverReader) => void;
}) {
  const groups: { title: string; section: DiscoverReader["section"] }[] = [
    { title: "Similar Taste", section: "similar" },
    { title: "Readers Who Could Broaden Your Shelf", section: "broaden" },
    { title: "Popular List Makers", section: "list-makers" },
    { title: "New Readers to Discover", section: "new" },
    { title: "Readers Followed by Your Friends", section: "friends-follow" },
  ];

  return (
    <div className="space-y-10">
      <SectionHeader
        primary
        title="Readers You Might Like"
        subtitle="Find people who read like you—or completely differently."
      />
      {groups.map((g) => {
        const readers = DISCOVER_READERS.filter((r) => r.section === g.section);
        return (
          <section key={g.section}>
            <h3 className="mb-3 font-serif text-lg font-semibold text-ink">
              {g.title}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {readers.map((reader) => (
                <ReaderCard
                  key={reader.id}
                  reader={reader}
                  following={discovery.followingIds.includes(reader.id)}
                  onToggleFollow={() => onToggleFollow(reader.id)}
                  onExplainMatch={() => onExplainMatch(reader)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ListCard({
  list,
  saved,
  onView,
  onSave,
  discovery,
}: {
  list: DiscoverList;
  saved: boolean;
  onView: () => void;
  onSave: () => void;
  discovery: DiscoveryState;
}) {
  const creator = getReaderById(list.creatorId);
  const covers = list.bookIds
    .slice(0, 4)
    .map((id) => getBookById(id))
    .filter(Boolean) as DiscoverBook[];
  const progress = listProgressSafe(discovery, list.bookIds);

  return (
    <article className="discover-card rounded-[1.25rem] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(42,36,56,0.08)]">
      <h3 className="font-serif text-lg leading-snug font-semibold text-ink">
        {list.title}
      </h3>
      {creator ? (
        <p className="mt-1 flex items-center gap-2 text-xs text-muted">
          <span className="relative inline-block h-5 w-5 overflow-hidden rounded-full">
            <Image src={creator.avatar} alt="" fill className="object-cover" sizes="20px" />
          </span>
          by @{creator.username}
        </p>
      ) : null}
      <div className="mt-3 flex -space-x-2">
        {covers.map((b) => (
          <div
            key={b.id}
            className="relative h-16 w-11 overflow-hidden rounded-md border-2 border-[#F3F4F8] shadow"
            style={{ background: b.color }}
          >
            <Image src={b.cover} alt="" fill className="object-cover" sizes="44px" />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        {list.bookIds.length} books · {list.saveCount.toLocaleString()} saves ·{" "}
        {list.readerCount} readers started
      </p>
      {progress.read > 0 ? (
        <p className="mt-1 text-xs font-medium text-ink/80">
          You&apos;ve read {progress.read} of {progress.total}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onView}
          className="flex-1 rounded-full bg-forest py-2 text-xs font-semibold text-paper hover:bg-forest-deep"
        >
          View List
        </button>
        <button
          type="button"
          onClick={onSave}
          className={`flex-1 rounded-full border py-2 text-xs font-semibold ${
            saved
              ? "border-forest/20 bg-[#2a2438]/10 text-[#2a2438]"
              : "border-forest/35 text-ink hover:bg-[#2a2438]/8"
          }`}
        >
          {saved ? "Saved ✓" : "Save List"}
        </button>
      </div>
    </article>
  );
}

function listProgressSafe(discovery: DiscoveryState, bookIds: string[]) {
  const read = bookIds.filter((id) => discovery.readBookIds.includes(id)).length;
  return { read, total: bookIds.length };
}

function ListsDiscover({
  discovery,
  onView,
  onSave,
}: {
  discovery: DiscoveryState;
  onView: (l: DiscoverList) => void;
  onSave: (l: DiscoverList) => void;
}) {
  const groups: { title: string; section: DiscoverList["section"] }[] = [
    { title: "Trending Lists", section: "trending" },
    { title: "Made for Your Taste", section: "for-you" },
    { title: "From Readers You Follow", section: "following" },
    { title: "Short & Sweet", section: "short" },
    { title: "Outside Your Comfort Zone", section: "outside" },
  ];

  return (
    <div className="space-y-10">
      <SectionHeader
        primary
        title="Lists Made by Readers"
        subtitle="Discover books through people, not just algorithms."
      />
      {groups.map((g) => {
        const lists = DISCOVER_LISTS.filter((l) => l.section === g.section);
        if (!lists.length) return null;
        return (
          <section key={g.section}>
            <h3 className="mb-3 font-serif text-lg font-semibold text-ink">
              {g.title}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  saved={discovery.savedListIds.includes(list.id)}
                  onView={() => onView(list)}
                  onSave={() => onSave(list)}
                  discovery={discovery}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SearchResults({
  query,
  results,
  filter,
  setFilter,
  discovery,
  onClear,
  onOpenBook,
  onAddTbr,
  onOpenList,
  onSaveList,
  onToggleFollow,
}: {
  query: string;
  results: ReturnType<typeof searchAll>;
  filter: ResultFilter;
  setFilter: (f: ResultFilter) => void;
  discovery: DiscoveryState;
  onClear: () => void;
  onOpenBook: (b: DiscoverBook) => void;
  onAddTbr: (b: DiscoverBook) => void;
  onOpenList: (l: DiscoverList) => void;
  onSaveList: (l: DiscoverList) => void;
  onToggleFollow: (id: string) => void;
}) {
  const total =
    results.books.length + results.readers.length + results.lists.length;
  const empty = total === 0;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Results for &ldquo;{query}&rdquo;
          </h2>
          <p className="mt-1 text-sm text-muted">
            {empty ? "Nothing matched this search." : `${total} matches`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
        >
          Clear Search
        </button>
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto">
        {(
          [
            ["all", "All"],
            ["books", "Books"],
            ["readers", "Readers"],
            ["lists", "Lists"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              filter === id
                ? "bg-forest text-paper"
                : "text-ink/70 hover:bg-[#3f3654]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {empty ? (
        <div className="mt-12 max-w-md text-center sm:text-left">
          <p className="font-serif text-2xl font-semibold text-ink">
            No stories hiding here yet.
          </p>
          <p className="mt-2 text-muted">
            Try another title, author, reader, or list.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={onClear}
              className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper"
            >
              Clear Search
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border border-forest/35 px-5 py-2.5 text-sm font-semibold text-ink"
            >
              Explore Books
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {(filter === "all" || filter === "books") && results.books.length > 0 ? (
            <section>
              <h3 className="mb-3 font-serif text-lg font-semibold text-ink">
                Books
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {results.books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onOpen={() => onOpenBook(book)}
                    onAddTbr={() => onAddTbr(book)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {(filter === "all" || filter === "lists") && results.lists.length > 0 ? (
            <section>
              <h3 className="mb-3 font-serif text-lg font-semibold text-ink">
                Reading Lists
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.lists.map((list) => (
                  <ListCard
                    key={list.id}
                    list={list}
                    saved={discovery.savedListIds.includes(list.id)}
                    onView={() => onOpenList(list)}
                    onSave={() => onSaveList(list)}
                    discovery={discovery}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {(filter === "all" || filter === "readers") &&
          results.readers.length > 0 ? (
            <section>
              <h3 className="mb-3 font-serif text-lg font-semibold text-ink">
                Readers
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.readers.map((reader) => (
                  <ReaderCard
                    key={reader.id}
                    reader={reader}
                    following={discovery.followingIds.includes(reader.id)}
                    onToggleFollow={() => onToggleFollow(reader.id)}
                    onExplainMatch={() => undefined}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function MatchPopover({
  reader,
  onClose,
}: {
  reader: DiscoverReader;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#2a2438]/25"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 max-w-sm rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f] p-5 shadow-xl"
      >
        <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
          {reader.readingMatch}% Reading Match
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          You both love {reader.matchReasons.slice(0, -1).join(", ")}
          {reader.matchReasons.length > 1 ? ", and " : ""}
          {reader.matchReasons[reader.matchReasons.length - 1]}.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
