import { DISCOVER_BOOKS, DISCOVER_READERS } from "@/components/search/data";

export function catalogCompact(excludeIds?: string[]) {
  const exclude = new Set(excludeIds ?? []);
  return DISCOVER_BOOKS.filter((b) => !exclude.has(b.id)).map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    genres: b.genres,
    pageCount: b.pageCount,
    averageRating: b.averageRating,
  }));
}

export function catalogIds(): Set<string> {
  return new Set(DISCOVER_BOOKS.map((b) => b.id));
}

export function getCatalogBook(id: string) {
  return DISCOVER_BOOKS.find((b) => b.id === id);
}

export function titlesForIds(ids: string[] | undefined, limit = 24) {
  if (!ids?.length) return [] as string[];
  return ids
    .map((id) => {
      const book = DISCOVER_BOOKS.find((b) => b.id === id);
      return book ? `${book.title} (${book.id})` : null;
    })
    .filter(Boolean)
    .slice(0, limit) as string[];
}

export function filterValidIds(ids: unknown, exclude?: Set<string>): string[] {
  const valid = catalogIds();
  const seen = new Set<string>();
  const out: string[] = [];
  if (!Array.isArray(ids)) return out;
  for (const raw of ids) {
    const id = String(raw ?? "").trim();
    if (!id || !valid.has(id) || seen.has(id)) continue;
    if (exclude?.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function readersCompact() {
  return DISCOVER_READERS.slice(0, 40).map((r) => ({
    id: r.id,
    username: r.username,
    displayName: r.displayName,
    personality: r.readingPersonality,
    favoriteGenres: r.favoriteGenres.slice(0, 6),
    currentBook: r.currentBook,
    matchReasons: r.matchReasons.slice(0, 4),
  }));
}
