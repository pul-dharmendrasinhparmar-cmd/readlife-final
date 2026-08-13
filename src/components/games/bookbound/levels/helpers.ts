import type { Hazard, LevelDef, Platform } from "../types";
import { GROUND_Y } from "../engine";

export function ground(x: number, w: number): Platform {
  return { x, y: GROUND_Y, w, h: 72, kind: "ground" };
}

export function plat(x: number, y: number, w: number): Platform {
  return { x, y, w, h: 22, kind: "float" };
}

export function ink(x: number, w: number): Hazard {
  return { x, y: GROUND_Y + 18, w, h: 36, kind: "ink" };
}

export function lava(x: number, w: number): Hazard {
  return { x, y: GROUND_Y + 24, w, h: 48, kind: "lava" };
}

export const CHAPTERS: Pick<
  LevelDef,
  "id" | "name" | "subtitle" | "blurb" | "theme"
>[] = [
  {
    id: 1,
    name: "The Ogre's Forgotten Library",
    subtitle: "Chapter 1",
    blurb: "An ancient library where forgotten books and lost pages wait.",
    theme: "library",
  },
  {
    id: 2,
    name: "The Ink Witch's Enchanted Forest",
    subtitle: "Chapter 2",
    blurb: "A purple wood where ink magic has stolen the pages.",
    theme: "forest",
  },
  {
    id: 3,
    name: "The Dragon's Final Chapter",
    subtitle: "Chapter 3",
    blurb: "A ruined castle, a sea of lava, and one last guardian.",
    theme: "castle",
  },
];
