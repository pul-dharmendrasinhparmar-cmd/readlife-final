"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { TbrCoachPanel } from "@/components/ai/tbr-coach-panel";
import { AppNav } from "@/components/layout/app-nav";
import { LeafIcon } from "@/components/icons";
import { SearchIcon } from "@/components/layout/nav-icons";
import {
  booksByCategory,
  getBookById,
  getListById,
  getReaderById,
} from "@/components/search/data";
import { ToastProvider, useToast } from "@/components/search/toast";
import type {
  DiscoverBook,
  DiscoveryState,
  LibraryEntry,
  LibraryStatus,
  TbrPriority,
} from "@/components/search/types";
import {
  countByStatus,
  FORMAT_LABELS,
  getEntry,
  listProgress,
  loadDiscoveryState,
  moveTbrPriority,
  PRIORITY_LABELS,
  removeFromLibrary,
  saveDiscoveryState,
  setLibraryStatus,
  SOURCE_OPTIONS,
  tbrAgeDays,
  toggleSavedList,
  updateLibraryEntry,
} from "@/lib/discovery-storage";
import { LibraryDrawer, StatusBadge } from "./library-drawer";
type Tab =
  | "all"
  | "reading"
  | "read"
  | "tbr"
  | "favorites"
  | "reviewed"
  | "paused"
  | "dnf"
  | "lists";

type ViewMode = "grid" | "shelf" | "list";

type SortKey =
  | "updated"
  | "added"
  | "title"
  | "author"
  | "rating-high"
  | "rating-low"
  | "finished-new"
  | "finished-old"
  | "priority"
  | "source";

type Filters = {
  genres: string[];
  formats: string[];
  sources: string[];
  minRating: number | null;
};

const EMPTY_FILTERS: Filters = {
  genres: [],
  formats: [],
  sources: [],
  minRating: null,
};

export function LibraryPage() {
  return (
    <ToastProvider>
      <LibraryPageInner />
    </ToastProvider>
  );
}

function LibraryPageInner() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const aiParam = searchParams.get("ai");
  const [state, setState] = useState<DiscoveryState | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [view, setView] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [readYear, setReadYear] = useState<"all" | "this" | "last">("all");
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [cleanupIndex, setCleanupIndex] = useState(0);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [menuId, setMenuId] = useState<string | null>(null);

  const openBook = (id: string) => router.push(`/books/${id}`);

  useEffect(() => {
    setState(loadDiscoveryState());
  }, []);

  useEffect(() => {
    if (aiParam === "tbr") {
      setTab("tbr");
      window.setTimeout(() => {
        document
          .getElementById("ai-tbr-coach")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [aiParam]);

  const persist = (next: DiscoveryState) => {
    saveDiscoveryState(next);
    setState(loadDiscoveryState());
  };

  const counts = useMemo(
    () => (state ? countByStatus(state) : null),
    [state],
  );

  const catalog = useMemo(() => {
    if (!state) return [] as { entry: LibraryEntry; book: DiscoverBook }[];
    return state.entries
      .map((entry) => {
        const book = getBookById(entry.bookId);
        return book ? { entry, book } : null;
      })
      .filter(Boolean) as { entry: LibraryEntry; book: DiscoverBook }[];
  }, [state]);

  const filtered = useMemo(() => {
    let rows = catalog;

    if (tab === "reading") rows = rows.filter((r) => r.entry.status === "reading");
    else if (tab === "read") rows = rows.filter((r) => r.entry.status === "read");
    else if (tab === "tbr") rows = rows.filter((r) => r.entry.status === "tbr");
    else if (tab === "paused") rows = rows.filter((r) => r.entry.status === "paused");
    else if (tab === "dnf") rows = rows.filter((r) => r.entry.status === "dnf");
    else if (tab === "favorites")
      rows = rows.filter((r) => r.entry.isFavorite);
    else if (tab === "reviewed") rows = rows.filter((r) => !!r.entry.review);

    if (tab === "read" && readYear !== "all") {
      const year = new Date().getFullYear();
      const target = readYear === "this" ? year : year - 1;
      rows = rows.filter((r) => {
        if (!r.entry.dateFinished) return false;
        return new Date(r.entry.dateFinished).getFullYear() === target;
      });
    }

    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(({ book, entry }) => {
        const hay = [
          book.title,
          book.author,
          ...book.genres,
          ...(entry.tags ?? []),
          entry.note ?? "",
          entry.review ?? "",
          entry.sourceUser ?? "",
          entry.sourceName ?? "",
          entry.sourceType ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    if (filters.genres.length) {
      rows = rows.filter(({ book }) =>
        filters.genres.some((g) => book.genres.includes(g)),
      );
    }
    if (filters.formats.length) {
      rows = rows.filter(
        ({ entry }) =>
          entry.format && filters.formats.includes(entry.format),
      );
    }
    if (filters.sources.length) {
      rows = rows.filter(
        ({ entry }) =>
          entry.sourceType && filters.sources.includes(entry.sourceType),
      );
    }
    if (filters.minRating != null) {
      rows = rows.filter(
        ({ entry }) => (entry.rating ?? 0) >= (filters.minRating as number),
      );
    }

    const sorted = [...rows];
    sorted.sort((a, b) => {
      switch (sort) {
        case "title":
          return a.book.title.localeCompare(b.book.title);
        case "author":
          return a.book.author.localeCompare(b.book.author);
        case "added":
          return (
            new Date(b.entry.dateAdded).getTime() -
            new Date(a.entry.dateAdded).getTime()
          );
        case "rating-high":
          return (b.entry.rating ?? 0) - (a.entry.rating ?? 0);
        case "rating-low":
          return (a.entry.rating ?? 0) - (b.entry.rating ?? 0);
        case "finished-new":
          return (
            new Date(b.entry.dateFinished ?? 0).getTime() -
            new Date(a.entry.dateFinished ?? 0).getTime()
          );
        case "finished-old":
          return (
            new Date(a.entry.dateFinished ?? 0).getTime() -
            new Date(b.entry.dateFinished ?? 0).getTime()
          );
        case "priority": {
          const order: TbrPriority[] = [
            "read-next",
            "read-soon",
            "need-to-read",
            "someday",
          ];
          return (
            order.indexOf(a.entry.priority ?? "someday") -
            order.indexOf(b.entry.priority ?? "someday")
          );
        }
        case "source":
          return (a.entry.sourceType ?? "").localeCompare(
            b.entry.sourceType ?? "",
          );
        case "updated":
        default:
          return (
            new Date(b.entry.dateUpdated).getTime() -
            new Date(a.entry.dateUpdated).getTime()
          );
      }
    });
    return sorted;
  }, [catalog, tab, query, filters, sort, readYear]);

  const activePair = useMemo(() => {
    if (!activeBookId || !state) return null;
    const book = getBookById(activeBookId);
    const entry = getEntry(state, activeBookId);
    if (!book || !entry) return null;
    return { book, entry };
  }, [activeBookId, state]);

  const savedLists = useMemo(() => {
    if (!state) return [];
    return state.savedListIds
      .map((id) => getListById(id))
      .filter(Boolean);
  }, [state]);

  const recommendations = booksByCategory("for-you").slice(0, 4);

  const tbrInsights = useMemo(() => {
    if (!state) return [];
    const tips: string[] = [];
    const somedayOld = state.entries.filter(
      (e) =>
        e.status === "tbr" &&
        e.priority === "someday" &&
        tbrAgeDays(e) > 365,
    );
    if (somedayOld.length)
      tips.push(
        `You've had ${somedayOld.length} book${somedayOld.length > 1 ? "s" : ""} in Someday for over a year.`,
      );
    const mina = state.entries.filter(
      (e) =>
        e.status === "tbr" &&
        e.priority === "read-next" &&
        e.sourceUser === "minareads",
    );
    if (mina.length)
      tips.push(
        `${mina.length} book${mina.length > 1 ? "s" : ""} in Read Next ${mina.length > 1 ? "were" : "was"} recommended by Mina.`,
      );
    const friendRated = state.entries.filter(
      (e) => e.sourceType === "friend" && (e.rating ?? 0) >= 4.5,
    );
    if (friendRated.length >= 2)
      tips.push("You tend to rate friend recommendations highly.");
    return tips.slice(0, 3);
  }, [state]);

  if (!state || !counts) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#2a2438] text-muted">
        Opening your library…
      </div>
    );
  }

  const activeFilterChips: { key: string; label: string }[] = [
    ...filters.genres.map((g) => ({ key: `g-${g}`, label: g })),
    ...filters.formats.map((f) => ({
      key: `f-${f}`,
      label: FORMAT_LABELS[f as keyof typeof FORMAT_LABELS] ?? f,
    })),
    ...filters.sources.map((s) => ({
      key: `s-${s}`,
      label: SOURCE_OPTIONS.find((o) => o.id === s)?.label ?? s,
    })),
    ...(filters.minRating != null
      ? [{ key: "rating", label: `${filters.minRating}+ stars` }]
      : []),
  ];

  const sortOptions: { id: SortKey; label: string }[] =
    tab === "tbr"
      ? [
          { id: "priority", label: "Priority" },
          { id: "added", label: "Date Added" },
          { id: "source", label: "Recommendation Source" },
          { id: "title", label: "Title A–Z" },
        ]
      : tab === "read"
        ? [
            { id: "finished-new", label: "Newest Read" },
            { id: "finished-old", label: "Oldest Read" },
            { id: "rating-high", label: "Highest Rated" },
            { id: "rating-low", label: "Lowest Rated" },
            { id: "title", label: "Title A–Z" },
          ]
        : [
            { id: "updated", label: "Recently Updated" },
            { id: "added", label: "Recently Added" },
            { id: "title", label: "Title A–Z" },
            { id: "author", label: "Author A–Z" },
            { id: "rating-high", label: "Highest Rated" },
            { id: "rating-low", label: "Lowest Rated" },
          ];

  const somedayCleanup = state.entries.filter((e) => e.status === "tbr");

  return (
    <div className="min-h-screen bg-[#2a2438] text-ink">
      <AppNav />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="relative max-w-3xl">
          <div className="pointer-events-none absolute -top-1 left-0 text-gold/70" aria-hidden>
            <LeafIcon className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-[2.35rem] font-semibold tracking-[-0.03em] text-ink sm:text-[2.75rem]">
            Library
          </h1>
          <p className="mt-2 text-[1.05rem] text-muted">
            Every book that&apos;s been part of your reading life.
          </p>
          <p className="mt-1 text-sm font-medium text-ink/70">
            {counts.total} books across your shelves
          </p>
        </header>

        {/* Summary strip */}
        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              ["Reading Now", counts.reading],
              ["Read", counts.read],
              ["TBR", counts.tbr],
              ["Paused", counts.paused],
              ["DNF", counts.dnf],
              ["Favorites", counts.favorites],
              ["Reviewed", counts.reviewed],
            ] as const
          ).map(([label, n]) => (
            <div
              key={label}
              className="rounded-full border border-[#4a425c] bg-[#3a324f]/90 px-3.5 py-1.5 text-sm text-ink"
            >
              <span className="font-semibold">{label}:</span> {n}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          className="mt-8 flex gap-1 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Library status"
        >
          {(
            [
              ["all", "All"],
              ["reading", "Reading"],
              ["read", "Read"],
              ["tbr", "TBR"],
              ["favorites", "Favorites"],
              ["reviewed", "Reviewed"],
              ["paused", "Paused"],
              ["dnf", "DNF"],
              ["lists", "Saved Lists"],
            ] as const
          ).map(([id, label]) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setTab(id);
                  setSelectMode(false);
                  setSelected([]);
                }}
                className={`relative shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
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

        {tab !== "lists" ? (
          <>
            {/* Controls */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <label className="relative min-w-[220px] flex-1 max-w-md">
                <span className="sr-only">Search your library</span>
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-soft">
                  <SearchIcon className="h-4 w-4" />
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your library..."
                  className="w-full rounded-full border border-[#564d6a] bg-[#3a324f] py-2.5 pr-4 pl-10 text-sm text-ink outline-none placeholder:text-muted-soft focus:border-forest/45 focus:shadow-[0_0_0_3px_rgba(176,143,206,0.1)]"
                />
              </label>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-full border border-[#564d6a] bg-[#3a324f] px-3.5 py-2.5 text-sm font-semibold text-ink outline-none"
                aria-label="Sort"
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="rounded-full border border-[#564d6a] bg-[#3a324f] px-4 py-2.5 text-sm font-semibold text-ink hover:bg-[#3f3654]"
              >
                Filters
                {activeFilterChips.length
                  ? ` · ${activeFilterChips.length}`
                  : ""}
              </button>

              <div className="flex rounded-full border border-[#564d6a] bg-[#3a324f] p-1">
                {(
                  [
                    ["grid", "Grid"],
                    ["shelf", "Shelf"],
                    ["list", "List"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setView(id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      view === id
                        ? "bg-forest text-paper"
                        : "text-ink/70 hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectMode((v) => !v);
                  setSelected([]);
                }}
                className="rounded-full px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-[#3f3654]"
              >
                {selectMode ? "Cancel" : "Select"}
              </button>
            </div>

            {activeFilterChips.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => {
                      if (chip.key.startsWith("g-"))
                        setFilters((f) => ({
                          ...f,
                          genres: f.genres.filter((g) => g !== chip.label),
                        }));
                      else if (chip.key.startsWith("f-"))
                        setFilters((f) => ({
                          ...f,
                          formats: f.formats.filter(
                            (x) =>
                              (FORMAT_LABELS[x as keyof typeof FORMAT_LABELS] ??
                                x) !== chip.label,
                          ),
                        }));
                      else if (chip.key.startsWith("s-"))
                        setFilters((f) => ({
                          ...f,
                          sources: f.sources.filter(
                            (x) =>
                              (SOURCE_OPTIONS.find((o) => o.id === x)?.label ??
                                x) !== chip.label,
                          ),
                        }));
                      else setFilters((f) => ({ ...f, minRating: null }));
                    }}
                    className="rounded-full bg-[#3f3654] px-3 py-1 text-xs font-semibold text-ink"
                  >
                    {chip.label} ×
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="text-xs font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Clear All Filters
                </button>
              </div>
            ) : null}

            {tab === "read" ? (
              <div className="mt-4 flex gap-2">
                {(
                  [
                    ["all", "All Time"],
                    ["this", "This Year"],
                    ["last", "Last Year"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setReadYear(id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      readYear === id
                        ? "bg-forest text-paper"
                        : "bg-[#3a324f] text-ink/70"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            {tab === "tbr" ? (
              <TbrSection
                rows={filtered}
                insights={tbrInsights}
                selectMode={selectMode}
                selected={selected}
                setSelected={setSelected}
                menuId={menuId}
                setMenuId={setMenuId}
                openCoach={aiParam === "tbr"}
                onOpen={openBook}
                onMove={(bookId, priority) => {
                  persist(moveTbrPriority(state, bookId, priority));
                  toast({
                    text: `Moved to ${PRIORITY_LABELS[priority].label} ${PRIORITY_LABELS[priority].emoji}`,
                  });
                }}
                onCleanup={() => {
                  setCleanupIndex(0);
                  setCleanupOpen(true);
                }}
              />
            ) : tab === "reading" ? (
              <ReadingSection
                rows={filtered}
                onOpen={openBook}
              />
            ) : (
              <CollectionSection
                tab={tab}
                view={view}
                rows={filtered}
                selectMode={selectMode}
                selected={selected}
                setSelected={setSelected}
                menuId={menuId}
                setMenuId={setMenuId}
                onOpen={openBook}
                onQuickStatus={(bookId, status, extras) => {
                  persist(setLibraryStatus(state, bookId, status, extras));
                  const formatLabel =
                    extras?.format && FORMAT_LABELS[extras.format]
                      ? ` · ${FORMAT_LABELS[extras.format]}`
                      : "";
                  toast({
                    text:
                      status === "reading"
                        ? `Moved to Currently Reading${formatLabel}.`
                        : status === "read"
                          ? "Marked as Finished."
                          : `Status updated.`,
                  });
                }}
              />
            )}

            {selectMode && selected.length > 0 ? (
              <div className="sticky bottom-4 z-20 mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2 rounded-full border border-[#4a425c] bg-[#3a324f] px-4 py-3 shadow-lg">
                <span className="text-xs font-semibold text-ink">
                  {selected.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => {
                    let next = state;
                    selected.forEach((id) => {
                      next = updateLibraryEntry(next, id, { isFavorite: true });
                    });
                    persist(next);
                    toast({ text: "Added to Favorites." });
                    setSelected([]);
                  }}
                  className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-paper"
                >
                  Favorite
                </button>
                <button
                  type="button"
                  onClick={() => {
                    let next = state;
                    selected.forEach((id) => {
                      next = setLibraryStatus(next, id, "tbr", {
                        priority: "someday",
                      });
                    });
                    persist(next);
                    toast({ text: "Moved to Someday ☁️" });
                    setSelected([]);
                  }}
                  className="rounded-full border border-forest/35 px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  Move to Someday
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <SavedListsSection
            state={state}
            lists={savedLists}
            onRemove={(id) => {
              persist(toggleSavedList(state, id));
              toast({ text: "Removed from saved lists." });
            }}
          />
        )}

        {/* Based on your library */}
        {tab !== "lists" ? (
          <section className="mt-14 border-t border-[#4a425c]/80 pt-10">
            <h2 className="font-serif text-xl font-semibold text-ink">
              Based on Your Library
            </h2>
            <p className="mt-1 text-sm text-muted">
              Books that fit what you&apos;ve been loving lately.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {recommendations.map((book) => (
                <article
                  key={book.id}
                  className="rounded-[1.15rem] border border-[#4a425c]/80 bg-[#3a324f]/90 p-3"
                >
                  <div
                    className="relative mx-auto aspect-[2/3] w-full max-w-[110px] overflow-hidden rounded-lg"
                    style={{ background: book.color }}
                  >
                    <Image
                      src={book.cover}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="110px"
                    />
                  </div>
                  <p className="mt-2 font-serif text-sm font-semibold text-ink">
                    {book.title}
                  </p>
                  <p className="text-[0.7rem] text-muted">{book.author}</p>
                </article>
              ))}
            </div>
            <Link
              href="/search"
              className="mt-4 inline-flex text-sm font-semibold text-ink underline-offset-2 hover:underline"
            >
              View More in Search →
            </Link>
          </section>
        ) : null}
      </main>

      <LibraryDrawer
        open={!!activePair}
        book={activePair?.book ?? null}
        entry={activePair?.entry ?? null}
        discovery={state}
        onClose={() => setActiveBookId(null)}
        onSave={(patch) => {
          if (!activeBookId) return;
          persist(updateLibraryEntry(state, activeBookId, patch));
          if (patch.review !== undefined) toast({ text: "Review updated." });
          if (patch.isFavorite) toast({ text: "Added to Favorites." });
          if (patch.isFavorite === false) toast({ text: "Removed from Favorites." });
          if (patch.note !== undefined) toast({ text: "Note saved." });
        }}
        onStatus={(status, extras) => {
          if (!activeBookId) return;
          persist(setLibraryStatus(state, activeBookId, status, extras));
          const formatLabel =
            extras?.format && FORMAT_LABELS[extras.format]
              ? ` · ${FORMAT_LABELS[extras.format]}`
              : "";
          const messages: Partial<Record<LibraryStatus, string>> = {
            reading: `Moved to Currently Reading${formatLabel}.`,
            read: "Marked as Finished.",
            paused: `Paused at ${extras?.progressPct ?? getEntry(state, activeBookId)?.progressPct ?? 0}%.`,
            dnf: "Moved to DNF.",
            tbr: `Moved to ${PRIORITY_LABELS[extras?.priority ?? "someday"].label} ${PRIORITY_LABELS[extras?.priority ?? "someday"].emoji}`,
          };
          toast({ text: messages[status] ?? "Status updated." });
        }}
        onRemove={() => {
          if (!activeBookId) return;
          persist(removeFromLibrary(state, activeBookId));
          setActiveBookId(null);
          toast({ text: "Removed from Library." });
        }}
      />

      {filterOpen ? (
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          onClose={() => setFilterOpen(false)}
          genreOptions={[
            ...new Set(catalog.flatMap((r) => r.book.genres)),
          ].sort()}
        />
      ) : null}

      {cleanupOpen ? (
        <CleanupModal
          entries={somedayCleanup}
          index={cleanupIndex}
          setIndex={setCleanupIndex}
          onClose={() => setCleanupOpen(false)}
          onKeep={() => setCleanupIndex((i) => i + 1)}
          onMove={(priority) => {
            const e = somedayCleanup[cleanupIndex];
            if (!e) return;
            persist(moveTbrPriority(state, e.bookId, priority));
            setCleanupIndex((i) => i + 1);
          }}
          onRemove={() => {
            const e = somedayCleanup[cleanupIndex];
            if (!e) return;
            persist(removeFromLibrary(state, e.bookId));
            setCleanupIndex((i) => i + 1);
          }}
          onDone={(cleaned) => {
            setCleanupOpen(false);
            toast({ text: `You cleaned up ${cleaned} books.` });
          }}
        />
      ) : null}
    </div>
  );
}

function ReadingSection({
  rows,
  onOpen,
}: {
  rows: { entry: LibraryEntry; book: DiscoverBook }[];
  onOpen: (id: string) => void;
}) {
  if (!rows.length) {
    return (
      <Empty
        title="Nothing has your bookmark right now."
        cta="Find a Book"
        href="/search"
      />
    );
  }
  return (
    <section className="mt-6">
      <h2 className="font-serif text-xl font-semibold text-ink">
        Currently Reading
      </h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {rows.map(({ book, entry }) => (
          <article
            key={book.id}
            className="flex gap-4 rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f] p-4"
          >
            <button type="button" onClick={() => onOpen(book.id)} className="shrink-0">
              <div
                className="relative h-[120px] w-[80px] overflow-hidden rounded-lg shadow"
                style={{ background: book.color }}
              >
                <Image src={book.cover} alt="" fill className="object-cover" sizes="80px" />
              </div>
            </button>
            <div className="min-w-0 flex-1">
              <button type="button" onClick={() => onOpen(book.id)} className="text-left">
                <h3 className="font-serif text-lg font-semibold text-ink">
                  {book.title}
                </h3>
                <p className="text-sm text-muted">{book.author}</p>
              </button>
              <p className="mt-2 text-sm font-semibold text-ink">
                {entry.progressPct ?? 0}%
                {entry.pagesRead != null
                  ? ` · ${entry.pagesRead} / ${book.pageCount} pages`
                  : ""}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#564d6a]">
                <div
                  className="h-full rounded-full bg-forest"
                  style={{ width: `${entry.progressPct ?? 0}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                {entry.format ? FORMAT_LABELS[entry.format] : "Physical"}
                {entry.lastSessionLabel
                  ? ` · Last session: ${entry.lastSessionLabel}`
                  : ""}
              </p>
              {entry.minutesThisWeek ? (
                <p className="text-xs text-muted">
                  {entry.minutesThisWeek} min this week
                </p>
              ) : null}
              <Link
                href="/home"
                className="mt-3 inline-flex rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper hover:bg-forest-deep"
              >
                Continue Reading
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TbrSection({
  rows,
  insights,
  selectMode,
  selected,
  setSelected,
  menuId,
  setMenuId,
  openCoach = false,
  onOpen,
  onMove,
  onCleanup,
}: {
  rows: { entry: LibraryEntry; book: DiscoverBook }[];
  insights: string[];
  selectMode: boolean;
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
  menuId: string | null;
  setMenuId: (id: string | null) => void;
  openCoach?: boolean;
  onOpen: (id: string) => void;
  onMove: (bookId: string, priority: TbrPriority) => void;
  onCleanup: () => void;
}) {
  const priorities: TbrPriority[] = [
    "read-next",
    "read-soon",
    "someday",
    "need-to-read",
  ];

  if (!rows.length) {
    return (
      <Empty
        title="Your TBR cart is suspiciously light."
        cta="Discover Books"
        href="/search"
      />
    );
  }

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">
            Your TBR
          </h2>
          <p className="mt-1 text-sm text-muted">
            Organize what you actually want to read next.
          </p>
        </div>
        <button
          type="button"
          onClick={onCleanup}
          className="rounded-full border border-forest/35 px-4 py-2 text-sm font-semibold text-ink hover:bg-[#3f3654]"
        >
          TBR Cleanup
        </button>
      </div>

      <div id="ai-tbr-coach">
        <TbrCoachPanel
          tbrIds={rows.map((r) => r.book.id)}
          defaultOpen={openCoach}
        />
      </div>

      {insights.length > 0 ? (
        <div className="mt-4 space-y-2 rounded-[1.25rem] border border-[#4a425c] bg-[#342c45]/90 px-4 py-3">
          <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
            Smart TBR notes
          </p>
          {insights.map((tip) => (
            <p key={tip} className="text-sm text-ink/85">
              {tip}
            </p>
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-4">
        {priorities.map((priority) => {
          const items = rows.filter((r) => r.entry.priority === priority);
          const meta = PRIORITY_LABELS[priority];
          return (
            <div
              key={priority}
              className="rounded-[1.35rem] border border-[#4a425c]/90 bg-[#3a324f]/70 p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/book-id");
                if (id) onMove(id, priority);
              }}
            >
              <div className="mb-3 flex items-baseline justify-between px-1">
                <h3 className="font-serif text-base font-semibold text-ink">
                  {meta.emoji} {meta.label}
                </h3>
                <span className="text-xs text-muted">{items.length}</span>
              </div>
              <div className="space-y-2.5">
                {items.map(({ book, entry }) => (
                  <TbrCard
                    key={book.id}
                    book={book}
                    entry={entry}
                    selectMode={selectMode}
                    selected={selected.includes(book.id)}
                    onToggleSelect={() =>
                      setSelected((prev) =>
                        prev.includes(book.id)
                          ? prev.filter((x) => x !== book.id)
                          : [...prev, book.id],
                      )
                    }
                    menuOpen={menuId === book.id}
                    setMenuOpen={(open) => setMenuId(open ? book.id : null)}
                    onOpen={() => onOpen(book.id)}
                    onMove={onMove}
                  />
                ))}
                {!items.length ? (
                  <p className="px-1 py-6 text-center text-xs text-muted">
                    Empty shelf
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TbrCard({
  book,
  entry,
  selectMode,
  selected,
  onToggleSelect,
  menuOpen,
  setMenuOpen,
  onOpen,
  onMove,
}: {
  book: DiscoverBook;
  entry: LibraryEntry;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  menuOpen: boolean;
  setMenuOpen: (o: boolean) => void;
  onOpen: () => void;
  onMove: (bookId: string, priority: TbrPriority) => void;
}) {
  return (
    <article
      draggable={!selectMode}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/book-id", book.id);
      }}
      className="rounded-2xl border border-[#564d6a] bg-[#3a324f] p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex gap-2.5">
        {selectMode ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="mt-1 accent-forest"
            aria-label={`Select ${book.title}`}
          />
        ) : null}
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 gap-2.5 text-left">
          <div
            className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md"
            style={{ background: book.color }}
          >
            <Image src={book.cover} alt="" fill className="object-cover" sizes="44px" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-serif text-sm font-semibold text-ink">
              {book.title}
            </p>
            <p className="truncate text-[0.7rem] text-muted">{book.author}</p>
            {entry.note ? (
              <p className="mt-1 line-clamp-2 text-[0.68rem] text-ink/70 italic">
                {entry.note}
              </p>
            ) : null}
            {entry.sourceUser || entry.sourceName ? (
              <p className="mt-1 text-[0.65rem] text-muted">
                {entry.sourceUser ? `@${entry.sourceUser}` : null}
                {entry.sourceName ? ` · ${entry.sourceName}` : null}
              </p>
            ) : null}
          </div>
        </button>
        <div className="relative">
          <button
            type="button"
            aria-label="Move to…"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full px-2 py-1 text-ink/60 hover:bg-[#3f3654]"
          >
            ···
          </button>
          {menuOpen ? (
            <div className="absolute top-8 right-0 z-10 w-40 overflow-hidden rounded-xl border border-[#4a425c] bg-[#3a324f] shadow-lg">
              {(Object.keys(PRIORITY_LABELS) as TbrPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-[#3f3654]"
                  onClick={() => {
                    onMove(book.id, p);
                    setMenuOpen(false);
                  }}
                >
                  Move to {PRIORITY_LABELS[p].emoji} {PRIORITY_LABELS[p].label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function CollectionSection({
  tab,
  view,
  rows,
  selectMode,
  selected,
  setSelected,
  menuId,
  setMenuId,
  onOpen,
  onQuickStatus,
}: {
  tab: Tab;
  view: ViewMode;
  rows: { entry: LibraryEntry; book: DiscoverBook }[];
  selectMode: boolean;
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
  menuId: string | null;
  setMenuId: (id: string | null) => void;
  onOpen: (id: string) => void;
  onQuickStatus: (
    id: string,
    status: LibraryStatus,
    extras?: Partial<LibraryEntry>,
  ) => void;
}) {
  const headers: Partial<Record<Tab, { title: string; subtitle?: string }>> = {
    all: { title: "All Books" },
    read: {
      title: "Finished Books",
    },
    favorites: {
      title: "Books You Love",
      subtitle: "The ones you'd happily forget just to read again.",
    },
    reviewed: { title: "Reviewed" },
    paused: {
      title: "Paused",
      subtitle: "Not abandoned. Just waiting.",
    },
    dnf: {
      title: "DNF",
      subtitle: "Not every book has to be finished.",
    },
  };

  if (!rows.length) {
    const empties: Partial<Record<Tab, { title: string; cta: string }>> = {
      all: { title: "Your shelves are waiting for their first spine.", cta: "Discover Books" },
      favorites: { title: "Your forever shelf is waiting.", cta: "Find a Book" },
      reviewed: { title: "No reviews written yet.", cta: "Open a finished book" },
      paused: { title: "No books waiting on the sidelines.", cta: "Find a Book" },
      dnf: { title: "Nothing abandoned here yet.", cta: "Discover Books" },
      read: { title: "No finished books yet.", cta: "Find a Book" },
    };
    const e = empties[tab] ?? { title: "Nothing here yet.", cta: "Discover Books" };
    return <Empty title={e.title} cta={e.cta} href="/search" />;
  }

  const head = headers[tab];

  return (
    <section className="mt-6">
      {head ? (
        <div className="mb-4">
          <h2 className="font-serif text-xl font-semibold text-ink">
            {head.title}
          </h2>
          {head.subtitle ? (
            <p className="mt-1 text-sm text-muted">{head.subtitle}</p>
          ) : null}
        </div>
      ) : null}

      {view === "shelf" ? (
        <ShelfView rows={rows} onOpen={onOpen} />
      ) : view === "list" ? (
        <ul className="divide-y divide-[#564d6a] overflow-hidden rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f]">
          {rows.map(({ book, entry }) => (
            <li key={book.id}>
              <button
                type="button"
                onClick={() => onOpen(book.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#2a2438]"
              >
                <div
                  className="relative h-12 w-8 shrink-0 overflow-hidden rounded"
                  style={{ background: book.color }}
                >
                  <Image src={book.cover} alt="" fill className="object-cover" sizes="32px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif font-semibold text-ink">
                    {book.title}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {book.author}
                    {entry.rating ? ` · ★ ${entry.rating}` : ""}
                    {entry.dateFinished
                      ? ` · ${new Date(entry.dateFinished).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <StatusBadge entry={entry} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {rows.map(({ book, entry }) => (
            <LibraryCard
              key={book.id}
              book={book}
              entry={entry}
              selectMode={selectMode}
              selected={selected.includes(book.id)}
              onToggleSelect={() =>
                setSelected((prev) =>
                  prev.includes(book.id)
                    ? prev.filter((x) => x !== book.id)
                    : [...prev, book.id],
                )
              }
              menuOpen={menuId === book.id}
              setMenuOpen={(o) => setMenuId(o ? book.id : null)}
              onOpen={() => onOpen(book.id)}
              onQuickStatus={onQuickStatus}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function LibraryCard({
  book,
  entry,
  selectMode,
  selected,
  onToggleSelect,
  menuOpen,
  setMenuOpen,
  onOpen,
  onQuickStatus,
}: {
  book: DiscoverBook;
  entry: LibraryEntry;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  menuOpen: boolean;
  setMenuOpen: (o: boolean) => void;
  onOpen: () => void;
  onQuickStatus: (
    id: string,
    status: LibraryStatus,
    extras?: Partial<LibraryEntry>,
  ) => void;
}) {
  const [pickFormat, setPickFormat] = useState(false);

  useEffect(() => {
    if (!menuOpen) setPickFormat(false);
  }, [menuOpen]);

  return (
    <article className="group relative flex flex-col rounded-[1.25rem] border border-[#4a425c]/80 bg-[#3a324f]/90 p-3 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(42,36,56,0.1)]">
      {selectMode ? (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="absolute top-3 left-3 z-10 accent-forest"
          aria-label={`Select ${book.title}`}
        />
      ) : null}
      <button type="button" onClick={onOpen} className="text-left">
        <div
          className="relative mx-auto aspect-[2/3] w-full max-w-[130px] overflow-hidden rounded-lg shadow-md"
          style={{ background: book.color }}
        >
          <Image
            src={book.cover}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover transition group-hover:scale-[1.03]"
            sizes="130px"
          />
          {entry.isFavorite ? (
            <span className="absolute top-2 right-2 rounded-full bg-[#3a324f]/95 px-1.5 text-xs text-[#b85a4a]">
              ♥
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 font-serif text-[0.95rem] leading-snug font-semibold text-ink">
          {book.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted">{book.author}</p>
        <div className="mt-2">
          <StatusBadge entry={entry} />
        </div>
        {entry.review ? (
          <p className="mt-2 line-clamp-2 text-[0.7rem] text-ink/70 italic">
            “{entry.review}”
          </p>
        ) : null}
        {entry.dnfReason ? (
          <p className="mt-1 text-[0.68rem] text-muted">Why: {entry.dnfReason}</p>
        ) : null}
        {entry.pauseReason ? (
          <p className="mt-1 text-[0.68rem] text-muted">
            Paused: {entry.pauseReason}
          </p>
        ) : null}
        {entry.timesRead && entry.timesRead > 1 ? (
          <p className="mt-1 text-[0.68rem] font-semibold text-ink/70">
            Reread ×{entry.timesRead}
          </p>
        ) : null}
      </button>
      <div className="relative mt-2 self-end">
        <button
          type="button"
          aria-label="Book actions"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-full px-2 py-1 text-sm text-ink/50 opacity-70 hover:bg-[#3f3654] group-hover:opacity-100"
        >
          ···
        </button>
        {menuOpen ? (
          <div className="absolute right-0 bottom-8 z-10 w-44 overflow-hidden rounded-xl border border-[#4a425c] bg-[#3a324f] shadow-lg">
            {entry.status !== "reading" ? (
              pickFormat ? (
                <div className="px-2 py-2">
                  <p className="px-1 pb-1.5 text-[0.65rem] font-semibold text-muted">
                    Format
                  </p>
                  {(
                    [
                      ["physical", "Physical"],
                      ["ebook", "Ebook"],
                      ["audiobook", "Audiobook"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-ink hover:bg-[#3f3654]"
                      onClick={() => {
                        onQuickStatus(book.id, "reading", {
                          format: id,
                          preferredFormat: id,
                        });
                        setMenuOpen(false);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="mt-1 block w-full px-2 py-1 text-left text-[0.65rem] font-semibold text-muted hover:text-ink"
                    onClick={() => setPickFormat(false)}
                  >
                    Back
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-[#3f3654]"
                  onClick={() => setPickFormat(true)}
                >
                  Mark as Reading
                </button>
              )
            ) : null}
            {entry.status === "reading" || entry.status === "paused" ? (
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-[#3f3654]"
                onClick={() => {
                  onQuickStatus(book.id, "read");
                  setMenuOpen(false);
                }}
              >
                Mark Complete
              </button>
            ) : null}
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-[#3f3654]"
              onClick={() => {
                onOpen();
                setMenuOpen(false);
              }}
            >
              Open details
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ShelfView({
  rows,
  onOpen,
}: {
  rows: { entry: LibraryEntry; book: DiscoverBook }[];
  onOpen: (id: string) => void;
}) {
  const chunk = 8;
  const shelves: (typeof rows)[] = [];
  for (let i = 0; i < rows.length; i += chunk) {
    shelves.push(rows.slice(i, i + chunk));
  }
  return (
    <div className="space-y-8">
      {shelves.map((shelf, si) => (
        <div key={si}>
          <div className="flex min-h-[120px] items-end gap-1 overflow-x-auto rounded-t-xl bg-gradient-to-b from-[#c4a882]/40 to-[#a88968]/50 px-3 pt-4">
            {shelf.map(({ book, entry }) => (
              <button
                key={book.id}
                type="button"
                onClick={() => onOpen(book.id)}
                title={book.title}
                className="group relative flex h-[100px] w-[28px] shrink-0 items-end justify-center rounded-sm shadow-md transition hover:-translate-y-1"
                style={{ background: book.color }}
              >
                <span className="absolute inset-x-0 top-2 bottom-2 flex items-center justify-center overflow-hidden px-[2px]">
                  <span className="rotate-180 text-[0.55rem] leading-none font-semibold tracking-wide text-paper/90 [writing-mode:vertical-rl]">
                    {book.title.length > 22
                      ? book.title.slice(0, 20) + "…"
                      : book.title}
                  </span>
                </span>
                {entry.isFavorite ? (
                  <span className="absolute -top-2 text-[0.6rem] text-[#f5d0a0]">
                    ♥
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <div className="h-3 rounded-b-xl bg-[#8a6f4e] shadow-inner" />
        </div>
      ))}
    </div>
  );
}

function SavedListsSection({
  state,
  lists,
  onRemove,
}: {
  state: DiscoveryState;
  lists: ReturnType<typeof getListById>[];
  onRemove: (id: string) => void;
}) {
  if (!lists.length) {
    return (
      <Empty
        title="No saved lists yet."
        cta="Explore Lists"
        href="/search"
      />
    );
  }
  return (
    <section className="mt-6">
      <h2 className="font-serif text-xl font-semibold text-ink">
        Saved Lists
      </h2>
      <p className="mt-1 text-sm text-muted">
        Lists you kept from Discover — saving never auto-adds books to TBR.
      </p>
      <ul className="mt-5 space-y-3">
        {lists.map((list) => {
          if (!list) return null;
          const creator = getReaderById(list.creatorId);
          const progress = listProgress(state, list.bookIds);
          const pct = Math.round(
            (progress.read / Math.max(1, progress.total)) * 100,
          );
          return (
            <li
              key={list.id}
              className="rounded-[1.35rem] border border-[#4a425c] bg-[#3a324f] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-ink">
                    {list.title}
                  </h3>
                  <p className="text-xs text-muted">
                    {creator ? `@${creator.username}` : "Reader"} ·{" "}
                    {list.bookIds.length} books
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/search"
                    className="rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper"
                  >
                    Open List
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemove(list.id)}
                    className="rounded-full border border-forest/30 px-4 py-2 text-xs font-semibold text-ink"
                  >
                    Remove Saved List
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-muted">
                  <span>
                    You&apos;ve read {progress.read} of {progress.total}
                  </span>
                  <span className="font-semibold text-ink">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#564d6a]">
                  <div
                    className="h-full rounded-full bg-forest"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  {progress.avgRating
                    ? `Average rating: ${progress.avgRating}★ · `
                    : ""}
                  {progress.onTbr} currently on TBR
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Empty({
  title,
  cta,
  href,
}: {
  title: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="mt-10 max-w-md">
      <p className="font-serif text-xl font-semibold text-ink">{title}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper"
      >
        {cta}
      </Link>
    </div>
  );
}

function FilterPanel({
  filters,
  setFilters,
  onClose,
  genreOptions,
}: {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  onClose: () => void;
  genreOptions: string[];
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (key: keyof Filters, value: string) => {
    setFilters((f) => {
      if (key === "minRating") return f;
      const arr = f[key] as string[];
      return {
        ...f,
        [key]: arr.includes(value)
          ? arr.filter((x) => x !== value)
          : [...arr, value],
      };
    });
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-[#2a2438]/30"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto border-l border-[#4a425c] bg-[#3a324f] p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-ink">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink hover:bg-[#3f3654]"
          >
            Done
          </button>
        </div>

        <FilterGroup title="Genre">
          {genreOptions.map((g) => (
            <Chip
              key={g}
              active={filters.genres.includes(g)}
              onClick={() => toggle("genres", g)}
              label={g}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Format">
          {(Object.keys(FORMAT_LABELS) as (keyof typeof FORMAT_LABELS)[]).map(
            (f) => (
              <Chip
                key={f}
                active={filters.formats.includes(f)}
                onClick={() => toggle("formats", f)}
                label={FORMAT_LABELS[f]}
              />
            ),
          )}
        </FilterGroup>

        <FilterGroup title="Recommendation Source">
          {SOURCE_OPTIONS.map((s) => (
            <Chip
              key={s.id}
              active={filters.sources.includes(s.id)}
              onClick={() => toggle("sources", s.id)}
              label={s.label}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Minimum Rating">
          {[null, 3, 4, 5].map((n) => (
            <Chip
              key={String(n)}
              active={filters.minRating === n}
              onClick={() => setFilters((f) => ({ ...f, minRating: n }))}
              label={n == null ? "Any" : `${n}+`}
            />
          ))}
        </FilterGroup>

        <button
          type="button"
          onClick={() => setFilters(EMPTY_FILTERS)}
          className="mt-6 w-full rounded-full border border-forest/30 py-2.5 text-sm font-semibold text-ink"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6">
      <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
        active
          ? "bg-forest text-paper"
          : "border border-[#564d6a] text-ink hover:bg-[#3f3654]"
      }`}
    >
      {label}
    </button>
  );
}

function CleanupModal({
  entries,
  index,
  setIndex,
  onClose,
  onKeep,
  onMove,
  onRemove,
  onDone,
}: {
  entries: LibraryEntry[];
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  onClose: () => void;
  onKeep: () => void;
  onMove: (p: TbrPriority) => void;
  onRemove: () => void;
  onDone: (cleaned: number) => void;
}) {
  const [cleaned, setCleaned] = useState(0);
  const entry = entries[index];
  const book = entry ? getBookById(entry.bookId) : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!entry || !book || index >= entries.length) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <button type="button" className="absolute inset-0 bg-[#2a2438]/35" onClick={onClose} aria-label="Close" />
        <div className="relative z-10 max-w-sm rounded-[1.5rem] border border-[#4a425c] bg-[#3a324f] p-6 text-center shadow-xl">
          <p className="font-serif text-xl font-semibold text-ink">
            TBR feels lighter.
          </p>
          <p className="mt-2 text-sm text-muted">
            You cleaned up {cleaned} books.
          </p>
          <button
            type="button"
            onClick={() => onDone(cleaned)}
            className="mt-4 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-[#2a2438]/35" onClick={onClose} aria-label="Close" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-[1.5rem] border border-[#4a425c] bg-[#3a324f] p-6 shadow-xl"
      >
        <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
          TBR Cleanup · {index + 1} / {entries.length}
        </p>
        <div className="mt-4 flex gap-3">
          <div
            className="relative h-28 w-20 overflow-hidden rounded-lg"
            style={{ background: book.color }}
          >
            <Image src={book.cover} alt="" fill className="object-cover" sizes="80px" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink">
              {book.title}
            </h3>
            <p className="text-sm text-muted">{book.author}</p>
            <p className="mt-2 text-xs text-muted">
              {PRIORITY_LABELS[entry.priority ?? "someday"].emoji}{" "}
              {PRIORITY_LABELS[entry.priority ?? "someday"].label}
              {" · "}
              {tbrAgeDays(entry)} days on TBR
            </p>
            {entry.note ? (
              <p className="mt-2 text-xs text-ink/75 italic">“{entry.note}”</p>
            ) : null}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onKeep}
            className="rounded-full bg-forest py-2.5 text-xs font-semibold text-paper"
          >
            Keep
          </button>
          <button
            type="button"
            onClick={() => {
              onMove("read-soon");
              setCleaned((c) => c + 1);
            }}
            className="rounded-full border border-forest/35 py-2.5 text-xs font-semibold text-ink"
          >
            Read Soon 🌿
          </button>
          <button
            type="button"
            onClick={() => {
              onMove("someday");
              setCleaned((c) => c + 1);
            }}
            className="rounded-full border border-forest/35 py-2.5 text-xs font-semibold text-ink"
          >
            Someday ☁️
          </button>
          <button
            type="button"
            onClick={() => {
              onRemove();
              setCleaned((c) => c + 1);
            }}
            className="rounded-full py-2.5 text-xs font-semibold text-[#f0c8c0] hover:bg-[#5a3530]"
          >
            Remove
          </button>
        </div>
        <button
          type="button"
          onClick={() => setIndex(entries.length)}
          className="mt-3 w-full text-xs font-semibold text-muted underline-offset-2 hover:underline"
        >
          Finish cleanup
        </button>
      </div>
    </div>
  );
}
