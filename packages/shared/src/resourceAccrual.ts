import { normalizeResourceType } from './resources';

export interface AccrualInput {
  type: string;
  amount: number;
  capacity: number;
  productionPerHour: number;
  updatedAt: Date | string;
}

export function effectiveProductionRate(
  type: string,
  baseRate: number,
  techBonuses: Record<string, number>
): number {
  const canonical = normalizeResourceType(type);
  if (canonical === 'METAL' && techBonuses.METAL_PRODUCTION) {
    return baseRate * (1 + techBonuses.METAL_PRODUCTION);
  }
  if (canonical === 'GAS' && techBonuses.GAS_PRODUCTION) {
    return baseRate * (1 + techBonuses.GAS_PRODUCTION);
  }
  if (canonical === 'HE3' && techBonuses.HE3_PRODUCTION) {
    return baseRate * (1 + techBonuses.HE3_PRODUCTION);
  }
  return baseRate;
}

export function accrueResource(
  resource: AccrualInput,
  techBonuses: Record<string, number> = {},
  now: Date = new Date()
): { amount: number; gained: number; productionPerHour: number } {
  const lastUpdate = new Date(resource.updatedAt);
  const hoursDiff = Math.max(0, (now.getTime() - lastUpdate.getTime()) / 3_600_000);
  const rate = effectiveProductionRate(resource.type, resource.productionPerHour, techBonuses);
  const gained = Math.floor(rate * hoursDiff);
  const amount = Math.min(Math.floor(resource.amount + gained), resource.capacity);
  return {
    amount,
    gained: Math.max(0, amount - Math.floor(resource.amount)),
    productionPerHour: Math.floor(rate),
  };
}

export function sumCollected(
  rows: { type: string; before: number; after: number }[]
): { metal: number; plasma: number; he3: number; credits: number } {
  const out = { metal: 0, plasma: 0, he3: 0, credits: 0 };
  for (const row of rows) {
    const c = normalizeResourceType(row.type);
    const delta = Math.max(0, row.after - row.before);
    if (c === 'METAL') out.metal += delta;
    else if (c === 'GAS') out.plasma += delta;
    else if (c === 'HE3') out.he3 += delta;
    else if (c === 'CREDITS') out.credits += delta;
  }
  return out;
}
