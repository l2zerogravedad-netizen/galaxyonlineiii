'use client';

import type { BuildingDefinition } from './types';
import { AssetImage } from './AssetImage';

interface BuildingDetailPanelProps {
  building: BuildingDefinition | null;
  onUpgrade?: () => void;
  onBuild?: () => void;
  pending?: boolean;
  liveMode?: boolean;
}

export function BuildingDetailPanel({
  building,
  onUpgrade,
  onBuild,
  pending = false,
  liveMode = true,
}: BuildingDetailPanelProps) {
  if (!building || building.type === 'EMPTY') {
    return (
      <aside className="game-panel p-4 flex flex-col items-center justify-center text-center min-h-[200px]">
        <AssetImage
          src="/game/assets/ui/build.webp"
          alt="Construir"
          className="w-16 h-16 mb-3 opacity-60"
          glow="cyan"
          icon="🔧"
        />
        <h3 className="text-sm font-semibold text-cyan-300">Espacio disponible</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-[200px]">
          Seleccioná un slot vacío o elegí una estructura de la biblioteca inferior para construir.
        </p>
      </aside>
    );
  }

  if (building.status === 'locked') {
    return (
      <aside className="game-panel p-4 flex flex-col items-center justify-center text-center">
        <span className="text-4xl mb-2">🔒</span>
        <h3 className="text-sm font-semibold text-slate-300">{building.name}</h3>
        <p className="text-xs text-slate-500 mt-2">Requiere nivel de imperio o tecnología previa.</p>
      </aside>
    );
  }

  const canUpgrade = building.status === 'active' && liveMode;
  const canBuild =
    building.status === 'empty' && building.type !== 'EMPTY' && liveMode;

  return (
    <aside className="game-panel p-4 flex flex-col gap-3 overflow-y-auto max-h-[420px] lg:max-h-none">
      <div className="flex gap-3">
        <AssetImage
          src={building.image}
          alt={building.name}
          className="w-20 h-20 shrink-0"
          glow="purple"
          icon="🏗"
        />
        <div className="min-w-0">
          <p className="text-[10px] uppercase text-purple-400/80">{building.category}</p>
          <h3 className="text-base font-bold truncate">{building.name}</h3>
          <p className="text-xs text-cyan-300">Nivel {building.level}</p>
          <p className="text-[10px] text-slate-500 mt-1 capitalize">{building.status}</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{building.description}</p>

      <dl className="grid grid-cols-2 gap-2 text-[11px]">
        <Stat label="Producción" value={building.production} />
        <Stat label="Capacidad" value={building.capacity} />
        <Stat label="Salud" value={`${building.health}%`} />
        <Stat label="Tipo" value={building.type} />
      </dl>

      <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3">
        <p className="text-[10px] uppercase text-amber-400 mb-2">Costo de mejora</p>
        <ul className="space-y-1 text-xs tabular-nums">
          <li className="text-slate-300">Metal: {building.upgradeCost.metal.toLocaleString()}</li>
          <li className="text-purple-300">Plasma: {building.upgradeCost.plasma.toLocaleString()}</li>
          <li className="text-amber-300">Créditos: {building.upgradeCost.credits.toLocaleString()}</li>
        </ul>
      </div>

      {canUpgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          disabled={pending}
          className="game-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <AssetImage
            src="/game/assets/ui/upgrade.webp"
            alt="Mejorar"
            className="w-5 h-5"
            glow="gold"
            icon="⬆"
          />
          {pending ? 'Procesando…' : 'Mejorar edificio'}
        </button>
      )}

      {canBuild && (
        <button
          type="button"
          onClick={onBuild}
          disabled={pending}
          className="game-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <AssetImage
            src="/game/assets/ui/build.webp"
            alt="Construir"
            className="w-5 h-5"
            glow="cyan"
            icon="🔧"
          />
          {pending ? 'Procesando…' : 'Construir edificio'}
        </button>
      )}

      {building.status === 'upgrading' && (
        <p className="text-center text-xs text-amber-300 animate-pulse">Construcción en progreso…</p>
      )}
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-cyan-900/40 bg-slate-900/40 px-2 py-1.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-cyan-100 font-medium truncate">{value || '—'}</dd>
    </div>
  );
}
