'use client';

import React, { useCallback, useRef } from 'react';
import { useGalaxyMap } from './useGalaxyMap';
import { Go2GalaxyMap } from './Go2GalaxyMap';
import { Go2GalaxyMinimap } from './Go2GalaxyMinimap';
import { Go2GalaxyChat } from './Go2GalaxyChat';
import { Go2GalaxyTooltip } from './Go2GalaxyTooltip';
import { Go2BottomNav } from '../Go2BottomNav';
import { GALAXY_PLANETS } from './galaxy-data';

export const Go2GalaxyScreen: React.FC = () => {
  const {
    camera,
    hoveredPlanet,
    selectedPlanet,
    tooltip,
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleClick,
    handleWheel,
    updateCanvasSize,
    viewportCoords,
    canvasSizeRef,
  } = useGalaxyMap();

  const handleResize = useCallback(
    (width: number, height: number) => {
      updateCanvasSize(width, height);
    },
    [updateCanvasSize]
  );

  const selectedInfo = selectedPlanet
    ? GALAXY_PLANETS.find((p) => p.id === selectedPlanet.id)
    : null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        backgroundColor: '#020408',
        fontFamily: 'monospace',
      }}
    >
      {/* Canvas Map */}
      <Go2GalaxyMap
        camera={camera}
        hoveredPlanet={hoveredPlanet}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        onResize={handleResize}
      />

      {/* Top-left: Viewport Coordinates */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(2, 4, 8, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 6,
            padding: '8px 12px',
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#868e96',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{ color: '#f59e0b', marginBottom: 4, fontSize: 10, letterSpacing: 1 }}>
            ░ VIEWPORT
          </div>
          <div>
            TL: [{Math.round(viewportCoords.topLeft.wx)}, {Math.round(viewportCoords.topLeft.wy)}]
          </div>
          <div>
            BR: [{Math.round(viewportCoords.bottomRight.wx)}, {Math.round(viewportCoords.bottomRight.wy)}]
          </div>
          <div style={{ color: '#22d3ee', marginTop: 4 }}>
            Zoom: {camera.zoom.toFixed(2)}x
          </div>
        </div>

        {/* Selected planet info */}
        {selectedInfo && (
          <div
            style={{
              backgroundColor: 'rgba(2, 4, 8, 0.85)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 6,
              padding: '8px 12px',
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#e9ecef',
              backdropFilter: 'blur(4px)',
              maxWidth: 200,
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)',
            }}
          >
            <div style={{ color: '#f59e0b', marginBottom: 4, fontSize: 10, letterSpacing: 1 }}>
              ● SELECTED
            </div>
            <div style={{ fontWeight: 'bold', fontSize: 12 }}>{selectedInfo.playerName}</div>
            <div style={{ color: '#868e96', fontSize: 10 }}>
              {selectedInfo.name} — Lv.{selectedInfo.level}
            </div>
            <div style={{ color: '#22d3ee', fontSize: 10, marginTop: 2 }}>
              [{selectedInfo.x}, {selectedInfo.y}] — {selectedInfo.alliance}
            </div>
          </div>
        )}

        {/* Planet count */}
        <div
          style={{
            backgroundColor: 'rgba(2, 4, 8, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 4,
            padding: '4px 10px',
            fontFamily: 'monospace',
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          {GALAXY_PLANETS.length} planets visible
        </div>
      </div>

      {/* Top-right: Controls hint */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 50,
          backgroundColor: 'rgba(2, 4, 8, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 6,
          padding: '8px 12px',
          fontFamily: 'monospace',
          fontSize: 10,
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        <div>🖱 Drag to pan</div>
        <div>⚲ Scroll to zoom</div>
        <div>👆 Click to select</div>
      </div>

      {/* Minimap */}
      <Go2GalaxyMinimap
        camera={camera}
        canvasWidth={canvasSizeRef.current?.width || 1920}
        canvasHeight={canvasSizeRef.current?.height || 1080}
      />

      {/* Chat */}
      <Go2GalaxyChat />

      {/* Tooltip (rendered via portal-like fixed positioning) */}
      <Go2GalaxyTooltip
        planet={tooltip.planet}
        x={tooltip.x}
        y={tooltip.y}
        visible={tooltip.visible}
      />

      {/* Bottom Navigation */}
      <Go2BottomNav />
    </div>
  );
};

Go2GalaxyScreen.displayName = 'Go2GalaxyScreen';
