import { LEVEL_1_COZY_SHELF } from "./level1-cozy-shelf";
import type { LevelConfig } from "./types";

export { LEVEL_1_COZY_SHELF } from "./level1-cozy-shelf";
export type { LevelConfig } from "./types";
export { obstaclesSet, pointKey } from "./types";

const LEVELS: Record<string, LevelConfig> = {
  [LEVEL_1_COZY_SHELF.id]: LEVEL_1_COZY_SHELF,
};

export function getLevel(id: string = LEVEL_1_COZY_SHELF.id): LevelConfig {
  return LEVELS[id] ?? LEVEL_1_COZY_SHELF;
}

export function listLevels(): LevelConfig[] {
  return Object.values(LEVELS);
}
