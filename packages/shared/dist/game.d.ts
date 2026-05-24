/** Shared game API contracts (web + api). */
export type ApiResourceType = 'METAL' | 'PLASMA' | 'CREDITS';
export type ApiBuildingType = 'COMMAND_CENTER' | 'METAL_MINE' | 'PLASMA_EXTRACTOR' | 'SHIPYARD' | 'RESEARCH_LAB' | 'ACADEMY' | 'WAREHOUSE';
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
    credits: number;
    metalCapacity: number;
    plasmaCapacity: number;
    metalProduction: number;
    plasmaProduction: number;
}
export interface GamePlanetDto {
    id: string;
    name: string;
    type: string;
    buildings: ApiBuilding[];
}
export interface GameDashboardDto {
    player: GamePlayerDto;
    resources: GameResourcesDto;
    planet: GamePlanetDto;
}
export interface UpgradeBuildingBody {
    slotIndex: number;
    type: ApiBuildingType | string;
}
