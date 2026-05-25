import type { CanonicalBuildingTypeId } from './planetLayout';

/** Tipos legacy API (mayoría en mayúsculas) → snake_case canónico */
export const LEGACY_TO_CANONICAL: Record<string, CanonicalBuildingTypeId> = {
  COMMAND_CENTER: 'control_center',
  NEXUS_COMMAND: 'control_center',
  METAL_MINE: 'metal_extractor',
  METAL_QUARRY: 'metal_extractor',
  PLASMA_EXTRACTOR: 'plasma_refinery',
  HE3_SYNTHESIZER: 'plasma_refinery',
  SHIPYARD: 'shipyard',
  STELLAR_FOUNDRY: 'shipyard',
  RESEARCH_LAB: 'research_lab',
  INSIGHT_SPIRE: 'research_lab',
  ACADEMY: 'research_lab',
  WAREHOUSE: 'warehouse',
  ENERGY: 'energy_generator',
  SOLAR_HELIX: 'energy_generator',
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
