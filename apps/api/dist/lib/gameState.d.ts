import { type GameResourcesDto } from '@galaxy/shared';
export declare function completeDueBuildingsForEmpire(empireId: string): Promise<number>;
export interface SyncResult {
    resources: GameResourcesDto;
    collected: {
        metal: number;
        plasma: number;
        credits: number;
    };
}
export declare function syncEmpireGameState(empireId: string): Promise<SyncResult>;
