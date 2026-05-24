'use client';

import type { PlayerData } from './types';

interface GameHeaderProps {
  player: PlayerData;
  planetName: string;
  onLogout: () => void;
}

export function GameHeader({ player, planetName, onLogout }: GameHeaderProps) {
  const xpPct = Math.min(100, (player.xp / player.xpMax) * 100);

  return (
    <header className="game-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">Sector Alfa</p>
        <h1 className="text-lg md:text-xl font-bold text-white truncate">{player.name}</h1>
        <p className="text-xs text-slate-400">{planetName}</p>
      </div>

      <div className="flex items-center gap-4 flex-1 max-w-md justify-center">
        <div className="text-center">
          <p className="text-[10px] uppercase text-slate-500">Nivel</p>
          <p className="text-xl font-bold text-cyan-300 tabular-nums">{player.level}</p>
        </div>
        <div className="flex-1 min-w-[120px]">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>XP</span>
            <span className="tabular-nums">
              {player.xp.toLocaleString()} / {player.xpMax.toLocaleString()}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 border border-cyan-900/50 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-purple-500 transition-all"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="shrink-0 px-3 py-1.5 text-xs rounded border border-red-500/40 text-red-300 hover:bg-red-950/50 transition"
      >
        Salir
      </button>
    </header>
  );
}
