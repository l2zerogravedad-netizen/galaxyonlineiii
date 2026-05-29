import { normalizeBuildingType } from './legacyBuildingTypes';
import { MAX_PER_PLANET_BY_TYPE } from './terrestrialCatalog';

/** Producción por hora según buildings-complete (nivel lineal). */
export function productionFromBuilding(type: string, level: number): {
  metal?: number;
  plasma?: number;
  he3?: number;
  credits?: number;
} {
  const t = normalizeBuildingType(type);
  if (level < 1) return {};
  switch (t) {
    case 'metal_extractor':
      return { metal: 20 * level };
    case 'plasma_refinery':
      return { plasma: 10 * level };
    case 'he3_extractor':
      return { he3: 8 * level };
    case 'control_center':
      return { credits: 5 * level };
    case 'trading_center':
      return { credits: 10 * level };
    case 'energy_generator':
      return {};
    default:
      return {};
  }
}

export function capacityBonusFromBuilding(type: string, level: number): {
  metal?: number;
  plasma?: number;
  he3?: number;
} {
  const t = normalizeBuildingType(type);
  if (t === 'warehouse' && level >= 1) {
    return { metal: 500 * level, plasma: 300 * level, he3: 250 * level };
  }
  return {};
}

export function countBuildingsOfType(
  buildings: { type: string; level: number; slotIndex: number; status: string }[],
  apiType: string
): number {
  const canonical = normalizeBuildingType(apiType);
  return buildings.filter(
    (b) =>
      normalizeBuildingType(b.type) === canonical &&
      b.level > 0 &&
      (b.status === 'IDLE' || b.status === 'UPGRADING')
  ).length;
}

export function canPlaceBuildingType(
  buildings: { type: string; level: number; slotIndex: number; status: string }[],
  apiType: string,
  slotIndex: number
): { ok: boolean; error?: string } {
  const canonical = normalizeBuildingType(apiType);
  const max = MAX_PER_PLANET_BY_TYPE[canonical] ?? 99;
  const occupied = buildings.find((b) => b.slotIndex === slotIndex);
  if (occupied) {
    if (normalizeBuildingType(occupied.type) !== canonical) {
      return { ok: false, error: 'Slot already occupied' };
    }
    return { ok: true };
  }
  const count = countBuildingsOfType(buildings, canonical);
  if (count >= max) {
    return { ok: false, error: `Maximum ${max} of this building on planet` };
  }
  return { ok: true };
}
