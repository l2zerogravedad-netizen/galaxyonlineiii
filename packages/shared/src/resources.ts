import type { GameResourcesDto } from './game';

export const LEGACY_CREDITS_TYPE = 'CREDITS';

export interface ResourceRow {
  type: string;
  amount: number;
  capacity?: number;
  productionPerHour?: number;
  updatedAt?: Date | string;
  id?: string;
}

export function normalizeResourceType(type: string): 'METAL' | 'GAS' | 'CREDITS' | 'HE3' | null {
  if (type === 'METAL') return 'METAL';
  if (type === 'GAS' || type === 'PLASMA') return 'GAS';
  if (type === 'HE3') return 'HE3';
  if (type === 'CREDITS' || type === LEGACY_CREDITS_TYPE || type === 'CRYSTAL') return 'CREDITS';
  return null;
}

export function getResourceRow(
  resources: ResourceRow[],
  canonical: 'METAL' | 'GAS' | 'CREDITS' | 'HE3'
): ResourceRow | undefined {
  if (canonical === 'CREDITS') {
    return (
      resources.find((r) => r.type === 'CREDITS') ??
      resources.find((r) => r.type === LEGACY_CREDITS_TYPE) ??
      resources.find((r) => r.type === 'CRYSTAL')
    );
  }
  if (canonical === 'GAS') {
    return (
      resources.find((r) => r.type === 'GAS') ??
      resources.find((r) => r.type === 'PLASMA')
    );
  }
  if (canonical === 'HE3') {
    return resources.find((r) => r.type === 'HE3');
  }
  return resources.find((r) => r.type === 'METAL');
}

export function toGameResourcesDto(resources: ResourceRow[]): GameResourcesDto {
  const metal = getResourceRow(resources, 'METAL');
  const gas = getResourceRow(resources, 'GAS');
  const he3 = getResourceRow(resources, 'HE3');
  const credits = getResourceRow(resources, 'CREDITS');
  const creditAmount = Math.floor(credits?.amount ?? 0);
  return {
    metal: Math.floor(metal?.amount ?? 0),
    plasma: Math.floor(gas?.amount ?? 0),
    he3: Math.floor(he3?.amount ?? 0),
    credits: creditAmount,
    crystal: creditAmount,
    metalCapacity: metal?.capacity ?? 0,
    plasmaCapacity: gas?.capacity ?? 0,
    he3Capacity: he3?.capacity ?? 0,
    crystalCapacity: credits?.capacity ?? 0,
    metalProduction: metal?.productionPerHour ?? 0,
    plasmaProduction: gas?.productionPerHour ?? 0,
    he3Production: he3?.productionPerHour ?? 0,
    crystalProduction: credits?.productionPerHour ?? 0,
  };
}
