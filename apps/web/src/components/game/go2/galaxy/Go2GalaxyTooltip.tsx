'use client';

import React from 'react';
import type { GalaxyPlanet } from './galaxy-data';
import { ALLIANCE_COLORS } from './galaxy-data';

interface Go2GalaxyTooltipProps {
  planet: GalaxyPlanet | null;
  x: number;
  y: number;
  visible: boolean;
}

export const Go2GalaxyTooltip: React.FC<Go2GalaxyTooltipProps> = ({
  planet,
  x,
  y,
  visible,
}) => {
  if (!visible || !planet) return null;

  const allianceColor = ALLIANCE_COLORS[planet.alliance] || '#adb5bd';

  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 1000,
        backgroundColor: 'rgba(2, 4, 8, 0.92)',
        border: `1px solid ${allianceColor}40`,
        borderRadius: 6,
        padding: '10px 14px',
        minWidth: 200,
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#e9ecef',
        boxShadow: `0 0 20px ${allianceColor}30, 0 4px 12px rgba(0,0,0,0.6)`,
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: 6,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: allianceColor,
            boxShadow: `0 0 6px ${allianceColor}`,
          }}
        />
        <span style={{ fontWeight: 'bold', fontSize: 13 }}>{planet.playerName}</span>
        <span style={{ color: allianceColor, fontSize: 11 }}>{planet.allianceTag}</span>
      </div>

      {/* Planet info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
        <div style={{ color: '#868e96' }}>Planet</div>
        <div>{planet.name}</div>

        <div style={{ color: '#868e96' }}>Coords</div>
        <div style={{ color: '#22d3ee' }}>
          [{planet.x}, {planet.y}]
        </div>

        <div style={{ color: '#868e96' }}>Level</div>
        <div style={{ color: '#f59e0b' }}>Lv.{planet.level}</div>

        <div style={{ color: '#868e96' }}>Type</div>
        <div style={{ textTransform: 'capitalize' }}>{planet.type}</div>

        <div style={{ color: '#868e96' }}>Alliance</div>
        <div style={{ color: allianceColor }}>{planet.alliance}</div>
      </div>

      {/* Resources */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 6,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          gap: 12,
          fontSize: 11,
        }}
      >
        <span>
          <span style={{ color: '#868e96' }}>M: </span>
          <span style={{ color: '#adb5bd' }}>{planet.resources.metal.toLocaleString()}</span>
        </span>
        <span>
          <span style={{ color: '#868e96' }}>C: </span>
          <span style={{ color: '#da77f2' }}>{planet.resources.crystal.toLocaleString()}</span>
        </span>
        <span>
          <span style={{ color: '#868e96' }}>E: </span>
          <span style={{ color: '#ffd43b' }}>{planet.resources.energy.toLocaleString()}</span>
        </span>
      </div>

      {/* Shield indicator */}
      {planet.hasShield && (
        <div
          style={{
            marginTop: 6,
            color: '#fbbf24',
            fontSize: 11,
            textAlign: 'center',
            textShadow: '0 0 6px rgba(251, 191, 36, 0.4)',
          }}
        >
          ◆ SHIELD ACTIVE ◆
        </div>
      )}
    </div>
  );
};

Go2GalaxyTooltip.displayName = 'Go2GalaxyTooltip';
