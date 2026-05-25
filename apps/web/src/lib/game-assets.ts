const B = '/game/assets/buildings';

export function buildingImageSrc(catalogId: string): string {
  return `${B}/${catalogId}.webp`;
}

export function resourceImageSrc(key: 'metal' | 'plasma' | 'credits'): string {
  const map = {
    metal: 'resource-metal',
    plasma: 'resource-plasma',
    credits: 'resource-credits',
  };
  return `/game/assets/resources/${map[key]}.webp`;
}
