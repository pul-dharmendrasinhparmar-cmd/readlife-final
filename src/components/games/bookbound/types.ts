export type BookboundPhase =
  | "story"
  | "title"
  | "levelSelect"
  | "levelIntro"
  | "playing"
  | "paused"
  | "levelComplete"
  | "gameOver"
  | "gameComplete";

export type ChapterId = 1 | 2 | 3;

export type Facing = -1 | 1;

export type EnemyKind = "ogre" | "witch" | "dragon";

export type CollectibleKind = "page" | "golden";

export type HazardKind = "ink" | "lava";

export type PlatformKind = "ground" | "float";

export type PlayerAnim =
  | "idle"
  | "run"
  | "jump"
  | "attack"
  | "hurt"
  | "dead";

export type EnemyAnim = "idle" | "walk" | "hurt" | "defeat";

export type Platform = {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: PlatformKind;
};

export type Hazard = {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: HazardKind;
};

export type Collectible = {
  id: string;
  kind: CollectibleKind;
  x: number;
  y: number;
  w: number;
  h: number;
  taken: boolean;
  bob: number;
};

export type Projectile = {
  id: string;
  kind: "ink" | "fireball" | "witch-ink" | "book";
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  life: number;
};

export type Enemy = {
  id: string;
  kind: EnemyKind;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  facing: Facing;
  minX: number;
  maxX: number;
  baseY: number;
  hp: number;
  maxHp: number;
  anim: EnemyAnim;
  animT: number;
  shootT: number;
  hurtT: number;
  floatT: number;
  boss: boolean;
  dead: boolean;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

export type Player = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  facing: Facing;
  grounded: boolean;
  hearts: number;
  maxHearts: number;
  invulnT: number;
  attackT: number;
  cooldownT: number;
  hurtT: number;
  anim: PlayerAnim;
  coyoteT: number;
  jumpBufT: number;
  airJumps: number;
  spawnX: number;
  spawnY: number;
};

export type BookboundInput = {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean;
  attack: boolean;
  attackPressed: boolean;
};

export type GameEvent =
  | "jump"
  | "page"
  | "golden"
  | "ink"
  | "hit"
  | "stomp"
  | "defeat"
  | "dragon"
  | "hurt"
  | "die"
  | "complete"
  | "checkpoint";

export type LevelTheme = "library" | "forest" | "castle";

export type EnemySpawn = {
  kind: EnemyKind;
  x: number;
  y: number;
  minX: number;
  maxX: number;
  boss?: boolean;
  hp?: number;
};

export type CollectibleSpawn = {
  kind: CollectibleKind;
  x: number;
  y: number;
};

export type LevelDef = {
  id: ChapterId;
  name: string;
  subtitle: string;
  blurb: string;
  theme: LevelTheme;
  background: string;
  width: number;
  spawn: { x: number; y: number };
  platforms: Platform[];
  enemies: EnemySpawn[];
  collectibles: CollectibleSpawn[];
  hazards: Hazard[];
  checkpoint: { x: number; y: number };
  portal: { x: number; y: number; w: number; h: number };
};

export type RunStats = {
  score: number;
  pages: number;
  golden: number;
  enemiesDefeated: number;
  heartsLeft: number;
  ogres: number;
  witches: number;
  dragons: number;
  elapsed: number;
};

export type WorldState = {
  level: LevelDef;
  player: Player;
  enemies: Enemy[];
  collectibles: Collectible[];
  projectiles: Projectile[];
  particles: Particle[];
  cameraX: number;
  time: number;
  checkpointReached: boolean;
  portalOpen: boolean;
  outcome: null | "complete" | "dead";
  run: RunStats;
  flashT: number;
};

export type BookboundStats = {
  gamesPlayed: number;
  highestLevelUnlocked: ChapterId;
  level1Completed: boolean;
  level2Completed: boolean;
  level3Completed: boolean;
  highestScore: number;
  lastScore?: number;
  totalPagesCollected: number;
  totalGoldenPagesCollected: number;
  totalEnemiesDefeated: number;
  ogresDefeated: number;
  witchesDefeated: number;
  dragonsDefeated: number;
  lastPlayedAt?: string;
};
