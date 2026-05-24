'use client';

import type { BuildingDefinition } from './types';
import { AssetImage } from './AssetImage';

interface BuildingCardProps {
  building: BuildingDefinition | null;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}

const statusLabel: Record<string, string> = {
  active: '',
  locked: '🔒',
  empty: '+',
  upgrading: '⏳',
};

export function BuildingCard({ building, selected, onSelect, compact }: BuildingCardProps) {
  if (!building || building.status === 'empty') {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`building-slot building-slot-empty ${selected ? 'ring-2 ring-cyan-400' : ''}`}
      >
        <span className="text-2xl text-cyan-400/50">+</span>
        <span className="text-[9px] uppercase tracking-wider text-cyan-400/60 mt-1">Construir</span>
      </button>
    );
  }

  const locked = building.status === 'locked';
  const upgrading = building.status === 'upgrading';

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={locked}
      className={`building-slot relative ${selected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950' : ''} ${
        locked ? 'opacity-60 cursor-not-allowed' : ''
      } ${upgrading ? 'animate-pulse' : ''}`}
    >
      <AssetImage
        src={building.image}
        alt={building.name}
        className={compact ? 'w-12 h-12' : 'w-16 h-16 md:w-20 md:h-20'}
        glow="cyan"
        icon="🏗"
      />
      {building.level > 0 && (
        <span className="absolute -top-1 -right-1 z-20 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center border border-amber-200">
          {building.level}
        </span>
      )}
      {locked && (
        <span className="absolute inset-0 flex items-center justify-center bg-slate-950/70 rounded-lg text-xl">
          🔒
        </span>
      )}
      {upgrading && (
        <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-amber-500/90 text-black py-0.5 rounded-b-lg uppercase font-bold">
          Mejorando
        </span>
      )}
      {!compact && (
        <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] text-cyan-200/80 truncate px-1">
          {building.name}
        </span>
      )}
      {statusLabel[building.status] && building.status !== 'active' && !locked && !upgrading && (
        <span className="absolute top-1 left-1 text-xs">{statusLabel[building.status]}</span>
      )}
    </button>
  );
}
