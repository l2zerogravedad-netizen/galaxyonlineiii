'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Gift, Clock, Star, Zap, Shield, Rocket } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface Prize {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  weight: number; // probability weight
}

// ============================================================================
// Constants
// ============================================================================

const PRIZES: Prize[] = [
  { id: 'credits', name: '10,000 Credits', icon: <Star size={16} />, color: '#fbbf24', weight: 30 },
  { id: 'crystals', name: '500 Crystals', icon: <Zap size={16} />, color: '#22d3ee', weight: 20 },
  { id: 'metal', name: '5,000 Metal', icon: <Shield size={16} />, color: '#a8a29e', weight: 20 },
  { id: 'energy', name: '3,000 Energy', icon: <Zap size={16} />, color: '#f59e0b', weight: 15 },
  { id: ' commander', name: 'Commander Card', icon: <Rocket size={16} />, color: '#ef4444', weight: 10 },
  { id: 'jackpot', name: 'JACKPOT!', icon: <Gift size={16} />, color: '#a855f7', weight: 5 },
];

const SPIN_DURATION = 3000; // ms
const ROTATIONS = 5;

// ============================================================================
// Weighted Random Selector
// ============================================================================

function weightedRandom(prizes: Prize[]): Prize {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  for (const prize of prizes) {
    random -= prize.weight;
    if (random <= 0) return prize;
  }
  return prizes[0];
}

// ============================================================================
// Component
// ============================================================================

export function DailyRoulette() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(true);
  const animTimerRef = useRef<number | null>(null);

  const clearAnimTimer = useCallback(() => {
    if (animTimerRef.current !== null) {
      clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }
  }, []);

  const spin = useCallback(() => {
    if (spinning || !canSpin) return;

    clearAnimTimer();
    setSpinning(true);
    setResult(null);

    const winIndex = Math.floor(Math.random() * PRIZES.length);
    const segmentAngle = 360 / PRIZES.length;
    const finalRotation = rotation + ROTATIONS * 360 + winIndex * segmentAngle + Math.random() * segmentAngle;

    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      const currentRotation = rotation + (finalRotation - rotation) * eased;
      setRotation(currentRotation);

      if (progress < 1) {
        animTimerRef.current = window.setTimeout(tick, 16);
      } else {
        setSpinning(false);
        setResult(PRIZES[winIndex]);
        setCanSpin(false);
        animTimerRef.current = null;
      }
    };

    tick();
  }, [spinning, canSpin, rotation, clearAnimTimer]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => clearAnimTimer();
  }, [clearAnimTimer]);

  const segmentAngle = 360 / PRIZES.length;

  return (
    <div className="flex flex-col items-center gap-4 p-4 rounded-xl border border-amber-500/30 bg-stone-900/90">
      <h3 className="text-amber-300 font-bold text-sm flex items-center gap-2">
        <Gift size={16} />
        Daily Roulette
      </h3>

      {/* Roulette Wheel */}
      <div className="relative w-48 h-48">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{ transform: `rotate(${-rotation}deg)`, transition: spinning ? 'none' : 'transform 0.5s ease-out' }}
        >
          {PRIZES.map((prize, i) => {
            const startAngle = (i * segmentAngle * Math.PI) / 180;
            const endAngle = ((i + 1) * segmentAngle * Math.PI) / 180;
            const x1 = 100 + 90 * Math.cos(startAngle);
            const y1 = 100 + 90 * Math.sin(startAngle);
            const x2 = 100 + 90 * Math.cos(endAngle);
            const y2 = 100 + 90 * Math.sin(endAngle);

            return (
              <g key={prize.id}>
                <path
                  d={`M 100 100 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`}
                  fill={prize.color}
                  opacity={0.7}
                  stroke="#1c1917"
                  strokeWidth={1}
                />
                <text
                  x={100 + 60 * Math.cos(startAngle + segmentAngle * Math.PI / 360)}
                  y={100 + 60 * Math.sin(startAngle + segmentAngle * Math.PI / 360)}
                  fill="white"
                  fontSize={8}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${i * segmentAngle + segmentAngle / 2}, ${100 + 60 * Math.cos(startAngle + segmentAngle * Math.PI / 360)}, ${100 + 60 * Math.sin(startAngle + segmentAngle * Math.PI / 360)})`}
                >
                  {prize.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="15" fill="#1c1917" stroke="#fbbf24" strokeWidth={2} />
        </svg>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-500" />
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={spinning || !canSpin}
        className={`
          px-6 py-2 rounded-lg font-bold text-sm transition-all
          ${spinning || !canSpin
            ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
            : 'bg-gradient-to-b from-amber-500 to-amber-700 text-white hover:from-amber-400 hover:to-amber-600 active:scale-95 shadow-lg shadow-amber-500/25'
          }
        `}
      >
        {spinning ? 'Spinning...' : canSpin ? 'SPIN!' : 'Come back tomorrow'}
      </button>

      {/* Result */}
      {result && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 border border-amber-500/30">
          <span style={{ color: result.color }}>{result.icon}</span>
          <span className="text-amber-200 text-sm font-bold">{result.name}</span>
        </div>
      )}

      {/* Timer */}
      <div className="flex items-center gap-1 text-stone-500 text-xs">
        <Clock size={12} />
        <span>Resets in 23:59:59</span>
      </div>
    </div>
  );
}
