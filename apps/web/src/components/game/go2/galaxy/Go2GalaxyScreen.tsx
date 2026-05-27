'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Go2GalaxyMap } from './Go2GalaxyMap';
import { Go2GalaxyMinimap } from './Go2GalaxyMinimap';
import { Go2GalaxyChat } from './Go2GalaxyChat';
import { Go2BottomNav } from '../Go2BottomNav';
import { GALAXY_PLANETS } from './galaxy-data';
import { useGalaxyMap } from './useGalaxyMap';

// Icons as simple SVG components for retro GO2 look
const SectorLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8L10 13" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SectorRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 3L11 8L6 13" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="#64b5f6" strokeWidth="1.5"/>
    <circle cx="7" cy="7" r="2" fill="#64b5f6"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1a6 6 0 0 1 6 6M7 1v3M7 1l-2 2" stroke="#64b5f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 13a6 6 0 0 1-6-6M7 13v-3M7 13l2-2" stroke="#64b5f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ActionButton = ({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center gap-0.5
      w-11 h-11 rounded-full
      transition-all duration-150
      ${active 
        ? 'bg-gradient-to-b from-blue-500/40 to-blue-700/40 border border-blue-400/60 shadow-lg shadow-blue-500/20' 
        : 'bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-blue-500/20 hover:border-blue-400/40 hover:from-slate-700/80 hover:to-slate-800/80'
      }
    `}
  >
    <span className="text-base">{icon}</span>
  </button>
);

const SideButton = ({ icon, onClick, title }: { icon: string; onClick?: () => void; title?: string }) => (
  <button
    onClick={onClick}
    title={title}
    className="
      w-9 h-9 rounded-lg
      flex items-center justify-center
      bg-gradient-to-b from-slate-800/70 to-slate-900/70
      border border-blue-500/20
      hover:border-blue-400/40 hover:from-slate-700/70 hover:to-slate-800/70
      transition-all duration-150
      shadow-md
    "
  >
    <span className="text-sm">{icon}</span>
  </button>
);

// Sector data
const SECTORS = [
  { id: 'S01', name: 'Ursa Major', count: 5 },
  { id: 'S02', name: 'Orion', count: 8 },
  { id: 'S03', name: 'Cygnus', count: 12 },
  { id: 'S04', name: 'Andromeda', count: 15 },
  { id: 'S05', name: 'Draco', count: 10 },
];

export function Go2GalaxyScreen() {
  const {
    camera,
    hoveredPlanet,
    selectedPlanet,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleClick,
    handleWheel,
    handleResize,
  } = useGalaxyMap();

  // Sector navigation
  const [currentSectorIdx, setCurrentSectorIdx] = useState(0);
  const currentSector = SECTORS[currentSectorIdx];

  // Timer
  const [timer, setTimer] = useState('00:35:37');
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        const [h, m, s] = prev.split(':').map(Number);
        let newS = s + 1;
        let newM = m;
        let newH = h;
        if (newS >= 60) { newS = 0; newM++; }
        if (newM >= 60) { newM = 0; newH++; }
        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:${String(newS).padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const prevSector = useCallback(() => {
    setCurrentSectorIdx(i => (i > 0 ? i - 1 : SECTORS.length - 1));
  }, []);

  const nextSector = useCallback(() => {
    setCurrentSectorIdx(i => (i < SECTORS.length - 1 ? i + 1 : 0));
  }, []);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#060d1a] select-none">
      {/* Galaxy Map Canvas */}
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

      {/* ==================== SECTOR NAVIGATOR (Top Left) ==================== */}
      <div className="absolute top-3 left-3 z-30">
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0a1628]/90 border border-blue-500/20 backdrop-blur-sm">
          <button onClick={prevSector} className="hover:opacity-70 transition-opacity">
            <SectorLeftIcon />
          </button>
          <button className="hover:opacity-70 transition-opacity mx-1">
            <HomeIcon />
          </button>
          <span className="text-cyan-400 font-bold text-xs font-mono tracking-wide mx-1">
            {currentSector.id}. {currentSector.name} ({currentSector.count})
          </span>
          <button className="hover:opacity-70 transition-opacity mx-1">
            <RefreshIcon />
          </button>
          <button onClick={nextSector} className="hover:opacity-70 transition-opacity">
            <SectorRightIcon />
          </button>
        </div>
      </div>

      {/* ==================== RESOURCE INFO (Top Right) ==================== */}
      <div className="absolute top-3 right-3 z-30">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#0a1628]/90 border border-blue-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-xs">&#9679;</span>
            <span className="text-amber-200 text-xs font-mono">1.2M</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-cyan-400 text-xs">&#9679;</span>
            <span className="text-cyan-200 text-xs font-mono">850K</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-purple-400 text-xs">&#9679;</span>
            <span className="text-purple-200 text-xs font-mono">420K</span>
          </div>
        </div>
      </div>

      {/* ==================== SIDE BUTTONS (Left) ==================== */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
        <SideButton icon="&#128260;" title="Refresh" />
        <SideButton icon="&#127758;" title="Map" />
        <SideButton icon="&#127968;" title="Home" />
        <div className="mt-2 px-2 py-1 rounded bg-[#0a1628]/80 border border-green-500/20">
          <span className="text-green-400 text-[10px] font-mono">{timer}</span>
        </div>
      </div>

      {/* ==================== CHAT PANEL (Bottom Left) ==================== */}
      <div className="absolute bottom-[72px] left-3 z-30">
        <Go2GalaxyChat />
      </div>

      {/* ==================== MINIMAP (Bottom Right, above nav) ==================== */}
      <div className="absolute bottom-[72px] right-3 z-30">
        <Go2GalaxyMinimap
          planets={GALAXY_PLANETS}
          camera={camera}
          mapWidth={GALAXY_PLANETS.reduce((max, p) => Math.max(max, p.x), 0) + 2}
          mapHeight={GALAXY_PLANETS.reduce((max, p) => Math.max(max, p.y), 0) + 2}
          viewportWidth={typeof window !== 'undefined' ? window.innerWidth : 1200}
          viewportHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
          onViewportClick={(worldX, worldY) => {
            console.log('Minimap click:', worldX, worldY);
          }}
        />
      </div>

      {/* ==================== ACTION BAR (Bottom Right, above nav) ==================== */}
      <div className="absolute bottom-[72px] right-[180px] z-30">
        <div className="flex items-center gap-1.5 px-2 py-2 rounded-xl bg-gradient-to-t from-[#0a1628]/95 to-[#0a1628]/70 border border-blue-500/10 backdrop-blur-sm">
          <ActionButton icon="&#127759;" label="Planet" />
          <ActionButton icon="&#127756;" label="Galaxy" active />
          <ActionButton icon="&#128640;" label="Fleets" />
          <ActionButton icon="&#128737;" label="Shield" />
          <ActionButton icon="&#9993;" label="Mail" />
          <ActionButton icon="&#9881;" label="Settings" />
          <ActionButton icon="&#128100;" label="Profile" />
          <ActionButton icon="&#127942;" label="Rank" />
        </div>
      </div>

      {/* ==================== BOTTOM NAVIGATION ==================== */}
      <Go2BottomNav />
    </div>
  );
}
