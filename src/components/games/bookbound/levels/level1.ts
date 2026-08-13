import { BG } from "../sprites";
import { GROUND_Y, PLAYER_H } from "../engine";
import type { LevelDef } from "../types";
import { ground, plat } from "./helpers";

/** Easy teaching chapter — about 60–90 seconds. */
export const LEVEL_1: LevelDef = {
  id: 1,
  name: "The Ogre's Forgotten Library",
  subtitle: "Chapter 1",
  blurb: "Learn to run, jump, collect pages, and shoo a Book Ogre.",
  theme: "library",
  background: BG.library,
  width: 3480,
  spawn: { x: 72, y: GROUND_Y - PLAYER_H },
  platforms: [
    ground(0, 640),
    plat(250, 372, 150),
    plat(460, 300, 130),
    ground(720, 520),
    plat(860, 352, 160),
    plat(1120, 292, 140),
    ground(1320, 720),
    plat(1520, 360, 180),
    plat(1780, 288, 150),
    ground(2140, 420),
    plat(2280, 340, 150),
    plat(2520, 268, 140),
    ground(2680, 800),
    plat(2920, 356, 180),
    plat(3180, 300, 160),
  ],
  enemies: [
    { kind: "ogre", x: 860, y: GROUND_Y - 68, minX: 740, maxX: 1160 },
    { kind: "ogre", x: 1580, y: GROUND_Y - 68, minX: 1360, maxX: 1960 },
    { kind: "ogre", x: 2920, y: GROUND_Y - 68, minX: 2720, maxX: 3280 },
  ],
  collectibles: [
    { kind: "page", x: 300, y: 330 },
    { kind: "page", x: 500, y: 258 },
    { kind: "page", x: 980, y: 420 },
    { kind: "page", x: 1160, y: 250 },
    { kind: "page", x: 1560, y: 318 },
    { kind: "golden", x: 1820, y: 246 },
    { kind: "page", x: 2320, y: 298 },
    { kind: "page", x: 2560, y: 226 },
    { kind: "page", x: 3000, y: 314 },
    { kind: "page", x: 3220, y: 258 },
  ],
  hazards: [],
  checkpoint: { x: 1680, y: GROUND_Y - PLAYER_H },
  portal: { x: 3340, y: GROUND_Y - 78, w: 70, h: 78 },
};
