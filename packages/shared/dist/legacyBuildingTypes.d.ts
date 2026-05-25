import type { CanonicalBuildingTypeId } from './planetLayout';
/** Tipos legacy API (mayoría en mayúsculas) → snake_case canónico */
export declare const LEGACY_TO_CANONICAL: Record<string, CanonicalBuildingTypeId>;
export declare function normalizeBuildingType(type: string): string;
export declare function isCanonicalBuildingType(type: string): boolean;
