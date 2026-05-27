'use client';

import { useEffect, useRef, useState } from 'react';

interface Ship {
  id: string;
  count: number;
  structure: number;
  shield: number;
  side: 'attacker' | 'defender';
}

const CELL = 60;
const GRID_W = 10;
const GRID_H = 6;

function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number, side: 'attacker' | 'defender', structure: number, shield: number, count: number) {
  const cx = x + CELL / 2;
  const cy = y + CELL / 2;
  const color = side === 'attacker' ? '#4488ff' : '#ff4444';
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  if (side === 'attacker') {
    ctx.moveTo(15, 0); ctx.lineTo(-10, -12); ctx.lineTo(-10, 12);
  } else {
    ctx.moveTo(-15, 0); ctx.lineTo(10, -12); ctx.lineTo(10, 12);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Engine glow
  ctx.beginPath();
  ctx.arc(side === 'attacker' ? -12 : 12, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ffaa00';
  ctx.fill();
  // Count
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(count.toLocaleString(), 0, -16);
  // Shield bar
  ctx.fillStyle = '#333';
  ctx.fillRect(-18, 14, 36, 3);
  ctx.fillStyle = '#00ccff';
  ctx.fillRect(-18, 14, 36 * (shield / 100), 3);
  // HP bar
  ctx.fillStyle = '#333';
  ctx.fillRect(-18, 19, 36, 3);
  const hpColor = structure > 50 ? '#44ff44' : structure > 20 ? '#ffdd44' : '#ff4444';
  ctx.fillStyle = hpColor;
  ctx.fillRect(-18, 19, 36 * (structure / 100), 3);
  ctx.restore();
}

export function Go2BattleSimple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  const ships = useRef<Ship[]>([]);
  if (ships.current.length === 0) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        ships.current.push({ id: `a_${r}_${c}`, count: 1000 + Math.floor(Math.random() * 500), structure: 100, shield: 100, side: 'attacker' });
        ships.current.push({ id: `d_${r}_${c}`, count: 1000 + Math.floor(Math.random() * 500), structure: 100, shield: 100, side: 'defender' });
      }
    }
  }

  const frames = useRef<{round: number; phase: string}[]>([]);
  if (frames.current.length === 0) {
    for (let r = 1; r <= 20; r++) {
      frames.current.push({ round: r, phase: r <= 3 ? 'move' : r === 20 ? 'end' : 'attack' });
    }
  }

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentFrame(f => f >= 19 ? f : f + 1);
    }, 2000 / speed);
    return () => clearInterval(timer);
  }, [isPaused, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, GRID_W * CELL, GRID_H * CELL);

    // Grid
    ctx.strokeStyle = '#0066cc22';
    for (let x = 0; x <= GRID_W; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, GRID_H * CELL); ctx.stroke(); }
    for (let y = 0; y <= GRID_H; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(GRID_W * CELL, y * CELL); ctx.stroke(); }

    // Center line
    ctx.strokeStyle = '#0066cc88';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(GRID_W * CELL / 2, 0); ctx.lineTo(GRID_W * CELL / 2, GRID_H * CELL); ctx.stroke();
    ctx.setLineDash([]);

    // Ships
    const attackers = ships.current.filter(s => s.side === 'attacker');
    const defenders = ships.current.filter(s => s.side === 'defender');
    attackers.forEach((ship, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      drawShip(ctx, col * CELL + CELL, row * CELL + CELL + row * 10, 'attacker', ship.structure, ship.shield, ship.count);
    });
    defenders.forEach((ship, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      drawShip(ctx, (GRID_W - 3 + col) * CELL, row * CELL + CELL + row * 10, 'defender', ship.structure, ship.shield, ship.count);
    });

    // Phase indicator
    const frame = frames.current[currentFrame] || frames.current[0];
    ctx.fillStyle = '#00000088';
    ctx.fillRect(GRID_W * CELL / 2 - 50, 5, 100, 20);
    ctx.fillStyle = frame.phase === 'move' ? '#4488ff' : frame.phase === 'attack' ? '#ff4444' : '#44ff44';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(frame.phase.toUpperCase(), GRID_W * CELL / 2, 20);
  }, [currentFrame]);

  const frame = frames.current[currentFrame] || frames.current[0];

  return (
    <div className="flex flex-col items-center" style={{ background: '#000011', minHeight: '100vh' }}>
      <div className="w-full flex justify-between items-center p-4 bg-[#000033] border-b-2 border-[#0066CC]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg border-2 border-[#4caf50] bg-[#0a1428] flex items-center justify-center text-[#4caf50] font-black text-lg">R</div>
          <div><div className="text-white font-bold text-sm">Reggie</div><div className="text-[#ffd54f] text-xs">Lv.5 &#9733;&#9733;</div></div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-[#ffd54f]">VS</div>
          <div className="text-[#90caf9] text-xs">Round {frame?.round} / 20</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right"><div className="text-white font-bold text-sm">Gastaf</div><div className="text-[#ffd54f] text-xs">Lv.38 &#9733;&#9733;&#9733;&#9733;&#9733;</div></div>
          <div className="w-12 h-12 rounded-lg border-2 border-[#ff4444] bg-[#1a0508] flex items-center justify-center text-[#ff4444] font-black text-lg">G</div>
        </div>
      </div>

      <canvas ref={canvasRef} width={GRID_W * CELL} height={GRID_H * CELL} className="border border-[#0066CC33] my-4" style={{ maxWidth: '100%', height: 'auto' }} />

      <div className="w-full flex justify-center gap-4 p-4 bg-[#000033] border-t-2 border-[#0066CC]">
        <button onClick={() => setIsPaused(p => !p)} className="px-6 py-2 bg-[#0033AA] border-2 border-[#0066CC] rounded-lg text-white font-bold hover:bg-[#0044CC] text-sm">{isPaused ? '&#9654; Play' : '&#9208; Pause'}</button>
        <select value={speed} onChange={e => setSpeed(Number(e.target.value))} className="px-4 py-2 bg-[#0033AA] border-2 border-[#0066CC] rounded-lg text-white text-sm">
          <option value={0.5}>0.5x</option><option value={1}>1x</option><option value={2}>2x</option><option value={4}>4x</option>
        </select>
      </div>
    </div>
  );
}

export default Go2BattleSimple;
