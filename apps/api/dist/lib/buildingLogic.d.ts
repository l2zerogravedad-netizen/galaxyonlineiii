import { type ApiBuilding } from '@galaxy/shared';
export declare function finalizeCompletedBuildings(planetId: string): Promise<ApiBuilding[]>;
export declare function countActiveConstruction(buildings: ApiBuilding[]): number;
export declare function validateBuildRequest(type: string, slotIndex: number, buildings: ApiBuilding[]): {
    ok: true;
    canonicalType: string;
} | {
    ok: false;
    error: string;
};
export declare function buildCostForLevel(type: string, targetLevel: number): import("@galaxy/shared").BuildCostResult;
export declare function constructionQueueFromBuildings(buildings: ApiBuilding[]): import("@galaxy/shared").Go2ConstructionQueueItemDto[];
