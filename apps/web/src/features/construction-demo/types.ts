export type BuildingTypeId =
  | 'metal_mine'
  | 'power_plant'
  | 'warehouse'
  | 'shipyard'
  | 'command_center';

export type Rotation = 0 | 90 | 180 | 270;

export interface Resources {
  metal: number;
  energy: number;
  crystal: number;
}

export interface BuildingCatalogItem {
  id: BuildingTypeId;
  name: string;
  description: string;
  cost: Resources;
  footprint: { w: number; h: number };
  color: string;
  accent: string;
  icon: string;
  maxOnMap?: number;
}

export interface PlacedBuilding {
  instanceId: string;
  typeId: BuildingTypeId;
  col: number;
  row: number;
  rotation: Rotation;
}

export interface GridCell {
  col: number;
  row: number;
}

export interface DemoSave {
  version: 1;
  resources: Resources;
  buildings: PlacedBuilding[];
}

export interface DragState {
  typeId: BuildingTypeId;
  rotation: Rotation;
}
