/** DESTOCK SPACE — tipos propios (sin nomenclatura GO II) */

export type ResourceKey = 'metal' | 'crystal' | 'energy' | 'nova' | 'credits';

export type BuildingId =
  | 'core_drill'
  | 'crystal_lattice'
  | 'flux_reactor'
  | 'nova_collider'
  | 'vault_silo'
  | 'habitat_pod'
  | 'blueforge_citadel'
  | 'nexus_spire'
  | 'prism_lab'
  | 'trade_nexus'
  | 'forge_dock'
  | 'launch_ring'
  | 'pulse_turret'
  | 'sweep_array';

/** Pestañas como en el video GO II (Recursos / Desarrollo / Civil / Milicia / Defensa) */
export type BuildTabId = 'produccion' | 'infra' | 'civil' | 'militar' | 'defensa';

export type Rotation = 0 | 90 | 180 | 270;

export interface Resources {
  metal: number;
  crystal: number;
  energy: number;
  nova: number;
  credits: number;
}

export interface EmpireProfile {
  name: string;
  tag: string;
  level: number;
  xp: number;
  xpMax: number;
}

export interface BuildingSpec {
  id: BuildingId;
  name: string;
  description: string;
  tab: BuildTabId;
  footprint: { w: number; h: number };
  cost: Resources;
  buildSeconds: number;
  maxOnBase: number;
  accent: string;
  color: string;
  unlock?: { buildingId: BuildingId; level: number; label: string };
}

export interface PlacedStructure {
  instanceId: string;
  buildingId: BuildingId;
  col: number;
  row: number;
  rotation: Rotation;
  level: number;
  spawnAt?: number;
}

export interface BuildJob {
  jobId: string;
  buildingId: BuildingId;
  col: number;
  row: number;
  rotation: Rotation;
  targetLevel: number;
  startedAt: number;
  durationMs: number;
  mode: 'build' | 'upgrade';
  instanceId?: string;
}

export interface GridCell {
  col: number;
  row: number;
}

export interface PlanetSave {
  version: 1;
  resources: Resources;
  structures: PlacedStructure[];
  queue: BuildJob[];
  notifications: string[];
}

export interface DragState {
  buildingId: BuildingId;
  rotation: Rotation;
}
