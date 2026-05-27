'use client';

import { useState } from 'react';
import {
  type Commander,
  calculateStatsAtLevel,
  getNextLevelBonus,
  getExpForLevel,
} from './go2-commander-data';

/* ────────────────────────── helpers ────────────────────────── */

function StatIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    accuracy: '🎯',
    speed: '🚀',
    dodge: '✈️',
    electron: '⚡',
  };
  return <span>{icons[type] ?? '•'}</span>;
}

function StatLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    accuracy: 'Acc',
    speed: 'Spd',
    dodge: 'Ddg',
    electron: 'Elec',
  };
  return <span>{labels[type] ?? type}</span>;
}

/* ────────────────────────── xp bar ────────────────────────── */

function XpBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min(100, Math.max(0, (current / max) * 100));
  const filled = Math.floor(pct / 10);
  const empty = 10 - filled;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-[2px]">
        {Array.from({ length: filled }, (_, i) => (
          <div
            key={`f-${i}`}
            className="h-3 flex-1 border border-[#0066CC]"
            style={{ backgroundColor: '#0066CC' }}
          />
        ))}
        {Array.from({ length: empty }, (_, i) => (
          <div
            key={`e-${i}`}
            className="h-3 flex-1 border border-[#0066CC]"
            style={{ backgroundColor: 'transparent' }}
          />
        ))}
      </div>
      <div className="text-right text-[10px] font-bold text-[#64b5f6]">
        {pct.toFixed(0)}%
      </div>
    </div>
  );
}

/* ────────────────────────── main component ────────────────────────── */

interface Go2CommanderLevelProps {
  commander: Commander;
  onLevelUp?: () => void;
  onAddExp?: (amount: number) => void;
}

export function Go2CommanderLevel({ commander, onLevelUp, onAddExp }: Go2CommanderLevelProps) {
  const [showAddExp, setShowAddExp] = useState(false);
  const [expInput, setExpInput] = useState('');

  // Current stats at current level
  const currentStats = calculateStatsAtLevel(commander, commander.level);

  // Next level stats preview
  const nextLevelStats =
    commander.level < 50
      ? calculateStatsAtLevel(commander, commander.level + 1)
      : null;

  // Level bonus (raw growth values)
  const levelBonus = getNextLevelBonus(commander);

  // XP for next level
  const xpForNext = getExpForLevel(commander.rarity, commander.level);

  // XP progress
  const xpPct = Math.min(100, (commander.exp / xpForNext) * 100);

  const handleTrain = () => {
    onAddExp?.(Math.floor(xpForNext * 0.25));
  };

  const handleUseExpCard = () => {
    setShowAddExp(true);
  };

  const handleSubmitExp = () => {
    const val = parseInt(expInput, 10);
    if (!isNaN(val) && val > 0) {
      onAddExp?.(val);
      setExpInput('');
      setShowAddExp(false);
    }
  };

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border p-4"
      style={{
        backgroundColor: '#000044',
        borderColor: '#0066CC',
      }}
    >
      {/* ── header ── */}
      <div
        className="-mx-4 -mt-4 border-b px-4 py-2 text-center text-xs font-bold uppercase tracking-widest"
        style={{
          backgroundColor: '#0066CC',
          borderColor: '#0066CC',
          color: '#ffffff',
        }}
      >
        LEVEL UP
      </div>

      {/* ── current level ── */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-[#90caf9]">Current Level:</span>
        <span
          className="rounded px-3 py-1 text-xl font-extrabold"
          style={{
            backgroundColor: '#0066CC',
            color: '#ffd54f',
          }}
        >
          {commander.level}
        </span>
        {commander.level >= 50 && (
          <span className="text-[10px] font-bold text-[#ffd54f]">MAX</span>
        )}
      </div>

      {/* ── xp bar ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#90caf9]">XP:</span>
          <span className="text-[11px] font-bold text-white">
            {commander.exp} / {xpForNext}
          </span>
        </div>
        <XpBar current={commander.exp} max={xpForNext} />
      </div>

      {/* ── current stats ── */}
      <div className="grid grid-cols-4 gap-2">
        {(
          [
            { key: 'accuracy', icon: '🎯', label: 'Acc', val: currentStats.accuracy },
            { key: 'speed', icon: '🚀', label: 'Spd', val: currentStats.speed },
            { key: 'dodge', icon: '✈️', label: 'Ddg', val: currentStats.dodge },
            { key: 'electron', icon: '⚡', label: 'Elec', val: currentStats.electron },
          ] as const
        ).map((s) => (
          <div
            key={s.key}
            className="flex flex-col items-center gap-0.5 rounded border p-1.5"
            style={{
              backgroundColor: '#000033',
              borderColor: '#0066CC66',
            }}
          >
            <span className="text-base">{s.icon}</span>
            <span className="text-sm font-extrabold text-white">{s.val}</span>
            <span className="text-[8px] uppercase text-white/50">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── next level bonus ── */}
      {commander.level < 50 && (
        <div
          className="flex flex-col gap-2 rounded border p-2.5"
          style={{
            backgroundColor: '#000033',
            borderColor: '#0066CC44',
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#ffd54f]">
            Next Level Bonus
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { key: 'accuracy', icon: '🎯', label: 'Acc', val: levelBonus.accuracy },
                { key: 'speed', icon: '🚀', label: 'Spd', val: levelBonus.speed },
                { key: 'dodge', icon: '✈️', label: 'Ddg', val: levelBonus.dodge },
                { key: 'electron', icon: '⚡', label: 'Elec', val: levelBonus.electron },
              ] as const
            ).map((s) => (
              <div key={s.key} className="flex items-center gap-1.5 text-[11px]">
                <span>{s.icon}</span>
                <span className="font-semibold text-[#90caf9]">{s.label}</span>
                <span className="font-bold text-[#ffd54f]">+{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── preview at next level ── */}
      {nextLevelStats && (
        <div
          className="flex flex-col gap-1.5 rounded border p-2.5"
          style={{
            backgroundColor: '#000033',
            borderColor: '#0066CC44',
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#64b5f6]">
            Preview at Level {commander.level + 1}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {(
              [
                { key: 'accuracy', val: nextLevelStats.accuracy },
                { key: 'speed', val: nextLevelStats.speed },
                { key: 'dodge', val: nextLevelStats.dodge },
                { key: 'electron', val: nextLevelStats.electron },
              ] as const
            ).map((s) => (
              <div key={s.key} className="text-center text-[11px] font-bold text-white/70">
                {s.val}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── add exp input ── */}
      {showAddExp && (
        <div
          className="flex flex-col gap-2 rounded border p-2.5"
          style={{
            backgroundColor: '#000033',
            borderColor: '#0066CC',
          }}
        >
          <div className="text-[10px] font-bold text-[#90caf9]">Enter EXP Amount</div>
          <div className="flex gap-2">
            <input
              type="number"
              value={expInput}
              onChange={(e) => setExpInput(e.target.value)}
              placeholder="EXP amount"
              className="flex-1 rounded border px-2 py-1 text-xs text-white outline-none"
              style={{
                backgroundColor: '#000022',
                borderColor: '#0066CC',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitExp()}
            />
            <button
              onClick={handleSubmitExp}
              className="rounded px-3 py-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: '#0066CC' }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* ── action buttons ── */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleTrain}
          disabled={commander.level >= 50}
          className="rounded border-2 py-2.5 text-[11px] font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{
            backgroundColor: '#0066CC',
            borderColor: '#0066CC',
          }}
        >
          Train with EXP
        </button>
        <button
          onClick={handleUseExpCard}
          disabled={commander.level >= 50}
          className="rounded border-2 py-2.5 text-[11px] font-bold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{
            backgroundColor: '#000033',
            borderColor: '#0066CC',
            color: '#90caf9',
          }}
        >
          Use EXP Card
        </button>
      </div>
    </div>
  );
}
