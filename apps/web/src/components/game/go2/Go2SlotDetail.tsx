'use client';

import type { BuildingDefinition, ResourcesData } from '../types';
import { fmt, resolveApiType } from '../dashboard/adapters';
import { isApiBuildable } from '@/lib/game/buildingMap';

export function Go2SlotDetail({
  building,
  pendingCatalogId,
  pendingBuild,
  resources,
  usingMock,
  onBuild,
  onUpgrade,
}: {
  building: BuildingDefinition;
  pendingCatalogId: string | null;
  pendingBuild: BuildingDefinition | null;
  resources: ResourcesData;
  usingMock: boolean;
  onBuild: () => void;
  onUpgrade: () => void;
}) {
  const empty = building.status === 'empty' || building.type === 'EMPTY';
  const upgrading = building.status === 'upgrading';
  const canAct = !usingMock && isApiBuildable(resolveApiType(pendingBuild ?? building));

  if (empty && !pendingCatalogId) {
    return (
      <div className="go2-slot-panel">
        <p className="font-bold text-amber-200">Celda libre</p>
        <p className="mt-1 text-stone-400">
          Pulsa el martillo y elige un edificio, luego esta celda.
        </p>
      </div>
    );
  }

  if (pendingBuild && empty) {
    const cost = pendingBuild.upgradeCost;
    return (
      <div className="go2-slot-panel">
        <p className="font-bold text-amber-200">{pendingBuild.name}</p>
        <p className="mt-1 text-stone-400">Construir en módulo {(building.slotIndex ?? 0) + 1}</p>
        <p className="mt-2 text-[10px] text-stone-500">
          Metal {fmt(cost.metal)} · He3 {fmt(cost.plasma)} · Créd. {fmt(cost.credits)}
        </p>
        <button
          type="button"
          className="mt-3 w-full rounded bg-gradient-to-b from-amber-500 to-amber-700 py-2 text-xs font-bold uppercase text-amber-950 disabled:opacity-50"
          disabled={!canAct}
          onClick={onBuild}
        >
          Construir
        </button>
      </div>
    );
  }

  return (
    <div className="go2-slot-panel">
      <p className="font-bold text-amber-200">
        {building.name} <span className="text-amber-400">Nv.{building.level}</span>
      </p>
      <p className="mt-1 text-[10px] text-stone-400">{building.production}</p>
      {upgrading ? (
        <p className="mt-2 text-amber-400">En construcción / mejora…</p>
      ) : (
        <>
          <p className="mt-2 text-[10px] text-stone-500">
            Mejora: Metal {fmt(building.upgradeCost.metal)} · He3{' '}
            {fmt(building.upgradeCost.plasma)}
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded bg-gradient-to-b from-cyan-600 to-cyan-800 py-2 text-xs font-bold uppercase text-white disabled:opacity-50"
            disabled={!canAct || building.status === 'locked'}
            onClick={onUpgrade}
          >
            Mejorar
          </button>
        </>
      )}
      <p className="mt-2 text-[9px] text-stone-600">
        Almacén: {fmt(resources.metal)} metal · {fmt(resources.plasma)} He3
      </p>
    </div>
  );
}
