export const BG = {
  library: "/games/bookbound/bg-library.png",
  forest: "/games/bookbound/bg-forest.png",
  castle: "/games/bookbound/bg-castle.png",
} as const;

export const STORY_ART = {
  2: "/games/bookbound/story-2.png",
  3: "/games/bookbound/story-3.png",
  4: "/games/bookbound/story-4.png",
  5: "/games/bookbound/story-5.png",
  6: "/games/bookbound/story-6.png",
} as const;

export const PIP_ICON = "/games/bookbound/pip-icon.png";

const S = "/games/bookbound/sprites";

function seq(prefix: string, count: number) {
  return Array.from({ length: count }, (_, i) => `${S}/${prefix}-${i}.png`);
}

export const SPRITES = {
  pipIdleFront: seq("pip-idle-front", 1),
  pipIdleLeft: seq("pip-idle-left", 1),
  pipIdleRight: seq("pip-idle-right", 1),
  pipRunLeft: seq("pip-idle-left", 1),
  pipRunRight: seq("pip-idle-right", 1),
  pipJumpLeft: seq("pip-jump-left", 1),
  pipJumpRight: seq("pip-jump-right", 1),
  pipAttackLeft: seq("pip-attack-left", 1),
  pipAttackRight: seq("pip-attack-right", 1),
  pipHurt: seq("pip-hurt", 3),
  pipDefeat: seq("pip-defeat", 4),
  pipEmote: seq("pip-emote", 4),
  ink: seq("ink", 4),
  ogreIdle: seq("ogre-idle", 4),
  ogreWalk: seq("ogre-walk", 5),
  ogreAttack: seq("ogre-attack", 3),
  ogreHurt: seq("ogre-hurt", 4),
  ogreDefeat: seq("ogre-defeat", 4),
  ogreBook: `${S}/ogre-book-0.png`,
  witchIdle: seq("witch-idle", 4),
  witchMove: seq("witch-move", 5),
  witchAttack: seq("witch-attack", 2),
  witchHurt: seq("witch-hurt", 4),
  witchDefeat: seq("witch-defeat", 4),
  witchInk: seq("witch-ink", 3),
  dragonIdle: seq("dragon-idle", 4),
  dragonFly: seq("dragon-fly", 4),
  dragonAttack: seq("dragon-attack", 2),
  dragonHurt: seq("dragon-hurt", 4),
  dragonDefeat: seq("dragon-defeat", 4),
  fireball: `${S}/fireball.png`,
  page: seq("page", 3),
  pageBook: `${S}/page-book.png`,
  pageGolden: `${S}/page-golden.png`,
  ledgeShort: `${S}/ledge-short.png`,
  ledgeMid: `${S}/ledge-mid.png`,
  ledgeMidDeco: `${S}/ledge-mid-deco.png`,
  ledgeLong: `${S}/ledge-long.png`,
  ledgeLongDeco: `${S}/ledge-long-deco.png`,
  groundLeft: `${S}/ground-cap-left.png`,
  groundTile: `${S}/ground-tile.png`,
  groundRight: `${S}/ground-cap-right.png`,
  groundShort: `${S}/ground-short.png`,
  groundPlain: `${S}/ground-plain.png`,
  groundMid3: `${S}/ground-mid3.png`,
  groundMid4: `${S}/ground-mid4.png`,
  groundDeco: `${S}/ground-deco.png`,
  groundCorner: `${S}/ground-corner.png`,
} as const;

/** Walkable wood band inside each floating shelf sprite (pixels). */
export const LEDGE_WOOD = {
  short: { src: `${S}/ledge-short.png`, top: 3, left: 16, width: 250, imgW: 278, imgH: 113 },
  mid: { src: `${S}/ledge-mid.png`, top: 8, left: 8, width: 330, imgW: 346, imgH: 93 },
  midDeco: { src: `${S}/ledge-mid-deco.png`, top: 95, left: 8, width: 328, imgW: 352, imgH: 239 },
  long: { src: `${S}/ledge-long.png`, top: 10, left: 6, width: 554, imgW: 566, imgH: 102 },
  longDeco: { src: `${S}/ledge-long-deco.png`, top: 61, left: 8, width: 558, imgW: 584, imgH: 168 },
} as const;

export type LedgeWood = (typeof LEDGE_WOOD)[keyof typeof LEDGE_WOOD];

/** Walkable wood band inside ground (floor) sprites. */
export const GROUND_PIECE = {
  left: { src: `${S}/ground-cap-left.png`, top: 8, left: 19, width: 124, imgW: 150, imgH: 127 },
  tile: { src: `${S}/ground-tile.png`, top: 10, left: 0, width: 144, imgW: 144, imgH: 102 },
  right: { src: `${S}/ground-cap-right.png`, top: 8, left: 9, width: 123, imgW: 159, imgH: 124 },
  short: { src: `${S}/ground-short.png`, top: 10, left: 15, width: 111, imgW: 141, imgH: 97 },
} as const;

export type GroundPiece = (typeof GROUND_PIECE)[keyof typeof GROUND_PIECE];

export const ALL_SPRITE_URLS: string[] = [
  BG.library,
  BG.forest,
  BG.castle,
  PIP_ICON,
  SPRITES.fireball,
  SPRITES.ogreBook,
  SPRITES.pageBook,
  SPRITES.pageGolden,
  SPRITES.ledgeShort,
  SPRITES.ledgeMid,
  SPRITES.ledgeMidDeco,
  SPRITES.ledgeLong,
  SPRITES.ledgeLongDeco,
  SPRITES.groundLeft,
  SPRITES.groundTile,
  SPRITES.groundRight,
  SPRITES.groundShort,
  SPRITES.groundPlain,
  SPRITES.groundMid3,
  SPRITES.groundMid4,
  SPRITES.groundDeco,
  SPRITES.groundCorner,
  ...SPRITES.page,
  ...SPRITES.pipIdleFront,
  ...SPRITES.pipIdleLeft,
  ...SPRITES.pipIdleRight,
  ...SPRITES.pipRunLeft,
  ...SPRITES.pipRunRight,
  ...SPRITES.pipJumpLeft,
  ...SPRITES.pipJumpRight,
  ...SPRITES.pipAttackLeft,
  ...SPRITES.pipAttackRight,
  ...SPRITES.pipHurt,
  ...SPRITES.pipDefeat,
  ...SPRITES.pipEmote,
  ...SPRITES.ink,
  ...SPRITES.ogreIdle,
  ...SPRITES.ogreWalk,
  ...SPRITES.ogreAttack,
  ...SPRITES.ogreHurt,
  ...SPRITES.ogreDefeat,
  ...SPRITES.witchIdle,
  ...SPRITES.witchMove,
  ...SPRITES.witchAttack,
  ...SPRITES.witchHurt,
  ...SPRITES.witchDefeat,
  ...SPRITES.witchInk,
  ...SPRITES.dragonIdle,
  ...SPRITES.dragonFly,
  ...SPRITES.dragonAttack,
  ...SPRITES.dragonHurt,
  ...SPRITES.dragonDefeat,
];

export function loadImages(urls: string[]): Promise<Map<string, HTMLImageElement>> {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise<[string, HTMLImageElement]>((resolve) => {
          const img = new Image();
          img.onload = () => resolve([src, img]);
          img.onerror = () => resolve([src, img]);
          img.src = src;
        }),
    ),
  ).then((pairs) => new Map(pairs.filter(([, image]) => image.naturalWidth > 0)));
}
