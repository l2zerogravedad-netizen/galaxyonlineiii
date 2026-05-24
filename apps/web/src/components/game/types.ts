export type BuildingStatus = 'active' | 'locked' | 'empty' | 'upgrading';
export type BuildingCategory = 'production' | 'military' | 'research' | 'storage' | 'core';
export type GlowVariant = 'cyan' | 'purple' | 'gold' | 'none';

export interface PlayerData {
  name: string;
  level: number;
  xp: number;
  xpMax: number;
}

export interface ResourcesData {
  metal: number;
  plasma: number;
  credits: number;
  metalCapacity?: number;
  plasmaCapacity?: number;
  metalProduction?: number;
  plasmaProduction?: number;
}

export interface BuildingDefinition {
  id: string;
  name: string;
  type: string;
  level: number;
  image: string;
  description: string;
  production: string;
  capacity: string;
  health: number;
  category: BuildingCategory;
  upgradeCost: { metal: number; plasma: number; credits: number };
  status: BuildingStatus;
  slotIndex?: number;
  /** UUID from API when placed on the planet */
  apiBuildingId?: string;
}

export interface GridSlot {
  slotIndex: number;
  buildingId: string | null;
}
