'use client';

import type { BuildingDefinition, GridSlot } from './types';
import { BuildingCard } from './BuildingCard';
import { getBuildingById } from './mockData';

const EMPTY_BUILDING = (slotIndex: number): BuildingDefinition => ({
  id: `empty-${slotIndex}`,
  name: 'Espacio vacío',
  type: 'EMPTY',
  level: 0,
  image: '',
  description: '',
  production: '',
  capacity: '',
  health: 0,
  category: 'core',
  upgradeCost: { metal: 0, plasma: 0, credits: 0 },
  status: 'empty',
  slotIndex,
});

interface BuildingGridProps {
  grid: GridSlot[];
  selectedSlotIndex: number | null;
  onSelectSlot: (slotIndex: number) => void;
}

export function BuildingGrid({ grid, selectedSlotIndex, onSelectSlot }: BuildingGridProps) {
  return (
    <section className="game-panel p-3 md:p-4 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">Base planetaria</h2>
        <span className="text-[10px] text-slate-500">Grilla 3×3</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div
          className="grid grid-cols-3 gap-2 md:gap-3 p-3 md:p-4 rounded-xl border border-cyan-500/20"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(6,78,99,0.25) 0%, rgba(2,6,23,0.9) 70%)',
            boxShadow: 'inset 0 0 40px rgba(34,211,238,0.08), 0 0 30px rgba(0,0,0,0.5)',
          }}
        >
          {grid.map((slot) => {
            const building = slot.buildingId
              ? getBuildingById(slot.buildingId) ?? EMPTY_BUILDING(slot.slotIndex)
              : EMPTY_BUILDING(slot.slotIndex);

            return (
              <BuildingCard
                key={slot.slotIndex}
                building={building}
                selected={selectedSlotIndex === slot.slotIndex}
                onSelect={() => onSelectSlot(slot.slotIndex)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
