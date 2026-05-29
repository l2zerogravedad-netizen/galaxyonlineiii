/**
 * ====================================================================
 * HealthBar — Stub component
 * Barra de vida para stacks
 * Será reemplazado por el agente de UI de batalla
 * ====================================================================
 */

import React from 'react';

/** Visual variant for battle resource bars */
export type HealthBarType = 'shield' | 'hull' | 'he3';

export interface HealthBarProps {
  current: number;
  max: number;
  /** Semantic color (legacy API) */
  color?: 'cyan' | 'rose' | 'green';
  /** Battle resource variant — drives the bar color */
  type?: HealthBarType;
  label?: string;
  /** Explicit pixel width; defaults to full-width when omitted */
  width?: number;
  /** Show the numeric current/max readout */
  showText?: boolean;
  className?: string;
}

const colorMap: Record<NonNullable<HealthBarProps['color']>, string> = {
  cyan: 'bg-cyan-500',
  rose: 'bg-rose-500',
  green: 'bg-green-500',
};

const typeConfig: Record<HealthBarType, { bar: string; label: string }> = {
  shield: { bar: 'bg-cyan-400', label: 'SHIELD' },
  hull: { bar: 'bg-green-500', label: 'HULL' },
  he3: { bar: 'bg-yellow-400', label: 'HE3' },
};

export function HealthBar({
  current,
  max,
  color = 'green',
  type,
  label,
  width,
  showText = false,
  className = '',
}: HealthBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const barColor = type ? typeConfig[type].bar : colorMap[color];
  const heading = label ?? (type ? typeConfig[type].label : undefined);

  return (
    <div
      className={width === undefined ? `w-full ${className}` : className}
      style={width === undefined ? undefined : { width }}
    >
      {(heading || showText) && (
        <div className="flex items-center justify-between mb-0.5">
          {heading && (
            <span className="text-[10px] text-[#5a7a9a] uppercase tracking-wider">{heading}</span>
          )}
          {showText && (
            <span className="text-[10px] text-[#8b9bb4] tabular-nums">
              {Math.round(current)}/{Math.round(max)}
            </span>
          )}
        </div>
      )}
      <div className="h-1.5 bg-[#1a2d4f] rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
