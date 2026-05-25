'use client';

import Image from 'next/image';
import {
  PLANET_GRID_COLUMNS,
  PLANET_GRID_ROWS,
  PLANET_BUILDING_SLOTS,
} from '@galaxy/shared';
import type { BuildingDefinition } from '../types';
import { buildGridCellBuildings } from '../dashboard/adapters';
import type { GridSlot } from '../types';
import { buildingImageSrc } from '@/lib/game-assets';

export function Go2IsometricGrid({
  grid,
  buildings,
  selectedSlotIndex,
  buildTargetSlotIndex,
  pendingCatalogId,
  onSelectSlot,
}: {
  grid: GridSlot[];
  buildings: BuildingDefinition[];
  selectedSlotIndex: number | null;
  buildTargetSlotIndex: number | null;
  pendingCatalogId: string | null;
  onSelectSlot: (slotIndex: number) => void;
}) {
  const cells = buildGridCellBuildings(grid, buildings, PLANET_BUILDING_SLOTS);

  const rows: BuildingDefinition[][] = [];
  for (let r = 0; r < PLANET_GRID_ROWS; r++) {
    const row: BuildingDefinition[] = [];
    for (let c = 0; c < PLANET_GRID_COLUMNS; c++) {
      const idx = r * PLANET_GRID_COLUMNS + c;
      row.push(cells[idx] ?? cells[0]);
    }
    rows.push(row);
  }

  return (
    <div className="go2-iso-board">
      {rows.map((row, ri) => (
        <div key={ri} className="go2-iso-row">
          {row.map((cell, ci) => {
            const slotIndex = ri * PLANET_GRID_COLUMNS + ci;
            const empty = cell.status === 'empty' || cell.type === 'EMPTY';
            const upgrading = cell.status === 'upgrading';
            const selected = selectedSlotIndex === slotIndex;
            const target =
              buildTargetSlotIndex === slotIndex ||
              (!!pendingCatalogId && empty && selected);

            const classes = [
              'go2-iso-tile',
              'go2-iso-tile--grid',
              empty ? '' : 'go2-iso-tile--occupied',
              upgrading ? 'go2-iso-tile--building' : '',
              selected ? 'go2-iso-tile--selected' : '',
              target ? 'go2-iso-tile--target' : '',
            ]
              .filter(Boolean)
              .join(' ');

            const img =
              !empty && cell.id && !cell.id.startsWith('slot-')
                ? buildingImageSrc(cell.id)
                : null;

            let progress = 0;
            if (upgrading && cell.constructionEndsAt) {
              const ends = new Date(cell.constructionEndsAt).getTime();
              const now = Date.now();
              progress = ends <= now ? 100 : Math.min(95, 50);
            }

            return (
              <button
                key={slotIndex}
                type="button"
                className={classes}
                title={
                  empty
                    ? `Celda ${slotIndex + 1} — libre`
                    : `${cell.name} Nv.${cell.level}`
                }
                onClick={() => onSelectSlot(slotIndex)}
              >
                <div className="go2-tile-inner">
                  {img ? (
                    <Image
                      src={img}
                      alt=""
                      width={52}
                      height={52}
                      className="go2-tile-img"
                      unoptimized
                    />
                  ) : empty && pendingCatalogId && selected ? (
                    <span className="go2-pending-q">?</span>
                  ) : null}
                </div>
                {!empty && cell.level > 0 ? (
                  <span className="go2-tile-lv">{cell.level}</span>
                ) : null}
                {upgrading ? (
                  <div className="go2-build-bar">
                    <div
                      className="go2-build-bar-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
