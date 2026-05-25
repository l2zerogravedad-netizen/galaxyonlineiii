'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { BuildingDefinition } from '../types';
import { GO2_BUILD_TABS, type Go2BuildTab } from '../base3d/buildingCategories';
import { BuildingAssetView } from '../dashboard/BuildingAssetView';

function countOnPlanet(buildings: BuildingDefinition[], apiType: string): number {
  return buildings.filter(
    (b) =>
      b.type === apiType &&
      b.level > 0 &&
      b.status !== 'empty' &&
      b.status !== 'locked'
  ).length;
}

export function Go2ConstructionMenu({
  open,
  buildings,
  onClose,
  onPick,
}: {
  open: boolean;
  buildings: BuildingDefinition[];
  onClose: () => void;
  onPick: (catalogId: string) => void;
}) {
  const [tab, setTab] = useState<Go2BuildTab>('recursos');

  const filtered = useMemo(
    () =>
      buildings.filter(
        (b) => b.type !== 'EMPTY' && (b.uiTab ?? 'desarrollo') === tab
      ),
    [buildings, tab]
  );

  if (!open) return null;

  return (
    <div className="go2-build-overlay" role="dialog" aria-label="Construcción">
      <div className="go2-build-dialog">
        <div className="flex items-center justify-between border-b border-amber-800 px-3 py-2">
          <h2 className="font-display text-sm font-black uppercase tracking-wider text-amber-200">
            Construcción
          </h2>
          <button type="button" onClick={onClose} className="text-amber-200/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="go2-build-tabs">
          {GO2_BUILD_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={['go2-build-tab', tab === t.id ? 'go2-build-tab--on' : ''].join(' ')}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="go2-build-grid scrollbar-game">
          {filtered.map((b) => {
            const locked = b.status === 'locked';
            const built = countOnPlanet(buildings, b.type);
            const max = b.maxPerPlanet ?? 99;
            const cap = built >= max;

            return (
              <button
                key={b.id}
                type="button"
                disabled={locked || cap}
                className="go2-build-item"
                onClick={() => onPick(b.id)}
              >
                <div className="h-12 w-12">
                  <BuildingAssetView catalogId={b.id} name={b.name} glow={b.glow} />
                </div>
                <span className="line-clamp-2 text-center font-semibold leading-tight">
                  {b.name}
                </span>
                <span className="font-mono text-amber-400">
                  {max != null ? `${built}/${max}` : `${built}/∞`}
                </span>
              </button>
            );
          })}
        </div>
        <p className="border-t border-stone-800 px-3 py-2 text-center text-[10px] text-stone-500">
          Elige edificio y pulsa una celda libre en el mapa
        </p>
      </div>
    </div>
  );
}
