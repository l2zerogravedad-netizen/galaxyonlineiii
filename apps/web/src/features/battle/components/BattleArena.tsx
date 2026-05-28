/**
 * ============================================================================
 * BattleArena — Canvas principal de batalla con grid hexagonal
 * ============================================================================
 * Renderiza:
 *   - Grid hexagonal 12x8 con fondo estrellado
 *   - Naves espaciales estilizadas (Frigate/Cruiser/Battleship)
 *   - Barras de estado (shield/hull)
 *   - Engine glow con partículas
 *   - Animaciones de movimiento tween
 *   - Cámara con pan/zoom
 *   - Hover, selección y tooltips
 * ============================================================================
 */

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import type {
  ShipStack,
  BattleEvent,
  BattlePhase,
  ShipType,
  Faction,
} from '../engine';

// ============================================================================
// TYPES & CONFIG
// ============================================================================

interface BattleArenaProps {
  attackerStacks: ShipStack[];
  defenderStacks: ShipStack[];
  events: BattleEvent[];
  selectedStackId?: string;
  onStackClick: (stackId: string) => void;
  onHexClick: (q: number, r: number) => void;
  phase: BattlePhase;
  round: number;
  width?: number;
  height?: number;
}

/** Coordenadas hexagonales axiales */
interface HexCoord {
  q: number; // columna
  r: number; // fila
}

/** Estado de animación de movimiento */
interface MoveAnimation {
  stackId: string;
  from: HexCoord;
  to: HexCoord;
  startTime: number;
  duration: number;
}

/** Partícula de engine glow */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

/** Efecto visual */
interface VisualEffect {
  type: 'shield_hit' | 'hull_hit' | 'explosion' | 'projectile';
  x: number;
  y: number;
  startTime: number;
  duration: number;
  intensity: number;
  targetX?: number;
  targetY?: number;
}

/** Tooltip state */
interface TooltipInfo {
  x: number;
  y: number;
  text: string[];
}

// --- Grid Config ---
const GRID_COLS = 12;
const GRID_ROWS = 8;
const HEX_RADIUS = 40;
const HEX_WIDTH = HEX_RADIUS * 2;
const HEX_HEIGHT = Math.sqrt(3) * HEX_RADIUS;
const HEX_H_SPACING = HEX_RADIUS * 3; // 1.5 * diameter
const HEX_V_SPACING = HEX_HEIGHT;
const SEPARATOR_COL = 5.5; // entre col 5 y 6

// --- Colors ---
const BG_COLOR = '#0a0e1a';
const HEX_BORDER = '#1e3a5f';
const HEX_HOVER = 'rgba(68, 136, 255, 0.2)';
const HEX_SELECTED = '#4488ff';
const SEPARATOR_COLOR = 'rgba(255, 68, 68, 0.27)';
const ATTACKER_COLOR = '#4488ff';
const DEFENDER_COLOR = '#ff4444';
const SHIELD_BAR_COLOR = '#00ccff';
const HULL_BAR_COLOR = '#44ff44';
const HULL_DAMAGED_COLOR = '#ff4444';
const SELECTED_GLOW = '#ffcc00';

// --- Ship sizes ---
const SHIP_SIZE: Record<ShipType, number> = {
  frigate: 20,
  cruiser: 30,
  battleship: 40,
};

// ============================================================================
// HEX MATH (Axial / Offset)
// ============================================================================

/** Convert axial hex coord to pixel position (flat-topped) */
function hexToPixel(q: number, r: number): { x: number; y: number } {
  const x = HEX_RADIUS * (3 / 2) * q;
  const y = HEX_RADIUS * (Math.sqrt(3) * r + (Math.sqrt(3) / 2) * q);
  return { x, y };
}

/** Convert pixel to nearest axial hex coord */
function pixelToHex(px: number, py: number): HexCoord {
  const q = ((2 / 3) * px) / HEX_RADIUS;
  const r = ((-1 / 3) * px + (Math.sqrt(3) / 3) * py) / HEX_RADIUS;
  return hexRound(q, r);
}

/** Round fractional hex to nearest integer hex */
function hexRound(q: number, r: number): HexCoord {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) {
    rq = -rr - rs;
  } else if (dr > ds) {
    rr = -rq - rs;
  }
  return { q: rq, r: rr };
}

/** Get polygon points for a flat-topped hexagon at pixel center */
function hexCorners(cx: number, cy: number, radius: number): [number, number][] {
  const corners: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    corners.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  return corners;
}

/** Check if a point is inside a hex polygon */
function pointInHex(px: number, py: number, cx: number, cy: number, radius: number): boolean {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  if (dx > radius || dy > (Math.sqrt(3) / 2) * radius) return false;
  return radius * (Math.sqrt(3) / 2) * radius - (Math.sqrt(3) / 2) * dx * radius >= dy * radius;
}

// ============================================================================
// POSITION MAPPING
// ============================================================================

/** Map stack position (1-24) to hex coord (q, r) */
function positionToHex(position: number): HexCoord {
  // Positions 1-12: attacker side (cols 0-5, rows 0-1)
  // Positions 13-24: defender side (cols 6-11, rows 0-1)
  if (position <= 12) {
    return {
      q: ((position - 1) % 6),
      r: Math.floor((position - 1) / 6) * 2,
    };
  } else {
    const dp = position - 12;
    return {
      q: 6 + ((dp - 1) % 6),
      r: Math.floor((dp - 1) / 6) * 2,
    };
  }
}

/** Inverse: hex coord to linear position */
function hexToPosition(q: number, r: number): number | null {
  if (r !== 0 && r !== 2) return null;
  if (q >= 0 && q <= 5) {
    return 1 + q + (r / 2) * 6;
  }
  if (q >= 6 && q <= 11) {
    return 13 + (q - 6) + (r / 2) * 6;
  }
  return null;
}

// ============================================================================
// RENDER HELPERS
// ============================================================================

/** Linear interpolation */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Ease-out cubic */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Clamp value */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Generate deterministic star field */
function generateStars(count: number, seed: number): { x: number; y: number; size: number; brightness: number }[] {
  const stars: { x: number; y: number; size: number; brightness: number }[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * 3000 - 200,
      y: rand() * 2000 - 200,
      size: rand() * 2 + 0.5,
      brightness: rand() * 0.5 + 0.5,
    });
  }
  return stars;
}

/** Get faction color */
function getFactionColor(faction: Faction): string {
  return faction === 'attacker' ? ATTACKER_COLOR : DEFENDER_COLOR;
}

/** Get ship facing angle (attacker faces right, defender faces left) */
function getShipAngle(faction: Faction): number {
  return faction === 'attacker' ? 0 : Math.PI;
}

// ============================================================================
// SHIP DRAWING
// ============================================================================

/**
 * Draw a detailed starship sprite for a given ship type.
 * Each type has a unique, non-triangular shape.
 */
function drawShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shipType: ShipType,
  faction: Faction,
  selected: boolean,
  time: number,
) {
  const size = SHIP_SIZE[shipType];
  const color = getFactionColor(faction);
  const angle = getShipAngle(faction);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Selection glow
  if (selected) {
    ctx.save();
    ctx.shadowColor = SELECTED_GLOW;
    ctx.shadowBlur = 20 + Math.sin(time * 4) * 5;
    ctx.beginPath();
    ctx.arc(0, 0, size + 8, 0, Math.PI * 2);
    ctx.strokeStyle = SELECTED_GLOW;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Engine glow (pulsing)
  const pulse = 0.7 + Math.sin(time * 8) * 0.3;
  ctx.save();
  ctx.globalAlpha = pulse * 0.6;
  const glowGrad = ctx.createRadialGradient(-size * 0.6, 0, 0, -size * 0.6, 0, size * 0.8);
  glowGrad.addColorStop(0, '#ff8800');
  glowGrad.addColorStop(0.5, '#ff4400');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(-size * 0.5, 0, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ship body based on type
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(255,255,255,0.27)';
  ctx.lineWidth = 1.5;

  switch (shipType) {
    case 'frigate': {
      // Sleek arrow / dart shape
      ctx.beginPath();
      ctx.moveTo(size * 0.9, 0); // nose
      ctx.lineTo(-size * 0.3, -size * 0.25); // rear top
      ctx.lineTo(-size * 0.5, -size * 0.15); // engine top
      ctx.lineTo(-size * 0.5, size * 0.15); // engine bottom
      ctx.lineTo(-size * 0.3, size * 0.25); // rear bottom
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit
      ctx.fillStyle = 'rgba(200,230,255,0.8)';
      ctx.beginPath();
      ctx.ellipse(size * 0.1, 0, size * 0.15, size * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing accents
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(size * 0.1, -size * 0.15);
      ctx.lineTo(-size * 0.1, -size * 0.22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(size * 0.1, size * 0.15);
      ctx.lineTo(-size * 0.1, size * 0.22);
      ctx.stroke();
      break;
    }

    case 'cruiser': {
      // Wider body with swept wings
      ctx.beginPath();
      ctx.moveTo(size * 0.85, 0); // nose
      ctx.lineTo(size * 0.1, -size * 0.35); // shoulder top
      ctx.lineTo(-size * 0.2, -size * 0.5); // wing tip top
      ctx.lineTo(-size * 0.35, -size * 0.35); // wing fold top
      ctx.lineTo(-size * 0.55, -size * 0.25); // rear top
      ctx.lineTo(-size * 0.6, 0); // rear center
      ctx.lineTo(-size * 0.55, size * 0.25); // rear bottom
      ctx.lineTo(-size * 0.35, size * 0.35); // wing fold bottom
      ctx.lineTo(-size * 0.2, size * 0.5); // wing tip bottom
      ctx.lineTo(size * 0.1, size * 0.35); // shoulder bottom
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Central hull highlight
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(size * 0.6, 0);
      ctx.lineTo(size * 0.1, -size * 0.15);
      ctx.lineTo(-size * 0.4, -size * 0.08);
      ctx.lineTo(-size * 0.5, 0);
      ctx.lineTo(-size * 0.4, size * 0.08);
      ctx.lineTo(size * 0.1, size * 0.15);
      ctx.closePath();
      ctx.fill();

      // Cockpit
      ctx.fillStyle = 'rgba(200,230,255,0.7)';
      ctx.beginPath();
      ctx.ellipse(size * 0.25, 0, size * 0.12, size * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();

      // Weapon mounts
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(size * 0.3, -size * 0.3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.3, size * 0.3, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'battleship': {
      // Massive multi-section hull
      // Main body
      ctx.beginPath();
      ctx.moveTo(size * 0.9, 0); // nose
      ctx.lineTo(size * 0.3, -size * 0.25); // front shoulder
      ctx.lineTo(size * 0.1, -size * 0.45); // upper wing start
      ctx.lineTo(-size * 0.1, -size * 0.6); // upper wing tip
      ctx.lineTo(-size * 0.25, -size * 0.5); // upper wing fold
      ctx.lineTo(-size * 0.4, -size * 0.4); // mid upper
      ctx.lineTo(-size * 0.6, -size * 0.3); // rear upper
      ctx.lineTo(-size * 0.7, -size * 0.1); // engine top
      ctx.lineTo(-size * 0.7, size * 0.1); // engine bottom
      ctx.lineTo(-size * 0.6, size * 0.3); // rear lower
      ctx.lineTo(-size * 0.4, size * 0.4); // mid lower
      ctx.lineTo(-size * 0.25, size * 0.5); // lower wing fold
      ctx.lineTo(-size * 0.1, size * 0.6); // lower wing tip
      ctx.lineTo(size * 0.1, size * 0.45); // lower wing start
      ctx.lineTo(size * 0.3, size * 0.25); // front shoulder bottom
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Hull plating lines
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      // Horizontal plating
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue;
        const py = i * size * 0.15;
        ctx.beginPath();
        ctx.moveTo(size * 0.5, py);
        ctx.lineTo(-size * 0.3, py);
        ctx.stroke();
      }

      // Central command tower
      ctx.fillStyle = 'rgba(160,180,220,0.4)';
      ctx.beginPath();
      ctx.moveTo(size * 0.15, -size * 0.12);
      ctx.lineTo(size * 0.05, -size * 0.2);
      ctx.lineTo(-size * 0.15, -size * 0.18);
      ctx.lineTo(-size * 0.2, 0);
      ctx.lineTo(-size * 0.15, size * 0.18);
      ctx.lineTo(size * 0.05, size * 0.2);
      ctx.lineTo(size * 0.15, size * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Turret indicators
      ctx.fillStyle = 'rgba(200,220,255,0.6)';
      ctx.beginPath();
      ctx.arc(size * 0.4, -size * 0.3, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.4, size * 0.3, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.1, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Bridge window
      ctx.fillStyle = 'rgba(100,200,255,0.5)';
      ctx.fillRect(-size * 0.1, -size * 0.08, size * 0.15, size * 0.16);
      break;
    }
  }

  ctx.restore();
}

/** Draw status bars (shield + hull) above a ship */
function drawStatusBars(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shipType: ShipType,
  shieldPct: number,
  hullPct: number,
) {
  const size = SHIP_SIZE[shipType];
  const barWidth = size * 1.4;
  const barHeight = 3;
  const barSpacing = 2;
  const topY = y - size - 10;

  // Shield bar (top)
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(x - barWidth / 2, topY, barWidth, barHeight);
  const sPct = clamp(shieldPct, 0, 1);
  if (sPct > 0) {
    ctx.fillStyle = SHIELD_BAR_COLOR;
    ctx.fillRect(x - barWidth / 2, topY, barWidth * sPct, barHeight);
  }
  // Shield border
  ctx.strokeStyle = 'rgba(0, 204, 255, 0.3)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x - barWidth / 2, topY, barWidth, barHeight);

  // Hull bar (bottom)
  const hullY = topY + barHeight + barSpacing;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(x - barWidth / 2, hullY, barWidth, barHeight);
  const hPct = clamp(hullPct, 0, 1);
  if (hPct > 0) {
    ctx.fillStyle = hPct < 0.3 ? HULL_DAMAGED_COLOR : HULL_BAR_COLOR;
    ctx.fillRect(x - barWidth / 2, hullY, barWidth * hPct, barHeight);
  }
  // Hull border
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.3)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x - barWidth / 2, hullY, barWidth, barHeight);
}

/** Draw stack count text below ship */
function drawStackCount(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  count: number,
) {
  ctx.save();
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 3;
  ctx.fillText(`${count}`, x, y + 12);
  ctx.restore();
}

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================

function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0);
}

function spawnEngineParticles(
  particles: Particle[],
  x: number,
  y: number,
  faction: Faction,
  count: number,
  time: number,
): Particle[] {
  const newParticles = [...particles];
  const baseAngle = faction === 'attacker' ? Math.PI : 0;
  for (let i = 0; i < count; i++) {
    const spread = (Math.random() - 0.5) * 0.6;
    const speed = 20 + Math.random() * 40;
    newParticles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: Math.cos(baseAngle + spread) * speed,
      vy: Math.sin(baseAngle + spread) * speed,
      life: 0.3 + Math.random() * 0.3,
      maxLife: 0.6,
      size: 1 + Math.random() * 2,
      color: Math.random() > 0.5 ? '#ff6600' : '#ffaa00',
    });
  }
  // Cap at 500 particles
  return newParticles.length > 500 ? newParticles.slice(newParticles.length - 500) : newParticles;
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ============================================================================
// VISUAL EFFECTS
// ============================================================================

function drawEffects(ctx: CanvasRenderingContext2D, effects: VisualEffect[], time: number) {
  for (const effect of effects) {
    const elapsed = (time - effect.startTime) / 1000;
    const progress = clamp(elapsed / effect.duration, 0, 1);
    const remaining = 1 - progress;

    switch (effect.type) {
      case 'shield_hit': {
        ctx.globalAlpha = remaining * 0.8;
        const radius = 20 + progress * 40;
        const grad = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, radius);
        grad.addColorStop(0, 'rgba(0, 204, 255, 0.8)');
        grad.addColorStop(0.5, 'rgba(0, 150, 255, 0.4)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'hull_hit': {
        ctx.globalAlpha = remaining;
        const radius = 10 + progress * 30;
        const grad = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, radius);
        grad.addColorStop(0, 'rgba(255, 100, 0, 0.9)');
        grad.addColorStop(0.5, 'rgba(255, 50, 0, 0.5)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'explosion': {
        ctx.globalAlpha = remaining;
        const radius = 15 + progress * 60 * effect.intensity;
        const grad = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, radius);
        grad.addColorStop(0, 'rgba(255, 220, 100, 1)');
        grad.addColorStop(0.3, 'rgba(255, 120, 0, 0.8)');
        grad.addColorStop(0.7, 'rgba(255, 50, 0, 0.3)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'projectile': {
        if (effect.targetX === undefined || effect.targetY === undefined) break;
        const px = lerp(effect.x, effect.targetX, progress);
        const py = lerp(effect.y, effect.targetY, progress);
        ctx.globalAlpha = 1;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 8);
        grad.addColorStop(0, 'rgba(255, 255, 200, 1)');
        grad.addColorStop(0.5, 'rgba(255, 200, 100, 0.8)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        // Trail
        ctx.globalAlpha = remaining;
        ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(effect.x, effect.y);
        ctx.stroke();
        break;
      }
    }
  }
  ctx.globalAlpha = 1;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const BattleArena: React.FC<BattleArenaProps> = ({
  attackerStacks,
  defenderStacks,
  events,
  selectedStackId,
  onStackClick,
  onHexClick,
  phase,
  round,
  width = 960,
  height = 640,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Camera state
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1, targetZoom: 1 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Hover state
  const hoverHexRef = useRef<HexCoord | null>(null);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  // Animations
  const moveAnimsRef = useRef<Map<string, MoveAnimation>>(new Map());
  const currentPositionsRef = useRef<Map<string, HexCoord>>(new Map());
  const particlesRef = useRef<Particle[]>([]);
  const effectsRef = useRef<VisualEffect[]>([]);

  // Stars (generated once)
  const starsRef = useRef(generateStars(300, 42));

  // Time
  const timeRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Combine all stacks
  const allStacks = useMemo(
    () => [...attackerStacks, ...defenderStacks],
    [attackerStacks, defenderStacks],
  );

  // Stack lookup
  const stackMap = useMemo(() => {
    const map = new Map<string, ShipStack>();
    for (const s of allStacks) map.set(s.id, s);
    return map;
  }, [allStacks]);

  // Initialize current positions from stack positions
  useEffect(() => {
    for (const stack of allStacks) {
      const hex = positionToHex(stack.position);
      currentPositionsRef.current.set(stack.id, hex);
    }
  }, [allStacks]);

  // Process events for animations
  useEffect(() => {
    for (const event of events) {
      switch (event.type) {
        case 'WEAPON_FIRE': {
          const stack = stackMap.get(event.stackId);
          const target = stackMap.get(event.targetId);
          if (stack && target) {
            const fromHex = currentPositionsRef.current.get(event.stackId);
            const toHex = currentPositionsRef.current.get(event.targetId);
            if (fromHex && toHex) {
              const fromPixel = hexToPixel(fromHex.q, fromHex.r);
              const toPixel = hexToPixel(toHex.q, toHex.r);
              effectsRef.current.push({
                type: 'projectile',
                x: fromPixel.x,
                y: fromPixel.y,
                targetX: toPixel.x,
                targetY: toPixel.y,
                startTime: performance.now(),
                duration: 0.5,
                intensity: 1,
              });
            }
          }
          break;
        }
        case 'SHIELD_HIT': {
          const pos = currentPositionsRef.current.get(event.targetId);
          if (pos) {
            const px = hexToPixel(pos.q, pos.r);
            effectsRef.current.push({
              type: 'shield_hit',
              x: px.x,
              y: px.y,
              startTime: performance.now(),
              duration: 0.6,
              intensity: event.absorbed / 100,
            });
          }
          break;
        }
        case 'HULL_DAMAGE': {
          const pos = currentPositionsRef.current.get(event.targetId);
          if (pos) {
            const px = hexToPixel(pos.q, pos.r);
            effectsRef.current.push({
              type: 'hull_hit',
              x: px.x,
              y: px.y,
              startTime: performance.now(),
              duration: 0.5,
              intensity: event.damage / 100,
            });
          }
          break;
        }
        case 'SHIPS_DESTROYED':
        case 'STACK_DESTROYED': {
          const pos = currentPositionsRef.current.get(event.stackId);
          if (pos) {
            const px = hexToPixel(pos.q, pos.r);
            effectsRef.current.push({
              type: 'explosion',
              x: px.x,
              y: px.y,
              startTime: performance.now(),
              duration: 1.0,
              intensity: event.type === 'STACK_DESTROYED' ? 2 : 1,
            });
          }
          break;
        }
        default:
          break;
      }
    }
  }, [events, stackMap]);

  // ============================================================================
  // RENDER LOOP
  // ============================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const render = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;
      timeRef.current = timestamp / 1000;
      const time = timeRef.current;

      // Smooth zoom
      const cam = cameraRef.current;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;

      // Canvas size
      const w = width;
      const h = height;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
      }

      // Clear
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, w, h);

      // Apply camera
      ctx.save();
      ctx.translate(w / 2 + cam.x, h / 2 + cam.y);
      ctx.scale(cam.zoom, cam.zoom);

      // --- Draw stars ---
      const stars = starsRef.current;
      ctx.fillStyle = '#ffffff';
      for (const star of stars) {
        ctx.globalAlpha = star.brightness * (0.5 + Math.sin(time * 0.5 + star.x) * 0.3);
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }
      ctx.globalAlpha = 1;

      // --- Calculate grid offset to center it ---
      const lastHex = hexToPixel(GRID_COLS - 1, GRID_ROWS - 1);
      const gridW = lastHex.x + HEX_WIDTH;
      const gridH = lastHex.y + HEX_HEIGHT;
      const gridOffsetX = -gridW / 2;
      const gridOffsetY = -gridH / 2;

      ctx.translate(gridOffsetX, gridOffsetY);

      // --- Draw hex grid ---
      const hoverHex = hoverHexRef.current;

      for (let r = 0; r < GRID_ROWS; r++) {
        for (let q = 0; q < GRID_COLS; q++) {
          const px = hexToPixel(q, r);
          const cx = px.x;
          const cy = px.y;
          const corners = hexCorners(cx, cy, HEX_RADIUS - 1);

          // Determine if this hex is in attacker (left) or defender (right) zone
          const isAttackerZone = q <= 5;
          const isDefenderZone = q >= 6;

          // Zone background tint
          if (isAttackerZone) {
            ctx.fillStyle = 'rgba(68, 136, 255, 0.03)';
          } else if (isDefenderZone) {
            ctx.fillStyle = 'rgba(255, 68, 68, 0.03)';
          }
          ctx.beginPath();
          ctx.moveTo(corners[0][0], corners[0][1]);
          for (let i = 1; i < 6; i++) {
            ctx.lineTo(corners[i][0], corners[i][1]);
          }
          ctx.closePath();
          ctx.fill();

          // Hover highlight
          if (hoverHex && hoverHex.q === q && hoverHex.r === r) {
            ctx.fillStyle = HEX_HOVER;
            ctx.fill();
          }

          // Check if this hex has a selected stack
          let isHexSelected = false;
          for (const stack of allStacks) {
            if (stack.id === selectedStackId) {
              const stackHex = currentPositionsRef.current.get(stack.id);
              if (stackHex && stackHex.q === q && stackHex.r === r) {
                isHexSelected = true;
                break;
              }
            }
          }

          // Hex border
          ctx.beginPath();
          ctx.moveTo(corners[0][0], corners[0][1]);
          for (let i = 1; i < 6; i++) {
            ctx.lineTo(corners[i][0], corners[i][1]);
          }
          ctx.closePath();

          if (isHexSelected) {
            ctx.strokeStyle = HEX_SELECTED;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = HEX_SELECTED;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
          } else {
            ctx.strokeStyle = HEX_BORDER;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // --- Draw separator line (dashed) ---
      const sepHex1 = hexToPixel(5, 0);
      const sepHex2 = hexToPixel(6, 0);
      const sepX = (sepHex1.x + sepHex2.x) / 2;
      ctx.save();
      ctx.strokeStyle = SEPARATOR_COLOR;
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.shadowColor = SEPARATOR_COLOR;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(sepX, -HEX_HEIGHT);
      ctx.lineTo(sepX, gridH + HEX_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Zone labels
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(68, 136, 255, 0.4)';
      ctx.fillText('ATTACKER', sepX / 2, -HEX_HEIGHT * 0.5);
      ctx.fillStyle = 'rgba(255, 68, 68, 0.4)';
      ctx.fillText('DEFENDER', sepX + (gridW - sepX) / 2, -HEX_HEIGHT * 0.5);
      ctx.restore();

      // --- Draw ships ---
      for (const stack of allStacks) {
        const hexPos = currentPositionsRef.current.get(stack.id);
        if (!hexPos) continue;

        const px = hexToPixel(hexPos.q, hexPos.r);
        const x = px.x;
        const y = px.y;

        // Engine particles
        const faction = stack.faction;
        particlesRef.current = spawnEngineParticles(
          particlesRef.current,
          x,
          y,
          faction,
          stack.shipType === 'frigate' ? 1 : stack.shipType === 'cruiser' ? 2 : 3,
          time,
        );

        // Draw ship
        const isSelected = stack.id === selectedStackId;
        drawShip(ctx, x, y, stack.shipType, faction, isSelected, time);

        // Status bars
        const shieldPct = stack.totalShield > 0 ? stack.totalShield / (stack.shieldPoints * stack.currentShips) : 0;
        const hullPct = stack.totalHull > 0 ? stack.currentHull / stack.hullPoints : 0;
        drawStatusBars(ctx, x, y, stack.shipType, shieldPct, hullPct);

        // Stack count
        drawStackCount(ctx, x, y, stack.currentShips);
      }

      // --- Draw particles ---
      drawParticles(ctx, particlesRef.current);

      // --- Draw effects ---
      drawEffects(ctx, effectsRef.current, timestamp);
      effectsRef.current = effectsRef.current.filter(
        (e) => timestamp - e.startTime < e.duration * 1000,
      );

      // --- Phase / Round indicator ---
      ctx.restore(); // Back to screen space
      ctx.save();
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      // Background panel
      const infoText = `ROUND ${round}  |  PHASE: ${phase}`;
      const infoW = ctx.measureText(infoText).width + 20;
      ctx.fillStyle = 'rgba(10, 14, 26, 0.85)';
      ctx.strokeStyle = HEX_BORDER;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(10, 10, infoW, 30, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#aaccff';
      ctx.fillText(infoText, 20, 18);

      // Zoom indicator
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(170, 204, 255, 0.6)';
      ctx.fillText(`Zoom: ${(cam.zoom * 100).toFixed(0)}%`, w - 15, 18);

      ctx.restore();

      // Update particles
      particlesRef.current = updateParticles(particlesRef.current, dt);

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [allStacks, selectedStackId, phase, round, width, height]);

  // ============================================================================
  // MOUSE HANDLERS
  // ============================================================================

  const screenToWorld = useCallback(
    (sx: number, sy: number): { x: number; y: number } => {
      const cam = cameraRef.current;
      const lastHex = hexToPixel(GRID_COLS - 1, GRID_ROWS - 1);
      const gridW = lastHex.x + HEX_WIDTH;
      const gridH = lastHex.y + HEX_HEIGHT;
      const gridOffsetX = -gridW / 2;
      const gridOffsetY = -gridH / 2;

      const wx = (sx - width / 2 - cam.x) / cam.zoom - gridOffsetX;
      const wy = (sy - height / 2 - cam.y) / cam.zoom - gridOffsetY;
      return { x: wx, y: wy };
    },
    [width, height],
  );

  const findStackAtPixel = useCallback(
    (wx: number, wy: number): ShipStack | null => {
      for (const stack of allStacks) {
        const hexPos = currentPositionsRef.current.get(stack.id);
        if (!hexPos) continue;
        const sp = hexToPixel(hexPos.q, hexPos.r);
        const size = SHIP_SIZE[stack.shipType];
        const dx = wx - sp.x;
        const dy = wy - sp.y;
        if (Math.sqrt(dx * dx + dy * dy) < size + 5) {
          return stack;
        }
      }
      return null;
    },
    [allStacks],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      if (isDraggingRef.current) {
        const dx = sx - lastMouseRef.current.x;
        const dy = sy - lastMouseRef.current.y;
        cameraRef.current.x += dx;
        cameraRef.current.y += dy;
        lastMouseRef.current = { x: sx, y: sy };
        return;
      }

      const { x: wx, y: wy } = screenToWorld(sx, sy);
      const hex = pixelToHex(wx, wy);

      // Clamp to grid bounds
      if (hex.q >= 0 && hex.q < GRID_COLS && hex.r >= 0 && hex.r < GRID_ROWS) {
        hoverHexRef.current = hex;

        // Tooltip
        const stack = findStackAtPixel(wx, wy);
        if (stack) {
          const shieldPct = stack.totalShield > 0
            ? Math.round((stack.totalShield / (stack.shieldPoints * stack.currentShips)) * 100)
            : 0;
          const hullPct = Math.round((stack.currentHull / stack.hullPoints) * 100);
          setTooltip({
            x: e.clientX - rect.left + 15,
            y: e.clientY - rect.top - 10,
            text: [
              `${stack.shipType.toUpperCase()} — ${stack.currentShips}/${stack.totalShips} ships`,
              `Shield: ${shieldPct}% | Hull: ${hullPct}%`,
              stack.commander ? `Cmd: ${stack.commander.name} (${stack.commander.stars}★)` : 'No Commander',
              `Faction: ${stack.faction}`,
            ],
          });
        } else {
          setTooltip(null);
        }
      } else {
        hoverHexRef.current = null;
        setTooltip(null);
      }
    },
    [screenToWorld, findStackAtPixel],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      if (e.button === 0) {
        // Check if clicking on a stack
        const { x: wx, y: wy } = screenToWorld(sx, sy);
        const stack = findStackAtPixel(wx, wy);
        if (stack) {
          onStackClick(stack.id);
          return;
        }

        // Check hex click
        const hex = pixelToHex(wx, wy);
        if (hex.q >= 0 && hex.q < GRID_COLS && hex.r >= 0 && hex.r < GRID_ROWS) {
          onHexClick(hex.q, hex.r);
          return;
        }
      }

      // Start panning
      isDraggingRef.current = true;
      lastMouseRef.current = { x: sx, y: sy };
    },
    [screenToWorld, findStackAtPixel, onStackClick, onHexClick],
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const cam = cameraRef.current;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      cam.targetZoom = clamp(cam.targetZoom * delta, 0.5, 2.0);
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
    hoverHexRef.current = null;
    setTooltip(null);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        background: BG_COLOR,
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #1e3a5f',
        boxShadow: '0 0 20px rgba(30, 58, 95, 0.3)',
        cursor: isDraggingRef.current ? 'grabbing' : 'crosshair',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: 'block',
          cursor: isDraggingRef.current ? 'grabbing' : 'default',
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            background: 'rgba(10, 14, 26, 0.95)',
            border: '1px solid #1e3a5f',
            borderRadius: '6px',
            padding: '8px 12px',
            pointerEvents: 'none',
            zIndex: 10,
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#aaccff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            maxWidth: '260px',
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.text.map((line, i) => (
            <div key={i} style={{ marginBottom: i < tooltip.text.length - 1 ? '3px' : 0 }}>
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Controls hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 14, 26, 0.8)',
          border: '1px solid #1e3a5f',
          borderRadius: '4px',
          padding: '4px 12px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: 'rgba(170, 204, 255, 0.5)',
          pointerEvents: 'none',
        }}
      >
        Click+Drag to pan · Scroll to zoom · Click ship to select
      </div>
    </div>
  );
};

export default BattleArena;
