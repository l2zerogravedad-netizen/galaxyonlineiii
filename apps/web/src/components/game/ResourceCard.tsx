'use client';

import { AssetImage } from './AssetImage';

interface ResourceCardProps {
  label: string;
  amount: number;
  capacity?: number;
  production?: number;
  iconSrc: string;
  iconFallback: string;
  accent: 'cyan' | 'purple' | 'gold';
}

const accentBorder = {
  cyan: 'border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.12)]',
  purple: 'border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.12)]',
  gold: 'border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.12)]',
};

const accentText = {
  cyan: 'text-cyan-300',
  purple: 'text-purple-300',
  gold: 'text-amber-300',
};

export function ResourceCard({
  label,
  amount,
  capacity,
  production,
  iconSrc,
  iconFallback,
  accent,
}: ResourceCardProps) {
  return (
    <div className={`game-panel flex items-center gap-3 px-3 py-2 border ${accentBorder[accent]}`}>
      <AssetImage
        src={iconSrc}
        alt={label}
        className="w-10 h-10 shrink-0"
        glow={accent}
        icon={iconFallback}
      />
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] uppercase tracking-wider ${accentText[accent]}`}>{label}</p>
        <p className="text-lg font-bold tabular-nums truncate">{Math.floor(amount).toLocaleString()}</p>
        {capacity != null && capacity > 0 && (
          <p className="text-[10px] text-slate-500">/ {capacity.toLocaleString()}</p>
        )}
        {production != null && production > 0 && (
          <p className="text-[10px] text-emerald-400">+{production.toLocaleString()}/h</p>
        )}
      </div>
    </div>
  );
}
