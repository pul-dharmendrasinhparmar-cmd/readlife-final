import { BG } from "../sprites";
import { GROUND_Y, PLAYER_H } from "../engine";
import type { LevelDef } from "../types";
import { ground, ink, plat } from "./helpers";

/** Medium — more vertical movement and floating witches. */
export const LEVEL_2: LevelDef = {
  id: 2,
  name: "The Ink Witch's Enchanted Forest",
  subtitle: "Chapter 2",
  blurb: "Leap the ink pools. The pages here are guarded by magic.",
  theme: "forest",
  background: BG.forest,
  width: 3720,
  spawn: { x: 70, y: GROUND_Y - PLAYER_H },
  platforms: [
    ground(0, 520),
    plat(220, 360, 140),
    plat(430, 280, 120),
    plat(620, 210, 130),
    ground(820, 280),
    plat(980, 330, 130),
    plat(1180, 250, 140),
    plat(1400, 180, 120),
    ground(1580, 520),
    plat(1760, 348, 150),
    plat(2020, 268, 130),
    plat(2240, 198, 140),
    ground(2480, 300),
    plat(2680, 320, 140),
    plat(2900, 240, 150),
    plat(3140, 300, 160),
    ground(3340, 380),
  ],
  enemies: [
    { kind: "witch", x: 980, y: 250, minX: 900, maxX: 1280 },
    { kind: "witch", x: 1760, y: 220, minX: 1640, maxX: 2060 },
    { kind: "witch", x: 2680, y: 200, minX: 2580, maxX: 3040 },
    { kind: "witch", x: 3180, y: 180, minX: 3080, maxX: 3480 },
  ],
  collectibles: [
    { kind: "page", x: 250, y: 318 },
    { kind: "page", x: 460, y: 238 },
    { kind: "golden", x: 650, y: 168 },
    { kind: "page", x: 1020, y: 288 },
    { kind: "page", x: 1220, y: 208 },
    { kind: "page", x: 1440, y: 138 },
    { kind: "page", x: 1800, y: 306 },
    { kind: "page", x: 2060, y: 226 },
    { kind: "golden", x: 2280, y: 156 },
    { kind: "page", x: 2720, y: 278 },
    { kind: "page", x: 2940, y: 198 },
    { kind: "page", x: 3480, y: 420 },
  ],
  hazards: [ink(900, 110), ink(1860, 150), ink(2540, 120)],
  checkpoint: { x: 1720, y: GROUND_Y - PLAYER_H },
  portal: { x: 3580, y: GROUND_Y - 78, w: 70, h: 78 },
};
