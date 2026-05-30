'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Go2GalaxyMap } from './Go2GalaxyMap';
import { Go2GalaxyMinimap } from './Go2GalaxyMinimap';
import { Go2GalaxyChat } from './Go2GalaxyChat';
import { Go2BottomNav } from '../Go2BottomNav';
import { Go2BaseMenu } from '@/features/construction-demo/Go2BaseMenu';
import { GALAXY_PLANETS } from './galaxy-data';
import { useGalaxyMap } from './useGalaxyMap';
import {
  getGalaxySector,
  moveFleet,
  type GalaxyPlanetData,
  type GalaxyFleetData,
} from '@/lib/game/galaxyClient';

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

/** Convert backend planet data to local GalaxyPlanet format */
function apiPlanetToLocal(p: GalaxyPlanetData) {
  return {
    id: p.id,
    name: p.name,
    playerName: p.playerName || 'Unknown',
    alliance: p.alliance || 'Independent',
    allianceTag: p.allianceTag || '[IND]',
    level: p.level || 1,
    type: p.type || 'earth',
    x: p.x || 0,
    y: p.y || 0,
    hasShield: p.hasShield || false,
    hasMilitary: false,
    population: 0,
    resources: { metal: 0, crystal: 0, energy: 0 },
    buildings: 0,
  } as typeof GALAXY_PLANETS[0];
}

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
    updateCanvasSize,
  } = useGalaxyMap();

  // API state
  const [backendPlanets, setBackendPlanets] = useState<GalaxyPlanetData[]>([]);
  const [backendFleets, setBackendFleets] = useState<GalaxyFleetData[]>([]);
  const [galaxyLoading, setGalaxyLoading] = useState(false);
  const [galaxyError, setGalaxyError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(true);
  const [moveStatus, setMoveStatus] = useState<string | null>(null);

  // Load galaxy sector from API
  const loadGalaxy = useCallback(async (x: number, y: number, radius: number = 10) => {
    setGalaxyLoading(true);
    setGalaxyError(null);
    try {
      const data = await getGalaxySector(x, y, radius);
      if (data?.planets) {
        setBackendPlanets(data.planets);
        setUsingFallback(false);
      }
      if (data?.fleets) {
        setBackendFleets(data.fleets);
      }
    } catch (err) {
      console.warn('[Go2GalaxyScreen] Galaxy API error, using local fallback:', err);
      setGalaxyError(err instanceof Error ? err.message : 'Failed to load galaxy');
      setUsingFallback(true);
    } finally {
      setGalaxyLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadGalaxy(0, 0, 10);
  }, [loadGalaxy]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    loadGalaxy(0, 0, 10);
  }, [loadGalaxy]);

  // Move fleet handler
  const handleMoveFleet = useCallback(async (fleetId: string, targetX: number, targetY: number) => {
    setMoveStatus('Moving...');
    try {
      const result = await moveFleet(fleetId, targetX, targetY);
      setMoveStatus(`Arrival: ${result.arrivalTime || 'calculating...'}`);
      setTimeout(() => setMoveStatus(null), 3000);
      // Refresh galaxy after move
      loadGalaxy(0, 0, 10);
    } catch (err) {
      console.error('[Go2GalaxyScreen] Move fleet error:', err);
      setMoveStatus(err instanceof Error ? err.message : 'Move failed');
      setTimeout(() => setMoveStatus(null), 3000);
    }
  }, [loadGalaxy]);

  // Combine backend planets with local NPC planets
  // Backend planets take priority (by ID), NPCs fill in
  const combinedPlanets = React.useMemo(() => {
    if (backendPlanets.length === 0) return GALAXY_PLANETS;
    const apiIds = new Set(backendPlanets.map((p) => p.id));
    const localOnly = GALAXY_PLANETS.filter((p) => !apiIds.has(p.id));
    const mapped = backendPlanets.map(apiPlanetToLocal);
    return [...mapped, ...localOnly];
  }, [backendPlanets]);

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
        onResize={updateCanvasSize}
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
          <button 
            className="hover:opacity-70 transition-opacity mx-1"
            onClick={handleRefresh}
            title="Refresh galaxy data"
          >
            <RefreshIcon />
          </button>
          <button onClick={nextSector} className="hover:opacity-70 transition-opacity">
            <SectorRightIcon />
          </button>
          {/* API status indicator */}
          {galaxyLoading && (
            <span className="ml-1 text-[9px] text-yellow-300 animate-pulse">⟳</span>
          )}
          {usingFallback && !galaxyLoading && (
            <span className="ml-1 text-[9px] text-white/30" title="Local data">●</span>
          )}
          {!usingFallback && !galaxyLoading && (
            <span className="ml-1 text-[9px] text-green-400" title="Live data">●</span>
          )}
        </div>
      </div>

      {/* ==================== ERROR BANNER ==================== */}
      {galaxyError && (
        <div className="absolute top-14 left-3 z-30">
          <div className="px-3 py-1.5 rounded-lg bg-red-900/80 border border-red-500/40 backdrop-blur-sm">
            <span className="text-red-300 text-[10px] font-mono">⚠ {galaxyError}</span>
            <button 
              className="ml-2 text-red-300 text-[10px] underline"
              onClick={() => setGalaxyError(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ==================== MOVE STATUS ==================== */}
      {moveStatus && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30">
          <div className="px-4 py-1.5 rounded-lg bg-blue-900/80 border border-blue-500/40 backdrop-blur-sm">
            <span className="text-blue-300 text-[10px] font-mono">{moveStatus}</span>
          </div>
        </div>
      )}

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
        <SideButton icon="&#128260;" title="Refresh" onClick={handleRefresh} />
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
          camera={camera}
          canvasWidth={typeof window !== 'undefined' ? window.innerWidth : 1200}
          canvasHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
        />
      </div>

      {/* Barra de acciones antigua eliminada: ahora usamos el MISMO menú de la base
          terrestre (Go2BaseMenu) abajo, para no duplicar botones. */}

      {/* ==================== SELECTED PLANET PANEL ==================== */}
      {selectedPlanet && (
        <div className="absolute top-20 right-3 z-30">
          <div className="w-[200px] rounded-lg bg-[#0a1628]/95 border border-blue-500/20 backdrop-blur-sm p-3">
            <div className="text-cyan-400 font-bold text-xs font-mono mb-1">
              {selectedPlanet.name}
            </div>
            <div className="text-white/60 text-[10px] font-mono mb-0.5">
              {selectedPlanet.allianceTag} {selectedPlanet.playerName}
            </div>
            <div className="text-white/40 text-[10px] font-mono mb-2">
              Lv.{selectedPlanet.level} | ({selectedPlanet.x}, {selectedPlanet.y})
            </div>
            <div className="flex gap-1.5">
              <button
                className="flex-1 py-1 text-[9px] font-bold uppercase rounded bg-blue-600/40 border border-blue-500/30 text-blue-300 hover:bg-blue-600/60 transition-colors"
                onClick={() => {
                  // Placeholder: scout action
                  console.log('Scout', selectedPlanet.id);
                }}
              >
                Scout
              </button>
              <button
                className="flex-1 py-1 text-[9px] font-bold uppercase rounded bg-red-600/40 border border-red-500/30 text-red-300 hover:bg-red-600/60 transition-colors"
                onClick={() => {
                  // Placeholder: attack action
                  console.log('Attack', selectedPlanet.id);
                }}
              >
                Attack
              </button>
              <button
                className="flex-1 py-1 text-[9px] font-bold uppercase rounded bg-green-600/40 border border-green-500/30 text-green-300 hover:bg-green-600/60 transition-colors"
                onClick={() => {
                  // Placeholder: move fleet action
                  if (backendFleets.length > 0) {
                    handleMoveFleet(backendFleets[0].id, selectedPlanet.x, selectedPlanet.y);
                  } else {
                    setMoveStatus('No fleets available');
                    setTimeout(() => setMoveStatus(null), 2000);
                  }
                }}
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== BACKEND FLEETS INDICATOR ==================== */}
      {backendFleets.length > 0 && (
        <div className="absolute bottom-[180px] right-3 z-30">
          <div className="px-2 py-1 rounded-lg bg-[#0a1628]/80 border border-blue-500/20">
            <span className="text-blue-300 text-[10px] font-mono">
              {backendFleets.length} fleet{backendFleets.length > 1 ? 's' : ''} active
            </span>
          </div>
        </div>
      )}

      {/* ==================== MENÚ GO2 (idéntico al de la base terrestre) ==================== */}
      <Go2BaseMenu active="galaxy" />
    </div>
  );
}
