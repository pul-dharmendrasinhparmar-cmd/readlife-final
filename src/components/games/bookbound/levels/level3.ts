import { BG } from "../sprites";
import { GROUND_Y, PLAYER_H } from "../engine";
import type { LevelDef } from "../types";
import { ground, lava, plat } from "./helpers";

/** Hard — lava gaps, a Story Dragon with five hearts. */
export const LEVEL_3: LevelDef = {
  id: 3,
  name: "The Dragon's Final Chapter",
  subtitle: "Chapter 3",
  blurb: "Stone, fire, and the last pages of the story.",
  theme: "castle",
  background: BG.castle,
  width: 4080,
  spawn: { x: 70, y: GROUND_Y - PLAYER_H },
  platforms: [
    ground(0, 480),
    plat(300, 360, 130),
    plat(500, 280, 120),
    plat(720, 340, 140),
    ground(940, 260),
    plat(1280, 360, 150),
    plat(1500, 280, 130),
    plat(1720, 200, 140),
    plat(1960, 280, 130),
    ground(2180, 280),
    plat(2540, 340, 150),
    plat(2760, 260, 140),
    ground(3000, 1080),
    plat(3240, 340, 180),
    plat(3560, 280, 150),
  ],
  enemies: [
    {
      kind: "dragon",
      x: 1320,
      y: GROUND_Y - 62,
      minX: 1180,
      maxX: 1580,
      hp: 1,
    },
    {
      kind: "dragon",
      x: 2580,
      y: 260,
      minX: 2460,
      maxX: 2860,
      hp: 1,
    },
    {
      kind: "dragon",
      x: 3380,
      y: GROUND_Y - 78,
      minX: 3080,
      maxX: 3780,
      boss: true,
      hp: 5,
    },
  ],
  collectibles: [
    { kind: "page", x: 330, y: 318 },
    { kind: "page", x: 530, y: 238 },
    { kind: "page", x: 760, y: 298 },
    { kind: "golden", x: 1760, y: 158 },
    { kind: "page", x: 1520, y: 238 },
    { kind: "page", x: 2000, y: 238 },
    { kind: "page", x: 2580, y: 298 },
    { kind: "page", x: 2800, y: 218 },
    { kind: "golden", x: 3600, y: 238 },
    { kind: "page", x: 3280, y: 298 },
  ],
  hazards: [
    lava(500, 420),
    lava(1220, 940),
    lava(2480, 500),
  ],
  checkpoint: { x: 2260, y: GROUND_Y - PLAYER_H },
  portal: { x: 3920, y: GROUND_Y - 78, w: 70, h: 78 },
};
