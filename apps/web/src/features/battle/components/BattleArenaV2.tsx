/**
 * BattleArenaV2.tsx
 * Galaxy Online 2 - Battle Canvas Recreation
 * Based on reference screenshots showing isometric diamond grid,
 * nebula background, and squadron-based ship formations.
 */

import React, { useRef, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────

interface ShipType {
  type: "frigate" | "cruiser" | "battleship";
}

interface Squadron {
  id: number;
  gridQ: number;
  gridR: number;
  count: number;
  shipType: ShipType["type"];
  faction: "attacker" | "defender";
  formation: "wedge" | "line" | "diamond" | "v";
}

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface NebulaCloud {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
}

// ─── Constants ───────────────────────────────────────────────────────

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 640;
const DIAMOND_SIZE = 50; // diagonal length in pixels
const GRID_COLS = 24;
const GRID_ROWS = 18;

// Colors
const BG_COLOR = "#050a1a";
const GRID_LINE_COLOR = "#1a2a4a";
const GRID_LINE_HIT = "#2a3a5a";
const NEBULA_PURPLE = "#4a1a6b";
const NEBULA_PINK = "#8a3a7b";
const NEBULA_BLUE = "#1a2a6b";
const STAR_COLOR = "#ffffff";

// ─── Helper: Generate procedural stars ───────────────────────────────

function generateStars(width: number, height: number, count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.0 + 0.3,
      brightness: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 2.0 + 0.5,
      twinkleOffset: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

// ─── Helper: Generate nebula clouds ──────────────────────────────────

function generateNebulaClouds(width: number, height: number): NebulaCloud[] {
  const clouds: NebulaCloud[] = [
    // Purple nebula - upper center area
    { x: width * 0.3, y: height * 0.25, radius: 280, color: NEBULA_PURPLE, opacity: 0.35 },
    { x: width * 0.45, y: height * 0.35, radius: 240, color: NEBULA_PINK, opacity: 0.25 },
    { x: width * 0.15, y: height * 0.15, radius: 200, color: NEBULA_BLUE, opacity: 0.2 },
    // Lower nebula area
    { x: width * 0.25, y: height * 0.75, radius: 220, color: NEBULA_PURPLE, opacity: 0.3 },
    { x: width * 0.6, y: height * 0.7, radius: 250, color: "#5a2a7b", opacity: 0.22 },
    // Right side subtle
    { x: width * 0.85, y: height * 0.4, radius: 180, color: NEBULA_BLUE, opacity: 0.18 },
    // Center glow
    { x: width * 0.5, y: height * 0.5, radius: 350, color: NEBULA_PURPLE, opacity: 0.12 },
  ];
  return clouds;
}

// ─── Squad Data based on reference images ────────────────────────────

const SQUADRONS: Squadron[] = [
  // ─── ATTACKER (left side) - Frigates, small blue ships ───
  // Top-left cluster - frigates with count 800
  { id: 1, gridQ: 3, gridR: 3, count: 800, shipType: "frigate", faction: "attacker", formation: "wedge" },
  { id: 2, gridQ: 6, gridR: 2, count: 800, shipType: "frigate", faction: "attacker", formation: "wedge" },
  { id: 3, gridQ: 2, gridR: 6, count: 700, shipType: "frigate", faction: "attacker", formation: "v" },
  { id: 4, gridQ: 5, gridR: 5, count: 700, shipType: "frigate", faction: "attacker", formation: "v" },
  { id: 5, gridQ: 8, gridR: 3, count: 700, shipType: "frigate", faction: "attacker", formation: "wedge" },
  // Middle-left - cruisers with count 1000
  { id: 6, gridQ: 4, gridR: 8, count: 1000, shipType: "cruiser", faction: "attacker", formation: "diamond" },
  { id: 7, gridQ: 7, gridR: 7, count: 1000, shipType: "cruiser", faction: "attacker", formation: "diamond" },
  { id: 8, gridQ: 6, gridR: 10, count: 1000, shipType: "cruiser", faction: "attacker", formation: "v" },

  // ─── DEFENDER (right side) - Larger ships, silver/white ───
  // Top-right cluster - frigates with count 1700
  { id: 9, gridQ: 18, gridR: 4, count: 1700, shipType: "frigate", faction: "defender", formation: "wedge" },
  { id: 10, gridQ: 21, gridR: 3, count: 1700, shipType: "frigate", faction: "defender", formation: "wedge" },
  { id: 11, gridQ: 16, gridR: 6, count: 1700, shipType: "frigate", faction: "defender", formation: "v" },
  { id: 12, gridQ: 22, gridR: 6, count: 1700, shipType: "frigate", faction: "defender", formation: "v" },
  // Middle-right cluster - battleships with count 3000
  { id: 13, gridQ: 17, gridR: 9, count: 3000, shipType: "battleship", faction: "defender", formation: "line" },
  { id: 14, gridQ: 20, gridR: 8, count: 3000, shipType: "battleship", faction: "defender", formation: "line" },
  { id: 15, gridQ: 19, gridR: 11, count: 3000, shipType: "battleship", faction: "defender", formation: "diamond" },
  // Lower defenders
  { id: 16, gridQ: 15, gridR: 12, count: 5250, shipType: "cruiser", faction: "defender", formation: "wedge" },
  { id: 17, gridQ: 22, gridR: 10, count: 5250, shipType: "cruiser", faction: "defender", formation: "wedge" },
  { id: 18, gridQ: 18, gridR: 13, count: 5850, shipType: "battleship", faction: "defender", formation: "line" },
  // Extra attackers to balance
  { id: 19, gridQ: 3, gridR: 11, count: 3250, shipType: "cruiser", faction: "attacker", formation: "line" },
  { id: 20, gridQ: 9, gridR: 12, count: 5850, shipType: "battleship", faction: "attacker", formation: "diamond" },
  { id: 21, gridQ: 2, gridR: 14, count: 5850, shipType: "frigate", faction: "attacker", formation: "v" },
  { id: 22, gridQ: 22, gridR: 14, count: 5850, shipType: "frigate", faction: "defender", formation: "v" },
];

// ─── Grid coordinate conversion ──────────────────────────────────────

function gridToPixel(q: number, r: number): { x: number; y: number } {
  // Isometric diamond grid: each diamond is a square rotated 45 degrees
  // The diamond has width = DIAMOND_SIZE, height = DIAMOND_SIZE / 2 for isometric look
  const isoW = DIAMOND_SIZE;
  const isoH = DIAMOND_SIZE * 0.5;
  const offsetX = CANVAS_WIDTH * 0.15;
  const offsetY = CANVAS_HEIGHT * 0.1;

  const x = offsetX + (q - r) * (isoW * 0.5);
  const y = offsetY + (q + r) * (isoH * 0.5);

  return { x, y };
}

// ─── Draw Functions ──────────────────────────────────────────────────

function drawNebulaBackground(
  ctx: CanvasRenderingContext2D,
  clouds: NebulaCloud[],
  time: number
) {
  // Deep space base
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw nebula clouds with radial gradients
  for (const cloud of clouds) {
    const gradient = ctx.createRadialGradient(
      cloud.x, cloud.y, 0,
      cloud.x, cloud.y, cloud.radius
    );

    // Animate opacity slightly for living nebula feel
    const breathe = Math.sin(time * 0.3 + cloud.x * 0.01) * 0.05;
    const opacity = Math.max(0, cloud.opacity + breathe);

    // Parse hex color to rgba
    const hex = cloud.color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
    gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${opacity * 0.6})`);
    gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${opacity * 0.2})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(
      cloud.x - cloud.radius,
      cloud.y - cloud.radius,
      cloud.radius * 2,
      cloud.radius * 2
    );
  }

  // Subtle cosmic dust / secondary glow
  const dustGradient = ctx.createRadialGradient(
    CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.4, 0,
    CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.4, CANVAS_WIDTH * 0.6
  );
  dustGradient.addColorStop(0, "rgba(60, 20, 100, 0.08)");
  dustGradient.addColorStop(0.5, "rgba(30, 10, 60, 0.04)");
  dustGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = dustGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  time: number
) {
  for (const star of stars) {
    const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
    const alpha = star.brightness * (0.6 + twinkle * 0.4);

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = STAR_COLOR;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();

    // Star glow for brighter stars
    if (star.size > 1.2) {
      ctx.globalAlpha = alpha * 0.15;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = "#aabbff";
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawSun(ctx: CanvasRenderingContext2D, time: number) {
  // Bright sun/star in upper right corner (from reference image 1)
  const sunX = CANVAS_WIDTH * 0.88;
  const sunY = CANVAS_HEIGHT * 0.08;
  const sunRadius = 28;

  // Outer glow - large
  const outerGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, sunRadius * 6);
  outerGlow.addColorStop(0, "rgba(255, 180, 80, 0.25)");
  outerGlow.addColorStop(0.3, "rgba(255, 140, 60, 0.12)");
  outerGlow.addColorStop(0.6, "rgba(200, 80, 40, 0.05)");
  outerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = outerGlow;
  ctx.fillRect(sunX - sunRadius * 6, sunY - sunRadius * 6, sunRadius * 12, sunRadius * 12);

  // Middle glow
  const midGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.3, sunX, sunY, sunRadius * 2.5);
  midGlow.addColorStop(0, "rgba(255, 220, 150, 0.6)");
  midGlow.addColorStop(0.5, "rgba(255, 180, 80, 0.2)");
  midGlow.addColorStop(1, "rgba(255, 100, 40, 0)");
  ctx.fillStyle = midGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Inner sun body
  const pulse = Math.sin(time * 1.5) * 2;
  const innerGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius + pulse);
  innerGradient.addColorStop(0, "#fff8e0");
  innerGradient.addColorStop(0.3, "#ffd060");
  innerGradient.addColorStop(0.7, "#ff9040");
  innerGradient.addColorStop(1, "rgba(255, 80, 30, 0)");
  ctx.fillStyle = innerGradient;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius + pulse, 0, Math.PI * 2);
  ctx.fill();
}

function drawDiamondGrid(
  ctx: CanvasRenderingContext2D,
  hitCells?: Set<string>
) {
  ctx.strokeStyle = GRID_LINE_COLOR;
  ctx.lineWidth = 0.8;

  for (let q = -2; q <= GRID_COLS + 2; q++) {
    for (let r = -2; r <= GRID_ROWS + 2; r++) {
      const { x, y } = gridToPixel(q, r);

      // Check if this cell has a squadron for highlight
      const cellKey = `${q},${r}`;
      if (hitCells && hitCells.has(cellKey)) {
        ctx.strokeStyle = GRID_LINE_HIT;
        ctx.lineWidth = 1.2;
      } else {
        ctx.strokeStyle = GRID_LINE_COLOR;
        ctx.lineWidth = 0.8;
      }

      // Draw diamond (rotated square)
      const hw = DIAMOND_SIZE * 0.5; // half width
      const hh = DIAMOND_SIZE * 0.28; // half height (isometric compression)

      ctx.beginPath();
      ctx.moveTo(x, y - hh);       // top
      ctx.lineTo(x + hw, y);       // right
      ctx.lineTo(x, y + hh);       // bottom
      ctx.lineTo(x - hw, y);       // left
      ctx.closePath();
      ctx.stroke();
    }
  }
}

// ─── Draw Ship Sprites (detailed, multi-path) ────────────────────────

function drawFrigate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  faction: "attacker" | "defender",
  angle: number,
  scale: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  const bodyColor = faction === "attacker" ? "#4488ff" : "#b0b8cc";
  const darkColor = faction === "attacker" ? "#2255bb" : "#8088a0";
  const accentColor = faction === "attacker" ? "#66aaff" : "#ff4444";
  const engineColor = faction === "attacker" ? "#44ccff" : "#ff6644";

  // Engine glow (behind)
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = engineColor;
  ctx.beginPath();
  ctx.ellipse(-18, 0, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.ellipse(-22, 0, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Main body - long sleek arrow shape
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(22, 0);           // nose
  ctx.lineTo(5, -5);           // front shoulder L
  ctx.lineTo(-8, -6);          // mid wing L
  ctx.lineTo(-18, -3);         // rear wing tip L
  ctx.lineTo(-14, 0);          // engine notch L
  ctx.lineTo(-18, 3);          // rear wing tip R
  ctx.lineTo(-8, 6);           // mid wing R
  ctx.lineTo(5, 5);            // front shoulder R
  ctx.closePath();
  ctx.fill();

  // Body outline
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cockpit / central ridge
  ctx.fillStyle = faction === "attacker" ? "#88ccff" : "#dde0ee";
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(0, -2);
  ctx.lineTo(-8, 0);
  ctx.lineTo(0, 2);
  ctx.closePath();
  ctx.fill();

  // Wing accents
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(-6, -5);
  ctx.lineTo(-14, -3);
  ctx.lineTo(-10, -2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-6, 5);
  ctx.lineTo(-14, 3);
  ctx.lineTo(-10, 2);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Engine pods
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.ellipse(-16, -3, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-16, 3, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Engine lights
  ctx.fillStyle = engineColor;
  ctx.beginPath();
  ctx.arc(-18, -3, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-18, 3, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Weapon hardpoint (tiny)
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(2, 0, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCruiser(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  faction: "attacker" | "defender",
  angle: number,
  scale: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  const bodyColor = faction === "attacker" ? "#3a6ccc" : "#a0a8bc";
  const darkColor = faction === "attacker" ? "#1a4499" : "#707890";
  const accentColor = faction === "attacker" ? "#5599ee" : "#cc3333";
  const engineColor = faction === "attacker" ? "#33bbff" : "#ee5533";

  // Engine glow
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = engineColor;
  ctx.beginPath();
  ctx.ellipse(-24, 0, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Main hull - wider body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(20, 0);            // nose
  ctx.lineTo(8, -8);            // front hull L
  ctx.lineTo(-5, -10);          // shoulder L
  ctx.lineTo(-12, -7);          // wing start L
  ctx.lineTo(-22, -10);         // wing tip L
  ctx.lineTo(-18, -3);          // wing fold L
  ctx.lineTo(-24, -2);          // engine L
  ctx.lineTo(-24, 2);           // engine R
  ctx.lineTo(-18, 3);           // wing fold R
  ctx.lineTo(-22, 10);          // wing tip R
  ctx.lineTo(-12, 7);           // wing start R
  ctx.lineTo(-5, 10);           // shoulder R
  ctx.lineTo(8, 8);             // front hull R
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Secondary hull layer (armor plating)
  ctx.fillStyle = darkColor;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(2, -5);
  ctx.lineTo(-10, -4);
  ctx.lineTo(-14, 0);
  ctx.lineTo(-10, 4);
  ctx.lineTo(2, 5);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Bridge / command section
  ctx.fillStyle = faction === "attacker" ? "#6699dd" : "#c8ccdc";
  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.lineTo(-4, -3);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-4, 3);
  ctx.closePath();
  ctx.fill();

  // Weapon turrets (visible on sides)
  ctx.fillStyle = accentColor;
  // Top turret
  ctx.beginPath();
  ctx.arc(-2, -6, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // Bottom turret
  ctx.beginPath();
  ctx.arc(-2, 6, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // Nose cannon
  ctx.beginPath();
  ctx.arc(16, 0, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Wing details
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(-14, -8);
  ctx.lineTo(-20, -10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.lineTo(-20, 10);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Engine pods (4 visible)
  ctx.fillStyle = engineColor;
  for (const ey of [-2, 2]) {
    for (const ex of [-22, -24]) {
      ctx.beginPath();
      ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Hull panel lines
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(-5, -5);
  ctx.lineTo(-5, 5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(0, 3);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawBattleship(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  faction: "attacker" | "defender",
  angle: number,
  scale: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  const bodyColor = faction === "attacker" ? "#2d5aaa" : "#9098ac";
  const darkColor = faction === "attacker" ? "#163a80" : "#606878";
  const accentColor = faction === "attacker" ? "#4488dd" : "#bb2222";
  const engineColor = faction === "attacker" ? "#22aaff" : "#dd4422";
  const hullColor = faction === "attacker" ? "#3a70cc" : "#a8b0c4";

  // Large engine glow
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = engineColor;
  ctx.beginPath();
  ctx.ellipse(-32, 0, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.ellipse(-38, 0, 22, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Main hull (massive, multi-section) ──

  // Lower hull section
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.moveTo(24, 0);            // nose
  ctx.lineTo(12, -6);
  ctx.lineTo(-8, -10);          // belly L
  ctx.lineTo(-28, -6);
  ctx.lineTo(-30, 0);
  ctx.lineTo(-28, 6);
  ctx.lineTo(-8, 10);           // belly R
  ctx.lineTo(12, 6);
  ctx.closePath();
  ctx.fill();

  // Upper hull / main deck
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(28, 0);            // pointed nose
  ctx.lineTo(14, -10);          // front slope L
  ctx.lineTo(2, -12);           // deck edge L
  ctx.lineTo(-12, -10);         // mid deck L
  ctx.lineTo(-20, -12);         // wing mount L
  ctx.lineTo(-28, -14);         // wing tip L
  ctx.lineTo(-24, -6);          // wing fold L
  ctx.lineTo(-30, -4);          // engine bank top L
  ctx.lineTo(-30, 4);           // engine bank top R
  ctx.lineTo(-24, 6);           // wing fold R
  ctx.lineTo(-28, 14);          // wing tip R
  ctx.lineTo(-20, 12);          // wing mount R
  ctx.lineTo(-12, 10);          // mid deck R
  ctx.lineTo(2, 12);            // deck edge R
  ctx.lineTo(14, 10);           // front slope R
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Armored central section
  ctx.fillStyle = hullColor;
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(-2, -7);
  ctx.lineTo(-16, -6);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-16, 6);
  ctx.lineTo(-2, 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Command bridge
  ctx.fillStyle = faction === "attacker" ? "#5577bb" : "#b4bcc8";
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(-10, -4);
  ctx.lineTo(-16, 0);
  ctx.lineTo(-10, 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 0.6;
  ctx.stroke();

  // Bridge windows
  ctx.fillStyle = faction === "attacker" ? "#88ccff" : "#ffeeaa";
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(-10, 0, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Weapon batteries - multiple turrets
  ctx.fillStyle = accentColor;
  // Nose battery
  ctx.fillRect(18, -2, 4, 1.5);
  ctx.fillRect(18, 0.5, 4, 1.5);
  // Mid batteries
  ctx.beginPath();
  ctx.arc(-4, -9, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-4, 9, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-14, -10, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-14, 10, 2, 0, Math.PI * 2);
  ctx.fill();
  // Rear battery
  ctx.beginPath();
  ctx.arc(-22, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Large forward cannons
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(22, -3);
  ctx.lineTo(28, -3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(22, 3);
  ctx.lineTo(28, 3);
  ctx.stroke();

  // Wing details
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6;
  // Left wing lines
  ctx.beginPath();
  ctx.moveTo(-18, -11);
  ctx.lineTo(-26, -13);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-20, -8);
  ctx.lineTo(-28, -10);
  ctx.stroke();
  // Right wing lines
  ctx.beginPath();
  ctx.moveTo(-18, 11);
  ctx.lineTo(-26, 13);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-20, 8);
  ctx.lineTo(-28, 10);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Hull panel lines / grating
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 4; i++) {
    const px = 4 - i * 7;
    ctx.beginPath();
    ctx.moveTo(px, -5);
    ctx.lineTo(px, 5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Engine array (6 engines in 2x3 grid)
  ctx.fillStyle = engineColor;
  const enginePositions = [
    [-28, -3], [-28, 3],
    [-30, -1.5], [-30, 1.5],
    [-26, -4.5], [-26, 4.5],
  ];
  for (const [ex, ey] of enginePositions) {
    ctx.beginPath();
    ctx.arc(ex, ey, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Engine inner bright
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(ex - 0.5, ey, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = engineColor;
    ctx.globalAlpha = 1;
  }

  // Engine mounting structure
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-22, -5);
  ctx.lineTo(-28, -5);
  ctx.lineTo(-28, 5);
  ctx.lineTo(-22, 5);
  ctx.stroke();

  ctx.restore();
}

// ─── Draw Formation of Ships (3-4 ships in a squadron) ───────────────

function drawFormation(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  shipType: ShipType["type"],
  faction: "attacker" | "defender",
  formation: string,
  time: number,
  squadId: number
) {
  // Slight floating animation per squadron
  const floatY = Math.sin(time * 0.8 + squadId * 1.3) * 1.5;
  const baseX = centerX;
  const baseY = centerY + floatY;

  // Base angle: attackers point right (0), defenders point left (PI)
  const baseAngle = faction === "attacker" ? 0 : Math.PI;

  // Formation offsets for each ship in the squadron
  let offsets: { dx: number; dy: number; angleOffset: number }[] = [];

  switch (formation) {
    case "wedge":
      // Leader front, two behind
      offsets = [
        { dx: 6, dy: 0, angleOffset: 0 },
        { dx: -4, dy: -8, angleOffset: faction === "attacker" ? -0.08 : 0.08 },
        { dx: -4, dy: 8, angleOffset: faction === "attacker" ? 0.08 : -0.08 },
        { dx: -14, dy: 0, angleOffset: 0 },
      ];
      break;
    case "v":
      // V formation
      offsets = [
        { dx: 8, dy: 0, angleOffset: 0 },
        { dx: -2, dy: -10, angleOffset: faction === "attacker" ? -0.12 : 0.12 },
        { dx: -2, dy: 10, angleOffset: faction === "attacker" ? 0.12 : -0.12 },
        { dx: -12, dy: 0, angleOffset: 0 },
      ];
      break;
    case "diamond":
      // Diamond shape
      offsets = [
        { dx: 6, dy: 0, angleOffset: 0 },
        { dx: -2, dy: -8, angleOffset: 0 },
        { dx: -2, dy: 8, angleOffset: 0 },
        { dx: -10, dy: 0, angleOffset: Math.PI },
      ];
      break;
    case "line":
    default:
      // Horizontal line
      offsets = [
        { dx: 10, dy: -3, angleOffset: 0 },
        { dx: -2, dy: -3, angleOffset: 0 },
        { dx: -14, dy: -3, angleOffset: 0 },
        { dx: -6, dy: 8, angleOffset: 0 },
      ];
      break;
  }

  // Scale per ship type
  const scale = shipType === "frigate" ? 0.7 : shipType === "cruiser" ? 0.85 : 1.0;

  // Draw each ship in the formation
  for (let i = 0; i < offsets.length; i++) {
    const off = offsets[i];
    const sx = baseX + off.dx;
    const sy = baseY + off.dy;
    const angle = baseAngle + off.angleOffset;

    // Individual ship bobbing
    const shipBob = Math.sin(time * 1.2 + squadId * 2.1 + i * 0.7) * 0.8;

    switch (shipType) {
      case "frigate":
        drawFrigate(ctx, sx, sy + shipBob, faction, angle, scale);
        break;
      case "cruiser":
        drawCruiser(ctx, sx, sy + shipBob, faction, angle, scale);
        break;
      case "battleship":
        drawBattleship(ctx, sx, sy + shipBob, faction, angle, scale);
        break;
    }
  }
}

// ─── Draw Stack Number ───────────────────────────────────────────────

function drawStackNumber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  count: number,
  time: number
) {
  const label = count.toLocaleString();

  // Subtle shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.font = "bold 13px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(label, x + 1, y + 17);

  // Main text
  ctx.fillStyle = "#ffffff";
  ctx.fillText(label, x, y + 16);

  // Subtle glow for large stacks
  if (count >= 3000) {
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(time * 2 + count) * 0.05;
    ctx.fillStyle = count >= 5000 ? "#ffaa44" : "#88ccff";
    ctx.fillText(label, x, y + 16);
    ctx.restore();
  }
}

// ─── Main Component ──────────────────────────────────────────────────

const BattleArenaV2: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const nebulaRef = useRef<NebulaCloud[]>([]);
  const hitCellsRef = useRef<Set<string>>(new Set());

  // Initialize procedural data
  useEffect(() => {
    starsRef.current = generateStars(CANVAS_WIDTH, CANVAS_HEIGHT, 300);
    nebulaRef.current = generateNebulaClouds(CANVAS_WIDTH, CANVAS_HEIGHT);

    // Mark grid cells that have squadrons
    const hitCells = new Set<string>();
    for (const sq of SQUADRONS) {
      hitCells.add(`${sq.gridQ},${sq.gridR}`);
    }
    hitCellsRef.current = hitCells;
  }, []);

  // Main render loop
  const render = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const t = time / 1000; // seconds

    // ── Clear ──
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // ── Background: Nebula ──
    drawNebulaBackground(ctx, nebulaRef.current, t);

    // ── Stars ──
    drawStars(ctx, starsRef.current, t);

    // ── Sun / bright star ──
    drawSun(ctx, t);

    // ── Diamond Grid ──
    drawDiamondGrid(ctx, hitCellsRef.current);

    // ── Squadrons ──
    // Draw in order: frigates first (background), then cruisers, then battleships (foreground)
    const drawOrder = ["frigate", "cruiser", "battleship"] as const;
    for (const shipType of drawOrder) {
      for (const squadron of SQUADRONS) {
        if (squadron.shipType !== shipType) continue;

        const { x, y } = gridToPixel(squadron.gridQ, squadron.gridR);

        drawFormation(
          ctx,
          x,
          y,
          squadron.shipType,
          squadron.faction,
          squadron.formation,
          t,
          squadron.id
        );

        // Draw stack number below the squadron
        drawStackNumber(ctx, x, y + 12, squadron.count, t);
      }
    }

    // ── Subtle scanline overlay ──
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = "#000000";
    for (let sy = 0; sy < CANVAS_HEIGHT; sy += 3) {
      ctx.fillRect(0, sy, CANVAS_WIDTH, 1);
    }
    ctx.restore();

    // ── Vignette ──
    const vigGradient = ctx.createRadialGradient(
      CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5, CANVAS_WIDTH * 0.3,
      CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5, CANVAS_WIDTH * 0.7
    );
    vigGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    vigGradient.addColorStop(1, "rgba(0, 0, 0, 0.5)");
    ctx.fillStyle = vigGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // ── Border frame ──
    ctx.strokeStyle = "#1a2040";
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2);

    ctx.strokeStyle = "#0a1020";
    ctx.lineWidth = 1;
    ctx.strokeRect(3, 3, CANVAS_WIDTH - 6, CANVAS_HEIGHT - 6);

    animFrameRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [render]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#020510",
        padding: "20px",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          width: CANVAS_WIDTH,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          padding: "6px 16px",
          background: "linear-gradient(180deg, #0a1028 0%, #050a18 100%)",
          border: "1px solid #1a2a4a",
          borderRadius: "4px 4px 0 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#4488ff",
              boxShadow: "0 0 6px #4488ff",
            }}
          />
          <span
            style={{
              color: "#4488ff",
              fontSize: "14px",
              fontWeight: "bold",
              textShadow: "0 0 8px rgba(68, 136, 255, 0.5)",
            }}
          >
            Attacker
          </span>
        </div>
        <span
          style={{
            color: "#ff4444",
            fontSize: "13px",
            fontWeight: "bold",
            letterSpacing: "2px",
            textShadow: "0 0 6px rgba(255, 68, 68, 0.5)",
          }}
        >
          VS
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              color: "#ccccee",
              fontSize: "14px",
              fontWeight: "bold",
              textShadow: "0 0 8px rgba(204, 204, 238, 0.5)",
            }}
          >
            Defender
          </span>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#ccccee",
              boxShadow: "0 0 6px #ccccee",
            }}
          />
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: "2px solid #1a2a4a",
          borderRadius: "2px",
          boxShadow:
            "0 0 30px rgba(26, 42, 74, 0.5), inset 0 0 60px rgba(0, 0, 0, 0.3)",
          imageRendering: "auto",
        }}
      />

      {/* Info Footer */}
      <div
        style={{
          width: CANVAS_WIDTH,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "8px",
          padding: "6px 16px",
          background: "linear-gradient(180deg, #050a18 0%, #0a1028 100%)",
          border: "1px solid #1a2a4a",
          borderRadius: "0 0 4px 4px",
        }}
      >
        <span style={{ color: "#556688", fontSize: "11px" }}>
          Galaxy Online 2 - Battle Simulation
        </span>
        <span style={{ color: "#556688", fontSize: "11px" }}>
          Isometric Diamond Grid
        </span>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          gap: "24px",
          padding: "10px 20px",
          background: "rgba(5, 10, 26, 0.8)",
          border: "1px solid #1a2a4a",
          borderRadius: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "16px",
              height: "4px",
              backgroundColor: "#4488ff",
              borderRadius: "2px",
            }}
          />
          <span style={{ color: "#8899bb", fontSize: "11px" }}>Frigate</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "20px",
              height: "8px",
              backgroundColor: "#3a6ccc",
              borderRadius: "2px",
            }}
          />
          <span style={{ color: "#8899bb", fontSize: "11px" }}>Cruiser</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "24px",
              height: "12px",
              backgroundColor: "#2d5aaa",
              borderRadius: "2px",
            }}
          />
          <span style={{ color: "#8899bb", fontSize: "11px" }}>Battleship</span>
        </div>
      </div>
    </div>
  );
};

export default BattleArenaV2;
