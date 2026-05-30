'use client';

import { frigates, getHullById } from '@/data/game/ships-complete';
import type { CombatUnit } from './useDestockCombat';

export const FLEET_STORAGE_KEY = 'destock-go2-fleets-v1';

export interface FleetSlot {
  cell: number;
  hullId: string;
}

export interface FleetRecord {
  name: string;
  slots: FleetSlot[];
}

export interface FleetSave {
  activeFleetId: string;
  fleets: Record<string, FleetRecord>;
}

const DEFAULT_SLOTS: FleetSlot[] = [
  { cell: 58, hullId: 'frigate_t1' },
  { cell: 59, hullId: 'frigate_t1' },
  { cell: 60, hullId: 'frigate_t1' },
  { cell: 49, hullId: 'frigate_t1' },
  { cell: 50, hullId: 'frigate_t2' },
  { cell: 51, hullId: 'frigate_t1' },
];

export function defaultFleetSave(): FleetSave {
  return {
    activeFleetId: 'f1',
    fleets: {
      f1: { name: 'Flota Alfa', slots: [...DEFAULT_SLOTS] },
      f2: { name: 'Flota Exploración', slots: [{ cell: 60, hullId: 'frigate_t1' }] },
      f3: { name: 'Reserva', slots: [] },
    },
  };
}

export function loadFleetSave(): FleetSave {
  if (typeof window === 'undefined') return defaultFleetSave();
  try {
    const raw = localStorage.getItem(FLEET_STORAGE_KEY);
    if (!raw) return defaultFleetSave();
    return JSON.parse(raw) as FleetSave;
  } catch {
    return defaultFleetSave();
  }
}

export function saveFleetSave(save: FleetSave): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(save));
}

export function hullToCombatStats(hullId: string): {
  name: string;
  attack: number;
  defense: number;
  hp: number;
  shield: number;
} {
  const hull = getHullById(hullId) ?? frigates[0];
  const s = hull.stats;
  return {
    name: hull.name,
    attack: Math.round(s.structure * 0.12 + s.speed * 0.08),
    defense: Math.round(s.stability * 0.4),
    hp: s.structure,
    shield: Math.round(s.stability * 1.2),
  };
}

export function fleetSlotsToCombatUnits(slots: FleetSlot[]): CombatUnit[] {
  return slots.map((slot, i) => {
    const stats = hullToCombatStats(slot.hullId);
    return {
      uid: `p-${i}`,
      side: 'player' as const,
      cell: slot.cell,
      name: stats.name,
      attack: stats.attack,
      defense: stats.defense,
      hp: stats.hp,
      maxHp: stats.hp,
      shield: stats.shield,
      maxShield: stats.shield,
    };
  });
}

export function fleetPower(slots: FleetSlot[]): number {
  return slots.reduce((sum, s) => {
    const st = hullToCombatStats(s.hullId);
    return sum + st.attack + st.defense + st.hp + st.shield;
  }, 0);
}

export function getActiveFleetUnits(): CombatUnit[] {
  const save = loadFleetSave();
  const fleet = save.fleets[save.activeFleetId];
  if (!fleet?.slots.length) return [];
  return fleetSlotsToCombatUnits(fleet.slots);
}
