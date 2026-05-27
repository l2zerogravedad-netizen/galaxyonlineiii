"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────

export interface ShipStack {
  id: string;
  shipType: "frigate" | "cruiser" | "battleship";
  count: number;
  maxCount: number;
  shield: number;
  maxShield: number;
  structure: number;
  maxStructure: number;
  side: "attacker" | "defender";
  row: number;
  col: number;
}

export interface CommanderInfo {
  name: string;
  level: number;
  stars: number;
  portraitUrl: string;
}

export interface BattleAction {
  type: "fire" | "hit" | "destroy" | "shield_regen";
  sourceId: string;
  targetId: string;
  damage?: number;
  isCrit?: boolean;
  projectileType?: "ballistic" | "directional" | "missile" | "ship_based";
  timestamp: number;
}

export interface BattleState {
  attackerStacks: ShipStack[];
  defenderStacks: ShipStack[];
  attackerCommander: CommanderInfo;
  defenderCommander: CommanderInfo;
  currentRound: number;
  maxRounds: number;
  actions: BattleAction[];
  isComplete: boolean;
  winner?: "attacker" | "defender" | "draw";
}

export interface BattleResult {
  winner: "attacker" | "defender" | "draw";
  rounds: number;
  attackerRemaining: ShipStack[];
  defenderRemaining: ShipStack[];
}

export interface Go2BattleCanvasProps {
  battleState: BattleState;
  onBattleEnd?: (result: BattleResult) => void;
  onExit?: () => void;
}

type AnimationPhase = "idle" | "firing" | "hitting" | "exploding" | "round_end";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

interface LaserBeam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  life: number;
  maxLife: number;
  type: "ballistic" | "directional" | "missile" | "ship_based";
}

interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

// ─── Constants ───────────────────────────────────────────────────────

const SHIP_COLORS = {
  attacker: {
    base: "#4488ff",
    light: "#88bbff",
    dark: "#2255cc",
    engine: "#66aaff",
  },
  defender: {
    base: "#ff4444",
    light: "#ff8888",
    dark: "#cc2222",
    engine: "#ff6666",
  },
};

const CANVAS_BG = ["#000011", "#000044"] as const;

// ─── Helper: Generate Stars ──────────────────────────────────────────

function generateStars(w: number, h: number, count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.5 + 0.5,
      brightness: Math.random() * 0.5 + 0.5,
      twinkleSpeed: Math.random() * 2 + 1,
      twinkleOffset: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

// ─── Hook: useBattleCanvas ───────────────────────────────────────────

function useBattleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  battleState: BattleState,
  speed: number,
  isPaused: boolean,
  onBattleEnd?: (result: BattleResult) => void
) {
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const lasersRef = useRef<LaserBeam[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const actionQueueRef = useRef<BattleAction[]>([]);
  const currentActionRef = useRef<BattleAction | null>(null);
  const actionTimerRef = useRef<number>(0);
  const phaseRef = useRef<AnimationPhase>("idle");
  const flashShipsRef = useRef<Map<string, number>>(new Map());
  const destroyedShipsRef = useRef<Set<string>>(new Set());
  const processedActionsRef = useRef<Set<number>>(new Set());
  const battleEndedRef = useRef<boolean>(false);
  const stackPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Resize canvas
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = Math.max(parent.clientHeight, 500);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    // Regenerate stars on resize
    if (starsRef.current.length === 0) {
      starsRef.current = generateStars(w, h, 150);
    }
  }, [canvasRef]);

  // Get stack position on canvas
  const getStackPosition = useCallback(
    (stack: ShipStack, canvasW: number, canvasH: number) => {
      const ATTACKER_START_X = canvasW * 0.12;
      const DEFENDER_START_X = canvasW * 0.68;
      const START_Y = canvasH * 0.18;
      const GAP_X = 90;
      const GAP_Y = Math.max(75, (canvasH * 0.6) / 3);

      const baseX = stack.side === "attacker" ? ATTACKER_START_X : DEFENDER_START_X;
      const x = baseX + stack.col * GAP_X;
      const y = START_Y + stack.row * GAP_Y;
      return { x, y };
    },
    []
  );

  // ─── Drawing Functions ─────────────────────────────────────────────

  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, CANVAS_BG[0]);
    grad.addColorStop(1, CANVAS_BG[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Nebula clouds (subtle)
    const nebulaGrad1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w * 0.4);
    nebulaGrad1.addColorStop(0, "rgba(60, 20, 100, 0.08)");
    nebulaGrad1.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = nebulaGrad1;
    ctx.fillRect(0, 0, w, h);

    const nebulaGrad2 = ctx.createRadialGradient(w * 0.8, h * 0.7, 0, w * 0.8, h * 0.7, w * 0.35);
    nebulaGrad2.addColorStop(0, "rgba(20, 40, 120, 0.06)");
    nebulaGrad2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = nebulaGrad2;
    ctx.fillRect(0, 0, w, h);

    // Stars
    starsRef.current.forEach((star) => {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.brightness * (0.6 + 0.4 * twinkle);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    });
  };

  const drawFrigate = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    colors: (typeof SHIP_COLORS)["attacker"],
    facingRight: boolean
  ) => {
    const s = facingRight ? 1 : -1;
    ctx.save();
    ctx.translate(x, y);

    // Glow effect
    ctx.shadowColor = colors.base;
    ctx.shadowBlur = 8;

    // Main body - triangular fighter
    ctx.beginPath();
    ctx.moveTo(s * 18, 0);
    ctx.lineTo(s * -10, -10);
    ctx.lineTo(s * -6, 0);
    ctx.lineTo(s * -10, 10);
    ctx.closePath();
    ctx.fillStyle = colors.base;
    ctx.fill();
    ctx.strokeStyle = colors.light;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Cockpit
    ctx.beginPath();
    ctx.moveTo(s * 6, 0);
    ctx.lineTo(s * -2, -3);
    ctx.lineTo(s * -2, 3);
    ctx.closePath();
    ctx.fillStyle = colors.light;
    ctx.fill();

    // Engine glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = colors.engine;
    ctx.beginPath();
    ctx.arc(s * -12, -6, 2, 0, Math.PI * 2);
    ctx.arc(s * -12, 6, 2, 0, Math.PI * 2);
    ctx.fillStyle = colors.engine;
    ctx.fill();

    ctx.restore();
  };

  const drawCruiser = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    colors: (typeof SHIP_COLORS)["attacker"],
    facingRight: boolean
  ) => {
    const s = facingRight ? 1 : -1;
    ctx.save();
    ctx.translate(x, y);

    ctx.shadowColor = colors.base;
    ctx.shadowBlur = 10;

    // Main hull
    ctx.beginPath();
    ctx.moveTo(s * 28, 0);
    ctx.lineTo(s * 15, -14);
    ctx.lineTo(s * -15, -14);
    ctx.lineTo(s * -28, -6);
    ctx.lineTo(s * -28, 6);
    ctx.lineTo(s * -15, 14);
    ctx.lineTo(s * 15, 14);
    ctx.closePath();
    ctx.fillStyle = colors.base;
    ctx.fill();
    ctx.strokeStyle = colors.light;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Center stripe
    ctx.beginPath();
    ctx.moveTo(s * 22, 0);
    ctx.lineTo(s * -20, 0);
    ctx.strokeStyle = colors.light;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bridge
    ctx.beginPath();
    ctx.rect(s * 5, -6, 10, 12);
    ctx.fillStyle = colors.dark;
    ctx.fill();
    ctx.strokeStyle = colors.light;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Engines
    ctx.shadowBlur = 14;
    ctx.shadowColor = colors.engine;
    ctx.beginPath();
    ctx.arc(s * -30, -8, 3, 0, Math.PI * 2);
    ctx.arc(s * -30, 8, 3, 0, Math.PI * 2);
    ctx.fillStyle = colors.engine;
    ctx.fill();

    ctx.restore();
  };

  const drawBattleship = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    colors: (typeof SHIP_COLORS)["attacker"],
    facingRight: boolean
  ) => {
    const s = facingRight ? 1 : -1;
    ctx.save();
    ctx.translate(x, y);

    ctx.shadowColor = colors.base;
    ctx.shadowBlur = 12;

    // Main hull - massive
    ctx.beginPath();
    ctx.moveTo(s * 38, 0);
    ctx.lineTo(s * 30, -18);
    ctx.lineTo(s * 10, -22);
    ctx.lineTo(s * -20, -20);
    ctx.lineTo(s * -36, -12);
    ctx.lineTo(s * -38, -4);
    ctx.lineTo(s * -38, 4);
    ctx.lineTo(s * -36, 12);
    ctx.lineTo(s * -20, 20);
    ctx.lineTo(s * 10, 22);
    ctx.lineTo(s * 30, 18);
    ctx.closePath();
    ctx.fillStyle = colors.base;
    ctx.fill();
    ctx.strokeStyle = colors.light;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Armor plates (horizontal lines)
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(s * 25, i * 8);
      ctx.lineTo(s * -25, i * 8);
      ctx.strokeStyle = colors.dark;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Command tower
    ctx.beginPath();
    ctx.rect(s * 8, -10, 14, 20);
    ctx.fillStyle = colors.dark;
    ctx.fill();
    ctx.strokeStyle = colors.light;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Central cannon
    ctx.beginPath();
    ctx.moveTo(s * 38, 0);
    ctx.lineTo(s * 45, 0);
    ctx.strokeStyle = colors.light;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Side cannons
    ctx.beginPath();
    ctx.moveTo(s * 20, -18);
    ctx.lineTo(s * 30, -24);
    ctx.moveTo(s * 20, 18);
    ctx.lineTo(s * 30, 24);
    ctx.strokeStyle = colors.light;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Engines
    ctx.shadowBlur = 16;
    ctx.shadowColor = colors.engine;
    const engineX = s * -40;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(engineX, i * 10, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.engine;
      ctx.fill();
    }

    ctx.restore();
  };

  const drawShip = (
    ctx: CanvasRenderingContext2D,
    stack: ShipStack,
    pos: { x: number; y: number },
    time: number
  ) => {
    const colors = stack.side === "attacker" ? SHIP_COLORS.attacker : SHIP_COLORS.defender;
    const facingRight = stack.side === "attacker";
    const isDestroyed = stack.count <= 0;
    const flashAlpha = flashShipsRef.current.get(stack.id) || 0;

    ctx.save();

    // Fade out destroyed ships
    if (isDestroyed) {
      ctx.globalAlpha = 0.3;
    }

    // Apply flash
    if (flashAlpha > 0) {
      ctx.shadowColor = flashAlpha > 0.5 ? "#ffffff" : colors.base;
      ctx.shadowBlur = 20;
    }

    // Draw ship based on type
    switch (stack.shipType) {
      case "frigate":
        drawFrigate(ctx, pos.x, pos.y, colors, facingRight);
        break;
      case "cruiser":
        drawCruiser(ctx, pos.x, pos.y, colors, facingRight);
        break;
      case "battleship":
        drawBattleship(ctx, pos.x, pos.y, colors, facingRight);
        break;
    }

    // Cross out destroyed ships
    if (isDestroyed) {
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 2;
      const s = facingRight ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(pos.x - s * 20, pos.y - 15);
      ctx.lineTo(pos.x + s * 20, pos.y + 15);
      ctx.moveTo(pos.x + s * 20, pos.y - 15);
      ctx.lineTo(pos.x - s * 20, pos.y + 15);
      ctx.stroke();
      ctx.globalAlpha = 0.3;
    }

    ctx.restore();
  };

  const drawShipCount = (
    ctx: CanvasRenderingContext2D,
    stack: ShipStack,
    pos: { x: number; y: number }
  ) => {
    if (stack.count <= 0) return;

    const text = stack.count.toLocaleString();
    const isDamaged = stack.count < stack.maxCount;

    ctx.save();
    ctx.font = "bold 12px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    // Black outline
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeText(text, pos.x, pos.y - 22);

    // Fill
    ctx.fillStyle = isDamaged ? "#ffdd44" : "#ffffff";
    ctx.fillText(text, pos.x, pos.y - 22);

    ctx.restore();
  };

  const drawHealthBars = (
    ctx: CanvasRenderingContext2D,
    stack: ShipStack,
    pos: { x: number; y: number }
  ) => {
    if (stack.count <= 0) return;

    const barW = 56;
    const barH = 4;
    const barX = pos.x - barW / 2;
    const barY = pos.y + 26;

    ctx.save();

    // Shield bar background
    ctx.fillStyle = "#222222";
    ctx.fillRect(barX, barY - 5, barW, barH);

    // Shield bar
    const shieldPct = Math.max(0, stack.shield / stack.maxShield);
    if (shieldPct > 0) {
      ctx.fillStyle = "#00ccff";
      ctx.fillRect(barX, barY - 5, barW * shieldPct, barH);
    }

    // Structure bar background
    ctx.fillStyle = "#222222";
    ctx.fillRect(barX, barY, barW, barH);

    // Structure bar
    const structPct = Math.max(0, stack.structure / stack.maxStructure);
    const structColor = structPct > 0.3 ? "#44ff44" : "#ff4444";
    if (structPct > 0) {
      ctx.fillStyle = structColor;
      ctx.fillRect(barX, barY, barW * structPct, barH);
    }

    // Bar borders
    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(barX, barY - 5, barW, barH);
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.restore();
  };

  // ─── Effects Drawing ───────────────────────────────────────────────

  const drawLasers = (ctx: CanvasRenderingContext2D, _time: number) => {
    lasersRef.current = lasersRef.current.filter((laser) => {
      laser.life -= 0.05 * speed;
      if (laser.life <= 0) return false;

      const progress = 1 - laser.life / laser.maxLife;
      const alpha = laser.life / laser.maxLife;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (laser.type === "directional") {
        // Instant blue laser beam
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = laser.width;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 15;
        ctx.stroke();

        // Core
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = laser.width * 0.4;
        ctx.stroke();
      } else if (laser.type === "ballistic") {
        // Orange projectile
        const cx = laser.x1 + (laser.x2 - laser.x1) * Math.min(progress * 2, 1);
        const cy = laser.y1 + (laser.y2 - laser.y1) * Math.min(progress * 2, 1);
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ff8800";
        ctx.shadowColor = "#ff8800";
        ctx.shadowBlur = 10;
        ctx.fill();
        // Trail
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(laser.x1, laser.y1);
        ctx.strokeStyle = "rgba(255, 136, 0, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (laser.type === "missile") {
        // Red missile with trail
        const cx = laser.x1 + (laser.x2 - laser.x1) * Math.min(progress * 1.5, 1);
        const cy = laser.y1 + (laser.y2 - laser.y1) * Math.min(progress * 1.5, 1);
        // Trail
        const trailLength = 20;
        const tx = cx - (laser.x2 - laser.x1) * 0.05 * trailLength;
        const ty = cy - (laser.y2 - laser.y1) * 0.05 * trailLength;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = "rgba(255, 50, 50, 0.5)";
        ctx.lineWidth = 4;
        ctx.stroke();
        // Missile body
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ff3333";
        ctx.shadowColor = "#ff3333";
        ctx.shadowBlur = 8;
        ctx.fill();
      } else {
        // Ship-based: purple energy bolt
        const cx = laser.x1 + (laser.x2 - laser.x1) * Math.min(progress * 2.5, 1);
        const cy = laser.y1 + (laser.y2 - laser.y1) * Math.min(progress * 2.5, 1);
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#aa44ff";
        ctx.shadowColor = "#aa44ff";
        ctx.shadowBlur = 12;
        ctx.fill();
        // Energy rings
        ctx.beginPath();
        ctx.arc(cx, cy, 10 + Math.sin(progress * 10) * 4, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(170, 68, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
      return true;
    });
  };

  const drawExplosions = (ctx: CanvasRenderingContext2D, _time: number) => {
    explosionsRef.current = explosionsRef.current.filter((exp) => {
      exp.life -= 0.03 * speed;
      exp.radius += (exp.maxRadius - exp.radius) * 0.1 * speed;
      if (exp.life <= 0) return false;

      const alpha = exp.life / exp.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;

      // Outer glow
      const grad = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.radius);
      grad.addColorStop(0, "rgba(255, 200, 50, 0.8)");
      grad.addColorStop(0.5, "rgba(255, 100, 20, 0.4)");
      grad.addColorStop(1, "rgba(255, 50, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, exp.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
      ctx.fill();

      ctx.restore();
      return true;
    });
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, _time: number) => {
    particlesRef.current = particlesRef.current.filter((p) => {
      p.x += p.vx * speed;
      p.y += p.vy * speed;
      p.life -= 0.02 * speed;
      if (p.life <= 0) return false;

      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    });
  };

  const drawFloatingTexts = (ctx: CanvasRenderingContext2D, _time: number) => {
    floatingTextsRef.current = floatingTextsRef.current.filter((ft) => {
      ft.y += ft.vy * speed;
      ft.life -= 0.015 * speed;
      if (ft.life <= 0) return false;

      const alpha = ft.life / ft.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = ft.text.includes("CRIT")
        ? "bold 16px 'Segoe UI', Arial, sans-serif"
        : "bold 13px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";

      // Outline
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);

      // Fill
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);

      ctx.restore();
      return true;
    });
  };

  // ─── HUD Drawing ───────────────────────────────────────────────────

  const drawTopHUD = (
    ctx: CanvasRenderingContext2D,
    w: number,
    battleState: BattleState
  ) => {
    const hudH = 56;
    const pad = 12;

    // Background
    ctx.fillStyle = "rgba(0, 0, 51, 0.9)";
    ctx.fillRect(0, 0, w, hudH);
    ctx.strokeStyle = "#0066CC";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, hudH);
    ctx.lineTo(w, hudH);
    ctx.stroke();

    // ── Left Commander (Attacker) ──
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    // Portrait placeholder (circle)
    ctx.beginPath();
    ctx.arc(pad + 18, hudH / 2, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#112244";
    ctx.fill();
    ctx.strokeStyle = SHIP_COLORS.attacker.base;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = SHIP_COLORS.attacker.base;
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CMD", pad + 18, hudH / 2);

    // Name
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(battleState.attackerCommander.name, pad + 44, hudH / 2 - 10);

    // Level + Stars
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "12px 'Segoe UI', Arial, sans-serif";
    const stars = "★".repeat(battleState.attackerCommander.stars);
    ctx.fillText(
      `Lv.${battleState.attackerCommander.level} ${stars}`,
      pad + 44,
      hudH / 2 + 8
    );
    ctx.restore();

    // ── VS ──
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffd54f";
    ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
    ctx.shadowColor = "#ffd54f";
    ctx.shadowBlur = 8;
    ctx.fillText("VS", w / 2, hudH / 2);
    ctx.restore();

    // ── Right Commander (Defender) ──
    ctx.save();
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(battleState.defenderCommander.name, w - pad - 44, hudH / 2 - 10);

    // Level + Stars
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "12px 'Segoe UI', Arial, sans-serif";
    const dstars = "★".repeat(battleState.defenderCommander.stars);
    ctx.fillText(
      `${dstars} Lv.${battleState.defenderCommander.level}`,
      w - pad - 44,
      hudH / 2 + 8
    );

    // Portrait placeholder
    ctx.beginPath();
    ctx.arc(w - pad - 18, hudH / 2, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#441111";
    ctx.fill();
    ctx.strokeStyle = SHIP_COLORS.defender.base;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = SHIP_COLORS.defender.base;
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CMD", w - pad - 18, hudH / 2);

    ctx.restore();

    // ── Round Counter ──
    ctx.save();
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(
      `Round ${battleState.currentRound} / ${battleState.maxRounds}`,
      w - pad,
      hudH / 2 - 18
    );
    ctx.restore();
  };

  // ─── Action Processing ─────────────────────────────────────────────

  const processAction = useCallback(
    (action: BattleAction, canvasW: number, canvasH: number) => {
      const allStacks = [
        ...battleState.attackerStacks,
        ...battleState.defenderStacks,
      ];
      const source = allStacks.find((s) => s.id === action.sourceId);
      const target = allStacks.find((s) => s.id === action.targetId);
      if (!source || !target) return;

      const srcPos = getStackPosition(source, canvasW, canvasH);
      const tgtPos = getStackPosition(target, canvasW, canvasH);

      if (action.type === "fire") {
        phaseRef.current = "firing";
        flashShipsRef.current.set(action.sourceId, 1);

        // Create laser/projectile
        const laserColors: Record<string, string> = {
          ballistic: "#ff8800",
          directional: "#00aaff",
          missile: "#ff3333",
          ship_based: "#aa44ff",
        };

        lasersRef.current.push({
          x1: srcPos.x,
          y1: srcPos.y,
          x2: tgtPos.x,
          y2: tgtPos.y,
          color: laserColors[action.projectileType || "directional"],
          width: action.projectileType === "directional" ? 4 : 3,
          life: 1,
          maxLife: 1,
          type: action.projectileType || "directional",
        });
      } else if (action.type === "hit") {
        phaseRef.current = "hitting";
        flashShipsRef.current.set(action.targetId, 1);

        // Floating damage text
        if (action.damage && action.damage > 0) {
          floatingTextsRef.current.push({
            x: tgtPos.x + (Math.random() - 0.5) * 30,
            y: tgtPos.y - 20,
            text: action.isCrit ? `CRIT -${action.damage}!` : `-${action.damage}`,
            color: action.isCrit ? "#ff4444" : "#ffaa44",
            life: 1.5,
            maxLife: 1.5,
            vy: -1.5,
          });
        }

        // Hit particles
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed2 = Math.random() * 3 + 1;
          particlesRef.current.push({
            x: tgtPos.x,
            y: tgtPos.y,
            vx: Math.cos(angle) * speed2,
            vy: Math.sin(angle) * speed2,
            life: 0.6 + Math.random() * 0.4,
            maxLife: 1,
            color: action.isCrit ? "#ff4444" : "#ffaa44",
            size: Math.random() * 3 + 1,
          });
        }
      } else if (action.type === "destroy") {
        phaseRef.current = "exploding";
        destroyedShipsRef.current.add(action.targetId);

        // Big explosion
        explosionsRef.current.push({
          x: tgtPos.x,
          y: tgtPos.y,
          radius: 5,
          maxRadius: 40 + Math.random() * 20,
          life: 1,
          maxLife: 1,
          color: "#ff6600",
        });

        // Many particles
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed2 = Math.random() * 5 + 2;
          particlesRef.current.push({
            x: tgtPos.x,
            y: tgtPos.y,
            vx: Math.cos(angle) * speed2,
            vy: Math.sin(angle) * speed2,
            life: 0.8 + Math.random() * 0.5,
            maxLife: 1.3,
            color: ["#ff6600", "#ffaa00", "#ff4444", "#ffff44"][
              Math.floor(Math.random() * 4)
            ],
            size: Math.random() * 4 + 1,
          });
        }

        // "DESTROYED" text
        floatingTextsRef.current.push({
          x: tgtPos.x,
          y: tgtPos.y,
          text: "DESTROYED!",
          color: "#ff2222",
          life: 2,
          maxLife: 2,
          vy: -2,
        });
      } else if (action.type === "shield_regen") {
        // Shield regen particles
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed2 = Math.random() * 2 + 0.5;
          particlesRef.current.push({
            x: srcPos.x + Math.cos(angle) * 20,
            y: srcPos.y + Math.sin(angle) * 20,
            vx: -Math.cos(angle) * speed2,
            vy: -Math.sin(angle) * speed2,
            life: 0.5 + Math.random() * 0.3,
            maxLife: 0.8,
            color: "#00ccff",
            size: Math.random() * 2 + 1,
          });
        }
      }
    },
    [battleState, getStackPosition, speed]
  );

  // ─── Main Animation Loop ───────────────────────────────────────────

  const animate = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      // Delta time
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const dt = isPaused ? 0 : (time - lastTimeRef.current) * 0.001;
      lastTimeRef.current = time;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // ── Background ──
      drawBackground(ctx, w, h, time * 0.001);

      // ── Update flash ships ──
      flashShipsRef.current.forEach((val, key) => {
        const newVal = val - dt * 3 * speed;
        if (newVal <= 0) flashShipsRef.current.delete(key);
        else flashShipsRef.current.set(key, newVal);
      });

      // ── Process action queue ──
      if (!isPaused && actionQueueRef.current.length > 0) {
        actionTimerRef.current -= dt * speed;
        if (actionTimerRef.current <= 0) {
          const action = actionQueueRef.current.shift();
          if (action) {
            processAction(action, w, h);
            actionTimerRef.current = 0.4; // Delay between actions
          }
        }
      }

      // ── Replenish action queue from battleState ──
      if (!isPaused && actionQueueRef.current.length === 0) {
        const newActions = battleState.actions.filter(
          (a) => !processedActionsRef.current.has(a.timestamp)
        );
        if (newActions.length > 0) {
          for (const a of newActions) {
            processedActionsRef.current.add(a.timestamp);
            actionQueueRef.current.push(a);
          }
        } else if (battleState.isComplete && !battleEndedRef.current) {
          battleEndedRef.current = true;
          setTimeout(() => {
            if (onBattleEnd) {
              const result: BattleResult = {
                winner: battleState.winner || "draw",
                rounds: battleState.currentRound,
                attackerRemaining: battleState.attackerStacks.filter((s) => s.count > 0),
                defenderRemaining: battleState.defenderStacks.filter((s) => s.count > 0),
              };
              onBattleEnd(result);
            }
          }, 1500);
        }
      }

      // ── Draw ships ──
      const allStacks = [
        ...battleState.attackerStacks,
        ...battleState.defenderStacks,
      ];
      for (const stack of allStacks) {
        const pos = getStackPosition(stack, w, h);
        stackPositionsRef.current.set(stack.id, pos);
        drawShip(ctx, stack, pos, time * 0.001);
        drawShipCount(ctx, stack, pos);
        drawHealthBars(ctx, stack, pos);
      }

      // ── Draw effects ──
      drawLasers(ctx, time * 0.001);
      drawExplosions(ctx, time * 0.001);
      drawParticles(ctx, time * 0.001);
      drawFloatingTexts(ctx, time * 0.001);

      // ── HUD ──
      drawTopHUD(ctx, w, battleState);

      // ── Bottom control bar ──
      drawBottomBar(ctx, w, h, isPaused, speed);

      animFrameRef.current = requestAnimationFrame(animate);
    },
    [
      canvasRef,
      battleState,
      speed,
      isPaused,
      onBattleEnd,
      drawBackground,
      drawShip,
      drawShipCount,
      drawHealthBars,
      drawLasers,
      drawExplosions,
      drawParticles,
      drawFloatingTexts,
      drawTopHUD,
      processAction,
      getStackPosition,
    ]
  );

  // Bottom bar drawing
  const drawBottomBar = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    paused: boolean,
    _speed: number
  ) => {
    const barH = 40;
    const barY = h - barH;

    ctx.fillStyle = "rgba(0, 0, 51, 0.9)";
    ctx.fillRect(0, barY, w, barH);
    ctx.strokeStyle = "#0066CC";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, barY);
    ctx.lineTo(w, barY);
    ctx.stroke();

    // Time display
    ctx.fillStyle = "#ffffff";
    ctx.font = "13px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("00:15", w - 16, barY + barH / 2);

    // Status text
    ctx.textAlign = "center";
    ctx.fillStyle = paused ? "#ffaa44" : "#44ff44";
    ctx.fillText(paused ? "PAUSED" : "PLAYING", w / 2, barY + barH / 2);
  };

  // ─── Setup & Cleanup ───────────────────────────────────────────────

  useEffect(() => {
    resizeCanvas();
    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);

    // Generate stars
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        starsRef.current = generateStars(parent.clientWidth, parent.clientHeight, 150);
      }
    }

    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [resizeCanvas, animate]);

  // Reset when battleState changes significantly
  useEffect(() => {
    processedActionsRef.current.clear();
    actionQueueRef.current = [];
    destroyedShipsRef.current.clear();
    battleEndedRef.current = false;
    currentActionRef.current = null;
  }, [battleState.attackerCommander.name, battleState.defenderCommander.name]);
}

// ─── Main Component ──────────────────────────────────────────────────

export default function Go2BattleCanvas({
  battleState,
  onBattleEnd,
  onExit,
}: Go2BattleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const speedOptions = [0.5, 1, 2, 4];

  useBattleCanvas(canvasRef, battleState, speed, isPaused, onBattleEnd);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 500,
        background: "#000011",
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
          display: "block",
        }}
      />

      {/* Overlay Controls (bottom bar) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "0 16px",
          background: "rgba(0, 0, 51, 0.85)",
          borderTop: "1px solid #0066CC",
          zIndex: 10,
        }}
      >
        {/* Pause/Play */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          style={{
            background: "#0033AA",
            border: "1px solid #0066FF",
            color: "#ffffff",
            padding: "4px 14px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#0044CC";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#0033AA";
          }}
        >
          {isPaused ? "▶ Play" : "⏸ Pause"}
        </button>

        {/* Speed */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: "#aaaaaa", fontSize: 11 }}>Speed:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{
              background: "#0033AA",
              border: "1px solid #0066FF",
              color: "#ffffff",
              padding: "3px 8px",
              borderRadius: 4,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {speedOptions.map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>
        </div>

        {/* Skip */}
        <button
          onClick={() => {
            /* Skip to end - handled by parent */
          }}
          style={{
            background: "#0033AA",
            border: "1px solid #0066FF",
            color: "#ffffff",
            padding: "4px 14px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#0044CC";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#0033AA";
          }}
        >
          ⏭ Skip
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Round info */}
        <span style={{ color: "#ffd54f", fontSize: 12, fontWeight: "bold" }}>
          Round {battleState.currentRound} / {battleState.maxRounds}
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Exit */}
        <button
          onClick={onExit}
          style={{
            background: "#660000",
            border: "1px solid #ff4444",
            color: "#ffffff",
            padding: "4px 14px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#880000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#660000";
          }}
        >
          ✕ Exit
        </button>
      </div>

      {/* Winner Overlay */}
      {battleState.isComplete && battleState.winner && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.8)",
            border: "2px solid #ffd54f",
            borderRadius: 12,
            padding: "24px 48px",
            textAlign: "center",
            zIndex: 20,
            animation: "fadeIn 0.5s ease-out",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#ffd54f",
              textShadow: "0 0 20px rgba(255, 213, 79, 0.5)",
              marginBottom: 8,
            }}
          >
            {battleState.winner === "attacker"
              ? `${battleState.attackerCommander.name} WINS!`
              : battleState.winner === "defender"
                ? `${battleState.defenderCommander.name} WINS!`
                : "DRAW!"}
          </div>
          <div style={{ fontSize: 14, color: "#aaaaaa" }}>
            Battle ended in Round {battleState.currentRound}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
