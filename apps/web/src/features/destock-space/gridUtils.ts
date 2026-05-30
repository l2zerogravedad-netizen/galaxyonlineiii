import { GRID_COLS, GRID_ROWS, getSpec } from './catalog';
import type { BuildJob, BuildingSpec, GridCell, PlacedStructure, Rotation } from './types';

export function footprintSize(spec: BuildingSpec, rotation: Rotation) {
  const swap = rotation === 90 || rotation === 270;
  return swap
    ? { w: spec.footprint.h, h: spec.footprint.w }
    : { w: spec.footprint.w, h: spec.footprint.h };
}

export function cellsForPlacement(col: number, row: number, w: number, h: number): GridCell[] {
  const cells: GridCell[] = [];
  for (let r = row; r < row + h; r++) {
    for (let c = col; c < col + w; c++) cells.push({ col: c, row: r });
  }
  return cells;
}

export function cellKey(col: number, row: number) {
  return `${col},${row}`;
}

export function occupancy(
  structures: PlacedStructure[],
  queue: BuildJob[],
  excludeInstance?: string
): Map<string, string> {
  const map = new Map<string, string>();
  const add = (col: number, row: number, w: number, h: number, id: string) => {
    for (const c of cellsForPlacement(col, row, w, h)) {
      map.set(cellKey(c.col, c.row), id);
    }
  };
  for (const s of structures) {
    if (s.instanceId === excludeInstance) continue;
    const spec = getSpec(s.buildingId);
    if (!spec) continue;
    const { w, h } = footprintSize(spec, s.rotation);
    add(s.col, s.row, w, h, s.instanceId);
  }
  for (const j of queue) {
    const spec = getSpec(j.buildingId);
    if (!spec) continue;
    const { w, h } = footprintSize(spec, j.rotation);
    add(j.col, j.row, w, h, j.jobId);
  }
  return map;
}

export function canPlace(
  col: number,
  row: number,
  w: number,
  h: number,
  occ: Map<string, string>
): { ok: true } | { ok: false; reason: string } {
  if (col < 0 || row < 0 || col + w > GRID_COLS || row + h > GRID_ROWS) {
    return { ok: false, reason: 'Fuera del sector' };
  }
  for (const c of cellsForPlacement(col, row, w, h)) {
    if (occ.has(cellKey(c.col, c.row))) return { ok: false, reason: 'Casilla ocupada' };
  }
  return { ok: true };
}

export function screenToGrid(
  localX: number,
  localY: number,
  tileW: number,
  tileH: number
): GridCell | null {
  const rowH = tileH * 0.5;
  const halfW = tileW * 0.5;
  const row = Math.floor(localY / rowH);
  if (row < 0 || row >= GRID_ROWS) return null;
  const col = Math.floor((localX - (row % 2 === 0 ? 0 : halfW)) / tileW);
  if (col < 0 || col >= GRID_COLS) return null;
  return { col, row };
}

export function countType(
  id: string,
  structures: PlacedStructure[],
  queue: BuildJob[]
): number {
  return (
    structures.filter((s) => s.buildingId === id).length +
    queue.filter((j) => j.buildingId === id).length
  );
}
