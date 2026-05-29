/** Shared game API contracts (web + api + desktop + mobile). */

import type { CanonicalBuildingTypeId } from './planetLayout';

export type ApiResourceType = 'METAL' | 'GAS' | 'CREDITS' | 'HE3';

export type ApiBuildingType = CanonicalBuildingTypeId | string;

export type ApiBuildingStatus = 'IDLE' | 'CONSTRUCTING' | 'UPGRADING' | string;

export interface ApiResource {
  id: string;
  type: ApiResourceType | string;
  amount: number;
  capacity: number;
  productionPerHour: number;
  updatedAt?: string;
}

export interface ApiBuilding {
  id: string;
  planetId: string;
  type: string;
  level: number;
  slotIndex: number;
  status: ApiBuildingStatus;
  constructionEndsAt?: string | null;
}

export interface ApiPlanet {
  id: string;
  name: string;
  type: string;
  maxBuildingSlots?: number;
  buildings: ApiBuilding[];
}

export interface ApiEmpire {
  id: string;
  name: string;
  level: number;
  experience: number;
  resources: ApiResource[];
  planets: ApiPlanet[];
}

export interface GamePlayerDto {
  empireId: string;
  name: string;
  level: number;
  xp: number;
  xpMax: number;
}

export interface GameResourcesDto {
  metal: number;
  plasma: number;
  he3: number;
  credits: number;
  /** Legacy Nova API field — same as credits */
  crystal?: number;
  metalCapacity: number;
  plasmaCapacity: number;
  he3Capacity: number;
  crystalCapacity?: number;
  metalProduction: number;
  plasmaProduction: number;
  he3Production: number;
  crystalProduction?: number;
}

export interface GamePlanetDto {
  id: string;
  name: string;
  type: string;
  maxBuildingSlots: number;
  buildings: ApiBuilding[];
}

export interface Go2ConstructionQueueItemDto {
  id: string;
  buildingType: string;
  buildingName: string;
  level: number;
  targetLevel: number;
  slotIndex: number;
  status: 'CONSTRUCTING' | 'UPGRADING';
  endsAt: string | null;
  progressPct: number;
}

export interface GameDashboardDto {
  player: GamePlayerDto;
  resources: GameResourcesDto;
  planet: GamePlanetDto;
  constructionQueue: Go2ConstructionQueueItemDto[];
}

export interface UpgradeBuildingBody {
  slotIndex: number;
  type: ApiBuildingType | string;
}
