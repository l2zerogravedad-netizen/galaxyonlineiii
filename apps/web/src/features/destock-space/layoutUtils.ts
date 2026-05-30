import { GRID_COLS, GRID_ROWS, TILE_H, TILE_W, getSpec } from './catalog';
import type { BuildingSpec, PlacedStructure, Rotation } from './types';
import { footprintSize } from './gridUtils';

export const BOARD_W = GRID_COLS * TILE_W + TILE_W * 0.5;
export const BOARD_H = GRID_ROWS * (TILE_H * 0.5) + 100;

export function rectFor(
  col: number,
  row: number,
  spec: BuildingSpec,
  rotation: Rotation
) {
  const { w, h } = footprintSize(spec, rotation);
  return {
    left: col * TILE_W + (row % 2 === 0 ? 0 : TILE_W * 0.5),
    top: row * (TILE_H * 0.5),
    width: w * TILE_W - 4,
    height: h * (TILE_H * 0.5) + (h - 1) * 8 + 32,
  };
}

export function rectForStructure(s: PlacedStructure) {
  const spec = getSpec(s.buildingId);
  if (!spec) return { left: 0, top: 0, width: 0, height: 0 };
  return rectFor(s.col, s.row, spec, s.rotation);
}
