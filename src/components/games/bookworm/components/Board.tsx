"use client";

import type { LevelConfig } from "../levels/types";
import { pointKey } from "../levels/types";
import type { BookFood, Dir, EatFeedback, Point } from "../types";

type BoardProps = {
  level: LevelConfig;
  snake: Point[];
  dir: Dir;
  book: BookFood | null;
  eatPop: EatFeedback;
  dead?: boolean;
  celebrating?: boolean;
};

function WormHead({ dir, dizzy, happy }: { dir: Dir; dizzy?: boolean; happy?: boolean }) {
  return (
    <div className={`bw-worm-orient face-${dir}`} aria-hidden>
      <div
        className={`bw-worm-head${dizzy ? " is-dizzy" : ""}${happy ? " is-happy" : ""}`}
      >
        <span className="bw-glasses">
          <span className="bw-lens" />
          <span className="bw-bridge" />
          <span className="bw-lens" />
        </span>
        <span className="bw-eyes">
          <span className="bw-eye" />
          <span className="bw-eye" />
        </span>
        <span className="bw-smile" />
      </div>
    </div>
  );
}

function BookSprite({ book }: { book: BookFood }) {
  return (
    <div
      className={`bw-book variant-${book.variant}`}
      style={{ ["--book-hue" as string]: String(book.hue) }}
      aria-label="Book"
    >
      <span className="bw-book-cover">
        <span className="bw-book-spine" />
        <span className="bw-book-foil" />
      </span>
      <span className="bw-book-pages" />
    </div>
  );
}

export function Board({
  level,
  snake,
  dir,
  book,
  eatPop,
  dead,
  celebrating,
}: BoardProps) {
  const occupied = new Map<string, number>();
  snake.forEach((seg, i) => occupied.set(pointKey(seg), i));
  const obstacles = new Set(level.obstacles.map(pointKey));
  const n = level.grid;

  return (
    <div
      className={`bw-board${dead ? " is-dead" : ""}${celebrating ? " is-win" : ""}`}
      style={{
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        ["--bw-grid-n" as string]: String(n),
      }}
      role="img"
      aria-label="Bookworm board"
    >
      {Array.from({ length: n * n }, (_, i) => {
        const x = i % n;
        const y = Math.floor(i / n);
        const key = `${x},${y}`;
        const segIndex = occupied.get(key);
        const isHead = segIndex === 0;
        const isBody = segIndex !== undefined;
        const isObstacle = obstacles.has(key);
        const isBook = book && book.x === x && book.y === y && !isBody;
        const popHere = eatPop && eatPop.x === x && eatPop.y === y;

        return (
          <div key={key} className="bw-cell">
            {isObstacle ? <div className="bw-shelf" aria-hidden /> : null}
            {isBody ? (
              isHead ? (
                <WormHead dir={dir} dizzy={dead} happy={celebrating} />
              ) : (
                <div
                  className={`bw-segment seg-${(segIndex ?? 1) % 3}`}
                  aria-hidden
                />
              )
            ) : null}
            {isBook ? <BookSprite book={book} /> : null}
            {popHere ? (
              <span className="bw-pop" key={eatPop.id}>
                {eatPop.text}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
