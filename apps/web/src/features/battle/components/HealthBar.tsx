/**
 * ====================================================================
 * HealthBar — Stub component
 * Barra de vida para stacks
 * Será reemplazado por el agente de UI de batalla
 * ====================================================================
 */

import React from 'react';

export interface HealthBarProps {
  current: number;
  max: number;
  color?: 'cyan' | 'rose' | 'green';
  label?: string;
  className?: string;
}

export function HealthBar({ current, max, color = 'green', label, className = '' }: HealthBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const colorMap = {
    cyan: 'bg-cyan-500',
    rose: 'bg-rose-500',
    green: 'bg-green-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <div className="text-[10px] text-[#5a7a9a] mb-0.5">{label}</div>}
      <div className="h-1.5 bg-[#1a2d4f] rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
