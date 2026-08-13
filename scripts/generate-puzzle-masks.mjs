#!/usr/bin/env node
/**
 * ReadLife Pieces — SVG jigsaw mask generator
 *
 * Traditional rounded interlocking tabs (Draradech cubic construction).
 * Adjacent pieces share the exact same edge curve so tabs/holes match.
 *
 * Usage:
 *   node scripts/generate-puzzle-masks.mjs
 *
 * Outputs:
 *   public/puzzle-masks/piece-01.svg … piece-35.svg
 *   src/components/games/pieces/piece-meta.ts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

export const WIDTH = 450;
export const HEIGHT = 600;
export const COLS = 5;
export const ROWS = 7;
export const PIECE_COUNT = COLS * ROWS;

/** Knob occupies ~40% of the edge (4 × tAlong). */
const TAB_SIZE = 0.4;
/** How far a tab extends, as a fraction of the piece (capped to avoid corner collisions). */
const TAB_DEPTH = 0.4;
/** Organic wobble on control points. */
const RANDOMNESS = 0.1;
/** Deterministic seed so masks stay stable across regenerations. */
const SEED = 20260813;

const tAlong = TAB_SIZE / 4; // 0.10 → bulb span 40% of edge
// 40% depth would collide with a 40% tab at corners. Cap so the
// bulb stays inside the neighbour's corner "ear".
const corner = 0.5 - 2 * tAlong;
const tPerp = Math.min(TAB_DEPTH / 3, (corner - 0.04) / 3);
const jAlong = Math.min(RANDOMNESS, 0.035);
const jPerp = Math.min(RANDOMNESS, corner - 3 * tPerp - 0.02);

const OUT_DIR = path.join(ROOT, "public", "puzzle-masks");
const META_PATH = path.join(ROOT, "src/components/games/pieces/piece-meta.ts");

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function uniform(rng, min, max) {
  return min + rng() * (max - min);
}

function rbool(rng) {
  return rng() > 0.5;
}

function round(n) {
  return Math.round(n * 100) / 100;
}

function first(rng, state) {
  state.e = uniform(rng, -jPerp, jPerp);
  next(rng, state);
}

function next(rng, state) {
  const flipold = state.flip;
  state.flip = rbool(rng);
  state.a = flipold === state.flip ? -state.e : state.e;
  state.b = uniform(rng, -jAlong, jAlong);
  state.c = uniform(rng, -jPerp, jPerp);
  state.d = uniform(rng, -jAlong, jAlong);
  state.e = uniform(rng, -jPerp, jPerp);
}

/**
 * 10 control points for one shared edge, left→right (horizontal)
 * or top→bottom (vertical). Traditional 3-cubic mushroom tab.
 */
function edgePoints({ vertical, xi, yi, a, b, c, d, e, flip }) {
  const sl = vertical ? HEIGHT / ROWS : WIDTH / COLS;
  const sw = vertical ? WIDTH / COLS : HEIGHT / ROWS;
  const ol = sl * (vertical ? yi : xi);
  const ow = sw * (vertical ? xi : yi);
  const l = (v) => ol + sl * v;
  const w = (v) => ow + sw * v * (flip ? -1 : 1);

  const pairs = [
    [0.0, 0.0],
    [0.2, a],
    [0.5 + b + d, -tPerp + c],
    [0.5 - tAlong + b, tPerp + c],
    [0.5 - 2.0 * tAlong + b - d, 3.0 * tPerp + c],
    [0.5 + 2.0 * tAlong + b - d, 3.0 * tPerp + c],
    [0.5 + tAlong + b, tPerp + c],
    [0.5 + b + d, -tPerp + c],
    [0.8, e],
    [1.0, 0.0],
  ];

  return pairs.map(([lv, wv]) => {
    const L = round(l(lv));
    const W = round(w(wv));
    return vertical ? { x: W, y: L } : { x: L, y: W };
  });
}

function cubicsForward(pts) {
  let d = "";
  for (let i = 0; i < 3; i++) {
    const p1 = pts[i * 3 + 1];
    const p2 = pts[i * 3 + 2];
    const p3 = pts[i * 3 + 3];
    d += `C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y} `;
  }
  return d;
}

function cubicsReverse(pts) {
  // P0→P3→P6→P9  reversed: C P8 P7 P6  C P5 P4 P3  C P2 P1 P0
  let d = "";
  d += `C ${pts[8].x} ${pts[8].y} ${pts[7].x} ${pts[7].y} ${pts[6].x} ${pts[6].y} `;
  d += `C ${pts[5].x} ${pts[5].y} ${pts[4].x} ${pts[4].y} ${pts[3].x} ${pts[3].y} `;
  d += `C ${pts[2].x} ${pts[2].y} ${pts[1].x} ${pts[1].y} ${pts[0].x} ${pts[0].y} `;
  return d;
}

function cubicPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return {
    x:
      u * u * u * p0.x +
      3 * u * u * t * p1.x +
      3 * u * t * t * p2.x +
      t * t * t * p3.x,
    y:
      u * u * u * p0.y +
      3 * u * u * t * p1.y +
      3 * u * t * t * p2.y +
      t * t * t * p3.y,
  };
}

function sampleEdge(pts, into) {
  for (let i = 0; i < 3; i++) {
    const p0 = pts[i * 3];
    const p1 = pts[i * 3 + 1];
    const p2 = pts[i * 3 + 2];
    const p3 = pts[i * 3 + 3];
    for (let s = 0; s <= 16; s++) {
      into.push(cubicPoint(p0, p1, p2, p3, s / 16));
    }
  }
}

function generateEdges(rng) {
  /** hEdges[yi][xi] — horizontal cut between row yi and yi+1 (yi: 0..5) */
  const hEdges = [];
  for (let yi = 1; yi < ROWS; yi++) {
    const row = [];
    const state = { flip: false, a: 0, b: 0, c: 0, d: 0, e: 0 };
    first(rng, state);
    for (let xi = 0; xi < COLS; xi++) {
      row.push(
        edgePoints({
          vertical: false,
          xi,
          yi,
          ...state,
        }),
      );
      next(rng, state);
    }
    hEdges.push(row);
  }

  /** vEdges[xi][yi] — vertical cut between col xi and xi+1 (xi: 0..3) */
  const vEdges = [];
  for (let xi = 1; xi < COLS; xi++) {
    const col = [];
    const state = { flip: false, a: 0, b: 0, c: 0, d: 0, e: 0 };
    first(rng, state);
    for (let yi = 0; yi < ROWS; yi++) {
      col.push(
        edgePoints({
          vertical: true,
          xi,
          yi,
          ...state,
        }),
      );
      next(rng, state);
    }
    vEdges.push(col);
  }

  return { hEdges, vEdges };
}

function piecePath(row, col, hEdges, vEdges) {
  const cellW = WIDTH / COLS;
  const cellH = HEIGHT / ROWS;
  const x0 = round(col * cellW);
  const y0 = round(row * cellH);
  const x1 = round((col + 1) * cellW);
  const y1 = round((row + 1) * cellH);

  let d = `M ${x0} ${y0} `;

  if (row === 0) d += `L ${x1} ${y0} `;
  else d += cubicsForward(hEdges[row - 1][col]);

  if (col === COLS - 1) d += `L ${x1} ${y1} `;
  else d += cubicsForward(vEdges[col][row]);

  if (row === ROWS - 1) d += `L ${x0} ${y1} `;
  else d += cubicsReverse(hEdges[row][col]);

  if (col === 0) d += `L ${x0} ${y0} `;
  else d += cubicsReverse(vEdges[col - 1][row]);

  d += "Z";
  return d;
}

function pieceBBox(row, col, hEdges, vEdges) {
  const cellW = WIDTH / COLS;
  const cellH = HEIGHT / ROWS;
  const pts = [
    { x: col * cellW, y: row * cellH },
    { x: (col + 1) * cellW, y: row * cellH },
    { x: (col + 1) * cellW, y: (row + 1) * cellH },
    { x: col * cellW, y: (row + 1) * cellH },
  ];

  if (row > 0) sampleEdge(hEdges[row - 1][col], pts);
  if (row < ROWS - 1) sampleEdge(hEdges[row][col], pts);
  if (col < COLS - 1) sampleEdge(vEdges[col][row], pts);
  if (col > 0) sampleEdge(vEdges[col - 1][row], pts);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  const pad = 0.5;
  const x = Math.max(0, Math.floor(minX - pad));
  const y = Math.max(0, Math.floor(minY - pad));
  const x2 = Math.min(WIDTH, Math.ceil(maxX + pad));
  const y2 = Math.min(HEIGHT, Math.ceil(maxY + pad));
  return { x, y, w: x2 - x, h: y2 - y };
}

function svgForPath(d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" preserveAspectRatio="none">
  <path fill="#ffffff" fill-rule="nonzero" d="${d}"/>
</svg>
`;
}

function generate() {
  const rng = mulberry32(SEED);
  const { hEdges, vEdges } = generateEdges(rng);
  const pieces = [];

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(META_PATH), { recursive: true });

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const index = row * COLS + col + 1;
      const file = `piece-${String(index).padStart(2, "0")}.svg`;
      const d = piecePath(row, col, hEdges, vEdges);
      const bbox = pieceBBox(row, col, hEdges, vEdges);
      fs.writeFileSync(path.join(OUT_DIR, file), svgForPath(d));
      pieces.push({
        id: index,
        file,
        row,
        col,
        bbox,
      });
    }
  }

  const meta = `/* Generated by scripts/generate-puzzle-masks.mjs — do not edit by hand. */
export const PUZZLE_WIDTH = ${WIDTH};
export const PUZZLE_HEIGHT = ${HEIGHT};
export const PUZZLE_COLS = ${COLS};
export const PUZZLE_ROWS = ${ROWS};
export const PIECE_COUNT = ${PIECE_COUNT};

export type PieceBBox = { x: number; y: number; w: number; h: number };

export type PieceMeta = {
  id: number;
  file: string;
  row: number;
  col: number;
  bbox: PieceBBox;
};

export const PIECES: PieceMeta[] = ${JSON.stringify(pieces, null, 2)};
`;

  fs.writeFileSync(META_PATH, meta);
  console.log(
    `Wrote ${pieces.length} masks → ${path.relative(ROOT, OUT_DIR)}`,
  );
  console.log(`Wrote ${path.relative(ROOT, META_PATH)}`);
  console.log(
    `tab along=${tAlong.toFixed(3)}  perp=${tPerp.toFixed(3)}  jAlong=${jAlong}  jPerp=${jPerp.toFixed(3)}`,
  );
}

generate();
