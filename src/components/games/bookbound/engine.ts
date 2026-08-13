import type {
  BookboundInput,
  Enemy,
  EnemySpawn,
  GameEvent,
  LevelDef,
  Player,
  WorldState,
} from "./types";

export const VIEW_W = 960;
export const VIEW_H = 540;
export const GROUND_Y = 468;

export const PLAYER_W = 38;
export const PLAYER_H = 50;
export const MOVE_SPEED = 228;
export const JUMP_VEL = -620;
export const DOUBLE_JUMP_VEL = -560;
export const GRAVITY = 1680;
export const MAX_FALL = 920;
export const ATTACK_COOLDOWN = 0.52;
export const ATTACK_ANIM = 0.28;
export const INK_SPEED = 430;
export const INK_LIFE = 0.85;
export const INVULN = 1.25;
export const STOMP_BOUNCE = -300;
export const SCORE_PAGE = 10;
export const SCORE_GOLDEN = 50;
export const SCORE_ENEMY = 25;
export const SCORE_DRAGON = 250;

let seq = 1;
const uid = () => `bb-${seq++}`;

function aabb(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function enemyBox(s: EnemySpawn): { w: number; h: number } {
  if (s.kind === "ogre") return { w: 58, h: 68 };
  if (s.kind === "witch") return { w: 52, h: 58 };
  return s.boss ? { w: 92, h: 78 } : { w: 70, h: 62 };
}

function makeEnemy(s: EnemySpawn): Enemy {
  const box = enemyBox(s);
  const hp = s.hp ?? (s.boss ? 5 : 1);
  return {
    id: uid(),
    kind: s.kind,
    x: s.x,
    y: s.y,
    w: box.w,
    h: box.h,
    vx: s.kind === "witch" ? 42 : s.boss ? 55 : 48,
    facing: 1,
    minX: s.minX,
    maxX: s.maxX,
    baseY: s.y,
    hp,
    maxHp: hp,
    anim: "walk",
    animT: 0,
    shootT: 1.2 + Math.random() * 0.8,
    hurtT: 0,
    floatT: Math.random() * Math.PI * 2,
    boss: !!s.boss,
    dead: false,
  };
}

export function createWorld(level: LevelDef): WorldState {
  const player: Player = {
    x: level.spawn.x,
    y: level.spawn.y,
    w: PLAYER_W,
    h: PLAYER_H,
    vx: 0,
    vy: 0,
    facing: 1,
    grounded: true,
    hearts: 3,
    maxHearts: 3,
    invulnT: 0,
    attackT: 0,
    cooldownT: 0,
    hurtT: 0,
    anim: "idle",
    coyoteT: 0,
    jumpBufT: 0,
    airJumps: 1,
    spawnX: level.spawn.x,
    spawnY: level.spawn.y,
  };

  return {
    level,
    player,
    enemies: level.enemies.map(makeEnemy),
    collectibles: level.collectibles.map((c, i) => ({
      id: `c-${i}`,
      kind: c.kind,
      x: c.x,
      y: c.y,
      w: c.kind === "golden" ? 22 : 18,
      h: c.kind === "golden" ? 26 : 22,
      taken: false,
      bob: i * 0.7,
    })),
    projectiles: [],
    particles: [],
    cameraX: 0,
    time: 0,
    checkpointReached: false,
    portalOpen: true,
    outcome: null,
    flashT: 0,
    run: {
      score: 0,
      pages: 0,
      golden: 0,
      enemiesDefeated: 0,
      heartsLeft: 3,
      ogres: 0,
      witches: 0,
      dragons: 0,
      elapsed: 0,
    },
  };
}

function burst(state: WorldState, x: number, y: number, color: string, n = 10) {
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const sp = 40 + Math.random() * 90;
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 40,
      life: 0.35 + Math.random() * 0.25,
      maxLife: 0.5,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function facePlayer(e: Enemy, p: Player) {
  e.facing = p.x + p.w / 2 >= e.x + e.w / 2 ? 1 : -1;
}

function playerInSight(e: Enemy, p: Player, range = 520) {
  return Math.abs(p.x + p.w / 2 - (e.x + e.w / 2)) < range;
}

function shootAtPlayer(
  state: WorldState,
  e: Enemy,
  kind: "book" | "witch-ink" | "fireball",
) {
  const dir = e.facing;
  const sizes =
    kind === "fireball"
      ? { w: 28, h: 16, speed: 230, life: 2.6 }
      : kind === "book"
        ? { w: 18, h: 14, speed: 210, life: 2.2 }
        : { w: 16, h: 12, speed: 200, life: 2.3 };
  state.projectiles.push({
    id: uid(),
    kind,
    x: dir > 0 ? e.x + e.w - 4 : e.x - sizes.w,
    y: e.y + e.h * 0.35,
    w: sizes.w,
    h: sizes.h,
    vx: dir * sizes.speed,
    life: sizes.life,
  });
}

function edgeAhead(state: WorldState, e: Enemy) {
  const probeX = e.facing > 0 ? e.x + e.w + 4 : e.x - 4;
  const probeY = e.y + e.h + 4;
  for (const plat of state.level.platforms) {
    if (
      probeX >= plat.x &&
      probeX <= plat.x + plat.w &&
      probeY >= plat.y &&
      probeY <= plat.y + plat.h + 18
    ) {
      return false;
    }
  }
  return true;
}

function respawn(state: WorldState) {
  const p = state.player;
  if (state.checkpointReached) {
    p.x = state.level.checkpoint.x;
    p.y = state.level.checkpoint.y;
  } else {
    p.x = p.spawnX;
    p.y = p.spawnY;
  }
  p.vx = 0;
  p.vy = 0;
  p.airJumps = 1;
  p.invulnT = INVULN;
  p.hurtT = 0.25;
  p.anim = "hurt";
  state.flashT = 0.2;
  state.cameraX = Math.max(0, p.x - VIEW_W * 0.38);
}

function damagePlayer(state: WorldState, events: GameEvent[], respawnNow: boolean) {
  const p = state.player;
  if (p.invulnT > 0 || p.anim === "dead") return;
  p.hearts -= 1;
  state.run.heartsLeft = p.hearts;
  p.invulnT = INVULN;
  p.hurtT = 0.35;
  p.anim = "hurt";
  state.flashT = 0.18;
  events.push("hurt");
  burst(state, p.x + p.w / 2, p.y + p.h / 2, "#c45c4a", 8);
  if (p.hearts <= 0) {
    p.anim = "dead";
    p.vx = 0;
    events.push("die");
    state.outcome = "dead";
    return;
  }
  if (respawnNow) respawn(state);
  else {
    p.vy = -140;
    p.vx = -p.facing * 140;
  }
}

function defeatEnemy(state: WorldState, e: Enemy, events: GameEvent[]) {
  if (e.dead) return;
  e.hp -= 1;
  e.hurtT = 0.28;
  e.anim = "hurt";
  if (e.hp > 0) {
    events.push("stomp");
    burst(state, e.x + e.w / 2, e.y + e.h / 2, "#e8c97a", 6);
    return;
  }
  e.dead = true;
  e.anim = "defeat";
  e.animT = 0;
  e.vx = 0;
  events.push("defeat");
  state.run.enemiesDefeated += 1;
  if (e.kind === "ogre") state.run.ogres += 1;
  if (e.kind === "witch") state.run.witches += 1;
  if (e.kind === "dragon") {
    state.run.dragons += 1;
    events.push("dragon");
  }
  const pts = e.boss ? SCORE_DRAGON : SCORE_ENEMY;
  state.run.score += pts;
  burst(
    state,
    e.x + e.w / 2,
    e.y + e.h / 2,
    e.kind === "witch" ? "#9b7ed9" : e.kind === "dragon" ? "#e07a4a" : "#8fbc8f",
    14,
  );
}

export function stepWorld(
  state: WorldState,
  input: BookboundInput,
  dt: number,
): GameEvent[] {
  const events: GameEvent[] = [];
  const p = state.player;
  dt = Math.min(dt, 1 / 30);
  state.time += dt;
  state.run.elapsed += dt;
  if (state.flashT > 0) state.flashT -= dt;

  if (state.outcome) return events;

  p.invulnT = Math.max(0, p.invulnT - dt);
  p.attackT = Math.max(0, p.attackT - dt);
  p.cooldownT = Math.max(0, p.cooldownT - dt);
  p.hurtT = Math.max(0, p.hurtT - dt);
  p.coyoteT = Math.max(0, p.coyoteT - dt);
  p.jumpBufT = Math.max(0, p.jumpBufT - dt);

  if (input.jumpPressed) p.jumpBufT = 0.12;

  const wantLeft = input.left && !input.right;
  const wantRight = input.right && !input.left;
  if (p.anim !== "dead" && p.hurtT <= 0) {
    if (wantLeft) {
      p.vx = -MOVE_SPEED;
      p.facing = -1;
    } else if (wantRight) {
      p.vx = MOVE_SPEED;
      p.facing = 1;
    } else {
      p.vx = 0;
    }
  }

  if (p.anim !== "dead" && p.jumpBufT > 0) {
    const canGroundJump = p.grounded || p.coyoteT > 0;
    const canDouble = !canGroundJump && p.airJumps > 0;
    if (canGroundJump || canDouble) {
      p.vy = canDouble ? DOUBLE_JUMP_VEL : JUMP_VEL;
      if (canDouble) p.airJumps = 0;
      p.grounded = false;
      p.coyoteT = 0;
      p.jumpBufT = 0;
      events.push("jump");
    }
  }

  if (
    input.attackPressed &&
    p.cooldownT <= 0 &&
    p.anim !== "dead" &&
    p.hurtT <= 0
  ) {
    p.attackT = ATTACK_ANIM;
    p.cooldownT = ATTACK_COOLDOWN;
    events.push("ink");
    const dir = p.facing;
    state.projectiles.push({
      id: uid(),
      kind: "ink",
      x: dir > 0 ? p.x + p.w - 4 : p.x - 18,
      y: p.y + 16,
      w: 22,
      h: 14,
      vx: dir * INK_SPEED,
      life: INK_LIFE,
    });
  }

  p.vy = Math.min(MAX_FALL, p.vy + GRAVITY * dt);
  p.x += p.vx * dt;

  const worldW = state.level.width;
  p.x = Math.max(0, Math.min(worldW - p.w, p.x));

  const prevFeet = p.y + p.h;
  p.y += p.vy * dt;
  let landedPlat = null as (typeof state.level.platforms)[number] | null;
  if (p.vy >= 0) {
    for (const plat of state.level.platforms) {
      const overlapX = p.x + 6 < plat.x + plat.w && p.x + p.w - 6 > plat.x;
      if (
        overlapX &&
        prevFeet <= plat.y + 10 &&
        p.y + p.h >= plat.y
      ) {
        landedPlat = plat;
        break;
      }
    }
  }
  if (landedPlat) {
    p.y = landedPlat.y - p.h;
    p.vy = 0;
    p.grounded = true;
    p.coyoteT = 0.1;
    p.airJumps = 1;
  } else {
    if (p.grounded) p.coyoteT = 0.1;
    p.grounded = false;
  }

  if (p.y > VIEW_H + 40) {
    damagePlayer(state, events, true);
    return events;
  }

  if (p.anim !== "dead") {
    if (p.hurtT > 0) p.anim = "hurt";
    else if (p.attackT > 0) p.anim = "attack";
    else if (!p.grounded) p.anim = "jump";
    else if (Math.abs(p.vx) > 8) p.anim = "run";
    else p.anim = "idle";
  }

  const cp = state.level.checkpoint;
  if (!state.checkpointReached && p.x + p.w > cp.x && p.x < cp.x + 28) {
    state.checkpointReached = true;
    events.push("checkpoint");
    burst(state, cp.x + 10, cp.y - 20, "#e8c97a", 12);
  }

  for (const c of state.collectibles) {
    if (c.taken) continue;
    c.bob += dt * 2.4;
    if (aabb(p, c)) {
      c.taken = true;
      if (c.kind === "golden") {
        state.run.golden += 1;
        state.run.score += SCORE_GOLDEN;
        events.push("golden");
        burst(state, c.x + 10, c.y + 10, "#e8c97a", 12);
      } else {
        state.run.pages += 1;
        state.run.score += SCORE_PAGE;
        events.push("page");
        burst(state, c.x + 8, c.y + 8, "#342c45", 8);
      }
    }
  }

  for (const h of state.level.hazards) {
    if (p.invulnT > 0) continue;
    if (aabb(p, h)) {
      damagePlayer(state, events, true);
      break;
    }
  }

  for (const e of state.enemies) {
    e.animT += dt;
    e.hurtT = Math.max(0, e.hurtT - dt);
    if (e.dead) continue;

    e.shootT -= dt;
    if (e.kind === "witch") {
      e.floatT += dt;
      e.y = e.baseY + Math.sin(e.floatT * 1.6) * 28;
      e.x += e.vx * e.facing * dt * 0.85;
      if (e.x < e.minX) {
        e.x = e.minX;
        e.facing = 1;
      }
      if (e.x > e.maxX) {
        e.x = e.maxX;
        e.facing = -1;
      }
      e.anim = e.hurtT > 0 ? "hurt" : "walk";
      if (e.shootT <= 0 && playerInSight(e, p)) {
        facePlayer(e, p);
        e.shootT = 1.7;
        shootAtPlayer(state, e, "witch-ink");
      }
    } else if (e.kind === "dragon") {
      e.floatT += dt;
      if (e.boss) e.y = e.baseY + Math.sin(e.floatT * 0.9) * 10;
      e.x += e.vx * e.facing * dt;
      if (e.x < e.minX) {
        e.x = e.minX;
        e.facing = 1;
      }
      if (e.x > e.maxX) {
        e.x = e.maxX;
        e.facing = -1;
      }
      e.anim = e.hurtT > 0 ? "hurt" : "walk";
      if (e.shootT <= 0 && playerInSight(e, p, 640)) {
        facePlayer(e, p);
        e.shootT = e.boss ? 1.35 : 1.9;
        shootAtPlayer(state, e, "fireball");
      }
    } else {
      if (e.hurtT <= 0) {
        e.x += e.vx * e.facing * dt;
        if (e.x < e.minX || e.x > e.maxX || edgeAhead(state, e)) {
          e.facing = (e.facing * -1) as 1 | -1;
          e.x += e.facing * 6;
        }
      }
      e.anim = e.hurtT > 0 ? "hurt" : "walk";
      if (e.shootT <= 0 && playerInSight(e, p, 440)) {
        facePlayer(e, p);
        e.shootT = 1.8;
        shootAtPlayer(state, e, "book");
      }
    }

    if (p.anim === "dead" || p.invulnT > 0) continue;
    if (!aabb(p, e)) continue;

    const stomp =
      p.vy > 60 && p.y + p.h - 12 <= e.y + e.h * 0.45;
    if (stomp) {
      p.vy = STOMP_BOUNCE;
      p.grounded = false;
      defeatEnemy(state, e, events);
      events.push("stomp");
    } else {
      damagePlayer(state, events, false);
    }
  }

  state.enemies = state.enemies.filter((e) => !(e.dead && e.animT > 0.55));

  for (const shot of state.projectiles) {
    shot.x += shot.vx * dt;
    shot.life -= dt;
  }

  for (const shot of state.projectiles) {
    if (shot.life <= 0) continue;
    if (shot.kind === "ink") {
      for (const e of state.enemies) {
        if (e.dead) continue;
        if (aabb(shot, e)) {
          shot.life = 0;
          defeatEnemy(state, e, events);
          break;
        }
      }
    } else if (p.invulnT <= 0 && p.anim !== "dead" && aabb(shot, p)) {
      shot.life = 0;
      damagePlayer(state, events, false);
    }
  }

  state.projectiles = state.projectiles.filter(
    (s) => s.life > 0 && s.x > -40 && s.x < worldW + 40,
  );

  for (const part of state.particles) {
    part.x += part.vx * dt;
    part.y += part.vy * dt;
    part.vy += 280 * dt;
    part.life -= dt;
  }
  state.particles = state.particles.filter((pt) => pt.life > 0);

  const portal = state.level.portal;
  const bossAlive = state.enemies.some((e) => e.boss && !e.dead);
  if (!bossAlive && aabb(p, portal)) {
    state.outcome = "complete";
    state.run.heartsLeft = p.hearts;
    events.push("complete");
  }

  const target = p.x - VIEW_W * 0.38;
  const maxCam = Math.max(0, worldW - VIEW_W);
  const desired = Math.max(0, Math.min(maxCam, target));
  state.cameraX += (desired - state.cameraX) * Math.min(1, dt * 7);

  return events;
}

export function idleInput(): BookboundInput {
  return {
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
    attack: false,
    attackPressed: false,
  };
}
