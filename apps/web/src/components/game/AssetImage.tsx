'use client';

import { useState } from 'react';

export type GlowVariant = 'cyan' | 'purple' | 'gold' | 'red' | 'none';

const glowClass: Record<GlowVariant, string> = {
  cyan: 'drop-shadow-[0_0_16px_rgba(34,211,238,0.6)]',
  purple: 'drop-shadow-[0_0_16px_rgba(168,85,247,0.6)]',
  gold: 'drop-shadow-[0_0_16px_rgba(251,191,36,0.6)]',
  red: 'drop-shadow-[0_0_16px_rgba(248,113,113,0.6)]',
  none: '',
};

const glowHover: Record<GlowVariant, string> = {
  cyan: 'hover:drop-shadow-[0_0_24px_rgba(34,211,238,0.8)]',
  purple: 'hover:drop-shadow-[0_0_24px_rgba(168,85,247,0.8)]',
  gold: 'hover:drop-shadow-[0_0_24px_rgba(251,191,36,0.8)]',
  red: 'hover:drop-shadow-[0_0_24px_rgba(248,113,113,0.8)]',
  none: '',
};

export interface AssetImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  glow?: GlowVariant;
  icon?: string;
  showTransition?: boolean;
}

export function AssetImage({
  src,
  alt,
  className = '',
  fallback,
  glow = 'cyan',
  icon = '🛸',
  showTransition = true,
}: AssetImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center ${glowClass[glow]} ${className}`}
        role="img"
        aria-label={alt}
      >
        {fallback ?? (
          <div className="flex flex-col items-center justify-center w-full h-full min-h-[48px] rounded-lg border border-cyan-500/30 bg-gradient-to-br from-slate-800/90 to-slate-950/90 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50">
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
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`
          object-contain w-full h-full
          ${glowClass[glow]} ${glowHover[glow]}
          ${showTransition ? 'transition-all duration-500 ease-out' : ''}
          ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
