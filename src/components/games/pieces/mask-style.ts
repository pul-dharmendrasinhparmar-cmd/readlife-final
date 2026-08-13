import type { CSSProperties } from "react";
import {
  PUZZLE_HEIGHT,
  PUZZLE_WIDTH,
  type PieceMeta,
} from "./piece-meta";

export function pieceMaskUrl(file: string) {
  return `/puzzle-masks/${file}`;
}

/** CSS mask + cover background registered to the 450×600 puzzle canvas. */
export function pieceMaskStyle(
  piece: PieceMeta,
  coverUrl: string,
  scale: number,
): CSSProperties {
  const boardW = PUZZLE_WIDTH * scale;
  const boardH = PUZZLE_HEIGHT * scale;
  const ox = -piece.bbox.x * scale;
  const oy = -piece.bbox.y * scale;
  const mask = `url("${pieceMaskUrl(piece.file)}")`;
  return {
    width: piece.bbox.w * scale,
    height: piece.bbox.h * scale,
    backgroundImage: `url("${coverUrl}")`,
    backgroundSize: `${boardW}px ${boardH}px`,
    backgroundPosition: `${ox}px ${oy}px`,
    backgroundRepeat: "no-repeat",
    WebkitMaskImage: mask,
    maskImage: mask,
    WebkitMaskSize: `${boardW}px ${boardH}px`,
    maskSize: `${boardW}px ${boardH}px`,
    WebkitMaskPosition: `${ox}px ${oy}px`,
    maskPosition: `${ox}px ${oy}px`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
}
