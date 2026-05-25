import type { BuildingCatalogItem, GridCell, PlacedBuilding, Rotation } from './types';
import { GRID_COLS, GRID_ROWS, getCatalogItem } from './catalog';

export function footprintSize(
  item: BuildingCatalogItem,
  rotation: Rotation
): { w: number; h: number } {
  const swap = rotation === 90 || rotation === 270;
  return swap
    ? { w: item.footprint.h, h: item.footprint.w }
    : { w: item.footprint.w, h: item.footprint.h };
}

export function cellsForPlacement(
  col: number,
  row: number,
  w: number,
  h: number
): GridCell[] {
  const cells: GridCell[] = [];
  for (let r = row; r < row + h; r++) {
    for (let c = col; c < col + w; c++) {
      cells.push({ col: c, row: r });
    }
  }
  return cells;
}

export function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

export function buildOccupancyMap(
  buildings: PlacedBuilding[],
  excludeId?: string
): Map<string, string> {
  const map = new Map<string, string>();
  for (const b of buildings) {
    if (b.instanceId === excludeId) continue;
    const def = getCatalogItem(b.typeId);
    if (!def) continue;
    const { w, h } = footprintSize(def, b.rotation);
    for (const cell of cellsForPlacement(b.col, b.row, w, h)) {
      map.set(cellKey(cell.col, cell.row), b.instanceId);
    }
  }
  return map;
}

export function canPlaceAt(
  col: number,
  row: number,
  w: number,
  h: number,
  occupancy: Map<string, string>
): { ok: true } | { ok: false; reason: string } {
  if (col < 0 || row < 0 || col + w > GRID_COLS || row + h > GRID_ROWS) {
    return { ok: false, reason: 'Fuera de la grilla' };
  }
  for (const cell of cellsForPlacement(col, row, w, h)) {
    if (occupancy.has(cellKey(cell.col, cell.row))) {
      return { ok: false, reason: 'Celda ocupada' };
    }
  }
  return { ok: true };
}

export function countTypeOnMap(
  buildings: PlacedBuilding[],
  typeId: string
): number {
  return buildings.filter((b) => b.typeId === typeId).length;
}

/** Convierte coordenadas de pantalla (relativas al board) a celda lógica. */
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
  const rowOffset = row % 2 === 0 ? 0 : halfW;
  const col = Math.floor((localX - rowOffset) / tileW);
  if (col < 0 || col >= GRID_COLS) return null;
  return { col, row };
}
