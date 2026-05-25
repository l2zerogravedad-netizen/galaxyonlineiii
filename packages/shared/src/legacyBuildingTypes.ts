import type { CanonicalBuildingTypeId } from './planetLayout';

/** Tipos legacy API (mayoría en mayúsculas) → snake_case canónico */
export const LEGACY_TO_CANONICAL: Record<string, CanonicalBuildingTypeId> = {
  COMMAND_CENTER: 'control_center',
  METAL_MINE: 'metal_extractor',
  PLASMA_EXTRACTOR: 'plasma_refinery',
  SHIPYARD: 'shipyard',
  RESEARCH_LAB: 'research_lab',
  ACADEMY: 'research_lab',
  WAREHOUSE: 'warehouse',
  ENERGY: 'energy_generator',
  DEFENSE: 'defense_turret',
  HANGAR: 'hangar',
};

export function normalizeBuildingType(type: string): string {
  if (LEGACY_TO_CANONICAL[type]) return LEGACY_TO_CANONICAL[type];
  return type;
}

export function isCanonicalBuildingType(type: string): boolean {
  const n = normalizeBuildingType(type);
  return n === type || !!LEGACY_TO_CANONICAL[type];
}
