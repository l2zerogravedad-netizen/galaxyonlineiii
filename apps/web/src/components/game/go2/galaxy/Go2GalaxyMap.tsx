'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import {
  GALAXY_PLANETS,
  GALAXY_SIZE,
  ALLIANCE_COLORS,
  PLANET_TYPE_COLORS,
} from './galaxy-data';
import type { GalaxyPlanet } from './galaxy-data';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

interface Go2GalaxyMapProps {
  camera: { x: number; y: number; zoom: number };
  hoveredPlanet: { id: string } | null;
  selectedPlanet: { id: string } | null;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  onResize: (width: number, height: number) => void;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  layer: number;
  pulsePhase: number;
  pulseSpeed: number;
}

// ============================================================================
// Constants
// ============================================================================

const CELL_SIZE = GALAXY_SIZE.cellSize;
const PLANET_RADIUS = 32;
const STAR_COUNT = 400;

const NEBULAE = [
  { x: 0.25, y: 0.3,  color: '147, 51, 234',  radius: 0.42 },
  { x: 0.75, y: 0.65, color: '59, 130, 246',  radius: 0.38 },
  { x: 0.5,  y: 0.8,  color: '6, 182, 212',   radius: 0.35 },
  { x: 0.15, y: 0.7,  color: '236, 72, 153',  radius: 0.30 },
  { x: 0.85, y: 0.2,  color: '34, 211, 238',  radius: 0.28 },
];

const PARALLAX_FACTORS = [0.2, 0.5, 1.0];

// Alliance label background colors (semi-transparent)
const ALLIANCE_LABEL_BG: Record<string, string> = {
  'Destiny': 'rgba(33, 150, 243, 0.25)',
  'Salvation': 'rgba(76, 175, 80, 0.25)',
  'INFerno': 'rgba(244, 67, 54, 0.25)',
  'Confederacy': 'rgba(255, 152, 0, 0.25)',
  'Independent': 'rgba(158, 158, 158, 0.25)',
};

const ALLIANCE_LABEL_BORDER: Record<string, string> = {
  'Destiny': 'rgba(100, 181, 246, 0.6)',
  'Salvation': 'rgba(129, 199, 132, 0.6)',
  'INFerno': 'rgba(239, 83, 80, 0.6)',
  'Confederacy': 'rgba(255, 183, 77, 0.6)',
  'Independent': 'rgba(189, 189, 189, 0.6)',
};

// ============================================================================
// Utilities
// ============================================================================

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function generateStars(count: number, width: number, height: number): Star[] {
  const rand = seededRandom(12345);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * width,
      y: rand() * height,
      size: rand() * 1.8 + 0.3,
      opacity: rand() * 0.7 + 0.3,
      layer: Math.floor(rand() * 3),
      pulsePhase: rand() * Math.PI * 2,
      pulseSpeed: rand() * 2 + 0.5,
    });
  }
  return stars;
}

function getWorldPos(planet: GalaxyPlanet): { wx: number; wy: number } {
  return {
    wx: planet.x * CELL_SIZE,
    wy: planet.y * CELL_SIZE,
  };
}

// ============================================================================
// Sprite Generation (Procedural Planet Sprites - GO2 Style)
// ============================================================================

const SPRITE_CACHE = new Map<string, HTMLCanvasElement>();

function getSpriteKey(type: GalaxyPlanet['type'], size: number): string {
  return `${type}_${size}`;
}

function generatePlanetSprite(type: GalaxyPlanet['type'], size: number): HTMLCanvasElement {
  const key = getSpriteKey(type, size);
  if (SPRITE_CACHE.has(key)) return SPRITE_CACHE.get(key)!;

  const canvas = document.createElement('canvas');
  const pad = 8;
  canvas.width = size * 2 + pad * 2;
  canvas.height = size * 2 + pad * 2;
  const ctx = canvas.getContext('2d')!;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = size;
  const rng = seededRandom(type.length * 42 + size);

  // Palettes per planet type (GO2 accurate)
  const palettes: Record<GalaxyPlanet['type'], { base: string[]; highlight: string; shadow: string; rim: string }> = {
    ice: {
      base: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#e8f5e9'],
      highlight: '#ffffff',
      shadow: '#1565c0',
      rim: '#90caf9',
    },
    earth: {
      base: ['#4caf50', '#388e3c', '#2e7d32', '#1b5e20', '#2196f3', '#1976d2'],
      highlight: '#81c784',
      shadow: '#0d47a1',
      rim: '#4caf50',
    },
    fire: {
      base: ['#ff5722', '#e64a19', '#d84315', '#bf360c', '#ff8a65', '#ffab91'],
      highlight: '#ffccbc',
      shadow: '#870000',
      rim: '#ff5722',
    },
    gas: {
      base: ['#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa'],
      highlight: '#f3e5f5',
      shadow: '#4a148c',
      rim: '#ce93d8',
    },
    lava: {
      base: ['#ff9800', '#f57c00', '#ef6c00', '#e65100', '#ff6f00', '#ffca28'],
      highlight: '#ffe082',
      shadow: '#bf360c',
      rim: '#ff9800',
    },
    resource: {
      base: ['#ffd54f', '#ffca28', '#ffc107', '#ffb300', '#ffa000', '#ff8f00'],
      highlight: '#fff9c4',
      shadow: '#e65100',
      rim: '#ffd54f',
    },
  };
  const pal = palettes[type];

  // 1. Outer glow
  const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.6);
  glowGrad.addColorStop(0, hexToRgba(pal.rim, 0.12));
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // 2. Shadow (offset)
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  // 3. Main planet sphere
  const baseGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  // Multiple color stops for texture
  for (let i = 0; i < 5; i++) {
    baseGrad.addColorStop(i / 4, pal.base[i]);
  }
  baseGrad.addColorStop(1, pal.shadow);
  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Procedural continents/texture (irregular shapes)
  const continentCount = Math.floor(rng() * 4) + 3;
  for (let i = 0; i < continentCount; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * r * 0.5;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    const sr = rng() * r * 0.35 + r * 0.15;
    
    ctx.save();
    ctx.globalAlpha = 0.4 + rng() * 0.3;
    const cGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    cGrad.addColorStop(0, pal.base[Math.floor(rng() * pal.base.length)]);
    cGrad.addColorStop(0.7, pal.base[Math.floor(rng() * pal.base.length)]);
    cGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cGrad;
    
    // Irregular shape
    ctx.beginPath();
    const points = Math.floor(rng() * 5) + 5;
    for (let j = 0; j <= points; j++) {
      const a = (j / points) * Math.PI * 2;
      const radius = sr * (0.7 + rng() * 0.6);
      const px = sx + Math.cos(a) * radius;
      const py = sy + Math.sin(a) * radius;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 5. 3D highlight (upper-left bright spot)
  const hlGrad = ctx.createRadialGradient(
    cx - r * 0.35, cy - r * 0.35, 0,
    cx - r * 0.35, cy - r * 0.35, r * 0.65
  );
  hlGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
  hlGrad.addColorStop(0.5, 'rgba(255,255,255,0.1)');
  hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hlGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // 6. Rim light
  ctx.save();
  ctx.strokeStyle = hexToRgba(pal.rim, 0.4);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 7. Gas planet rings
  if (type === 'gas') {
    ctx.save();
    ctx.strokeStyle = hexToRgba(pal.rim, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.6, r * 0.35, Math.PI * 0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = hexToRgba(pal.rim, 0.25);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.9, r * 0.45, Math.PI * 0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 8. Ice planet frost effect
  if (type === 'ice') {
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * r * 0.7;
      const fx = cx + Math.cos(angle) * dist;
      const fy = cy + Math.sin(angle) * dist;
      const fGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 4 + rng() * 6);
      fGrad.addColorStop(0, 'rgba(255,255,255,0.3)');
      fGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.arc(fx, fy, 4 + rng() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 9. Earth clouds
  if (type === 'earth') {
    ctx.save();
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 3; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * r * 0.5;
      const ex = cx + Math.cos(angle) * dist;
      const ey = cy + Math.sin(angle) * dist;
      const ew = rng() * r * 0.4 + r * 0.2;
      const eh = ew * 0.3;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ex, ey, ew, eh, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  SPRITE_CACHE.set(key, canvas);
  return canvas;
}

// Building sprite - GO2 style colony with triangular roof
function generateBuildingSprite(size: number): HTMLCanvasElement {
  const key = `bld_${size}`;
  if (SPRITE_CACHE.has(key)) return SPRITE_CACHE.get(key)!;

  const canvas = document.createElement('canvas');
  const pad = 3;
  canvas.width = size + pad * 2;
  canvas.height = size + pad * 2;
  const ctx = canvas.getContext('2d')!;
  const rng = seededRandom(size * 7);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Colors
  const roofColors = ['#e8a838', '#d4932a', '#f0b848', '#c88320'];
  const wallColors = ['#a8c060', '#8faf50', '#b8d070', '#7d9f40'];
  const roofColor = roofColors[Math.floor(rng() * roofColors.length)];
  const wallColor = wallColors[Math.floor(rng() * wallColors.length)];
  const w = size * 0.7;
  const h = size * 0.55;
  const roofH = size * 0.35;

  // Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(cx - w/2 + 1, cy - h/2 + roofH + 2, w, h - roofH + 1);
  ctx.restore();

  // Wall (rectangle body)
  ctx.fillStyle = wallColor;
  ctx.fillRect(cx - w/2, cy - h/2 + roofH, w, h - roofH);

  // Wall border
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(cx - w/2, cy - h/2 + roofH, w, h - roofH);

  // Roof (triangle)
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(cx - w/2 - size*0.08, cy - h/2 + roofH);
  ctx.lineTo(cx, cy - h/2);
  ctx.lineTo(cx + w/2 + size*0.08, cy - h/2 + roofH);
  ctx.closePath();
  ctx.fill();

  // Roof border
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Roof highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.moveTo(cx - w/2 - size*0.02, cy - h/2 + roofH);
  ctx.lineTo(cx, cy - h/2 + size*0.08);
  ctx.lineTo(cx + w*0.15, cy - h/2 + roofH);
  ctx.closePath();
  ctx.fill();

  // Door
  ctx.fillStyle = 'rgba(60,40,20,0.6)';
  ctx.fillRect(cx - w*0.12, cy + h*0.05, w*0.24, h*0.22);

  // Window
  ctx.fillStyle = 'rgba(100,180,255,0.5)';
  ctx.fillRect(cx - w*0.25, cy + h*0.08, w*0.12, w*0.12);

  SPRITE_CACHE.set(key, canvas);
  return canvas;
}

// ============================================================================
// Component
// ============================================================================

export function Go2GalaxyMap({
  camera,
  hoveredPlanet,
  selectedPlanet,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onClick,
  onWheel,
  onResize,
}: Go2GalaxyMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const cameraRef = useRef<CameraState>(camera);
  const hoveredRef = useRef<string | null>(hoveredPlanet?.id ?? null);
  const selectedRef = useRef<string | null>(selectedPlanet?.id ?? null);
  const timeRef = useRef<number>(0);

  // Sync refs
  cameraRef.current = camera;
  hoveredRef.current = hoveredPlanet?.id ?? null;
  selectedRef.current = selectedPlanet?.id ?? null;

  const worldToScreen = useCallback(
    (wx: number, wy: number, cam: CameraState, vw: number, vh: number) => ({
      sx: (wx - cam.x) * cam.zoom + vw / 2,
      sy: (wy - cam.y) * cam.zoom + vh / 2,
    }),
    []
  );

  // Draw military cross
  const drawMilitaryCross = useCallback(
    (ctx: CanvasRenderingContext2D, sx: number, sy: number, camZoom: number) => {
      const size = 20 * camZoom;
      const barThick = size * 0.28;
      const offset = PLANET_RADIUS * camZoom + 10 * camZoom;
      const cx = sx + offset;
      const cy = sy;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4 * camZoom;

      // Vertical bar
      ctx.fillStyle = '#e53935';
      ctx.fillRect(cx - barThick/2, cy - size/2, barThick, size);

      // Horizontal bar
      ctx.fillRect(cx - size/2, cy - barThick/2, size, barThick);

      // Center highlight
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(cx - barThick/2, cy - barThick/2, barThick, barThick);

      ctx.restore();
    },
    []
  );

  // Draw buildings orbiting planet
  const drawBuildings = useCallback(
    (ctx: CanvasRenderingContext2D, sx: number, sy: number, buildings: number, camZoom: number) => {
      if (buildings <= 0) return;

      const count = Math.min(buildings, 8);
      const orbitR = (PLANET_RADIUS + 12) * camZoom;
      const bSize = Math.round((7 + Math.min(count, 4) * 1.2) * camZoom);
      const sprite = generateBuildingSprite(Math.max(bSize, 6));
      const angleStep = (Math.PI * 2) / count;

      ctx.save();
      for (let i = 0; i < count; i++) {
        const angle = angleStep * i - Math.PI / 2 + (i % 2) * 0.12;
        const bx = sx + Math.cos(angle) * orbitR - sprite.width / 2;
        const by = sy + Math.sin(angle) * orbitR - sprite.height / 2;
        ctx.drawImage(sprite, bx, by);
      }
      ctx.restore();
    },
    []
  );

  // Draw planet label with alliance background
  const drawLabel = useCallback(
    (ctx: CanvasRenderingContext2D, planet: GalaxyPlanet, sx: number, sy: number, camZoom: number) => {
      const allianceColor = ALLIANCE_COLORS[planet.alliance] ?? '#adb5bd';
      const labelBg = ALLIANCE_LABEL_BG[planet.alliance] ?? 'rgba(158,158,158,0.25)';
      const labelBorder = ALLIANCE_LABEL_BORDER[planet.alliance] ?? 'rgba(189,189,189,0.6)';
      const fontSize = Math.max(9, Math.round(10 * camZoom));
      const labelY = sy - PLANET_RADIUS * camZoom - 22 * camZoom;

      ctx.save();
      ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      const line1 = `${planet.allianceTag} ${planet.playerName}`;
      const line2 = planet.name;

      const text1Width = ctx.measureText(line1).width;
      const text2Width = ctx.measureText(line2).width;
      const maxTextWidth = Math.max(text1Width, text2Width);
      const boxWidth = maxTextWidth + 14;
      const boxHeight = fontSize * 2.4 + 6;
      const boxX = sx - boxWidth / 2;
      const boxY = labelY - boxHeight;

      // Background with alliance color
      ctx.fillStyle = labelBg;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
      ctx.fill();

      // Border
      ctx.strokeStyle = labelBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
      ctx.stroke();

      // Line 1: Alliance tag + player name
      ctx.fillStyle = allianceColor;
      ctx.fillText(line1, sx, boxY + fontSize + 3);

      // Line 2: Planet name
      ctx.font = `${fontSize * 0.85}px "Segoe UI", Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(line2, sx, boxY + fontSize * 2.2 + 4);

      ctx.restore();
    },
    []
  );

  // Draw level badge on planet
  const drawLevelBadge = useCallback(
    (ctx: CanvasRenderingContext2D, planet: GalaxyPlanet, sx: number, sy: number, camZoom: number) => {
      const allianceColor = ALLIANCE_COLORS[planet.alliance] ?? '#adb5bd';
      const badgeR = Math.round(8 * camZoom);
      const badgeX = sx + PLANET_RADIUS * camZoom * 0.6;
      const badgeY = sy - PLANET_RADIUS * camZoom * 0.6;

      ctx.save();
      // Badge background
      ctx.fillStyle = allianceColor;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
      ctx.fill();

      // Badge border
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
      ctx.stroke();

      // Level number
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(7, Math.round(8 * camZoom))}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(planet.level.toString(), badgeX, badgeY);
      ctx.restore();
    },
    []
  );

  // Draw single planet
  const drawPlanet = useCallback(
    (ctx: CanvasRenderingContext2D, planet: GalaxyPlanet, cam: CameraState, w: number, h: number) => {
      const { wx, wy } = getWorldPos(planet);
      const { sx, sy } = worldToScreen(wx, wy, cam, w, h);

      const isHovered = hoveredRef.current === planet.id;
      const scale = isHovered ? 1.15 : 1.0;
      const scaledR = PLANET_RADIUS * cam.zoom * scale;

      // Culling
      if (sx < -scaledR * 2 || sx > w + scaledR * 2 || sy < -scaledR * 2 || sy > h + scaledR * 2) return;

      const allianceColor = ALLIANCE_COLORS[planet.alliance] ?? '#adb5bd';

      // 1. Alliance glow
      const glowR = 70 * cam.zoom;
      const glowGrad = ctx.createRadialGradient(sx, sy, scaledR, sx, sy, glowR);
      glowGrad.addColorStop(0, hexToRgba(allianceColor, 0.18));
      glowGrad.addColorStop(0.5, hexToRgba(allianceColor, 0.06));
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
      ctx.fill();

      // 2. Shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10 * cam.zoom;
      ctx.shadowOffsetX = 3 * cam.zoom;
      ctx.shadowOffsetY = 3 * cam.zoom;

      // 3. Planet sprite
      const spriteSize = Math.round(scaledR);
      const sprite = generatePlanetSprite(planet.type, spriteSize);
      ctx.drawImage(sprite, sx - sprite.width / 2, sy - sprite.height / 2);
      ctx.restore();

      // 4. Buildings
      if (planet.buildings > 0) {
        drawBuildings(ctx, sx, sy, planet.buildings, cam.zoom);
      }

      // 5. Gas rings (drawn after buildings so they appear in front/back properly)
      if (planet.type === 'gas') {
        ctx.save();
        ctx.strokeStyle = '#e1bee7';
        ctx.lineWidth = 1.5 * cam.zoom;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(sx, sy, scaledR * 1.5, scaledR * 0.4, Math.PI * 0.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 6. Military cross
      if (planet.hasMilitary) {
        drawMilitaryCross(ctx, sx, sy, cam.zoom);
      }

      // 7. Shield (dotted circle)
      if (planet.hasShield) {
        ctx.save();
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 1.5 * cam.zoom;
        ctx.setLineDash([4 * cam.zoom, 3 * cam.zoom]);
        ctx.beginPath();
        ctx.arc(sx, sy, scaledR + 6 * cam.zoom, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 8. Hover glow
      if (isHovered) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2 * cam.zoom;
        ctx.shadowColor = 'rgba(255,255,255,0.4)';
        ctx.shadowBlur = 15 * cam.zoom;
        ctx.beginPath();
        ctx.arc(sx, sy, scaledR + 4 * cam.zoom, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 9. Level badge
      drawLevelBadge(ctx, planet, sx, sy, cam.zoom);

      // 10. Label
      drawLabel(ctx, planet, sx, sy, cam.zoom);
    },
    [worldToScreen, drawBuildings, drawMilitaryCross, drawLabel, drawLevelBadge]
  );

  // Main render loop
  const render = useCallback(
    (ctx: CanvasRenderingContext2D, cssW: number, cssH: number, dpr: number) => {
      const cam = cameraRef.current;
      const w = cssW * dpr;
      const h = cssH * dpr;
      const time = timeRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. Background
      ctx.fillStyle = '#060d1a';
      ctx.fillRect(0, 0, cssW, cssH);

      // 2. Nebulae
      ctx.save();
      for (const neb of NEBULAE) {
        const nx = (neb.x * cssW - cam.x * cam.zoom * 0.1) % (cssW * 1.5);
        const ny = (neb.y * cssH - cam.y * cam.zoom * 0.1) % (cssH * 1.5);
        const nr = neb.radius * Math.max(cssW, cssH);
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        grad.addColorStop(0, `rgba(${neb.color}, 0.08)`);
        grad.addColorStop(0.5, `rgba(${neb.color}, 0.03)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
      }
      ctx.restore();

      // 3. Stars with parallax
      ctx.save();
      for (let layer = 0; layer < 3; layer++) {
        const factor = PARALLAX_FACTORS[layer];
        const offsetX = -cam.x * cam.zoom * factor * 0.3;
        const offsetY = -cam.y * cam.zoom * factor * 0.3;
        for (const star of starsRef.current) {
          if (star.layer !== layer) continue;
          const pulse = Math.sin(time * star.pulseSpeed + star.pulsePhase) * 0.3 + 0.7;
          const sx = ((star.x + offsetX) % (cssW + 100)) - 50;
          const sy = ((star.y + offsetY) % (cssH + 100)) - 50;
          ctx.fillStyle = `rgba(255,255,255,${star.opacity * pulse})`;
          ctx.beginPath();
          ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 4. Diagonal grid
      ctx.save();
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.025)';
      ctx.lineWidth = 0.5;
      const gridSize = CELL_SIZE * cam.zoom;
      const offsetX = (-cam.x * cam.zoom + cssW / 2) % gridSize;
      const offsetY = (-cam.y * cam.zoom + cssH / 2) % gridSize;
      // Diagonal lines
      for (let i = -20; i < cssW / gridSize + 20; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize + offsetX, 0);
        ctx.lineTo(i * gridSize + offsetX - cssH, cssH);
        ctx.stroke();
      }
      for (let j = -20; j < cssH / gridSize + 20; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * gridSize + offsetY);
        ctx.lineTo(cssW, j * gridSize + offsetY - cssW);
        ctx.stroke();
      }
      ctx.restore();

      // 5. Connection lines between nearby planets
      ctx.save();
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.06)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < GALAXY_PLANETS.length; i++) {
        const p1 = GALAXY_PLANETS[i];
        const { wx: wx1, wy: wy1 } = getWorldPos(p1);
        const s1 = worldToScreen(wx1, wy1, cam, cssW, cssH);
        for (let j = i + 1; j < GALAXY_PLANETS.length; j++) {
          const p2 = GALAXY_PLANETS[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 2.5) continue;
          const { wx: wx2, wy: wy2 } = getWorldPos(p2);
          const s2 = worldToScreen(wx2, wy2, cam, cssW, cssH);
          ctx.beginPath();
          ctx.moveTo(s1.sx, s1.sy);
          ctx.lineTo(s2.sx, s2.sy);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 6. Planets
      for (const planet of GALAXY_PLANETS) {
        drawPlanet(ctx, planet, cam, cssW, cssH);
      }

      // 7. Coordinates HUD
      ctx.save();
      ctx.fillStyle = 'rgba(6, 13, 26, 0.7)';
      ctx.fillRect(8, 8, 140, 22);
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 8, 140, 22);
      ctx.fillStyle = '#64b5f6';
      ctx.font = '11px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `Viewport: [${Math.round(cam.x / CELL_SIZE)}:${Math.round(cam.y / CELL_SIZE)}]`,
        14,
        23
      );
      ctx.restore();
    },
    [worldToScreen, drawPlanet]
  );

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      if (starsRef.current.length === 0) {
        starsRef.current = generateStars(STAR_COUNT, cssW + 200, cssH + 200);
      }

      onResize(cssW, cssH);
    };

    resize();

    const ro = typeof window !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(container);

    let running = true;
    const loop = () => {
      if (!running) return;
      timeRef.current += 0.016;
      const rect = container.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;
      render(ctx, cssW, cssH, dpr);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      ro?.disconnect();
    };
  }, [render, onResize]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'grab',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={onClick}
        onWheel={onWheel}
      />
    </div>
  );
}
