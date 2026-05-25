export type BuildingStatus = 'active' | 'locked' | 'empty' | 'upgrading';
export type BuildingCategory = 'production' | 'military' | 'research' | 'storage' | 'core' | 'defense' | 'infrastructure';
export type Go2BuildTab = 'recursos' | 'desarrollo' | 'civil' | 'milicia' | 'defensa';
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
  constructionEndsAt?: string | null;
  uiTab?: Go2BuildTab;
  maxPerPlanet?: number;
  glow?: GlowVariant;
  unlockRequirement?: string;
}

export interface GridSlot {
  slotIndex: number;
  buildingId: string | null;
}
