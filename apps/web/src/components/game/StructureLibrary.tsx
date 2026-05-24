'use client';

import type { BuildingDefinition } from './types';
import { BuildingCard } from './BuildingCard';

interface StructureLibraryProps {
  buildings: BuildingDefinition[];
  selectedBuildingId: string | null;
  onSelectBuilding: (id: string) => void;
}

export function StructureLibrary({
  buildings,
  selectedBuildingId,
  onSelectBuilding,
}: StructureLibraryProps) {
  return (
    <section className="game-panel p-2 md:p-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400/90">
          Biblioteca de estructuras
        </h2>
        <span className="text-[10px] text-slate-500">{buildings.length} tipos</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {buildings.map((b) => (
          <div key={b.id} className="shrink-0 w-[72px]">
            <BuildingCard
              building={b}
              selected={selectedBuildingId === b.id}
              onSelect={() => onSelectBuilding(b.id)}
              compact
            />
            <p className="text-[8px] text-center text-slate-400 mt-1 truncate px-0.5">{b.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
