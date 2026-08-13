import { ATTACK_ANIM, VIEW_H, VIEW_W } from "./engine";
import { GROUND_PIECE, LEDGE_WOOD, SPRITES, type GroundPiece, type LedgeWood } from "./sprites";
import type { Collectible, Enemy, LevelTheme, Platform, Player, WorldState } from "./types";

function img(map: Map<string, HTMLImageElement>, src: string) {
  return map.get(src) ?? null;
}

function frame(list: readonly string[], t: number, fps: number) {
  const i = Math.floor(Math.abs(t) * fps) % list.length;
  return list[i];
}

function once(list: readonly string[], progress: number) {
  const i = Math.min(list.length - 1, Math.max(0, Math.floor(progress * list.length)));
  return list[i];
}

function pipSrc(p: Player, time: number) {
  const right = p.facing > 0;
  if (p.anim === "dead") return SPRITES.pipDefeat[SPRITES.pipDefeat.length - 1];
  if (p.anim === "hurt") {
    return once(SPRITES.pipHurt, 1 - p.hurtT / 0.35);
  }
  if (p.anim === "attack") {
    const list = right ? SPRITES.pipAttackRight : SPRITES.pipAttackLeft;
    return once(list, 1 - p.attackT / ATTACK_ANIM);
  }
  if (p.anim === "jump") {
    const list = right ? SPRITES.pipJumpRight : SPRITES.pipJumpLeft;
    const i = p.vy < -80 ? 0 : p.vy > 120 ? 2 : 1;
    return list[Math.min(i, list.length - 1)];
  }
  if (p.anim === "run") {
    return frame(right ? SPRITES.pipRunRight : SPRITES.pipRunLeft, time, 10);
  }
  return frame(right ? SPRITES.pipIdleRight : SPRITES.pipIdleLeft, time, 5);
}

function justShot(e: Enemy) {
  if (e.kind === "witch") return e.shootT > 1.35 && e.shootT <= 1.7;
  if (e.kind === "dragon") {
    return e.boss
      ? e.shootT > 1.0 && e.shootT <= 1.35
      : e.shootT > 1.55 && e.shootT <= 1.9;
  }
  return e.shootT > 1.48 && e.shootT <= 1.8;
}

function enemySrc(e: Enemy) {
  if (e.kind === "ogre") {
    if (e.anim === "defeat") return once(SPRITES.ogreDefeat, e.animT / 0.5);
    if (e.anim === "hurt") return frame(SPRITES.ogreHurt, e.animT, 8);
    if (justShot(e)) return once(SPRITES.ogreAttack, 1 - (e.shootT - 1.48) / 0.32);
    return frame(SPRITES.ogreWalk, e.animT, 6);
  }
  if (e.kind === "witch") {
    if (e.anim === "defeat") return once(SPRITES.witchDefeat, e.animT / 0.5);
    if (e.anim === "hurt") return frame(SPRITES.witchHurt, e.animT, 8);
    if (justShot(e)) return once(SPRITES.witchAttack, 1 - (e.shootT - 1.35) / 0.35);
    return frame(SPRITES.witchMove, e.animT, 6);
  }
  if (e.anim === "defeat") return once(SPRITES.dragonDefeat, e.animT / 0.5);
  if (e.anim === "hurt") return frame(SPRITES.dragonHurt, e.animT, 8);
  if (justShot(e)) {
    const t = e.boss ? 1 - (e.shootT - 1.0) / 0.35 : 1 - (e.shootT - 1.55) / 0.35;
    return once(SPRITES.dragonAttack, t);
  }
  return frame(SPRITES.dragonFly, e.animT, 6);
}

function themeColors(theme: LevelTheme) {
  if (theme === "forest") {
    return { top: "#3d4a38", mid: "#5c7350", edge: "#2a3328" };
  }
  if (theme === "castle") {
    return { top: "#5a5560", mid: "#7a7480", edge: "#3a3540" };
  }
  return { top: "#8a6238", mid: "#c4a06a", edge: "#5a3d22" };
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
  flip: boolean,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (!image) {
    ctx.fillStyle = "rgba(42,52,44,0.45)";
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    return;
  }
  if (flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(image, 0, 0, w, h);
  } else {
    ctx.drawImage(image, x, y, w, h);
  }
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  state: WorldState,
  images: Map<string, HTMLImageElement>,
) {
  const bg = img(images, state.level.background);
  const cam = state.cameraX;
  if (!bg) {
    ctx.fillStyle = "#1c2430";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    return;
  }
  const scale = VIEW_H / bg.height;
  const dw = bg.width * scale;
  const shift = ((cam * 0.32) % dw + dw) % dw;
  for (let x = -shift; x < VIEW_W; x += dw) {
    ctx.drawImage(bg, x, 0, dw, VIEW_H);
  }
}

function pickLedge(p: Platform): LedgeWood {
  // Prefer plain shelves — deco ledge art is ghosted and draws props over Pip.
  if (p.w <= 130) return LEDGE_WOOD.short;
  if (p.w <= 155) return LEDGE_WOOD.mid;
  return LEDGE_WOOD.long;
}

function drawGroundPiece(
  ctx: CanvasRenderingContext2D,
  images: Map<string, HTMLImageElement>,
  piece: GroundPiece,
  woodX: number,
  woodY: number,
  woodW: number,
) {
  const sprite = img(images, piece.src);
  if (!sprite || woodW <= 1) return false;
  const scale = woodW / piece.width;
  drawSprite(
    ctx,
    sprite,
    woodX - piece.left * scale,
    woodY - piece.top * scale,
    piece.imgW * scale,
    piece.imgH * scale,
    false,
    1,
  );
  return true;
}

function drawGroundPlatform(
  ctx: CanvasRenderingContext2D,
  images: Map<string, HTMLImageElement>,
  x: number,
  p: Platform,
  colors: ReturnType<typeof themeColors>,
) {
  const left = GROUND_PIECE.left;
  const right = GROUND_PIECE.right;
  const tile = GROUND_PIECE.tile;
  const scale = p.h / (tile.imgH - tile.top);
  const leftW = left.width * scale;
  const rightW = right.width * scale;

  let drew = false;
  if (p.w < leftW + rightW + 8) {
    drew = drawGroundPiece(ctx, images, GROUND_PIECE.short, x, p.y, p.w);
  } else {
    const mid = p.w - leftW - rightW;
    const count = Math.max(1, Math.round(mid / (tile.width * scale)));
    const each = mid / count;
    drew = drawGroundPiece(ctx, images, left, x, p.y, leftW);
    for (let i = 0; i < count; i++) {
      drew =
        drawGroundPiece(ctx, images, tile, x + leftW + i * each, p.y, each) ||
        drew;
    }
    drew =
      drawGroundPiece(ctx, images, right, x + p.w - rightW, p.y, rightW) || drew;
  }

  if (drew) return;
  ctx.fillStyle = colors.mid;
  roundRect(ctx, x, p.y, p.w, p.h, 0);
  ctx.fill();
  ctx.fillStyle = colors.top;
  ctx.fillRect(x, p.y, p.w, 6);
}

function drawFloatLedge(
  ctx: CanvasRenderingContext2D,
  images: Map<string, HTMLImageElement>,
  p: Platform,
  cam: number,
  colors: ReturnType<typeof themeColors>,
) {
  const x = p.x - cam;
  const ledge = pickLedge(p);
  const sprite = img(images, ledge.src);
  if (!sprite) {
    ctx.fillStyle = colors.mid;
    roundRect(ctx, x, p.y, p.w, p.h, 6);
    ctx.fill();
    ctx.fillStyle = colors.top;
    ctx.fillRect(x, p.y, p.w, 6);
    return;
  }
  const scale = p.w / ledge.width;
  drawSprite(
    ctx,
    sprite,
    x - ledge.left * scale,
    p.y - ledge.top * scale,
    ledge.imgW * scale,
    ledge.imgH * scale,
    false,
    1,
  );
}

function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  state: WorldState,
  images: Map<string, HTMLImageElement>,
) {
  const cam = state.cameraX;
  const colors = themeColors(state.level.theme);
  for (const p of state.level.platforms) {
    const x = p.x - cam;
    if (x + p.w < -80 || x > VIEW_W + 80) continue;
    if (p.kind === "ground") {
      drawGroundPlatform(ctx, images, x, p, colors);
    } else {
      drawFloatLedge(ctx, images, p, cam, colors);
    }
  }
}

function drawHazards(ctx: CanvasRenderingContext2D, state: WorldState) {
  const cam = state.cameraX;
  for (const h of state.level.hazards) {
    const x = h.x - cam;
    if (x + h.w < -20 || x > VIEW_W + 20) continue;
    if (h.kind === "lava") {
      const g = ctx.createLinearGradient(0, h.y, 0, h.y + h.h);
      g.addColorStop(0, "#ffb347");
      g.addColorStop(0.45, "#e07a4a");
      g.addColorStop(1, "#8b2e1a");
      ctx.fillStyle = g;
      roundRect(ctx, x, h.y, h.w, h.h, 8);
      ctx.fill();
    } else {
      ctx.fillStyle = "#1a1228";
      roundRect(ctx, x, h.y, h.w, h.h, 10);
      ctx.fill();
      ctx.fillStyle = "rgba(110,50,160,0.5)";
      roundRect(ctx, x + 6, h.y + 4, h.w - 12, h.h - 10, 8);
      ctx.fill();
    }
  }
}

function drawPage(
  ctx: CanvasRenderingContext2D,
  images: Map<string, HTMLImageElement>,
  c: Collectible,
  cam: number,
  time: number,
) {
  const golden = c.kind === "golden";
  const bob = Math.sin(time) * 5;
  const src = golden
    ? Math.floor(c.x) % 2 === 0
      ? SPRITES.pageBook
      : SPRITES.pageGolden
    : frame(SPRITES.page, c.bob + time * 0.35, 2);
  const sprite = img(images, src);
  const dw = golden ? 48 : 38;
  const dh = golden ? 56 : 46;
  const dx = c.x - cam + c.w / 2 - dw / 2;
  const dy = c.y + bob + c.h / 2 - dh / 2;
  if (!sprite) {
    ctx.fillStyle = golden ? "#f3d98a" : "#efe4c8";
    ctx.fillRect(dx, dy, dw, dh);
    return;
  }
  ctx.save();
  ctx.shadowColor = golden ? "#e8c97a" : "rgba(232, 201, 122, 0.35)";
  ctx.shadowBlur = golden ? 18 : 8;
  drawSprite(ctx, sprite, dx, dy, dw, dh, false, 1);
  ctx.restore();
}

function drawPortal(ctx: CanvasRenderingContext2D, state: WorldState) {
  const p = state.level.portal;
  const x = p.x - state.cameraX;
  const t = state.time;
  ctx.save();
  ctx.translate(x + p.w / 2, p.y + p.h / 2);
  ctx.shadowColor = "#e8c97a";
  ctx.shadowBlur = 22 + Math.sin(t * 3) * 6;
  ctx.fillStyle = "#3a2f1c";
  ctx.beginPath();
  ctx.ellipse(-16, 8, 10, 22, -0.25, 0, Math.PI * 2);
  ctx.ellipse(16, 8, 10, 22, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(247,240,230,${0.55 + Math.sin(t * 4) * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(0, 4, 14, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b08fce";
  ctx.fillRect(-18, 26, 36, 6);
  ctx.restore();
}

function drawCheckpoint(ctx: CanvasRenderingContext2D, state: WorldState) {
  const c = state.level.checkpoint;
  const x = c.x - state.cameraX;
  const y = c.y + 8;
  ctx.fillStyle = "#5a3d22";
  ctx.fillRect(x, y - 46, 5, 52);
  ctx.fillStyle = state.checkpointReached ? "#b08fce" : "#7ba3c4";
  ctx.beginPath();
  ctx.moveTo(x + 5, y - 46);
  ctx.lineTo(x + 28, y - 34);
  ctx.lineTo(x + 5, y - 22);
  ctx.closePath();
  ctx.fill();
}

export function renderWorld(
  ctx: CanvasRenderingContext2D,
  state: WorldState,
  images: Map<string, HTMLImageElement>,
) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  drawBackground(ctx, state, images);
  drawPlatforms(ctx, state, images);
  drawHazards(ctx, state);
  drawCheckpoint(ctx, state);
  drawPortal(ctx, state);

  const cam = state.cameraX;

  for (const c of state.collectibles) {
    if (c.taken) continue;
    drawPage(ctx, images, c, cam, state.time * 2.2 + c.bob);
  }

  for (const e of state.enemies) {
    const sprite = img(images, enemySrc(e));
    const pad = e.boss ? 24 : e.kind === "witch" ? 22 : 16;
    const alpha = e.anim === "defeat" ? Math.max(0, 1 - e.animT * 1.7) : 1;
    const shouldFlip = e.kind === "witch" ? e.facing > 0 : e.facing < 0;
    drawSprite(
      ctx,
      sprite,
      e.x - cam - pad,
      e.y - pad,
      e.w + pad * 2,
      e.h + pad * 2,
      shouldFlip,
      alpha,
    );
    if (e.boss && !e.dead) {
      const bx = e.x - cam;
      const bw = e.w;
      ctx.fillStyle = "rgba(20,16,12,0.45)";
      ctx.fillRect(bx, e.y - 14, bw, 6);
      ctx.fillStyle = "#c45c4a";
      ctx.fillRect(bx, e.y - 14, bw * (e.hp / e.maxHp), 6);
    }
  }

  for (const shot of state.projectiles) {
    const x = shot.x - cam;
    if (shot.kind === "ink") {
      const src = SPRITES.ink[Math.min(
        SPRITES.ink.length - 1,
        Math.floor((1 - shot.life / 0.85) * SPRITES.ink.length),
      )];
      drawSprite(
        ctx,
        img(images, src),
        x,
        shot.y,
        28,
        18,
        shot.vx < 0,
        1,
      );
    } else if (shot.kind === "fireball") {
      drawSprite(
        ctx,
        img(images, SPRITES.fireball),
        x,
        shot.y - 4,
        32,
        20,
        shot.vx < 0,
        1,
      );
    } else if (shot.kind === "witch-ink") {
      const src = SPRITES.witchInk[Math.min(
        SPRITES.witchInk.length - 1,
        Math.floor((1 - shot.life / 2.3) * SPRITES.witchInk.length),
      )];
      drawSprite(
        ctx,
        img(images, src),
        x,
        shot.y - 4,
        28,
        18,
        shot.vx > 0,
        1,
      );
    } else if (shot.kind === "book") {
      drawSprite(
        ctx,
        img(images, SPRITES.ogreBook),
        x - 4,
        shot.y - 4,
        26,
        18,
        shot.vx < 0,
        1,
      );
    } else {
      ctx.fillStyle = "#5b2d8a";
      ctx.beginPath();
      ctx.ellipse(x + 8, shot.y + 6, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(180,120,220,0.7)";
      ctx.beginPath();
      ctx.ellipse(x + 8, shot.y + 6, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const p = state.player;
  const pip = img(images, pipSrc(p, state.time));
  const flash =
    p.invulnT > 0 && p.anim !== "dead"
      ? 0.45 + 0.55 * Math.round(Math.sin(state.time * 28) * 0.5 + 0.5)
      : p.anim === "dead"
        ? 0.55
        : 1;
  const bob = p.anim === "run" ? Math.sin(state.time * 14) * 2 : 0;
  drawSprite(
    ctx,
    pip,
    p.x - cam - 14,
    p.y - 18 + bob,
    66,
    72,
    false,
    flash,
  );

  for (const part of state.particles) {
    ctx.globalAlpha = Math.max(0, part.life / part.maxLife);
    ctx.fillStyle = part.color;
    ctx.beginPath();
    ctx.arc(part.x - cam, part.y, part.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (state.flashT > 0) {
    ctx.fillStyle = `rgba(255,220,200,${state.flashT * 0.35})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
