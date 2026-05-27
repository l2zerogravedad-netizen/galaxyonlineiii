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
  layer: number; // 0, 1, 2 para parallax
  pulsePhase: number; // fase para brillo pulsante
  pulseSpeed: number;
}

// ============================================================================
// Constants
// ============================================================================

const CELL_SIZE = GALAXY_SIZE.cellSize;
const PLANET_RADIUS = 18;
const STAR_COUNT = 300;

const NEBULAE = [
  { x: 0.25, y: 0.3,  color: '147, 51, 234',  radius: 0.42 }, // purple
  { x: 0.75, y: 0.65, color: '59, 130, 246',  radius: 0.38 }, // blue
  { x: 0.5,  y: 0.8,  color: '6, 182, 212',   radius: 0.35 }, // cyan
];

const PARALLAX_FACTORS = [0.2, 0.5, 1.0];

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
      size: rand() * 1.5 + 0.5, // 0.5 - 2.0px
      opacity: rand() * 0.6 + 0.4,
      layer: Math.floor(rand() * 3), // 0, 1, 2
      pulsePhase: rand() * Math.PI * 2,
      pulseSpeed: rand() * 1.5 + 0.5,
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
// Component
// ============================================================================

export const Go2GalaxyMap: React.FC<Go2GalaxyMapProps> = ({
  camera,
  hoveredPlanet,
  selectedPlanet,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onClick,
  onWheel,
  onResize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const cameraRef = useRef<CameraState>(camera);
  const hoveredRef = useRef<string | null>(hoveredPlanet?.id ?? null);
  const selectedRef = useRef<string | null>(selectedPlanet?.id ?? null);
  const timeRef = useRef<number>(0);

  cameraRef.current = camera;
  hoveredRef.current = hoveredPlanet?.id ?? null;
  selectedRef.current = selectedPlanet?.id ?? null;

  // ---- Coordinate transforms ------------------------------------------------

  const worldToScreen = useCallback(
    (wx: number, wy: number, cam: CameraState, w: number, h: number) => {
      const centerX = w / 2;
      const centerY = h / 2;
      return {
        sx: centerX + (wx - cam.x) * cam.zoom,
        sy: centerY + (wy - cam.y) * cam.zoom,
      };
    },
    []
  );

  const isInViewport = useCallback(
    (sx: number, sy: number, w: number, h: number, margin: number): boolean => {
      return sx >= -margin && sx <= w + margin && sy >= -margin && sy <= h + margin;
    },
    []
  );

  // ---- LAYER 1: Background & Nebulae --------------------------------------

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = '#0a1628';
      ctx.fillRect(0, 0, w, h);
    },
    []
  );

  const drawNebulae = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cam: CameraState,
      w: number,
      h: number
    ) => {
      const worldW = GALAXY_SIZE.width * CELL_SIZE;
      const worldH = GALAXY_SIZE.height * CELL_SIZE;

      for (const neb of NEBULAE) {
        const nebWx = neb.x * worldW;
        const nebWy = neb.y * worldH;
        const { sx, sy } = worldToScreen(nebWx, nebWy, cam, w, h);
        const radius = neb.radius * Math.max(w, h) * cam.zoom;

        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
        gradient.addColorStop(0, `rgba(${neb.color}, 0.12)`);
        gradient.addColorStop(0.5, `rgba(${neb.color}, 0.05)`);
        gradient.addColorStop(1, `rgba(${neb.color}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [worldToScreen]
  );

  // ---- LAYER 2: Stars (parallax) -------------------------------------------

  const drawStars = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cam: CameraState,
      w: number,
      h: number,
      time: number
    ) => {
      const centerX = w / 2;
      const centerY = h / 2;

      for (const star of starsRef.current) {
        const factor = PARALLAX_FACTORS[star.layer] ?? 1.0;

        // Parallax offset: las estrellas se mueven menos que la camara
        const offsetX = (centerX - cam.x * cam.zoom) * (1 - factor);
        const offsetY = (centerY - cam.y * cam.zoom) * (1 - factor);

        let sx = ((star.x + offsetX) % (w + 200)) - 100;
        let sy = ((star.y + offsetY) % (h + 200)) - 100;

        if (sx < -50) sx += w + 200;
        if (sy < -50) sy += h + 200;

        // Brillo pulsante para algunas estrellas (capa 2)
        let opacity = star.opacity;
        if (star.layer === 2) {
          const pulse =
            Math.sin(time * star.pulseSpeed + star.pulsePhase) * 0.3 + 0.7;
          opacity *= pulse;
        }

        ctx.beginPath();
        ctx.arc(sx, sy, star.size * (star.layer === 2 ? 1 : 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();

        // Glow para estrellas grandes de capa cercana
        if (star.layer === 2 && star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 220, 255, ${opacity * 0.15})`;
          ctx.fill();
        }
      }
    },
    []
  );

  // ---- LAYER 3: Grid -------------------------------------------------------

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, cam: CameraState, w: number, h: number) => {
      const gridSize = CELL_SIZE * cam.zoom;
      const centerX = w / 2;
      const centerY = h / 2;
      const startX = centerX - cam.x * cam.zoom;
      const startY = centerY - cam.y * cam.zoom;

      ctx.strokeStyle = 'rgba(100, 150, 255, 0.04)';
      ctx.lineWidth = 1;

      const offsetX = startX % gridSize;
      const offsetY = startY % gridSize;

      ctx.beginPath();
      for (let x = offsetX; x < w; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = offsetY; y < h; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    },
    []
  );

  // ---- LAYER 4: Connection Lines -------------------------------------------

  const drawConnections = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cam: CameraState,
      w: number,
      h: number
    ) => {
      const maxDist = 2 * CELL_SIZE; // distancia maxima en world units

      ctx.strokeStyle = 'rgba(100, 150, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let i = 0; i < GALAXY_PLANETS.length; i++) {
        const p1 = GALAXY_PLANETS[i];
        const { wx: wx1, wy: wy1 } = getWorldPos(p1);
        const { sx: sx1, sy: sy1 } = worldToScreen(wx1, wy1, cam, w, h);

        if (!isInViewport(sx1, sy1, w, h, 100)) continue;

        for (let j = i + 1; j < GALAXY_PLANETS.length; j++) {
          const p2 = GALAXY_PLANETS[j];
          const { wx: wx2, wy: wy2 } = getWorldPos(p2);

          const dx = wx2 - wx1;
          const dy = wy2 - wy1;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const { sx: sx2, sy: sy2 } = worldToScreen(wx2, wy2, cam, w, h);
            ctx.moveTo(sx1, sy1);
            ctx.lineTo(sx2, sy2);
          }
        }
      }

      ctx.stroke();
    },
    [worldToScreen, isInViewport]
  );

  // ---- LAYER 5: Planets ----------------------------------------------------

  const drawMilitaryCross = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      sx: number,
      sy: number,
      camZoom: number
    ) => {
      const size = 14 * camZoom;
      const half = size / 2;
      const offset = PLANET_RADIUS * camZoom + 8 * camZoom;
      const cx = sx + offset;
      const cy = sy;

      ctx.save();
      ctx.fillStyle = '#d32f2f';

      // Rectangulo vertical
      const vW = size * 0.35;
      const vH = size;
      ctx.fillRect(cx - vW / 2, cy - vH / 2, vW, vH);

      // Rectangulo horizontal
      const hW = size;
      const hH = size * 0.35;
      ctx.fillRect(cx - hW / 2, cy - hH / 2, hW, hH);

      ctx.restore();
    },
    []
  );

  const drawBuildings = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      sx: number,
      sy: number,
      buildings: number,
      camZoom: number
    ) => {
      if (buildings <= 0) return;

      const baseRadius = PLANET_RADIUS * camZoom + 6 * camZoom;
      const bSize = 3.5 * camZoom;
      const angleStep = (Math.PI * 2) / Math.min(buildings, 8);

      ctx.save();
      ctx.fillStyle = '#8d6e63';

      for (let i = 0; i < Math.min(buildings, 8); i++) {
        const angle = angleStep * i - Math.PI / 2;
        const bx = sx + Math.cos(angle) * baseRadius;
        const by = sy + Math.sin(angle) * baseRadius;
        ctx.fillRect(bx - bSize / 2, by - bSize / 2, bSize, bSize);
      }

      ctx.restore();
    },
    []
  );

  const drawPlanet = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      planet: GalaxyPlanet,
      cam: CameraState,
      w: number,
      h: number
    ) => {
      const { wx, wy } = getWorldPos(planet);
      const { sx, sy } = worldToScreen(wx, wy, cam, w, h);

      const isHovered = hoveredRef.current === planet.id;
      const isSelected = selectedRef.current === planet.id;
      const r = PLANET_RADIUS * cam.zoom;
      const scale = isHovered ? 1.2 : isSelected ? 1.1 : 1.0;
      const scaledR = r * scale;

      const colors = PLANET_TYPE_COLORS[planet.type];
      const allianceColor = ALLIANCE_COLORS[planet.alliance] ?? '#adb5bd';

      // 1. Glow de alianza
      const glowRadius = 40 * cam.zoom;
      const glowGrad = ctx.createRadialGradient(sx, sy, scaledR, sx, sy, glowRadius);
      glowGrad.addColorStop(0, hexToRgba(allianceColor, 0.15));
      glowGrad.addColorStop(1, hexToRgba(allianceColor, 0));
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Sombra
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 6 * cam.zoom;
      ctx.shadowOffsetX = 2 * cam.zoom;
      ctx.shadowOffsetY = 2 * cam.zoom;

      // 3. Circulo base con gradiente segun tipo
      const planetGrad = ctx.createRadialGradient(
        sx - scaledR * 0.3,
        sy - scaledR * 0.3,
        scaledR * 0.1,
        sx,
        sy,
        scaledR
      );
      planetGrad.addColorStop(0, colors.light);
      planetGrad.addColorStop(0.6, colors.base);
      planetGrad.addColorStop(1, colors.dark);

      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, scaledR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 4. Iluminacion 3D (brillo sutil superior-izquierdo)
      const highlightGrad = ctx.createRadialGradient(
        sx - scaledR * 0.35,
        sy - scaledR * 0.35,
        0,
        sx - scaledR * 0.35,
        sy - scaledR * 0.35,
        scaledR * 0.7
      );
      highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, scaledR, 0, Math.PI * 2);
      ctx.fill();

      // 5. Edificios (antes de anillos y escudo)
      if (planet.buildings > 0) {
        drawBuildings(ctx, sx, sy, planet.buildings, cam.zoom);
      }

      // 6. Anillos para tipo gas
      if (planet.type === 'gas') {
        ctx.save();
        ctx.strokeStyle = '#e1bee7';
        ctx.lineWidth = 1.5 * cam.zoom;
        ctx.globalAlpha = 0.4;

        ctx.beginPath();
        ctx.ellipse(
          sx,
          sy,
          scaledR * 1.5,
          scaledR * 0.45,
          Math.PI * 0.2,
          0,
          Math.PI * 2
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(
          sx,
          sy,
          scaledR * 1.8,
          scaledR * 0.55,
          Math.PI * 0.2,
          0,
          Math.PI * 2
        );
        ctx.stroke();

        ctx.restore();
      }

      // 7. Cruces rojas para military
      if (planet.hasMilitary) {
        drawMilitaryCross(ctx, sx, sy, cam.zoom);
      }

      // 8. Escudo (circulo punteado dorado)
      if (planet.hasShield) {
        ctx.save();
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 1.5 * cam.zoom;
        ctx.setLineDash([3 * cam.zoom, 3 * cam.zoom]);
        ctx.beginPath();
        ctx.arc(sx, sy, scaledR + 5 * cam.zoom, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 9. Hover: glow blanco + escala ya aplicada
      if (isHovered) {
        ctx.save();

        // Glow blanco exterior
        const hoverGlow = ctx.createRadialGradient(
          sx,
          sy,
          scaledR,
          sx,
          sy,
          scaledR + 12 * cam.zoom
        );
        hoverGlow.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        hoverGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = hoverGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, scaledR + 12 * cam.zoom, 0, Math.PI * 2);
        ctx.fill();

        // Anillo blanco
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2 * cam.zoom;
        ctx.beginPath();
        ctx.arc(sx, sy, scaledR + 3 * cam.zoom, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // 10. Selected: anillo sutil
      if (isSelected && !isHovered) {
        ctx.save();
        ctx.strokeStyle = hexToRgba(allianceColor, 0.8);
        ctx.lineWidth = 2 * cam.zoom;
        ctx.beginPath();
        ctx.arc(sx, sy, scaledR + 3 * cam.zoom, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    },
    [worldToScreen, drawMilitaryCross, drawBuildings]
  );

  // ---- LAYER 6: Labels -----------------------------------------------------

  const drawLabels = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cam: CameraState,
      w: number,
      h: number
    ) => {
      if (cam.zoom < 0.5) return;

      for (const planet of GALAXY_PLANETS) {
        const { wx, wy } = getWorldPos(planet);
        const { sx, sy } = worldToScreen(wx, wy, cam, w, h);

        // Culling
        if (!isInViewport(sx, sy, w, h, 150)) continue;

        const r = PLANET_RADIUS * cam.zoom;
        const allianceColor = ALLIANCE_COLORS[planet.alliance] ?? '#adb5bd';

        // --- Circulo de nivel (a la izquierda del planeta) ---
        const levelRadius = 7 * cam.zoom;
        const levelX = sx - r - levelRadius - 4 * cam.zoom;
        const levelY = sy;

        ctx.save();
        ctx.beginPath();
        ctx.arc(levelX, levelY, levelRadius, 0, Math.PI * 2);
        ctx.fillStyle = allianceColor;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(7 * cam.zoom)}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(planet.level), levelX, levelY + 1 * cam.zoom);
        ctx.restore();

        // --- Label box (debajo del planeta) ---
        const labelBoxPaddingX = 6 * cam.zoom;
        const labelBoxPaddingY = 3 * cam.zoom;
        const lineHeight1 = Math.round(10 * cam.zoom);
        const lineHeight2 = Math.round(9 * cam.zoom);
        const boxWidth = 110 * cam.zoom;
        const boxHeight = (lineHeight1 + lineHeight2 + labelBoxPaddingY * 2 + 2 * cam.zoom);
        const boxX = sx - boxWidth / 2;
        const boxY = sy + r + 8 * cam.zoom;

        // Fondo del label
        ctx.save();
        ctx.fillStyle = 'rgba(10, 20, 40, 0.75)';
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.15)';
        ctx.lineWidth = 1;

        // Dibujar rectangulo redondeado
        const cornerR = 3 * cam.zoom;
        ctx.beginPath();
        ctx.moveTo(boxX + cornerR, boxY);
        ctx.lineTo(boxX + boxWidth - cornerR, boxY);
        ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + cornerR);
        ctx.lineTo(boxX + boxWidth, boxY + boxHeight - cornerR);
        ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - cornerR, boxY + boxHeight);
        ctx.lineTo(boxX + cornerR, boxY + boxHeight);
        ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - cornerR);
        ctx.lineTo(boxX, boxY + cornerR);
        ctx.quadraticCurveTo(boxX, boxY, boxX + cornerR, boxY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Linea 1: Tag de alianza + nombre del jugador
        ctx.save();
        ctx.font = `${Math.round(10 * cam.zoom)}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = allianceColor;
        const line1Text = `${planet.allianceTag} ${planet.playerName}`;
        ctx.fillText(line1Text, sx, boxY + labelBoxPaddingY);
        ctx.restore();

        // Linea 2: nombre del planeta
        ctx.save();
        ctx.font = `${Math.round(9 * cam.zoom)}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(planet.name, sx, boxY + labelBoxPaddingY + lineHeight1 + 1 * cam.zoom);
        ctx.restore();
      }
    },
    [worldToScreen, isInViewport]
  );

  // ---- Main render loop ----------------------------------------------------

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cam = cameraRef.current;
      const time = timestamp / 1000;
      timeRef.current = time;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // LAYER 1: Background + Nebulae
      drawBackground(ctx, w, h);
      drawNebulae(ctx, cam, w, h);

      // LAYER 2: Stars (parallax 3 capas)
      drawStars(ctx, cam, w, h, time);

      // LAYER 3: Grid
      drawGrid(ctx, cam, w, h);

      // LAYER 4: Connection lines
      drawConnections(ctx, cam, w, h);

      // LAYER 5: Planets (con culling)
      for (const planet of GALAXY_PLANETS) {
        const { wx, wy } = getWorldPos(planet);
        const { sx, sy } = worldToScreen(wx, wy, cam, w, h);
        if (!isInViewport(sx, sy, w, h, 100)) continue;
        drawPlanet(ctx, planet, cam, w, h);
      }

      // LAYER 6: Labels
      drawLabels(ctx, cam, w, h);

      rafRef.current = requestAnimationFrame(draw);
    },
    [
      drawBackground,
      drawNebulae,
      drawStars,
      drawGrid,
      drawConnections,
      drawPlanet,
      drawLabels,
      worldToScreen,
      isInViewport,
    ]
  );

  // ---- Resize & Lifecycle --------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;

      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      // Generar estrellas solo la primera vez
      if (starsRef.current.length === 0) {
        starsRef.current = generateStars(STAR_COUNT, cssW + 200, cssH + 200);
      }

      onResize(cssW, cssH);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw, onResize]);

  // ==========================================================================
  // Render
  // ==========================================================================

  const cursor = hoveredPlanet ? 'pointer' : 'grab';

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onClick={onClick}
      onWheel={onWheel}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor,
        display: 'block',
      }}
    />
  );
};

Go2GalaxyMap.displayName = 'Go2GalaxyMap';
