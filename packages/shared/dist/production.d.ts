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
/**
 * Counts buildings that are currently mid-construction or mid-upgrade, i.e. occupying a
 * slot in the construction queue. Used to enforce GO2_CONSTRUCTION_QUEUE_SIZE.
 */
export declare function countActiveConstruction(buildings: {
    status: string;
}[]): number;
export declare function canPlaceBuildingType(buildings: {
    type: string;
    level: number;
    slotIndex: number;
    status: string;
}[], apiType: string, slotIndex: number): {
    ok: boolean;
    error?: string;
};
