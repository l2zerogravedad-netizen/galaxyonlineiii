'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Go2GalaxyMap } from './Go2GalaxyMap';
import { Go2GalaxyMinimap } from './Go2GalaxyMinimap';
import { Go2GalaxyChat } from './Go2GalaxyChat';
import { Go2GalaxyTooltip } from './Go2GalaxyTooltip';
import { Go2BottomNav } from '../Go2BottomNav';
import { GALAXY_PLANETS } from './galaxy-data';
import { useGalaxyMap } from './useGalaxyMap';

/* ------------------------------------------------------------------ */
/*  Sector data                                                        */
/* ------------------------------------------------------------------ */

interface SectorInfo {
  id: string;
  name: string;
  count: number;
}

const SECTORS: SectorInfo[] = [
  { id: 'S01', name: 'Ursa Major', count: 5 },
  { id: 'S02', name: 'Orion', count: 8 },
  { id: 'S03', name: 'Cassiopeia', count: 6 },
  { id: 'S04', name: 'Andromeda', count: 7 },
  { id: 'S05', name: 'Cygnus', count: 4 },
  { id: 'S06', name: 'Draco', count: 9 },
  { id: 'S07', name: 'Phoenix', count: 3 },
  { id: 'S08', name: 'Leo', count: 6 },
];

/* ------------------------------------------------------------------ */
/*  Timer hook                                                         */
/* ------------------------------------------------------------------ */

function useTimer(initialSeconds: number): string {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');

  return `${h}:${m}:${s}`;
}

/* ------------------------------------------------------------------ */
/*  Action-bar button data                                             */
/* ------------------------------------------------------------------ */

interface ActionButton {
  icon: string;
  label: string;
}

const ACTION_BUTTONS: ActionButton[] = [
  { icon: '\uD83C\uDF0D', label: 'Planet' },
  { icon: '\uD83D\uDDFA\uFE0F', label: 'Galaxy' },
  { icon: '\u2694\uFE0F', label: 'Fleets' },
  { icon: '\u2709\uFE0F', label: 'Messages' },
  { icon: '\uD83D\uDEE1\uFE0F', label: 'Shield' },
  { icon: '\u2699\uFE0F', label: 'Settings' },
  { icon: '\uD83D\uDC64', label: 'Profile' },
  { icon: '\uD83D\uDCCB', label: 'Ranking' },
];

/* ------------------------------------------------------------------ */
/*  Side-button data                                                   */
/* ------------------------------------------------------------------ */

interface SideButton {
  icon: string;
  label: string;
}

const SIDE_BUTTONS: SideButton[] = [
  { icon: '\uD83D\uDD04', label: 'Refresh' },
  { icon: '\uD83D\uDDFA\uFE0F', label: 'Map' },
  { icon: '\uD83C\uDFE0', label: 'Base' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

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

  /* -- Sector navigation -- */
  const [sectorIndex, setSectorIndex] = useState(0);
  const currentSector = SECTORS[sectorIndex];

  const goPrevSector = useCallback(() => {
    setSectorIndex((prev) => (prev > 0 ? prev - 1 : SECTORS.length - 1));
  }, []);

  const goNextSector = useCallback(() => {
    setSectorIndex((prev) => (prev < SECTORS.length - 1 ? prev + 1 : 0));
  }, []);

  const goHomeSector = useCallback(() => {
    setSectorIndex(0);
  }, []);

  /* -- Timer -- */
  const timerDisplay = useTimer(2137); // starts at ~00:35:37

  /* -- Canvas resize -- */
  const handleResize = useCallback(
    (width: number, height: number) => {
      updateCanvasSize(width, height);
    },
    [updateCanvasSize]
  );

  /* -- Hover refs for side buttons -- */
  const [hoveredSideBtn, setHoveredSideBtn] = useState<number | null>(null);
  const [hoveredActionBtn, setHoveredActionBtn] = useState<number | null>(null);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        backgroundColor: '#0a1628',
        fontFamily: 'monospace',
      }}
    >
      {/* ============================================================ */}
      {/* 1. Canvas Map — full viewport                                 */}
      {/* ============================================================ */}
      <Go2GalaxyMap
        camera={camera}
        hoveredPlanet={hoveredPlanet}
        selectedPlanet={selectedPlanet}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        onResize={handleResize}
      />

      {/* ============================================================ */}
      {/* 2. Sector Navigator (top-left)                                */}
      {/* ============================================================ */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 50,
          backgroundColor: 'rgba(10, 30, 60, 0.85)',
          border: '1px solid rgba(100, 150, 255, 0.2)',
          borderRadius: 6,
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          minWidth: 180,
        }}
      >
        {/* Sector name row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 'bold',
            color: '#64b5f6',
            fontFamily: 'monospace',
          }}
        >
          <button
            onClick={goPrevSector}
            style={{
              background: 'none',
              border: 'none',
              color: '#64b5f6',
              fontSize: 14,
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            &#9664;
          </button>
          <span>
            {currentSector.id}. {currentSector.name} ({currentSector.count})
          </span>
          <button
            onClick={goNextSector}
            style={{
              background: 'none',
              border: 'none',
              color: '#64b5f6',
              fontSize: 14,
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            &#9654;
          </button>
        </div>

        {/* Sub-controls: prev / home / next */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={goPrevSector}
            title="Previous sector"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: 'rgba(20, 50, 100, 0.6)',
              border: '1px solid rgba(100, 150, 255, 0.25)',
              color: '#64b5f6',
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            &#9664;
          </button>
          <button
            onClick={goHomeSector}
            title="Home sector"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: 'rgba(20, 50, 100, 0.6)',
              border: '1px solid rgba(100, 150, 255, 0.25)',
              color: '#64b5f6',
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            &#8962;
          </button>
          <button
            onClick={goNextSector}
            title="Next sector"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: 'rgba(20, 50, 100, 0.6)',
              border: '1px solid rgba(100, 150, 255, 0.25)',
              color: '#64b5f6',
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            &#9654;
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. Left sidebar — Action Buttons                              */}
      {/* ============================================================ */}
      <div
        style={{
          position: 'absolute',
          left: 10,
          top: 110,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {SIDE_BUTTONS.map((btn, i) => (
          <button
            key={btn.label}
            title={btn.label}
            onMouseEnter={() => setHoveredSideBtn(i)}
            onMouseLeave={() => setHoveredSideBtn(null)}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor:
                hoveredSideBtn === i
                  ? 'rgba(30, 70, 140, 0.8)'
                  : 'rgba(20, 50, 100, 0.6)',
              border: '1px solid rgba(100, 150, 255, 0.3)',
              color: '#64b5f6',
              fontSize: 15,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s',
              textShadow:
                hoveredSideBtn === i
                  ? '0 0 8px rgba(100, 181, 246, 0.6)'
                  : 'none',
            }}
          >
            {btn.icon}
          </button>
        ))}

        {/* ========================================================== */}
        {/* 4. Timer (below side buttons)                               */}
        {/* ========================================================== */}
        <div
          style={{
            marginTop: 4,
            textAlign: 'center',
            fontSize: 11,
            fontFamily: 'monospace',
            color: '#4caf50',
            letterSpacing: 1,
            userSelect: 'none',
          }}
        >
          {timerDisplay}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. Coordinates HUD (top-left, below sector nav)               */}
      {/* ============================================================ */}
      <div
        style={{
          position: 'absolute',
          top: 110,
          left: 56,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(10, 30, 60, 0.7)',
            border: '1px solid rgba(100, 150, 255, 0.12)',
            borderRadius: 4,
            padding: '5px 10px',
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#5a7a9c',
            lineHeight: 1.6,
          }}
        >
          <div>
            Viewport: [
            {Math.round(viewportCoords.topLeft.wx)}:
            {Math.round(viewportCoords.topLeft.wy)}]
          </div>
          <div>Planets: {GALAXY_PLANETS.length}</div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 9. Action Bar — bottom-right, 8 circular buttons              */}
      {/* ============================================================ */}
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          right: 180,
          zIndex: 50,
          display: 'flex',
          gap: 6,
        }}
      >
        {ACTION_BUTTONS.map((btn, i) => (
          <button
            key={btn.label}
            title={btn.label}
            onMouseEnter={() => setHoveredActionBtn(i)}
            onMouseLeave={() => setHoveredActionBtn(null)}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background:
                hoveredActionBtn === i
                  ? 'linear-gradient(180deg, rgba(30, 60, 120, 0.9), rgba(20, 40, 90, 0.95))'
                  : 'linear-gradient(180deg, rgba(20, 40, 80, 0.8), rgba(10, 20, 50, 0.9))',
              border: '1px solid rgba(100, 150, 255, 0.25)',
              color: '#64b5f6',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
              boxShadow:
                hoveredActionBtn === i
                  ? '0 0 12px rgba(100, 181, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.08)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 7. Minimap — bottom-right, above bottom nav                   */}
      {/* ============================================================ */}
      <Go2GalaxyMinimap
        camera={camera}
        canvasWidth={canvasSizeRef.current?.width || 1920}
        canvasHeight={canvasSizeRef.current?.height || 1080}
      />

      {/* ============================================================ */}
      {/* 8. Chat Panel — bottom-left, above bottom nav                 */}
      {/* ============================================================ */}
      <Go2GalaxyChat />

      {/* ============================================================ */}
      {/* 11. Tooltip — near cursor                                     */}
      {/* ============================================================ */}
      <Go2GalaxyTooltip
        planet={tooltip.planet}
        x={tooltip.x}
        y={tooltip.y}
        visible={tooltip.visible}
      />

      {/* ============================================================ */}
      {/* 10. Bottom Navigation                                         */}
      {/* ============================================================ */}
      <Go2BottomNav />
    </div>
  );
};

Go2GalaxyScreen.displayName = 'Go2GalaxyScreen';
