'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { GALAXY_PLANETS, GALAXY_SIZE, ALLIANCE_COLORS, PLANET_TYPE_COLORS } from './galaxy-data';
import type { CameraState } from './useGalaxyMap';

interface Go2GalaxyMapProps {
  camera: CameraState;
  hoveredPlanet: { id: string } | null;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  onResize: (width: number, height: number) => void;
}

const CELL_SIZE = GALAXY_SIZE.cellSize;
const PLANET_RADIUS = 24;

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  layer: number;
}

const NEBULAE = [
  { x: 0.3, y: 0.3, color: 'rgba(45, 27, 105, 0.25)', radius: 0.4 },
  { x: 0.7, y: 0.6, color: 'rgba(10, 74, 91, 0.2)', radius: 0.35 },
  { x: 0.5, y: 0.5, color: 'rgba(13, 27, 74, 0.2)', radius: 0.45 },
];

function generateStars(count: number, width: number, height: number): Star[] {
  const stars: Star[] = [];
  const rng = (seed: number) => {
    let s = seed;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  };
  const rand = rng(12345);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * width,
      y: rand() * height,
      size: rand() * 2 + 0.5,
      opacity: rand() * 0.8 + 0.2,
      layer: Math.floor(rand() * 3),
    });
  }
  return stars;
}

export const Go2GalaxyMap: React.FC<Go2GalaxyMapProps> = ({
  camera,
  hoveredPlanet,
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
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const hoveredRef = useRef(hoveredPlanet);
  hoveredRef.current = hoveredPlanet;

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

  const drawNebulae = useCallback(
    (ctx: CanvasRenderingContext2D, cam: CameraState, w: number, h: number) => {
      for (const neb of NEBULAE) {
        const { sx, sy } = worldToScreen(
          neb.x * GALAXY_SIZE.width * CELL_SIZE,
          neb.y * GALAXY_SIZE.height * CELL_SIZE,
          cam,
          w,
          h
        );
        const radius = neb.radius * Math.max(w, h) * cam.zoom;
        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
        const baseColor = neb.color.replace(/[\d.]+\)$/, '');
        const baseOpacity = parseFloat(neb.color.match(/[\d.]+$/)?.[0] || '0.2');
        gradient.addColorStop(0, `${baseColor}${baseOpacity})`);
        gradient.addColorStop(0.5, `${baseColor}${baseOpacity * 0.5})`);
        gradient.addColorStop(1, `${baseColor}0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [worldToScreen]
  );

  const drawStars = useCallback(
    (ctx: CanvasRenderingContext2D, cam: CameraState, w: number, h: number) => {
      const parallaxFactors = [0.3, 0.6, 1.0];
      const centerX = w / 2;
      const centerY = h / 2;

      for (const star of starsRef.current) {
        const factor = parallaxFactors[star.layer] || 1.0;
        const offsetX = (centerX - cam.x * cam.zoom) * (1 - factor);
        const offsetY = (centerY - cam.y * cam.zoom) * (1 - factor);
        const sx = ((star.x + offsetX) % (w + 100)) - 50;
        const sy = ((star.y + offsetY) % (h + 100)) - 50;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      }
    },
    []
  );

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, cam: CameraState, w: number, h: number) => {
      const gridSize = CELL_SIZE * cam.zoom;
      const centerX = w / 2;
      const centerY = h / 2;
      const startX = centerX - cam.x * cam.zoom;
      const startY = centerY - cam.y * cam.zoom;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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

  const drawPlanet = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      planet: (typeof GALAXY_PLANETS)[0],
      cam: CameraState,
      w: number,
      h: number
    ) => {
      const { sx, sy } = worldToScreen(
        planet.x * CELL_SIZE,
        planet.y * CELL_SIZE,
        cam,
        w,
        h
      );
      const r = PLANET_RADIUS * cam.zoom;
      const isHovered = hoveredRef.current?.id === planet.id;
      const scale = isHovered ? 1.15 : 1.0;
      const scaledR = r * scale;
      const allianceColor = ALLIANCE_COLORS[planet.alliance] || '#adb5bd';

      // Glow/halo
      const glowRadius = scaledR * 2.2;
      const glowGradient = ctx.createRadialGradient(sx, sy, scaledR * 0.8, sx, sy, glowRadius);
      glowGradient.addColorStop(0, allianceColor.replace(')', ', 0.3)').replace('#', ''));
      // Parse hex to rgba for glow
      const hex = allianceColor.replace('#', '');
      const r1 = parseInt(hex.slice(0, 2), 16);
      const g1 = parseInt(hex.slice(2, 4), 16);
      const b1 = parseInt(hex.slice(4, 6), 16);
      glowGradient.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, 0.3)`);
      glowGradient.addColorStop(1, `rgba(${r1}, ${g1}, ${b1}, 0)`);
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Shadow offset for 3D effect
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 8 * cam.zoom;
      ctx.shadowOffsetX = 3 * cam.zoom;
      ctx.shadowOffsetY = 3 * cam.zoom;

      // Planet base
      const colors = PLANET_TYPE_COLORS[planet.type];
      const planetGradient = ctx.createRadialGradient(
        sx - scaledR * 0.3,
        sy - scaledR * 0.3,
        scaledR * 0.1,
        sx,
        sy,
        scaledR
      );
      planetGradient.addColorStop(0, colors[0]);
      planetGradient.addColorStop(0.5, colors[1]);
      planetGradient.addColorStop(1, colors[2]);

      ctx.fillStyle = planetGradient;
      ctx.beginPath();
      ctx.arc(sx, sy, scaledR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Gas planet rings
      if (planet.type === 'gas') {
        ctx.save();
        ctx.strokeStyle = colors[0];
        ctx.lineWidth = 2 * cam.zoom;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.ellipse(
          sx,
          sy,
          scaledR * 1.6,
          scaledR * 0.5,
          Math.PI * 0.25,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(
          sx,
          sy,
          scaledR * 1.9,
          scaledR * 0.6,
          Math.PI * 0.25,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
      }

      // Shield (dotted circle)
      if (planet.hasShield) {
        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2 * cam.zoom;
        ctx.setLineDash([4 * cam.zoom, 4 * cam.zoom]);
        ctx.beginPath();
        ctx.arc(sx, sy, scaledR + 6 * cam.zoom, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Hover ring
      if (isHovered) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2 * cam.zoom;
        ctx.beginPath();
        ctx.arc(sx, sy, scaledR + 4 * cam.zoom, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    },
    [worldToScreen]
  );

  const drawLabels = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cam: CameraState,
      w: number,
      h: number
    ) => {
      if (cam.zoom < 0.6) return;

      ctx.font = `${Math.round(10 * cam.zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      for (const planet of GALAXY_PLANETS) {
        const { sx, sy } = worldToScreen(
          planet.x * CELL_SIZE,
          planet.y * CELL_SIZE,
          cam,
          w,
          h
        );

        // Check if in viewport
        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue;

        const r = PLANET_RADIUS * cam.zoom;
        const allianceColor = ALLIANCE_COLORS[planet.alliance] || '#adb5bd';
        const labelY = sy - r - 6 * cam.zoom;

        // Player name
        const nameText = planet.playerName;
        const nameMetrics = ctx.measureText(nameText);
        const namePadding = 4 * cam.zoom;

        ctx.fillStyle = 'rgba(2, 4, 8, 0.8)';
        ctx.fillRect(
          sx - nameMetrics.width / 2 - namePadding,
          labelY - (12 * cam.zoom) - namePadding,
          nameMetrics.width + namePadding * 2,
          12 * cam.zoom + namePadding * 2
        );

        ctx.fillStyle = '#ffffff';
        ctx.fillText(nameText, sx, labelY);

        // Alliance tag
        const tagText = planet.allianceTag;
        const tagY = labelY + 12 * cam.zoom;
        const tagMetrics = ctx.measureText(tagText);

        ctx.fillStyle = 'rgba(2, 4, 8, 0.7)';
        ctx.fillRect(
          sx - tagMetrics.width / 2 - namePadding,
          tagY - (10 * cam.zoom) - namePadding,
          tagMetrics.width + namePadding * 2,
          10 * cam.zoom + namePadding * 2
        );

        ctx.fillStyle = allianceColor;
        ctx.fillText(tagText, sx, tagY + 2 * cam.zoom);
      }
    },
    [worldToScreen]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const cam = cameraRef.current;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // 1. Background
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, w, h);

    // 2. Nebulae
    drawNebulae(ctx, cam, w, h);

    // 3. Stars
    drawStars(ctx, cam, w, h);

    // 4. Grid
    drawGrid(ctx, cam, w, h);

    // 5. Planets
    for (const planet of GALAXY_PLANETS) {
      const { sx } = worldToScreen(planet.x * CELL_SIZE, planet.y * CELL_SIZE, cam, w, h);
      if (sx < -100 || sx > w + 100) continue;
      drawPlanet(ctx, planet, cam, w, h);
    }

    // 6. Labels
    drawLabels(ctx, cam, w, h);

    rafRef.current = requestAnimationFrame(draw);
  }, [drawNebulae, drawStars, drawGrid, drawPlanet, drawLabels, worldToScreen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      if (starsRef.current.length === 0) {
        starsRef.current = generateStars(250, w + 100, h + 100);
      }

      onResize(w, h);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw, onResize]);

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
        cursor: hoveredPlanet ? 'pointer' : 'grab',
        display: 'block',
      }}
    />
  );
};

Go2GalaxyMap.displayName = 'Go2GalaxyMap';
