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
export declare function normalizeResourceType(type: string): 'METAL' | 'PLASMA' | 'CREDITS' | null;
export declare function getResourceRow(resources: ResourceRow[], canonical: 'METAL' | 'PLASMA' | 'CREDITS'): ResourceRow | undefined;
export declare function toGameResourcesDto(resources: ResourceRow[]): GameResourcesDto;
