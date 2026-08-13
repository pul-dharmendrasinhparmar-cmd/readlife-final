"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { BookItem, OnboardingState } from "./data";
import { BOOK_SUGGESTIONS } from "./data";

type Props = {
  state: OnboardingState;
  onChange: (next: Partial<OnboardingState>) => void;
};

function BookCover({
  book,
  onRemove,
}: {
  book: BookItem;
  onRemove: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative w-[108px] shrink-0 sm:w-[120px]">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-md">
        {!imgFailed ? (
          <Image
            src={book.cover}
            alt={`${book.title} cover`}
            fill
            className="object-cover"
            sizes="120px"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="flex h-full w-full flex-col justify-end p-3"
            style={{
              background: `linear-gradient(160deg, ${book.color} 0%, #1a241c 100%)`,
            }}
          >
            <p className="line-clamp-3 text-[0.72rem] leading-tight font-semibold text-paper">
              {book.title}
            </p>
            <p className="mt-1 truncate text-[0.62rem] text-paper/70">{book.author}</p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-paper bg-forest text-sm leading-none text-paper shadow-sm transition hover:bg-forest-deep"
        aria-label={`Remove ${book.title}`}
      >
        ×
      </button>
      <p className="mt-2 line-clamp-2 text-center text-[0.78rem] font-semibold text-ink">
        {book.title}
      </p>
    </div>
  );
}

function BookSearch({
  excludeIds,
  onAdd,
}: {
  excludeIds: string[];
  onAdd: (book: BookItem) => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return BOOK_SUGGESTIONS.filter(
      (b) =>
        !excludeIds.includes(b.id) &&
        (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)),
    ).slice(0, 5);
  }, [query, excludeIds]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-soft">
        ⌕
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search books…"
        className="w-full rounded-full border-2 border-line/60 bg-paper py-3.5 pr-4 pl-11 text-base text-ink outline-none placeholder:text-muted-soft focus:border-forest/45"
      />
      {results.length > 0 ? (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-line/60 bg-paper shadow-xl">
          {results.map((book) => (
            <li key={book.id}>
              <button
                type="button"
                onClick={() => {
                  onAdd(book);
                  setQuery("");
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-cream"
              >
                <span className="relative h-12 w-8 shrink-0 overflow-hidden rounded-sm shadow-sm">
                  <Image
                    src={book.cover}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </span>
                <span>
                  <span className="block text-base font-semibold text-ink">
                    {book.title}
                  </span>
                  <span className="text-sm text-muted">{book.author}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function BookRow({
  books,
  exclude,
  onRemove,
  onAddMore,
  onSearchAdd,
}: {
  books: BookItem[];
  exclude: string[];
  onRemove: (id: string) => void;
  onAddMore: () => void;
  onSearchAdd: (book: BookItem) => void;
}) {
  return (
    <>
      <div className="mt-3">
        <BookSearch excludeIds={exclude} onAdd={onSearchAdd} />
      </div>
      <div className="mt-5 flex gap-4 overflow-x-auto pb-3">
        {books.map((book) => (
          <BookCover key={book.id} book={book} onRemove={() => onRemove(book.id)} />
        ))}
        <button
          type="button"
          onClick={onAddMore}
          className="flex aspect-[2/3] w-[108px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-forest/35 bg-[#342c45] text-ink sm:w-[120px]"
        >
          <span className="text-3xl leading-none">+</span>
          <span className="text-sm font-semibold">Add more</span>
        </button>
      </div>
    </>
  );
}

export function BooksStep({ state, onChange }: Props) {
  const exclude = [...state.lovedBooks, ...state.skipBooks].map((b) => b.id);

  const addLoved = (book: BookItem) => {
    if (state.lovedBooks.some((b) => b.id === book.id)) return;
    onChange({
      lovedBooks: [...state.lovedBooks, book],
      skipBooks: state.skipBooks.filter((b) => b.id !== book.id),
    });
  };

  const addSkip = (book: BookItem) => {
    if (state.skipBooks.some((b) => b.id === book.id)) return;
    onChange({
      skipBooks: [...state.skipBooks, book],
      lovedBooks: state.lovedBooks.filter((b) => b.id !== book.id),
    });
  };

  return (
    <div>
      <h1 className="font-serif text-[2.15rem] leading-tight font-semibold tracking-[-0.025em] text-ink sm:text-[2.55rem]">
        Add some books you love{" "}
        <span className="text-muted-soft">(or don&apos;t)</span>.
      </h1>
      <p className="mt-2.5 text-lg text-muted">
        A few favorites help ReadLife understand your taste.
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
          Books I love
        </h2>
        <BookRow
          books={state.lovedBooks}
          exclude={exclude}
          onSearchAdd={addLoved}
          onRemove={(id) =>
            onChange({
              lovedBooks: state.lovedBooks.filter((b) => b.id !== id),
            })
          }
          onAddMore={() => {
            const next = BOOK_SUGGESTIONS.find((b) => !exclude.includes(b.id));
            if (next) addLoved(next);
          }}
        />
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
          Not for me
        </h2>
        <p className="mt-1.5 text-base text-muted">
          Optional — helps us avoid recommending books that aren&apos;t your vibe.
        </p>
        <BookRow
          books={state.skipBooks}
          exclude={exclude}
          onSearchAdd={addSkip}
          onRemove={(id) =>
            onChange({
              skipBooks: state.skipBooks.filter((b) => b.id !== id),
            })
          }
          onAddMore={() => {
            const next = BOOK_SUGGESTIONS.find((b) => !exclude.includes(b.id));
            if (next) addSkip(next);
          }}
        />
      </section>
    </div>
  );
}
