'use client';

import type { GlowVariant } from '../types';
import { buildingImageSrc } from '@/lib/game-assets';
import { AssetImage } from '../AssetImage';

export function BuildingAssetView({
  catalogId,
  name,
  glow = 'cyan',
  className = '',
}: {
  catalogId: string;
  name: string;
  glow?: GlowVariant;
  className?: string;
}) {
  return (
    <AssetImage
      src={buildingImageSrc(catalogId)}
      alt={name}
      glow={glow}
      className={className}
      fallback={
        <div className="flex h-full w-full items-center justify-center rounded bg-black/30 text-[10px] font-bold text-white/80">
          {name.slice(0, 2)}
        </div>
      }
    />
  );
}
