/** Producción por hora según buildings-complete (nivel lineal). */
export declare function productionFromBuilding(type: string, level: number): {
    metal?: number;
    plasma?: number;
    credits?: number;
};
export declare function capacityBonusFromBuilding(type: string, level: number): {
    metal?: number;
    plasma?: number;
};
export declare function countBuildingsOfType(buildings: {
    type: string;
    level: number;
    slotIndex: number;
    status: string;
}[], apiType: string): number;
export declare function canPlaceBuildingType(buildings: {
    type: string;
    level: number;
    slotIndex: number;
    status: string;
}[], apiType: string, slotIndex: number): {
    ok: boolean;
    error?: string;
};
