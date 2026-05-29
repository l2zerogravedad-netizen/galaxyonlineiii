export interface AccrualInput {
    type: string;
    amount: number;
    capacity: number;
    productionPerHour: number;
    updatedAt: Date | string;
}
export declare function effectiveProductionRate(type: string, baseRate: number, techBonuses: Record<string, number>): number;
export declare function accrueResource(resource: AccrualInput, techBonuses?: Record<string, number>, now?: Date): {
    amount: number;
    gained: number;
    productionPerHour: number;
};
export declare function sumCollected(rows: {
    type: string;
    before: number;
    after: number;
}[]): {
    metal: number;
    plasma: number;
    he3: number;
    credits: number;
};
