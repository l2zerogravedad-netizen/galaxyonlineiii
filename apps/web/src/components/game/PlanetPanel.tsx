'use client';

import { AssetImage } from './AssetImage';

interface PlanetPanelProps {
  planetName: string;
  planetType?: string;
}

export function PlanetPanel({ planetName, planetType = 'Habitable' }: PlanetPanelProps) {
  return (
    <aside className="game-panel flex flex-col items-center p-3 lg:p-4 min-h-[200px] lg:min-h-0">
      <p className="text-[10px] uppercase tracking-widest text-cyan-400/70 mb-2">Planeta principal</p>
      <div className="relative w-full max-w-[220px] aspect-square flex items-center justify-center">
        <div className="absolute inset-4 rounded-full bg-cyan-500/10 blur-2xl animate-pulse" />
        <div className="absolute inset-8 rounded-full bg-purple-500/10 blur-xl" />
        <AssetImage
          src="/game/assets/planets/main-planet.webp"
          alt={planetName}
          className="relative w-full h-full z-10"
          glow="cyan"
          icon="🪐"
        />
      </div>
      <h2 className="mt-3 text-sm font-semibold text-center">{planetName}</h2>
      <p className="text-[10px] text-slate-400 uppercase">{planetType}</p>
      <div className="mt-3 w-full grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded border border-cyan-900/50 bg-slate-900/50 px-2 py-1 text-center">
          <span className="text-slate-500 block">Defensa</span>
          <span className="text-cyan-300 font-mono">84%</span>
        </div>
        <div className="rounded border border-cyan-900/50 bg-slate-900/50 px-2 py-1 text-center">
          <span className="text-slate-500 block">Población</span>
          <span className="text-cyan-300 font-mono">12.4k</span>
        </div>
      </div>
    </aside>
  );
}
