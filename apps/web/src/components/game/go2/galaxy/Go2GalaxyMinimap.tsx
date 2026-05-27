'use client';

import React from 'react';
import { GALAXY_PLANETS, GALAXY_SIZE, ALLIANCE_COLORS } from './galaxy-data';
import type { CameraState } from './useGalaxyMap';

interface Go2GalaxyMinimapProps {
  camera: CameraState;
  canvasWidth: number;
  canvasHeight: number;
}

export const Go2GalaxyMinimap: React.FC<Go2GalaxyMinimapProps> = ({
  camera,
  canvasWidth,
  canvasHeight,
}) => {
  const minimapSize = 160;
  const padding = 10;
  const worldW = GALAXY_SIZE.width * GALAXY_SIZE.cellSize;
  const worldH = GALAXY_SIZE.height * GALAXY_SIZE.cellSize;
  const scale = minimapSize / Math.max(worldW, worldH);

  const viewW = canvasWidth / camera.zoom;
  const viewH = canvasHeight / camera.zoom;
  const viewX = camera.x - viewW / 2;
  const viewY = camera.y - viewH / 2;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: padding + 60,
        right: padding,
        width: minimapSize,
        height: minimapSize,
        backgroundColor: 'rgba(2, 4, 8, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      }}
    >
      <svg width={minimapSize} height={minimapSize} viewBox={`0 0 ${minimapSize} ${minimapSize}`}>
        {/* Background */}
        <rect width={minimapSize} height={minimapSize} fill="#020408" />

        {/* Planet dots */}
        {GALAXY_PLANETS.map((planet) => {
          const px = planet.x * GALAXY_SIZE.cellSize * scale;
          const py = planet.y * GALAXY_SIZE.cellSize * scale;
          const color = ALLIANCE_COLORS[planet.alliance] || '#adb5bd';
          return (
            <circle
              key={planet.id}
              cx={px}
              cy={py}
              r={2}
              fill={color}
              opacity={0.9}
            />
          );
        })}

        {/* Viewport rectangle */}
        <rect
          x={viewX * scale}
          y={viewY * scale}
          width={viewW * scale}
          height={viewH * scale}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={1}
          opacity={0.7}
          rx={2}
        />
      </svg>

      {/* Label */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: 9,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 1,
        }}
      >
        MINIMAP
      </div>
    </div>
  );
};

Go2GalaxyMinimap.displayName = 'Go2GalaxyMinimap';
