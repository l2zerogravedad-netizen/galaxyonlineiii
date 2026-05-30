/**
 * Assets HD de prueba (Downloads) — reemplazables en el modelo final.
 * Iconos: desctock_icons_hd.zip
 * Edificios: galaxy_buildings_hd.zip
 */

import type { Go2IconName } from '@/components/game/go2/Go2Icons';

const UI_HD = '/game/assets/ui/hd';
const BUILDINGS_HD = '/game/assets/buildings/hd';

/** Iconos PNG → nombres lógicos del UI GO2 */
export const GO2_HD_ICON_SRC: Partial<Record<Go2IconName, string>> = {
  'nav-planet': `${UI_HD}/home_icon_hd.png`,
  'nav-galaxy': `${UI_HD}/star_icon_hd.png`,
  'nav-station': `${UI_HD}/people_icon_hd.png`,
  'nav-market': `${UI_HD}/bag_icon_hd.png`,
  'nav-fleets': `${UI_HD}/plane_icon_hd.png`,
  inventory: `${UI_HD}/bag_icon_hd.png`,
  mission: `${UI_HD}/bag_icon_hd.png`,
  chest: `${UI_HD}/bag_icon_hd.png`,
  ship: `${UI_HD}/plane_icon_hd.png`,
  shield: `${UI_HD}/shield_icon_hd.png`,
  module: `${UI_HD}/shield_icon_hd.png`,
  clan: `${UI_HD}/people_icon_hd.png`,
  research: `${UI_HD}/people_icon_hd.png`,
  premium: `${UI_HD}/star_icon_hd.png`,
  'star-self': `${UI_HD}/star_icon_hd.png`,
  'star-ally': `${UI_HD}/star_icon_hd.png`,
};

/** Edificios PNG → catalogId del catálogo terrestre */
export const GO2_HD_BUILDING_SRC: Record<string, string> = {
  'control-center': `${BUILDINGS_HD}/control-center.png`,
  'metal-extractor': `${BUILDINGS_HD}/metal-extractor.png`,
  'plasma-refinery': `${BUILDINGS_HD}/plasma-refinery.png`,
  'energy-generator': `${BUILDINGS_HD}/energy-generator.png`,
  warehouse: `${BUILDINGS_HD}/warehouse.png`,
  'residential-area': `${BUILDINGS_HD}/residential-area.png`,
  'research-lab': `${BUILDINGS_HD}/research-lab.png`,
  'trading-center': `${BUILDINGS_HD}/trading-center.png`,
  shipyard: `${BUILDINGS_HD}/shipyard.png`,
  hangar: `${BUILDINGS_HD}/hangar.png`,
  'defense-turret': `${BUILDINGS_HD}/defense-turret.png`,
  radar: `${BUILDINGS_HD}/radar.png`,
};

export function hasHdBuilding(catalogId: string): boolean {
  return catalogId in GO2_HD_BUILDING_SRC;
}

export function hasHdIcon(name: Go2IconName): boolean {
  return name in GO2_HD_ICON_SRC;
}

/** Prueba de carga GLB (Meshy) — un edificio; el resto se añadirá al catálogo final */
export const GO2_TEST_GLB_BUILDING = {
  id: 'meshy-blueforge-citadel',
  url: '/game/assets/buildings/glb/meshy-blueforge-citadel.glb',
  label: 'Blueforge Citadel (Meshy)',
  /** Tamaño en disco del .glb copiado para test */
  fileBytes: 21_475_924,
  /** Mapeo sugerido al catálogo 2D */
  catalogId: 'control-center',
  sourceFile: 'Meshy_AI_Blueforge_Citadel_0524184700_texture.glb',
} as const;

/** Edificios construibles en el mapa con modelo 3D (catalogId → URL GLB) */
export const GO2_GLB_BY_CATALOG: Record<string, string> = {
  [GO2_TEST_GLB_BUILDING.catalogId]: GO2_TEST_GLB_BUILDING.url,
};

export function getGlbUrlForCatalog(catalogId: string): string | undefined {
  return GO2_GLB_BY_CATALOG[catalogId];
}

export function hasGlbBuilding(catalogId: string): boolean {
  return catalogId in GO2_GLB_BY_CATALOG;
}
