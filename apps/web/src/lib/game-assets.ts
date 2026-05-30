/**
 * Mapeo de edificios → sprites HD (estilo GO2) para el grid isométrico /destock.
 * Los sprites viven en /public/game/assets/buildings/ (building_*.png).
 *
 * Antes esto devolvía `${id}.webp`, pero esos webp nunca existieron → toda
 * imagen de edificio daba 404. Mapeamos por id de catálogo y por tipo canónico
 * (acepta guion o guion-bajo) a uno de los 6 sprites disponibles; los tipos sin
 * sprite propio caen a un sprite genérico (almacén) para no romper la imagen.
 */

// Los sprites HD viven en destock-isometric/ (la carpeta buildings/ solo tiene README).
const B = '/game/assets/destock-isometric';

const SPRITE_BY_KEY: Record<string, string> = {
  // Centro de comando
  'control-center': 'building_command_center',
  'command_center': 'building_command_center',
  // Extractor de metal
  'metal-extractor': 'building_mine',
  'metal_extractor': 'building_mine',
  // Energía / refinería
  'power-plant': 'building_energy',
  'power_plant': 'building_energy',
  'energy_generator': 'building_energy',
  'gas-refinery': 'building_energy',
  'gas_refinery': 'building_energy',
  'plasma_refinery': 'building_energy',
  // Laboratorio
  'research-lab': 'building_lab',
  'research_lab': 'building_lab',
  // Astillero
  'shipyard': 'building_shipyard',
  // Almacén
  'warehouse': 'building_storage',
};

export function buildingImageSrc(catalogId: string): string {
  const key = (catalogId ?? '').toLowerCase();
  const sprite = SPRITE_BY_KEY[key] ?? 'building_storage';
  return `${B}/${sprite}.png`;
}

export function resourceImageSrc(key: 'metal' | 'plasma' | 'credits'): string {
  const map = {
    metal: 'resource-metal',
    plasma: 'resource-plasma',
    credits: 'resource-credits',
  };
  return `/game/assets/resources/${map[key]}.webp`;
}
