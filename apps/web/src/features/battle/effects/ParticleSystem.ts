// ============================================================
//  PARTICLE SYSTEM — Complete Visual Effects Engine
//  2D Canvas particle system for GO2 Battle Viewer
//  Optimized for 60 FPS with 2000+ particles (object pooling)
// ============================================================

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  alpha: number;
  gravity: number;
  decay: number;
  grow: number;
  rotation: number;
  rotSpeed: number;
  shape: "circle" | "square" | "line" | "ring";
}

export interface Projectile {
  x: number;
  y: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  vx: number;
  vy: number;
  progress: number;
  speed: number;
  weaponType: WeaponType;
  damageType: DamageType;
  color: string;
  size: number;
  trailTimer: number;
  lifetime: number;
  alive: boolean;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  decay: number;
  lineWidth: number;
  color: string;
}

export interface ShieldRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  decay: number;
  color: string;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  alpha: number;
  decay: number;
  vy: number;
  lifetime: number;
  maxLifetime: number;
  strokeColor: string;
  scale: number;
}

export type WeaponType = "ballistic" | "directional" | "missile" | "shipBased" | "laser";
export type DamageType = "heat" | "magnetic" | "ballistic" | "none";

export type BattleEvent =
  | { type: "WEAPON_FIRE"; x: number; y: number; weaponType: WeaponType; damageType: DamageType }
  | { type: "PROJECTILE_HIT"; x: number; y: number; weaponType: WeaponType; damageType: DamageType; damage: number }
  | { type: "SHIELD_HIT"; x: number; y: number; shieldX: number; shieldY: number; radius: number }
  | { type: "SHIELD_DEPLETED"; x: number; y: number }
  | { type: "HULL_DAMAGE"; x: number; y: number; damage: number }
  | { type: "SHIPS_DESTROYED"; x: number; y: number; count: number }
  | { type: "STACK_DESTROYED"; x: number; y: number }
  | { type: "INTERCEPT"; x: number; y: number }
  | { type: "SCATTER_DAMAGE"; x: number; y: number; damage: number }
  | { type: "EOS_TRIGGER"; x: number; y: number; absorbed: number }
  | { type: "CRITICAL_HIT"; x: number; y: number; damage: number }
  | { type: "DODGE"; x: number; y: number };

// ============================================================
//  COLOR PALETTES
// ============================================================
const DAMAGE_COLORS: Record<DamageType, { primary: string; glow: string; spark: string }> = {
  heat: { primary: "#ff3333", glow: "rgba(255,51,51,0.4)", spark: "#ff6666" },
  magnetic: { primary: "#3333ff", glow: "rgba(51,51,255,0.4)", spark: "#6666ff" },
  ballistic: { primary: "#ffcc00", glow: "rgba(255,204,0,0.4)", spark: "#ffee55" },
  none: { primary: "#ffffff", glow: "rgba(255,255,255,0.4)", spark: "#cccccc" },
};

const WEAPON_COLORS: Record<WeaponType, string> = {
  ballistic: "#ffcc00",
  directional: "#ff3333",
  missile: "#ff4444",
  shipBased: "#ff8800",
  laser: "#ff3333",
};

// ============================================================
//  RANDOM UTILITIES
// ============================================================
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function angle(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

// ============================================================
//  PARTICLE SYSTEM CLASS
// ============================================================
export class ParticleSystem {
  // Object pool - pre-allocated arrays for zero GC pressure
  private pool: Particle[] = [];
  private poolSize: number = 2000;
  private activeCount: number = 0;

  // Active containers
  private particles: Particle[] = [];
  private projectiles: Projectile[] = [];
  private shockwaves: Shockwave[] = [];
  private ripples: ShieldRipple[] = [];
  private floatingTexts: FloatingText[] = [];

  // Stats for debugging
  public stats = {
    activeParticles: 0,
    activeProjectiles: 0,
    activeShockwaves: 0,
    poolUsage: 0,
  };

  constructor() {
    this.initPool();
  }

  // ---- Object Pool Setup ----
  private initPool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push(this.createEmptyParticle());
    }
  }

  private createEmptyParticle(): Particle {
    return {
      x: 0, y: 0,
      vx: 0, vy: 0,
      life: 0, maxLife: 1,
      color: "#ffffff",
      size: 1,
      alpha: 1,
      gravity: 0,
      decay: 0.02,
      grow: 0,
      rotation: 0,
      rotSpeed: 0,
      shape: "circle",
    };
  }

  private acquireParticle(): Particle | null {
    if (this.activeCount >= this.poolSize) return null;
    const p = this.pool[this.activeCount];
    this.activeCount++;
    this.stats.poolUsage = this.activeCount / this.poolSize;
    return p;
  }

  // ---- Particle Spawners ----

  /**
   * Spawn explosion with radial particles
   * intensity 1-4: small to massive
   */
  spawnExplosion(x: number, y: number, intensity: 1 | 2 | 3 | 4 = 2): void {
    const counts = [8, 18, 35, 80];
    const count = counts[intensity - 1];
    const speedMax = [120, 200, 300, 450][intensity - 1];
    const lifeRange = [0.3, 0.5, 0.7, 1.0];
    const life = lifeRange[intensity - 1];

    // Core color varies by intensity
    const coreColors = ["#ffcc00", "#ff8800", "#ff4444", "#ff2200"];
    const coreColor = coreColors[intensity - 1];

    for (let i = 0; i < count; i++) {
      const p = this.acquireParticle();
      if (!p) break;

      const a = rand(0, Math.PI * 2);
      const spd = rand(20, speedMax);
      const sz = rand(1.5, intensity * 2.5);
      const lf = rand(life * 0.5, life * 1.5);

      p.x = x + rand(-4, 4);
      p.y = y + rand(-4, 4);
      p.vx = Math.cos(a) * spd;
      p.vy = Math.sin(a) * spd;
      p.life = lf;
      p.maxLife = lf;
      p.color = i < count * 0.3 ? coreColor : (i < count * 0.6 ? "#ff8800" : "#ff4444");
      p.size = sz;
      p.alpha = 1;
      p.gravity = rand(10, 40);
      p.decay = rand(0.8, 1.2) / lf;
      p.grow = rand(-2, 0.5);
      p.rotation = rand(0, Math.PI * 2);
      p.rotSpeed = rand(-3, 3);
      p.shape = Math.random() > 0.3 ? "circle" : "square";
    }

    // Spawn shockwave for medium+ explosions
    if (intensity >= 2) {
      this.spawnShockwave(x, y, intensity);
    }

    // Floating damage number on explosions
    if (intensity >= 3) {
      const dmg = [25, 50, 100, 200][intensity - 1];
      this.spawnFloatingText(x, y - 15, `-${dmg}`, "#ff4444", 18, "#880000");
    }
  }

  /**
   * Spawn a projectile with animation
   */
  spawnProjectile(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    weaponType: WeaponType,
    damageType: DamageType = "none"
  ): void {
    const colors = WEAPON_COLORS;
    const speeds: Record<WeaponType, number> = {
      ballistic: 800,
      directional: 9999,
      missile: 300,
      shipBased: 150,
      laser: 9999,
    };
    const sizes: Record<WeaponType, number> = {
      ballistic: 2,
      directional: 3,
      missile: 5,
      shipBased: 12,
      laser: 4,
    };

    const a = angle(startX, startY, endX, endY);
    const spd = speeds[weaponType];

    // Laser beams are instant - render as beam effect
    if (weaponType === "directional" || weaponType === "laser") {
      const dc = DAMAGE_COLORS[damageType];
      // Beam flash particles at hit point
      this.spawnSpark(endX, endY, randInt(5, 10), dc.spark);
      // Burn particles along the beam
      const beamDist = dist(startX, startY, endX, endY);
      const steps = Math.min(Math.floor(beamDist / 8), 30);
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const px = lerp(startX, endX, t) + rand(-2, 2);
        const py = lerp(startY, endY, t) + rand(-2, 2);
        const p = this.acquireParticle();
        if (!p) break;
        p.x = px;
        p.y = py;
        p.vx = rand(-15, 15);
        p.vy = rand(-15, 15);
        p.life = rand(0.1, 0.25);
        p.maxLife = p.life;
        p.color = dc.primary;
        p.size = rand(2, 5);
        p.alpha = rand(0.4, 0.9);
        p.gravity = 0;
        p.decay = 4;
        p.shape = "circle";
      }
      return;
    }

    // For non-beam weapons, create a projectile object
    const totalDist = dist(startX, startY, endX, endY);
    const travelTime = totalDist / spd;

    this.projectiles.push({
      x: startX,
      y: startY,
      startX,
      startY,
      endX,
      endY,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      progress: 0,
      speed: spd,
      weaponType,
      damageType,
      color: colors[weaponType],
      size: sizes[weaponType],
      trailTimer: 0,
      lifetime: travelTime,
      alive: true,
    });
  }

  /**
   * Spawn shield ripple - circular wave at impact point
   */
  spawnShieldRipple(x: number, y: number, radius: number = 40): void {
    this.ripples.push({
      x,
      y,
      radius: 4,
      maxRadius: radius * 1.5,
      speed: 120,
      alpha: 0.8,
      decay: 2.0,
      color: "#00ccff",
    });
    // Second ring
    this.ripples.push({
      x,
      y,
      radius: 2,
      maxRadius: radius,
      speed: 80,
      alpha: 0.6,
      decay: 2.5,
      color: "#66ddff",
    });
  }

  /**
   * Spawn engine trail particles
   */
  spawnEngineTrail(x: number, y: number, direction: number): void {
    for (let i = 0; i < 2; i++) {
      const p = this.acquireParticle();
      if (!p) break;
      const spread = 0.3;
      const a = direction + Math.PI + rand(-spread, spread);
      const spd = rand(40, 100);
      p.x = x + rand(-2, 2);
      p.y = y + rand(-2, 2);
      p.vx = Math.cos(a) * spd;
      p.vy = Math.sin(a) * spd;
      p.life = rand(0.2, 0.5);
      p.maxLife = p.life;
      p.color = rand(0, 1) > 0.5 ? "#4488ff" : "#88aaff";
      p.size = rand(2, 5);
      p.alpha = rand(0.3, 0.7);
      p.gravity = -5;
      p.decay = 1.5;
      p.grow = -1;
      p.shape = "circle";
    }
  }

  /**
   * Spawn sparks on impact
   */
  spawnSpark(x: number, y: number, count: number = 8, color: string = "#ffcc00"): void {
    for (let i = 0; i < count; i++) {
      const p = this.acquireParticle();
      if (!p) break;
      const a = rand(0, Math.PI * 2);
      const spd = rand(50, 200);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * spd;
      p.vy = Math.sin(a) * spd;
      p.life = rand(0.15, 0.4);
      p.maxLife = p.life;
      p.color = color;
      p.size = rand(1, 3);
      p.alpha = 1;
      p.gravity = rand(30, 80);
      p.decay = 2.5;
      p.shape = "line";
      p.rotation = a;
    }
  }

  /**
   * Spawn shockwave - expanding circle ring
   */
  spawnShockwave(x: number, y: number, intensity: 1 | 2 | 3 | 4 = 2): void {
    const radii = [30, 60, 120, 200];
    const speeds = [150, 250, 350, 500];
    const widths = [1.5, 2.5, 4, 6];
    const colors = ["#ffcc00", "#ff8800", "#ff4444", "#ff2200"];

    this.shockwaves.push({
      x,
      y,
      radius: 4,
      maxRadius: radii[intensity - 1],
      speed: speeds[intensity - 1],
      alpha: 0.6,
      decay: 2.0,
      lineWidth: widths[intensity - 1],
      color: colors[intensity - 1],
    });
  }

  /**
   * Spawn floating text (damage numbers, "EVADED", etc.)
   */
  spawnFloatingText(
    x: number,
    y: number,
    text: string,
    color: string = "#ffffff",
    fontSize: number = 14,
    strokeColor: string = "#000000",
    scale: number = 1
  ): void {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      fontSize,
      alpha: 1,
      decay: 1.0,
      vy: -40,
      lifetime: 1.0,
      maxLifetime: 1.0,
      strokeColor,
      scale,
    });
  }

  // ---- Specialized Effects ----

  /**
   * Shield depleted - shatter effect
   */
  spawnShieldShatter(x: number, y: number): void {
    // Crystal-like particles dispersing outward
    const colors = ["#00ccff", "#66ddff", "#aaddff", "#0088cc"];
    for (let i = 0; i < 30; i++) {
      const p = this.acquireParticle();
      if (!p) break;
      const a = rand(0, Math.PI * 2);
      const spd = rand(30, 180);
      p.x = x + rand(-10, 10);
      p.y = y + rand(-10, 10);
      p.vx = Math.cos(a) * spd;
      p.vy = Math.sin(a) * spd;
      p.life = rand(0.4, 0.9);
      p.maxLife = p.life;
      p.color = colors[randInt(0, colors.length - 1)];
      p.size = rand(2, 6);
      p.alpha = 1;
      p.gravity = rand(10, 30);
      p.decay = 1.2;
      p.grow = -0.5;
      p.rotation = rand(0, Math.PI * 2);
      p.rotSpeed = rand(-8, 8);
      p.shape = "square";
    }
    // Spawn shockwave
    this.spawnShockwave(x, y, 2);
  }

  /**
   * EOS shield trigger effect
   */
  spawnEosEffect(x: number, y: number, absorbed: number): void {
    // Blue aura particles circling
    for (let i = 0; i < 16; i++) {
      const p = this.acquireParticle();
      if (!p) break;
      const a = (i / 16) * Math.PI * 2;
      const r = rand(15, 30);
      p.x = x + Math.cos(a) * r;
      p.y = y + Math.sin(a) * r;
      p.vx = Math.cos(a) * rand(-20, 20);
      p.vy = Math.sin(a) * rand(-20, 20);
      p.life = rand(0.3, 0.6);
      p.maxLife = p.life;
      p.color = "#3388ff";
      p.size = rand(3, 6);
      p.alpha = rand(0.5, 0.9);
      p.gravity = 0;
      p.decay = 2;
      p.shape = "circle";
    }
    // Absorption number
    this.spawnFloatingText(x, y - 20, `${absorbed}`, "#3388ff", 16, "#114488");
  }

  /**
   * Critical hit effect - radial emphasis lines + big number
   */
  spawnCriticalHit(x: number, y: number, damage: number): void {
    // Radial emphasis lines
    for (let i = 0; i < 12; i++) {
      const p = this.acquireParticle();
      if (!p) break;
      const a = (i / 12) * Math.PI * 2;
      const spd = rand(80, 150);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * spd;
      p.vy = Math.sin(a) * spd;
      p.life = rand(0.2, 0.35);
      p.maxLife = p.life;
      p.color = "#ffcc00";
      p.size = rand(1, 2);
      p.alpha = 1;
      p.gravity = 0;
      p.decay = 3;
      p.shape = "line";
      p.rotation = a;
    }
    // Big damage number
    this.spawnFloatingText(x, y - 25, `CRIT ${damage}`, "#ff2244", 22, "#ffcc00", 1.5);
  }

  /**
   * Dodge effect
   */
  spawnDodge(x: number, y: number): void {
    // Afterimage particles
    for (let i = 0; i < 8; i++) {
      const p = this.acquireParticle();
      if (!p) break;
      const side = Math.random() > 0.5 ? 1 : -1;
      p.x = x + rand(-5, 5);
      p.y = y + rand(-5, 5);
      p.vx = side * rand(60, 120);
      p.vy = rand(-30, 30);
      p.life = rand(0.2, 0.35);
      p.maxLife = p.life;
      p.color = "#ffffff";
      p.size = rand(2, 4);
      p.alpha = rand(0.6, 0.9);
      p.gravity = 0;
      p.decay = 3;
      p.shape = "circle";
    }
    this.spawnFloatingText(x, y - 20, "EVADED", "#ffffff", 16, "#4488ff");
  }

  /**
   * Hull damage effect
   */
  spawnHullDamage(x: number, y: number, damage: number): void {
    // Red/gray debris particles
    const colors = ["#ff4444", "#cc3333", "#888888", "#aaaaaa"];
    for (let i = 0; i < randInt(5, 10); i++) {
      const p = this.acquireParticle();
      if (!p) break;
      const a = rand(0, Math.PI * 2);
      const spd = rand(30, 120);
      p.x = x + rand(-3, 3);
      p.y = y + rand(-3, 3);
      p.vx = Math.cos(a) * spd;
      p.vy = Math.sin(a) * spd;
      p.life = rand(0.2, 0.5);
      p.maxLife = p.life;
      p.color = colors[randInt(0, colors.length - 1)];
      p.size = rand(1.5, 4);
      p.alpha = 1;
      p.gravity = rand(20, 50);
      p.decay = 2;
      p.grow = -0.3;
      p.rotation = rand(0, Math.PI * 2);
      p.rotSpeed = rand(-5, 5);
      p.shape = Math.random() > 0.5 ? "square" : "circle";
    }
    this.spawnFloatingText(x, y - 15, `-${damage}`, "#ff6644", 14, "#662200");
  }

  /**
   * Intercept effect - missile destroyed mid-flight
   */
  spawnIntercept(x: number, y: number): void {
    // Green flash particles
    for (let i = 0; i < 20; i++) {
      const p = this.acquireParticle();
      if (!p) break;
      const a = rand(0, Math.PI * 2);
      const spd = rand(40, 160);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * spd;
      p.vy = Math.sin(a) * spd;
      p.life = rand(0.2, 0.5);
      p.maxLife = p.life;
      p.color = Math.random() > 0.5 ? "#44ff44" : "#88ff88";
      p.size = rand(2, 5);
      p.alpha = 1;
      p.gravity = rand(-10, 10);
      p.decay = 2.5;
      p.shape = "circle";
    }
    this.spawnShockwave(x, y, 1);
    this.spawnFloatingText(x, y - 15, "INTERCEPTED", "#44ff44", 13, "#116611");
  }

  /**
   * Scatter damage - area damage lines to nearby hexes
   */
  spawnScatterDamage(x: number, y: number, damage: number): void {
    // Electric arc particles radiating
    const arcCount = randInt(6, 12);
    for (let i = 0; i < arcCount; i++) {
      const p = this.acquireParticle();
      if (!p) break;
      const a = (i / arcCount) * Math.PI * 2 + rand(-0.2, 0.2);
      const spd = rand(60, 180);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * spd;
      p.vy = Math.sin(a) * spd;
      p.life = rand(0.15, 0.35);
      p.maxLife = p.life;
      p.color = "#ff8800";
      p.size = rand(1, 2);
      p.alpha = 1;
      p.gravity = 0;
      p.decay = 3;
      p.shape = "line";
      p.rotation = a;
    }
    this.spawnFloatingText(x, y - 15, `SCATTER ${damage}`, "#ff8800", 14, "#662200");
  }

  /**
   * Weapon fire muzzle flash
   */
  spawnMuzzleFlash(x: number, y: number, weaponType: WeaponType, damageType: DamageType = "none"): void {
    const dc = DAMAGE_COLORS[damageType];
    switch (weaponType) {
      case "ballistic": {
        // Small yellow flash
        for (let i = 0; i < 4; i++) {
          const p = this.acquireParticle();
          if (!p) break;
          p.x = x;
          p.y = y;
          p.vx = rand(-30, 30);
          p.vy = rand(-30, 30);
          p.life = rand(0.05, 0.12);
          p.maxLife = p.life;
          p.color = "#ffee55";
          p.size = rand(2, 4);
          p.alpha = rand(0.7, 1);
          p.decay = 8;
          p.shape = "circle";
        }
        break;
      }
      case "directional":
      case "laser": {
        // Beam origin flash
        for (let i = 0; i < 6; i++) {
          const p = this.acquireParticle();
          if (!p) break;
          p.x = x;
          p.y = y;
          p.vx = rand(-40, 40);
          p.vy = rand(-40, 40);
          p.life = rand(0.05, 0.15);
          p.maxLife = p.life;
          p.color = dc.primary;
          p.size = rand(2, 5);
          p.alpha = rand(0.8, 1);
          p.decay = 6;
          p.shape = "circle";
        }
        break;
      }
      case "missile": {
        // Smoke puff + small flame
        for (let i = 0; i < 6; i++) {
          const p = this.acquireParticle();
          if (!p) break;
          p.x = x;
          p.y = y;
          p.vx = rand(-20, 20);
          p.vy = rand(-20, 20);
          p.life = rand(0.1, 0.25);
          p.maxLife = p.life;
          p.color = i < 3 ? "#ff6622" : "#888888";
          p.size = rand(2, 5);
          p.alpha = rand(0.5, 0.9);
          p.decay = 4;
          p.grow = 1;
          p.shape = "circle";
        }
        break;
      }
      case "shipBased": {
        // Large energy pulse at origin
        for (let i = 0; i < 10; i++) {
          const p = this.acquireParticle();
          if (!p) break;
          const a = rand(0, Math.PI * 2);
          const spd = rand(40, 100);
          p.x = x;
          p.y = y;
          p.vx = Math.cos(a) * spd;
          p.vy = Math.sin(a) * spd;
          p.life = rand(0.1, 0.3);
          p.maxLife = p.life;
          p.color = "#ffaa00";
          p.size = rand(4, 10);
          p.alpha = rand(0.6, 1);
          p.decay = 4;
          p.shape = "circle";
        }
        this.spawnShockwave(x, y, 2);
        break;
      }
    }
  }

  // ============================================================
  //  UPDATE LOOP
  // ============================================================
  update(dt: number): void {
    // Clamp dt to prevent huge jumps
    const safeDt = Math.min(dt, 0.05);

    this.updateParticles(safeDt);
    this.updateProjectiles(safeDt);
    this.updateShockwaves(safeDt);
    this.updateRipples(safeDt);
    this.updateFloatingTexts(safeDt);

    // Update stats
    this.stats.activeParticles = this.particles.filter((p) => p.life > 0).length;
    this.stats.activeProjectiles = this.projectiles.filter((pr) => pr.alive).length;
    this.stats.activeShockwaves = this.shockwaves.length;
  }

  private updateParticles(dt: number): void {
    let aliveCount = 0;
    for (let i = 0; i < this.activeCount; i++) {
      const p = this.pool[i];
      p.life -= dt;
      if (p.life <= 0) continue;

      // Swap alive particle to front (maintain active region)
      if (i !== aliveCount) {
        const temp = this.pool[aliveCount];
        this.pool[aliveCount] = p;
        this.pool[i] = temp;
      }
      aliveCount++;

      // Physics
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.vx *= 0.99; // air resistance
      p.alpha -= p.decay * dt;
      p.size += p.grow * dt;
      p.rotation += p.rotSpeed * dt;

      if (p.alpha < 0) p.alpha = 0;
      if (p.size < 0.1) p.size = 0.1;
    }
    this.activeCount = aliveCount;
  }

  private updateProjectiles(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.lifetime -= dt;

      if (pr.lifetime <= 0) {
        // Hit!
        this.onProjectileHit(pr);
        pr.alive = false;
        this.projectiles.splice(i, 1);
        continue;
      }

      // Move
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.progress = 1 - pr.lifetime / (dist(pr.startX, pr.startY, pr.endX, pr.endY) / pr.speed);

      // Missile acceleration
      if (pr.weaponType === "missile") {
        pr.vx *= 1.02;
        pr.vy *= 1.02;
      }

      // Trail spawning
      pr.trailTimer -= dt;
      if (pr.trailTimer <= 0) {
        pr.trailTimer = pr.weaponType === "missile" ? 0.02 : 0.01;
        this.spawnProjectileTrail(pr);
      }
    }
  }

  private onProjectileHit(pr: Projectile): void {
    switch (pr.weaponType) {
      case "ballistic":
        this.spawnSpark(pr.endX, pr.endY, randInt(5, 10), "#ffee55");
        break;
      case "missile":
        this.spawnExplosion(pr.endX, pr.endY, 3);
        break;
      case "shipBased":
        this.spawnExplosion(pr.endX, pr.endY, 4);
        break;
    }
  }

  private spawnProjectileTrail(pr: Projectile): void {
    const p = this.acquireParticle();
    if (!p) return;
    p.x = pr.x + rand(-2, 2);
    p.y = pr.y + rand(-2, 2);
    p.vx = rand(-10, 10);
    p.vy = rand(-10, 10);

    switch (pr.weaponType) {
      case "ballistic": {
        p.life = rand(0.05, 0.12);
        p.color = "#ffee88";
        p.size = rand(1, 2);
        p.alpha = rand(0.3, 0.6);
        p.decay = 6;
        break;
      }
      case "missile": {
        p.life = rand(0.3, 0.6);
        p.color = Math.random() > 0.4 ? "#aaaaaa" : "#666666";
        p.size = rand(2, 5);
        p.alpha = rand(0.2, 0.5);
        p.decay = 1.2;
        p.grow = 0.5;
        break;
      }
      case "shipBased": {
        p.life = rand(0.2, 0.4);
        p.color = "#ffaa44";
        p.size = rand(3, 8);
        p.alpha = rand(0.3, 0.6);
        p.decay = 2.5;
        p.grow = 0.3;
        break;
      }
      default: {
        p.life = 0.01;
        p.color = pr.color;
        p.size = 1;
        p.alpha = 0;
        p.decay = 100;
      }
    }
    p.maxLife = p.life;
    p.gravity = 0;
    p.shape = "circle";
  }

  private updateShockwaves(dt: number): void {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed * dt;
      sw.alpha -= sw.decay * dt;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  private updateRipples(dt: number): void {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += r.speed * dt;
      r.alpha -= r.decay * dt;
      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number): void {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.lifetime -= dt;
      if (ft.lifetime <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
      ft.alpha = ft.lifetime / ft.maxLifetime;
    }
  }

  // ============================================================
  //  RENDER LOOP
  // ============================================================
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    this.renderParticles(ctx);
    this.renderProjectiles(ctx);
    this.renderShockwaves(ctx);
    this.renderRipples(ctx);

    ctx.restore();

    // Floating text uses normal composite (not lighter)
    this.renderFloatingTexts(ctx);
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.activeCount; i++) {
      const p = this.pool[i];
      if (p.life <= 0 || p.alpha <= 0) continue;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      const lifeRatio = p.life / p.maxLife;
      const currentSize = Math.max(0.1, p.size * lifeRatio);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      switch (p.shape) {
        case "circle": {
          ctx.beginPath();
          ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "square": {
          const half = currentSize;
          ctx.fillRect(-half, -half, half * 2, half * 2);
          break;
        }
        case "line": {
          ctx.lineWidth = Math.max(1, currentSize);
          ctx.beginPath();
          ctx.moveTo(-currentSize * 3, 0);
          ctx.lineTo(currentSize * 3, 0);
          ctx.stroke();
          break;
        }
        case "ring": {
          ctx.lineWidth = Math.max(1, currentSize * 0.5);
          ctx.beginPath();
          ctx.arc(0, 0, currentSize * 2, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
      }

      ctx.restore();
    }
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D): void {
    for (const pr of this.projectiles) {
      if (!pr.alive) continue;
      ctx.globalAlpha = 0.9;

      switch (pr.weaponType) {
        case "ballistic": {
          // Bright tracer line
          const tailLen = 12;
          const dx = -pr.vx / pr.speed * tailLen;
          const dy = -pr.vy / pr.speed * tailLen;
          ctx.strokeStyle = pr.color;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(pr.x + dx, pr.y + dy);
          ctx.lineTo(pr.x, pr.y);
          ctx.stroke();
          // Head glow
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "missile": {
          // Missile body
          const a = Math.atan2(pr.vy, pr.vx);
          ctx.save();
          ctx.translate(pr.x, pr.y);
          ctx.rotate(a);
          // Body
          ctx.fillStyle = "#cc3333";
          ctx.beginPath();
          ctx.ellipse(0, 0, pr.size, pr.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          // Nose
          ctx.fillStyle = "#ff4444";
          ctx.beginPath();
          ctx.moveTo(pr.size, 0);
          ctx.lineTo(pr.size * 0.5, -pr.size * 0.4);
          ctx.lineTo(pr.size * 0.5, pr.size * 0.4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
        }
        case "shipBased": {
          // Energy orb with glow
          const glowSize = pr.size * 2;
          // Outer glow
          const glowGrad = ctx.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, glowSize);
          glowGrad.addColorStop(0, "rgba(255,170,0,0.6)");
          glowGrad.addColorStop(0.5, "rgba(255,120,0,0.2)");
          glowGrad.addColorStop(1, "rgba(255,80,0,0)");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, glowSize, 0, Math.PI * 2);
          ctx.fill();
          // Core
          ctx.fillStyle = "#ffffaa";
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, pr.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          // Outer ring
          ctx.strokeStyle = "#ffaa00";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, pr.size, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
      }
    }
  }

  private renderShockwaves(ctx: CanvasRenderingContext2D): void {
    for (const sw of this.shockwaves) {
      ctx.globalAlpha = sw.alpha;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.lineWidth;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private renderRipples(ctx: CanvasRenderingContext2D): void {
    for (const r of this.ripples) {
      ctx.globalAlpha = r.alpha;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D): void {
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = ft.alpha;
      ctx.save();
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);
      ctx.font = `bold ${ft.fontSize}px 'Segoe UI', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Stroke
      ctx.strokeStyle = ft.strokeColor;
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, 0, 0);
      // Fill
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    }
  }

  // ============================================================
  //  EVENT PROCESSING
  // ============================================================
  processEvent(event: BattleEvent): void {
    switch (event.type) {
      case "WEAPON_FIRE": {
        this.spawnMuzzleFlash(event.x, event.y, event.weaponType, event.damageType);
        break;
      }
      case "PROJECTILE_HIT": {
        this.spawnProjectile(
          event.x,
          event.y,
          event.x,
          event.y,
          event.weaponType,
          event.damageType
        );
        switch (event.weaponType) {
          case "ballistic":
            this.spawnSpark(event.x, event.y, randInt(5, 10), "#ffee55");
            break;
          case "missile":
            this.spawnExplosion(event.x, event.y, 3);
            break;
          case "shipBased":
            this.spawnExplosion(event.x, event.y, 4);
            break;
          case "directional":
          case "laser": {
            const dc = DAMAGE_COLORS[event.damageType];
            this.spawnSpark(event.x, event.y, randInt(5, 10), dc.spark);
            break;
          }
        }
        if (event.damage > 0) {
          this.spawnFloatingText(event.x, event.y - 10, `-${event.damage}`, "#ff6644", 13, "#662200");
        }
        break;
      }
      case "SHIELD_HIT": {
        this.spawnShieldRipple(event.shieldX ?? event.x, event.shieldY ?? event.y, event.radius);
        // Small flash
        this.spawnSpark(event.x, event.y, randInt(3, 6), "#00ccff");
        break;
      }
      case "SHIELD_DEPLETED": {
        this.spawnShieldShatter(event.x, event.y);
        break;
      }
      case "HULL_DAMAGE": {
        this.spawnHullDamage(event.x, event.y, event.damage);
        break;
      }
      case "SHIPS_DESTROYED": {
        const intensity = event.count >= 5 ? 4 : event.count >= 2 ? 3 : 2;
        this.spawnExplosion(event.x, event.y, intensity as 2 | 3 | 4);
        if (event.count > 1) {
          this.spawnFloatingText(event.x, event.y - 20, `x${event.count}`, "#ff4444", 16, "#880000");
        }
        break;
      }
      case "STACK_DESTROYED": {
        this.spawnExplosion(event.x, event.y, 3);
        this.spawnFloatingText(event.x, event.y - 20, "DESTROYED", "#ff2222", 18, "#880000");
        break;
      }
      case "INTERCEPT": {
        this.spawnIntercept(event.x, event.y);
        break;
      }
      case "SCATTER_DAMAGE": {
        this.spawnScatterDamage(event.x, event.y, event.damage);
        break;
      }
      case "EOS_TRIGGER": {
        this.spawnEosEffect(event.x, event.y, event.absorbed);
        break;
      }
      case "CRITICAL_HIT": {
        this.spawnCriticalHit(event.x, event.y, event.damage);
        break;
      }
      case "DODGE": {
        this.spawnDodge(event.x, event.y);
        break;
      }
    }
  }

  // ============================================================
  //  SCREEN SHAKE
  // ============================================================
  screenShake = {
    intensity: 0,
    decay: 0.88,
    offsetX: 0,
    offsetY: 0,

    /**
     * Trigger screen shake
     * intensity 1-4: light to maximum
     */
    trigger(intensity: 1 | 2 | 3 | 4 = 2): void {
      const strengths = [4, 10, 20, 35];
      this.intensity = strengths[intensity - 1];
    },

    update(dt: number): void {
      if (this.intensity <= 0.1) {
        this.intensity = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        return;
      }
      // Perlin-like random shake
      this.offsetX = (Math.random() * 2 - 1) * this.intensity;
      this.offsetY = (Math.random() * 2 - 1) * this.intensity;
      this.intensity *= Math.pow(this.decay, dt * 60);
    },

    /**
     * Apply shake transform to context (call at start of frame render)
     */
    apply(ctx: CanvasRenderingContext2D): void {
      if (this.intensity > 0.1) {
        ctx.translate(this.offsetX, this.offsetY);
      }
    },

    reset(): void {
      this.intensity = 0;
      this.offsetX = 0;
      this.offsetY = 0;
    },
  };

  // ============================================================
  //  UTILITY
  // ============================================================

  /** Clear all active effects */
  clear(): void {
    this.activeCount = 0;
    this.projectiles.length = 0;
    this.shockwaves.length = 0;
    this.ripples.length = 0;
    this.floatingTexts.length = 0;
    this.screenShake.reset();
  }

  /** Get current particle count for debugging */
  getParticleCount(): number {
    return this.activeCount;
  }

  /** Get projectile count */
  getProjectileCount(): number {
    return this.projectiles.filter((p) => p.alive).length;
  }
}

export default ParticleSystem;
