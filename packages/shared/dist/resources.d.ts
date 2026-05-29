import type { GameResourcesDto } from './game';
export declare const LEGACY_CREDITS_TYPE = "CREDITS";
export interface ResourceRow {
    type: string;
    amount: number;
    capacity?: number;
    productionPerHour?: number;
    updatedAt?: Date | string;
    id?: string;
}
export declare function normalizeResourceType(type: string): 'METAL' | 'GAS' | 'CREDITS' | 'HE3' | null;
export declare function getResourceRow(resources: ResourceRow[], canonical: 'METAL' | 'GAS' | 'CREDITS' | 'HE3'): ResourceRow | undefined;
export declare function toGameResourcesDto(resources: ResourceRow[]): GameResourcesDto;
