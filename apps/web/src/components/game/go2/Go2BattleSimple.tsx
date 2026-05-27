'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ─── TYPES ─── */
interface ShipStack {
  id: string;
  count: number;
  structure: number;
  shield: number;
  row: number;
  col: number;
  side: 'attacker' | 'defender';
}

interface BattleFrame {
  round: number;
  phase: 'move' | 'attack' | 'end';
  attackerShips: ShipStack[];
  defenderShips: ShipStack[];
}

/* ─── CONSTANTS ─── */
const CELL = 60;
const GRID_W = 10;
const GRID_H = 6;
const CANVAS_W = GRID_W * CELL;
const CANVAS_H = GRID_H * CELL;

/* ─── Demo Battle Frames ─── */
function generateFrames(): BattleFrame[] {
  const attacker: ShipStack[] = [];
  const defender: ShipStack[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      attacker.push({ id: `a_${r}_${c}`, count: 1000 + Math.floor(Math.random() * 500), structure: 100, shield: 100, row: r, col: c, side: 'attacker' });
      defender.push({ id: `d_${r}_${c}`, count: 1000 + Math.floor(Math.random() * 500), structure: 100, shield: 100, row: r, col: c, side: 'defender' });
    }
  }
  const frames: BattleFrame[] = [];
  for (let round = 1; round <= 20; round++) {
    frames.push({ round, phase: round <= 3 ? 'move' : round === 20 ? 'end' : 'attack', attackerShips: attacker.map(s => ({ ...s })), defenderShips: defender.map(s => ({ ...s })) });
  }
  return frames;
}

/* ─── Draw Ship ─── */
function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number, side: 'attacker' | 'defender', structure: number, shield: number, count: number) {
  const cx = x + CELL / 2;
  const cy = y + CELL / 2;
  const color = side === 'attacker' ? '#4488ff' : '#ff4444';
  const destroyed = structure <= 0;

  ctx.save();
  ctx.translate(cx, cy);

  // Ship body (triangle)
  ctx.beginPath();
  if (side === 'attacker') {
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -12);
    ctx.lineTo(-10, 12);
  } else {
    ctx.moveTo(-15, 0);
    ctx.lineTo(10, -12);
    ctx.lineTo(10, 12);
  }
  ctx.closePath();
  ctx.fillStyle = destroyed ? '#333' : color;
  ctx.fill();
  ctx.strokeStyle = destroyed ? '#555' : '#fff';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Engine glow
  if (!destroyed) {
    ctx.beginPath();
    if (side === 'attacker') {
      ctx.arc(-12, 0, 3, 0, Math.PI * 2);
    } else {
      ctx.arc(12, 0, 3, 0, Math.PI * 2);
    }
    ctx.fillStyle = '#ffaa00';
    ctx.fill();
  }

  // Count label
  ctx.fillStyle = destroyed ? '#555' : '#fff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(count.toLocaleString(), 0, -16);

  // Shield bar
  if (!destroyed) {
    ctx.fillStyle = '#333';
    ctx.fillRect(-18, 14, 36, 3);
    ctx.fillStyle = '#00ccff';
    ctx.fillRect(-18, 14, 36 * (shield / 100), 3);

    // Structure bar
    ctx.fillStyle = '#333';
    ctx.fillRect(-18, 19, 36, 3);
    const hpColor = structure > 50 ? '#44ff44' : structure > 20 ? '#ffdd44' : '#ff4444';
    ctx.fillStyle = hpColor;
    ctx.fillRect(-18, 19, 36 * (structure / 100), 3);
  }

  ctx.restore();
}

/* ─── Draw Grid ─── */
function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#0066cc22';
  ctx.lineWidth = 1;
  for (let x = 0; x <= GRID_W; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, CANVAS_H);
    ctx.stroke();
  }
  for (let y = 0; y <= GRID_H; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(CANVAS_W, y * CELL);
    ctx.stroke();
  }
}

/* ─── Draw Laser ─── */
function drawLaser(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, progress: number) {
  const sx = fromX + CELL / 2;
  const sy = fromY + CELL / 2;
  const ex = toX + CELL / 2;
  const ey = toY + CELL / 2;
  const cx = sx + (ex - sx) * progress;
  const cy = sy + (ey - sy) * progress;

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(cx, cy);
  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

/* ─── Main Canvas Component ─── */
export function Go2BattleSimple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = useRef(generateFrames());
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const laserProgress = useRef(0);

  const frame = frames.current[currentFrame] || frames.current[0];

  // Animation loop
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentFrame(f => {
        if (f >= frames.current.length - 1) return f;
        return f + 1;
      });
    }, 2000 / speed);
    return () => clearInterval(timer);
  }, [isPaused, speed]);

  // Laser animation
  useEffect(() => {
    let animId: number;
    const animate = () => {
      laserProgress.current += 0.05;
      if (laserProgress.current > 1) laserProgress.current = 0;
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid
    drawGrid(ctx);

    // Center line
    ctx.strokeStyle = '#0066cc88';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 0);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Lasers (during attack phase)
    if (frame.phase === 'attack' && laserProgress.current > 0) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const ax = c * CELL + CELL;
          const ay = r * CELL + CELL + (r * 10);
          const dx = (GRID_W - 3 + c) * CELL;
          const dy = r * CELL + CELL + (r * 10);
          drawLaser(ctx, ax, ay, dx, dy, laserProgress.current);
        }
      }
    }

    // Attacker ships
    frame.attackerShips.forEach((ship, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      drawShip(ctx, col * CELL + CELL, row * CELL + CELL + (row * 10), 'attacker', ship.structure, ship.shield, ship.count);
    });

    // Defender ships
    frame.defenderShips.forEach((ship, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      drawShip(ctx, (GRID_W - 3 + col) * CELL, row * CELL + CELL + (row * 10), 'defender', ship.structure, ship.shield, ship.count);
    });

    // Phase indicator
    ctx.fillStyle = '#00000088';
    ctx.fillRect(CANVAS_W / 2 - 50, 5, 100, 20);
    ctx.fillStyle = frame.phase === 'move' ? '#4488ff' : frame.phase === 'attack' ? '#ff4444' : '#44ff44';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(frame.phase.toUpperCase(), CANVAS_W / 2, 20);

  }, [frame]);

  return (
    <div className="flex flex-col items-center" style={{ background: '#000011', minHeight: '100vh' }}>
      {/* HUD */}
      <div className="w-full flex justify-between items-center p-4 bg-[#000033] border-b-2 border-[#0066CC]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg border-2 border-[#4caf50] bg-[#0a1428] flex items-center justify-center text-[#4caf50] font-black text-lg">R</div>
          <div>
            <div className="text-white font-bold text-sm">Reggie</div>
            <div className="text-[#ffd54f] text-xs">Lv.5 ★★</div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-[#ffd54f]">VS</div>
          <div className="text-[#90caf9] text-xs">Round {frame.round} / 20</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-white font-bold text-sm">Gastaf</div>
            <div className="text-[#ffd54f] text-xs">Lv.38 ★★★★★</div>
          </div>
          <div className="w-12 h-12 rounded-lg border-2 border-[#ff4444] bg-[#1a0508] flex items-center justify-center text-[#ff4444] font-black text-lg">G</div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="border border-[#0066CC33] my-4"
        style={{ maxWidth: '100%', height: 'auto' }}
      />

      {/* Controls */}
      <div className="w-full flex justify-center gap-4 p-4 bg-[#000033] border-t-2 border-[#0066CC]">
        <button onClick={() => setIsPaused(p => !p)} className="px-6 py-2 bg-[#0033AA] border-2 border-[#0066CC] rounded-lg text-white font-bold hover:bg-[#0044CC] text-sm">
          {isPaused ? '▶ Play' : '⏸ Pause'}
        </button>
        <select value={speed} onChange={e => setSpeed(Number(e.target.value))} className="px-4 py-2 bg-[#0033AA] border-2 border-[#0066CC] rounded-lg text-white text-sm">
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
        <button onClick={() => setCurrentFrame(frames.current.length - 1)} className="px-6 py-2 bg-[#0033AA] border-2 border-[#0066CC] rounded-lg text-white font-bold hover:bg-[#0044CC] text-sm">
          ⏭ Skip
        </button>
      </div>
    </div>
  );
}

export default Go2BattleSimple;
