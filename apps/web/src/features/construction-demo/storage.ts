import type { DemoSave, PlacedBuilding, Resources } from './types';
import { STARTING_RESOURCES } from './catalog';

const STORAGE_KEY = 'galaxy-construction-demo-v1';

export function defaultSave(): DemoSave {
  return {
    version: 1,
    resources: { ...STARTING_RESOURCES },
    buildings: [],
  };
}

export function loadSave(): DemoSave {
  if (typeof window === 'undefined') return defaultSave();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as DemoSave;
    if (parsed.version !== 1 || !parsed.resources || !Array.isArray(parsed.buildings)) {
      return defaultSave();
    }
    return parsed;
  } catch {
    return defaultSave();
  }
}

export function persistSave(save: DemoSave): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

export function canAfford(resources: Resources, cost: Resources): boolean {
  return (
    resources.metal >= cost.metal &&
    resources.energy >= cost.energy &&
    resources.crystal >= cost.crystal
  );
}

export function spend(resources: Resources, cost: Resources): Resources {
  return {
    metal: resources.metal - cost.metal,
    energy: resources.energy - cost.energy,
    crystal: resources.crystal - cost.crystal,
  };
}

export function refund(resources: Resources, cost: Resources): Resources {
  return {
    metal: resources.metal + cost.metal,
    energy: resources.energy + cost.energy,
    crystal: resources.crystal + cost.crystal,
  };
}

export function newInstanceId(): string {
  return `b_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function resetSave(): DemoSave {
  const fresh = defaultSave();
  persistSave(fresh);
  return fresh;
}

export function exportBuildingsList(buildings: PlacedBuilding[]): string {
  return JSON.stringify(buildings, null, 2);
}
