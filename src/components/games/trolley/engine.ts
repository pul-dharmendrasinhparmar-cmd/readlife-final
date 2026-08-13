import {
  BOOKS,
  GAME_CONFIG,
  ITEM_META,
  sparkForBookId,
  type BadKind,
  type Genre,
  type GoodKind,
  type ItemKind,
  type ThemeId,
  pickWeightedKind,
} from "./gameConfig";

export type FallingItem = {
  id: string;
  kind: ItemKind;
  x: number;
  y: number;
  speed: number;
  rot: number;
  bookId?: string;
  genre?: Genre;
};

export type ActiveEffects = {
  slowUntil: number;
  multiplierUntil: number;
  celebrateUntil: number;
};

export function createEffects(): ActiveEffects {
  return { slowUntil: 0, multiplierUntil: 0, celebrateUntil: 0 };
}

export function spawnItem(
  now: number,
  elapsedRatio: number,
  boostGenre: Genre | null,
): FallingItem {
  const kind = pickWeightedKind(undefined, boostGenre);
  const meta = ITEM_META[kind];
  const speed =
    GAME_CONFIG.baseFallSpeed +
    (GAME_CONFIG.maxFallSpeed - GAME_CONFIG.baseFallSpeed) * elapsedRatio;

  let bookId: string | undefined;
  let genre: Genre | undefined;
  if (
    meta.good &&
    (kind === "book" ||
      kind === "featured" ||
      kind === "golden" ||
      kind === "series")
  ) {
    const pool =
      kind === "featured"
        ? BOOKS.filter((b) => b.featured)
        : boostGenre
          ? BOOKS.filter((b) => b.genre === boostGenre)
          : BOOKS;
    const pick = (pool.length ? pool : BOOKS)[
      Math.floor(Math.random() * (pool.length ? pool.length : BOOKS.length))
    ];
    bookId = pick.id;
    genre = pick.genre;
  }

  return {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    x: 8 + Math.random() * 84,
    y: -8,
    speed: speed * (0.85 + Math.random() * 0.3),
    rot: -18 + Math.random() * 36,
    bookId,
    genre,
  };
}

export function spawnIntervalMs(elapsedRatio: number): number {
  return (
    GAME_CONFIG.spawnEveryMs -
    (GAME_CONFIG.spawnEveryMs - GAME_CONFIG.minSpawnEveryMs) * elapsedRatio
  );
}

export function isGood(kind: ItemKind): kind is GoodKind {
  return ITEM_META[kind].good;
}

export function isBad(kind: ItemKind): kind is BadKind {
  return !ITEM_META[kind].good;
}

export type CatchResult = {
  points: number;
  lifeDelta: number;
  grantMultiplier: boolean;
  grantSlow: boolean;
  enterSparkId: string | null;
  genre?: Genre;
  bookId?: string;
  message: string;
};

const base = (
  partial: Omit<CatchResult, "grantMultiplier" | "grantSlow" | "enterSparkId"> &
    Partial<Pick<CatchResult, "grantMultiplier" | "grantSlow" | "enterSparkId">>,
): CatchResult => ({
  grantMultiplier: false,
  grantSlow: false,
  enterSparkId: null,
  ...partial,
});

export function resolveCatch(
  item: FallingItem,
  now: number,
  effects: ActiveEffects,
): CatchResult {
  const mult =
    now < effects.multiplierUntil ? GAME_CONFIG.bookmarkMultiplier : 1;
  const kind = item.kind;

  if (kind === "book") {
    return base({
      points: 10 * mult,
      lifeDelta: 0,
      genre: item.genre,
      bookId: item.bookId,
      message: "+10 book!",
    });
  }
  if (kind === "featured") {
    const spark = sparkForBookId(item.bookId);
    return base({
      points: 25 * mult,
      lifeDelta: 0,
      genre: item.genre,
      bookId: item.bookId,
      enterSparkId: spark?.id ?? null,
      message: spark ? `Opened ${spark.placeName}!` : "+25 unique book!",
    });
  }
  if (kind === "golden") {
    return base({
      points: 50 * mult,
      lifeDelta: 0,
      genre: item.genre,
      bookId: item.bookId,
      message: "+50 golden!",
    });
  }
  if (kind === "series") {
    return base({
      points: 30 * mult,
      lifeDelta: 0,
      genre: item.genre,
      bookId: item.bookId,
      message: "Series bonus!",
    });
  }
  if (kind === "bookmark") {
    return base({
      points: 5,
      lifeDelta: 0,
      grantMultiplier: true,
      message: "2× score!",
    });
  }
  if (kind === "glasses") {
    return base({
      points: 5,
      lifeDelta: 0,
      grantSlow: true,
      message: "Slow-mo reading!",
    });
  }
  if (kind === "card") {
    return base({
      points: 5,
      lifeDelta: 1,
      message: "Extra life!",
    });
  }
  if (kind === "bulb") {
    return base({
      points: 20,
      lifeDelta: 0,
      message: "Bright idea!",
    });
  }

  if (kind === "dust") {
    return base({
      points: -8,
      lifeDelta: 0,
      message: "Dusty pages!",
    });
  }
  if (kind === "spoiler") {
    return base({
      points: -5,
      lifeDelta: -1,
      message: `Oops — ${ITEM_META[kind].label}!`,
    });
  }
  return base({
    points: 0,
    lifeDelta: -1,
    message: `Oops — ${ITEM_META[kind].label}!`,
  });
}

export function themeClass(theme: ThemeId): string {
  return `theme-${theme}`;
}
