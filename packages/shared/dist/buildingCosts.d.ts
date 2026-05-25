export interface BuildCostResult {
    metal: number;
    plasma: number;
    credits: number;
    /** Duración en segundos */
    time: number;
}
export declare function getBuildingLevelCost(rawType: string, targetLevel: number, devCheap?: boolean): BuildCostResult;
