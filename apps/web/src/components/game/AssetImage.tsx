'use client';

import { useState } from 'react';
import type { GlowVariant } from './types';

const glowClass: Record<GlowVariant, string> = {
  cyan: 'drop-shadow-[0_0_12px_rgba(34,211,238,0.55)]',
  purple: 'drop-shadow-[0_0_12px_rgba(168,85,247,0.55)]',
  gold: 'drop-shadow-[0_0_12px_rgba(251,191,36,0.55)]',
  none: '',
};

export interface AssetImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  glow?: GlowVariant;
  icon?: string;
}

export function AssetImage({
  src,
  alt,
  className = '',
  fallback,
  glow = 'cyan',
  icon = '🛸',
}: AssetImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center ${glowClass[glow]} ${className}`}
        role="img"
        aria-label={alt}
      >
        {fallback ?? (
          <div className="flex flex-col items-center justify-center w-full h-full min-h-[48px] rounded-lg border border-cyan-500/30 bg-gradient-to-br from-slate-800/90 to-slate-950/90">
            <span className="text-2xl md:text-3xl opacity-90">{icon}</span>
            <span className="text-[9px] uppercase tracking-wider text-cyan-400/70 mt-1 px-1 text-center line-clamp-2">
              {alt}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain ${glowClass[glow]} ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
    />
  );
}
