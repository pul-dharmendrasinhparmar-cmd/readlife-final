import type { ChapterId, LevelDef } from "../types";
import { LEVEL_1 } from "./level1";
import { LEVEL_2 } from "./level2";
import { LEVEL_3 } from "./level3";

export { CHAPTERS } from "./helpers";

export const LEVELS: Record<ChapterId, LevelDef> = {
  1: LEVEL_1,
  2: LEVEL_2,
  3: LEVEL_3,
};

export function getLevel(id: ChapterId): LevelDef {
  return LEVELS[id];
}
