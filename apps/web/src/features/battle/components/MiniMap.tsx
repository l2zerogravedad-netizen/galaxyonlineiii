'use client';

import React, { useCallback, useState } from 'react';

export interface MapUnit {
  id: string;
  x: number; // 0-100
  y: number; // 0-100
  team: 'ally' | 'enemy';
  isDamaged?: boolean;
  isDestroyed?: boolean;
  type: 'fighter' | 'corvette' | 'frigate' | 'destroyer' | 'cruiser';
}

export interface MiniMapProps {
  units: MapUnit[];
  viewportX?: number;
  viewportY?: number;
  viewportW?: number;
  viewportH?: number;
  onClick?: (x: number, y: number) => void;
  className?: string;
}

const unitColors = {
  ally: '#4488ff',
  enemy: '#ff4444',
};

const typeSizes: Record<MapUnit['type'], number> = {
  fighter: 2,
  corvette: 2.5,
  frigate: 3,
  destroyer: 3.5,
  cruiser: 4,
};

export function MiniMap({
  units,
  viewportX = 0,
  viewportY = 0,
  viewportW = 50,
  viewportH = 50,
  onClick,
  className = '',
}: MiniMapProps) {
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onClick) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onClick(x, y);
    },
    [onClick]
  );

  return (
    <div
      className={`relative overflow-hidden cursor-crosshair ${className}`}
      style={{
        width: 150,
        height: 150,
        background: '#0a0e1a',
        border: '2px solid #1e2a4a',
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.5)',
      }}
      onClick={handleMapClick}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(68,136,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(68,136,255,0.3) 1px, transparent 1px)',
          backgroundSize: '25% 25%',
        }}
      />

      {/* Coordinate labels */}
      <div
        className="absolute top-1 left-1 text-[7px] font-bold tracking-wider uppercase"
        style={{ color: '#1e2a4a' }}
      >
        TACTICAL
      </div>

      {/* Viewport rectangle */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${viewportX}%`,
          top: `${viewportY}%`,
          width: `${viewportW}%`,
          height: `${viewportH}%`,
          border: '1px solid rgba(68, 136, 255, 0.3)',
          background: 'rgba(68, 136, 255, 0.04)',
          transition: 'all 200ms ease-out',
        }}
      />

      {/* Center crosshair */}
      <div
        className="absolute top-1/2 left-1/2 w-3 h-px -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'rgba(68,136,255,0.15)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-px h-3 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'rgba(68,136,255,0.15)' }}
      />

      {/* Units */}
      {units.map((unit) => {
        const size = typeSizes[unit.type];
        const color = unitColors[unit.team];
        const isHovered = hoveredUnit === unit.id;

        if (unit.isDestroyed) return null;

        return (
          <div
            key={unit.id}
            className="absolute rounded-full"
            style={{
              left: `${unit.x}%`,
              top: `${unit.y}%`,
              width: size,
              height: size,
              background: color,
              transform: `translate(-50%, -50%) scale(${isHovered ? 2 : 1})`,
              boxShadow: unit.isDamaged
                ? `0 0 4px ${color}, 0 0 8px ${color}66`
                : `0 0 2px ${color}`,
              transition: 'transform 150ms ease',
              animation: unit.isDamaged ? 'damagedBlink 0.6s ease-in-out infinite' : 'none',
              cursor: 'pointer',
              zIndex: isHovered ? 10 : 1,
            }}
            onMouseEnter={() => setHoveredUnit(unit.id)}
            onMouseLeave={() => setHoveredUnit(null)}
          />
        );
      })}

      {/* Unit count indicators */}
      <div
        className="absolute bottom-1 left-1.5 flex items-center gap-1.5"
        style={{ fontSize: '7px' }}
      >
        <span className="font-bold" style={{ color: '#4488ff' }}>
          ● {units.filter((u) => u.team === 'ally' && !u.isDestroyed).length}
        </span>
        <span className="font-bold" style={{ color: '#ff4444' }}>
          ● {units.filter((u) => u.team === 'enemy' && !u.isDestroyed).length}
        </span>
      </div>

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes damagedBlink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
