import {
  UNCOVERED_POOL,
  localISODate,
  uncoveredPuzzleNumber,
} from "@/components/games/uncovered/questions";
import type { PiecesCover } from "./types";

export function toPiecesCover(q: {
  id: string;
  title: string;
  author: string;
  fullCoverImage: string;
}): PiecesCover {
  return {
    id: q.id,
    title: q.title,
    author: q.author,
    image: q.fullCoverImage,
    fallbackImage: `/games/uncovered/hidden/${q.id}.jpg`,
  };
}

export function allPiecesCovers(): PiecesCover[] {
  return UNCOVERED_POOL.map(toPiecesCover);
}

export function getDailyCover(d = new Date()): PiecesCover & {
  puzzleNumber: number;
  date: string;
} {
  const puzzleNumber = uncoveredPuzzleNumber(d);
  const q = UNCOVERED_POOL[(puzzleNumber - 1) % UNCOVERED_POOL.length];
  return {
    ...toPiecesCover(q),
    puzzleNumber,
    date: localISODate(d),
  };
}

export function formatPiecesTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
