'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X, Search, Star, Coins, User, Music, DollarSign,
  ChevronLeft, ChevronRight, Settings, Box, Zap, Crosshair, Shield,
} from 'lucide-react';
import {
  CouponIcon, BlueprintIcon, BookIcon, GemIcon, PlanetIcon, CardIcon, ChipIcon,
  RingPlanetIcon, SolarSystemIcon, BaseHomeIcon, FactoryIcon,
  NetworkGlobeIcon, JetIcon, AllianceIcon, RadarIcon,
} from './hud/StoreIcons';
import {
  QuestAvatarIcon, IsometricBuilding, ScienceAtomIcon, PieChartIcon, WarshipToolsIcon,
  ConstructBuildingIcon, HelmetIcon, QuestBoardIcon, MailEnvelopeIcon, CubeItemIcon,
} from './hud/BuildQuestIcons';
import { storeData, storeTabs as tabs, type StoreItem } from './hud/storeData';
import { questData, buildingsData, type BuildingDef } from './hud/questBuildData';

/**
 * ConstructionDemoPage — Galaxy Online 2-style terrestrial base.
 * The HUD is the user-provided AAA design, reproduced verbatim; the only change
 * vs. the original mockup is that the simulated tan terrain + fake buildings are
 * replaced by the real Three.js planet rendered in a transparent iframe behind it.
 */
type ModalKind = 'shop' | 'lucky' | 'quest' | 'build' | null;

export function ConstructionDemoPage() {
  const [activeTab, setActiveTab] = useState('All Items');
  const [activeModal, setActiveModal] = useState<ModalKind>(null);

  // Dropdown action menus (vertical fly-outs over the bottom console buttons)
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);       // $ / Settings
  const [isGlobeMenuOpen, setIsGlobeMenuOpen] = useState(false); // Globe → build/research
  const [isAllianceMenuOpen, setIsAllianceMenuOpen] = useState(false); // Alliance → quest/mail

  // Quests
  const [showQuestAlert, setShowQuestAlert] = useState(true);
  const [currentQuestId, setCurrentQuestId] = useState('loud');

  // Build modal
  const [buildTab, setBuildTab] = useState('City Services');
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingDef | null>(null);

  const currentQuest = questData[currentQuestId];

  const handleQuestCollect = () => {
    if (currentQuest.buttonType === 'collect') setCurrentQuestId('tech');
  };

  const closeAllMenus = () => {
    setIsGlobeMenuOpen(false);
    setIsAllianceMenuOpen(false);
    setIsFlyoutOpen(false);
  };

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => setLoading(false);
    iframe.addEventListener('load', onLoad);
    // The iframe can finish loading before this effect attaches the listener
    // (then 'load' never fires for us). Cover that case + a hard fallback so the
    // overlay can never get stuck covering the HUD.
    try {
      if (iframe.contentDocument?.readyState === 'complete') setLoading(false);
    } catch (_) { /* cross-origin guard, not applicable here */ }
    const fallback = setTimeout(() => setLoading(false), 4000);
    return () => {
      iframe.removeEventListener('load', onLoad);
      clearTimeout(fallback);
    };
  }, []);

  const renderCurrency = (type: string) => {
    if (type === 'cube') return <div className="w-3 h-3 bg-green-400 border border-green-200 shadow-[0_0_5px_#4ade80] flex-shrink-0"></div>;
    if (type === 'honor') return <Star size={14} className="text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_2px_#fbbf24] flex-shrink-0" />;
    return null;
  };

  const getLabelColor = (label: string) => {
    if (label === 'NEW') return 'text-green-400 shadow-green-400';
    if (label === 'HOT') return 'text-yellow-400 shadow-yellow-400';
    return 'text-transparent';
  };

  const itemsToDisplay: StoreItem[] = storeData[activeTab] || storeData['All Items'];

  return (
    <div className="relative w-full h-screen overflow-hidden select-none font-sans bg-[#04070f]" onClick={closeAllMenus}>

      {/* ==================== 3D PLANET TERRAIN (background) ==================== */}
      <iframe
        ref={iframeRef}
        src="/planet-3d/scene.html"
        title="Planeta 3D"
        className="absolute inset-0 w-full h-full border-0 block z-0"
        allow="fullscreen"
      />
      {loading && (
        <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center bg-[#04070f] text-cyan-300"
          style={{ fontFamily: 'Orbitron, system-ui, sans-serif', letterSpacing: 1 }}>
          <div className="w-11 h-11 mb-3 rounded-full border-[3px] border-[#1f4e7a] border-t-cyan-400 animate-spin" />
          CARGANDO PLANETA…
        </div>
      )}

      {/* ==================== QUEST ALERT BANNER ==================== */}
      {showQuestAlert && !activeModal && (
        <div
          onClick={(e) => { e.stopPropagation(); setActiveModal('quest'); setShowQuestAlert(false); }}
          className="absolute bottom-36 left-4 z-20 w-80 h-20 bg-gradient-to-r from-[#994017] to-[#451a03] border-2 border-yellow-500 rounded-lg flex shadow-[0_0_15px_rgba(234,179,8,0.5)] cursor-pointer hover:scale-105 transition-transform overflow-hidden group">
          <div className="w-20 h-full bg-[#1e1b4b] relative border-r-2 border-yellow-600 flex-shrink-0">
            <QuestAvatarIcon className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 flex flex-col justify-center px-3 relative z-10">
            <div className="text-yellow-400 font-bold text-sm drop-shadow-[0_0_2px_#000]">Quest Completed!</div>
            <div className="text-orange-200 text-xs mt-1 drop-shadow-[0_0_2px_#000]">Quest title: <span className="font-bold text-white">Loud and Clear</span></div>
          </div>
          <div className="absolute inset-0 border-2 border-orange-400 rounded-lg opacity-0 group-hover:opacity-100 animate-pulse pointer-events-none"></div>
        </div>
      )}

      {/* ==================== TOP NAV BAR ==================== */}
      <div className="absolute top-0 left-0 w-full z-10 flex flex-col">
        {/* Banner */}
        <div className="bg-blue-900/90 border-b border-blue-500 h-8 flex items-center justify-center text-xs font-bold gap-4 shadow-md">
          <span className="text-white flex items-center gap-2">
            <span className="text-blue-300">🔊</span> 4-Star Divine Commanders, Rare Blueprints and MORE!
          </span>
          <span className="text-yellow-400">00:00-23:59 6/3(GMT-5), Tell your own fortune with Galaxy Tarot...</span>
        </div>
        {/* Nav Links */}
        <div className="flex px-2 mt-1 gap-1">
          {['Play', 'Invite Friends', 'Buy Points', 'Free Points', 'Facebook Wall', 'Forum', 'Add to Favorite', 'Desktop Shortcut', 'Event ✨', 'VIP'].map((nav, i) => (
            <button key={i} className={`
              px-3 py-1 text-xs font-bold border border-blue-600 rounded-t
              ${nav === 'Play' ? 'bg-[#3b2a1a] text-red-500 border-b-0 border-red-500' : 'bg-black/70 text-blue-200 hover:bg-blue-900'}
              ${nav === 'Buy Points' ? 'text-yellow-400' : ''}
              ${nav === 'Event ✨' ? 'text-yellow-300' : ''}
            `}>
              {nav}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== TOP LEFT HUD (PLAYER) ==================== */}
      <div className="absolute top-16 left-2 flex items-start gap-2 z-10">
        <div className="w-14 h-16 bg-gray-900 border-2 border-gray-600 rounded flex items-center justify-center opacity-90">
          <User size={36} className="text-gray-400" />
        </div>
        <div className="flex flex-col gap-1 w-48">
          <div className="flex items-center justify-between bg-blue-950/80 border border-blue-500/50 rounded px-2 py-0.5">
            <span className="text-sm font-bold text-blue-200">Rayder</span>
            <Crosshair size={14} className="text-blue-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-300">LV.</span>
            <span className="text-sm font-bold text-blue-100">2</span>
            <div className="flex-1 h-2.5 bg-gray-900 border border-gray-600 rounded relative">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-green-400 rounded-sm w-[37%] shadow-[0_0_5px_#4ade80]"></div>
            </div>
            <span className="text-[10px] text-green-400">37%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-yellow-500">SP:</span>
            <div className="flex-1 h-1.5 bg-gray-900 border border-gray-600 rounded relative">
              <div className="absolute top-0 left-0 h-full bg-yellow-500 rounded-sm w-[10%] shadow-[0_0_5px_#eab308]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SIDE ICONS ==================== */}
      <div className="absolute top-36 left-2 flex flex-col gap-2 z-10">
        <button className="w-8 h-8 bg-gradient-to-b from-blue-700 to-blue-900 border border-blue-400 rounded-full flex items-center justify-center shadow-lg hover:scale-105">
          <Music size={14} className="text-white" />
        </button>
        <button className="w-8 h-8 bg-gradient-to-b from-blue-700 to-blue-900 border border-blue-400 rounded flex items-center justify-center mt-2 shadow-lg hover:scale-105">
          <Box size={14} className="text-white" />
        </button>
        <div className="text-[10px] text-black bg-white/50 px-1 rounded text-center mt-1 font-bold">00:01:44</div>
      </div>

      {/* ==================== TOP RIGHT HUD (RESOURCES) ==================== */}
      <div className="absolute top-16 right-2 flex flex-col items-end gap-1 z-10">
        <div className="flex gap-1">
          <div className="bg-black/80 border border-gray-700 flex items-center gap-2 px-2 py-0.5 rounded w-32 justify-between">
            <Coins size={12} className="text-yellow-500" />
            <span className="text-xs font-mono text-gray-200">8,823</span>
          </div>
          <div className="bg-black/80 border border-gray-700 flex items-center gap-2 px-2 py-0.5 rounded w-32 justify-between">
            <div className="w-2.5 h-2.5 bg-blue-500 rotate-45 shadow-[0_0_3px_#3b82f6]"></div>
            <span className="text-xs font-mono text-gray-200">8,802</span>
          </div>
        </div>
        <div className="flex gap-1 mt-0.5">
          <div className="bg-black/80 border border-gray-700 flex items-center gap-2 px-2 py-0.5 rounded w-32 justify-between">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-sm shadow-[0_0_3px_#22c55e]"></div>
            <span className="text-xs font-mono text-gray-200">9,656</span>
          </div>
          <div className="bg-black/80 border border-gray-700 flex items-center gap-2 px-2 py-0.5 rounded w-32 justify-between">
            <div className="w-2.5 h-2.5 bg-red-500 rotate-45 shadow-[0_0_3px_#ef4444]"></div>
            <span className="text-xs font-mono text-gray-200">0</span>
          </div>
        </div>
        <div className="text-[10px] text-blue-300 font-mono mt-1 bg-blue-950/60 px-2 rounded border border-blue-800">
          01:50:27 AM
        </div>
      </div>

      {/* ==================== MENÚ PRINCIPAL INFERIOR (CENTRADO SOBRE FRIENDS) ==================== */}
      <div className="absolute bottom-[110px] left-1/2 -translate-x-1/2 z-20 flex items-end drop-shadow-2xl">

        {/* Bloque Izquierdo: Bases/Navegación */}
        <div className="relative w-44 h-28 mr-2">
          <div className="absolute bottom-1 left-2 w-40 h-20 bg-gradient-to-t from-[#1e293b] via-[#334155] to-[#475569] rounded-[40px] border border-[#64748b] shadow-[0_15px_25px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2)]"></div>

          <button className="absolute top-1 left-[38%] w-12 h-12 rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_12px_rgba(56,189,248,0.6),inset_0_0_10px_#000] z-20">
            <RingPlanetIcon className="w-8 h-8" />
          </button>

          <button className="absolute top-10 left-1 w-11 h-11 rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_12px_rgba(56,189,248,0.6),inset_0_0_10px_#000] z-10">
            <SolarSystemIcon className="w-7 h-7" />
          </button>

          <button className="absolute top-10 right-1 w-11 h-11 rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_12px_rgba(56,189,248,0.6),inset_0_0_10px_#000] z-10">
            <FactoryIcon className="w-6 h-6" />
          </button>

          <button className="absolute bottom-0 left-[35%] w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_15px_rgba(56,189,248,0.8),inset_0_0_10px_#000] z-30">
            <BaseHomeIcon className="w-8 h-8 drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]" />
          </button>
        </div>

        {/* Bloque Derecho: Acciones (Píldora alargada Metálica) */}
        <div className="relative h-20 bg-gradient-to-t from-[#1e293b] via-[#334155] to-[#475569] rounded-[40px] border border-[#64748b] shadow-[0_15px_30px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.2)] flex items-center px-3 gap-2">

          {/* BOTÓN 1: NETWORK GLOBE (MENÚ DE CONSTRUCCIÓN/INVESTIGACIÓN) */}
          <div className="relative mb-2">
            {isGlobeMenuOpen && (
              <div className="absolute bottom-[110%] left-1/2 transform -translate-x-1/2 flex flex-col gap-1 items-center bg-gradient-to-b from-[#0a2558] to-[#041029] border-[1.5px] border-[#38bdf8] rounded-md p-1 shadow-[0_0_15px_rgba(56,189,248,0.5)] animate-fade-in-up z-50 w-11">
                <div className="group relative flex items-center justify-center w-full">
                  <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Science Research</div>
                  <button className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><ScienceAtomIcon className="w-6 h-6" /></button>
                </div>
                <div className="group relative flex items-center justify-center w-full">
                  <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Blueprint Research</div>
                  <button className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><PieChartIcon className="w-6 h-6" /></button>
                </div>
                <div className="group relative flex items-center justify-center w-full">
                  <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Build Warship</div>
                  <button className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><WarshipToolsIcon className="w-6 h-6" /></button>
                </div>
                <div className="group relative flex items-center justify-center w-full">
                  <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Construct Building</div>
                  <button onClick={(e) => { e.stopPropagation(); setActiveModal('build'); setIsGlobeMenuOpen(false); }} className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><ConstructBuildingIcon className="w-6 h-6" /></button>
                </div>
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setIsGlobeMenuOpen(!isGlobeMenuOpen); setIsAllianceMenuOpen(false); setIsFlyoutOpen(false); }}
              className={`w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center transition-transform shadow-[0_0_10px_rgba(56,189,248,0.4),inset_0_0_15px_#000] ${isGlobeMenuOpen ? 'scale-110 border-yellow-400 shadow-[0_0_15px_#facc15]' : 'hover:scale-105'}`}>
              <NetworkGlobeIcon className="w-8 h-8" />
            </button>
          </div>

          {/* BOTÓN 2: JET */}
          <button onClick={(e) => { e.stopPropagation(); closeAllMenus(); }} className="w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_10px_rgba(56,189,248,0.4),inset_0_0_15px_#000] mb-2">
            <JetIcon className="w-8 h-8" />
          </button>

          {/* BOTÓN 3: ALIANZA (MENÚ DE QUEST/MAIL/INVENTARIO) */}
          <div className="relative mb-2">
            {isAllianceMenuOpen && (
              <div className="absolute bottom-[110%] left-1/2 transform -translate-x-1/2 flex flex-col gap-1 items-center bg-gradient-to-b from-[#0a2558] to-[#041029] border-[1.5px] border-[#38bdf8] rounded-md p-1 shadow-[0_0_15px_rgba(56,189,248,0.5)] animate-fade-in-up z-50 w-11">
                <div className="group relative flex items-center justify-center w-full">
                  <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Commander</div>
                  <button className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><HelmetIcon className="w-6 h-6" /></button>
                </div>
                <div className="group relative flex items-center justify-center w-full">
                  <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Quest</div>
                  <button onClick={(e) => { e.stopPropagation(); setActiveModal('quest'); setIsAllianceMenuOpen(false); }} className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><QuestBoardIcon className="w-6 h-6" /></button>
                </div>
                <div className="group relative flex items-center justify-center w-full">
                  <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Mail</div>
                  <button className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><MailEnvelopeIcon className="w-6 h-6" /></button>
                </div>
                <div className="group relative flex items-center justify-center w-full">
                  <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Inventory</div>
                  <button onClick={(e) => { e.stopPropagation(); setActiveModal('shop'); setIsAllianceMenuOpen(false); }} className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><CubeItemIcon className="w-6 h-6" /></button>
                </div>
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setIsAllianceMenuOpen(!isAllianceMenuOpen); setIsGlobeMenuOpen(false); setIsFlyoutOpen(false); }}
              className={`w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center transition-transform shadow-[0_0_10px_rgba(56,189,248,0.4),inset_0_0_15px_#000] ${isAllianceMenuOpen ? 'scale-110 border-yellow-400 shadow-[0_0_15px_#facc15]' : 'hover:scale-105'}`}>
              <AllianceIcon className="w-8 h-8" />
            </button>
          </div>

          {/* BOTÓN 4: RADAR */}
          <button onClick={(e) => { e.stopPropagation(); closeAllMenus(); }} className="w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_10px_rgba(56,189,248,0.4),inset_0_0_15px_#000] mb-2">
            <RadarIcon className="w-8 h-8" />
          </button>

          {/* Botón 5: Mall / Desplegable ($) */}
          <div className="relative mb-2 ml-1">
            {isFlyoutOpen && (
              <div className="absolute bottom-[120%] left-1/2 transform -translate-x-1/2 flex flex-col gap-2 items-center bg-gradient-to-b from-[#1e293b]/90 to-[#0f172a]/95 p-2 rounded-full border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] backdrop-blur-md animate-fade-in-up z-50">
                <button className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-800 border-2 border-blue-300 flex items-center justify-center hover:scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  <Zap size={16} className="text-white drop-shadow-[0_0_2px_#fff]" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-800 border-2 border-blue-300 flex items-center justify-center hover:scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  <Shield size={16} className="text-white drop-shadow-[0_0_2px_#fff]" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-800 border-2 border-blue-300 flex items-center justify-center hover:scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  <Settings size={16} className="text-white drop-shadow-[0_0_2px_#fff]" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveModal('lucky'); setIsFlyoutOpen(false); }}
                  className="w-12 h-12 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 border-2 border-cyan-200 flex items-center justify-center hover:scale-110 shadow-[0_0_15px_rgba(34,211,238,0.8)] mt-1">
                  <DollarSign size={22} className="text-white drop-shadow-[0_0_5px_#fff]" />
                </button>
              </div>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); setIsFlyoutOpen(!isFlyoutOpen); setIsGlobeMenuOpen(false); setIsAllianceMenuOpen(false); }}
              className={`w-[3.5rem] h-[3.5rem] rounded-full flex items-center justify-center transition-transform hover:scale-105 z-30 relative ${isFlyoutOpen ? 'scale-110' : ''}`}
              style={{
                background: 'radial-gradient(circle at center, #1e3a8a 0%, #0f172a 100%)',
                boxShadow: '0 0 20px #22d3ee, inset 0 0 15px rgba(0,0,0,0.8)',
                border: '2px solid #a5f3fc',
              }}>
              <div className="absolute inset-[-6px] rounded-full bg-cyan-400 opacity-30 blur-sm pointer-events-none animate-pulse"></div>
              <div className="w-[1.6rem] h-[1.6rem] rotate-45 border-[2.5px] border-[#fbbf24] bg-gradient-to-br from-[#1e3a8a] to-black flex items-center justify-center shadow-[0_0_8px_#fbbf24]">
                <span className="-rotate-45 text-[#fcd34d] font-black text-sm drop-shadow-[0_0_3px_#fde047]">$</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== BOTTOM HUD (FRIENDS CAROUSEL) ==================== */}
      <div className="absolute bottom-0 w-full z-10 flex flex-col items-center">
        <div className="w-3/5 bg-[#e2e8f0] rounded-t-lg border-t-4 border-l-4 border-r-4 border-white/50 shadow-2xl p-2 pb-0 flex items-center relative">
          <button className="text-gray-400 hover:text-gray-600 px-2"><ChevronLeft size={30} /></button>
          <div className="flex-1 flex gap-2 overflow-hidden justify-center py-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex flex-col items-center cursor-pointer hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 bg-[#8c7456] rounded-t border-2 border-white shadow-md flex items-center justify-center">
                  <User size={32} className="text-[#654e33]" />
                </div>
                <div className="w-16 bg-orange-400 text-white text-[9px] font-bold text-center py-1 rounded-b shadow">
                  Add a Friend
                </div>
              </div>
            ))}
          </div>
          <button className="text-gray-400 hover:text-gray-600 px-2"><ChevronRight size={30} /></button>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-48 h-4 bg-gray-500 rounded-full border-2 border-gray-300 flex justify-end items-center pr-1">
            <Search size={10} className="text-yellow-400" />
          </div>
        </div>
      </div>

      {/* ==================== CHAT BOX ==================== */}
      <div className="absolute bottom-2 left-2 w-72 z-10 flex flex-col">
        <div className="flex gap-1 mb-0">
          <button className="bg-blue-800 text-blue-100 text-[10px] px-3 py-1 rounded-t border border-blue-500 font-bold">Chat</button>
        </div>
        <div className="bg-black/70 border border-gray-600 rounded-b rounded-tr p-2 h-32 flex flex-col backdrop-blur-sm">
          <div className="flex-1 overflow-y-auto text-[10px] font-mono space-y-1">
            <div><span className="text-gray-300">[alicia]:</span>hello!</div>
            <div><span className="text-gray-300">[Xeno]:</span>yo</div>
            <div><span className="text-gray-300">[alicia]:</span>add</div>
            <div><span className="text-gray-300">[tyga]:</span>add me</div>
            <div><span className="text-gray-300">[alicia]:</span>addme</div>
          </div>
          <div className="mt-1 flex items-center bg-black/50 border border-gray-600 rounded px-2 py-0.5">
            <span className="text-[10px] text-blue-300 mr-2">World</span>
            <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[4px] border-b-blue-300 mr-2 rotate-180"></div>
            <input type="text" className="bg-transparent border-none outline-none text-[10px] flex-1 text-white" />
          </div>
        </div>
      </div>

      {/* ==================== OVERLAY ==================== */}
      {activeModal && (
        <div className="absolute inset-0 bg-black/60 z-20 backdrop-blur-[2px]" onClick={() => setActiveModal(null)}></div>
      )}

      {/* ==================== MODAL 1: LUCKY DRAW (Ruleta) ==================== */}
      {activeModal === 'lucky' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-[450px]" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-b from-blue-900 to-[#0a1128] border-[3px] border-cyan-500 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.4)] p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent"></div>
            <div className="flex justify-center mb-4">
              <div className="bg-blue-950 border border-cyan-500 px-6 py-1 rounded text-cyan-300 font-bold tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                LUCKY DRAW
              </div>
            </div>
            <div className="grid grid-cols-4 grid-rows-4 gap-2 relative z-10 bg-black/40 p-3 rounded-lg border border-blue-800">
              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><PlanetIcon type="gas" className="w-8 h-8" /></div>
              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><BookIcon className="w-8 h-8" /></div>
              <div className="bg-blue-900/50 border-2 border-cyan-400 rounded flex items-center justify-center aspect-square shadow-[0_0_15px_rgba(34,211,238,0.5)]"><GemIcon color="#3b82f6" highlight="#93c5fd" className="w-10 h-10 drop-shadow-[0_0_5px_#fff]" /></div>
              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><PlanetIcon type="lux" className="w-8 h-8" /></div>

              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><ChipIcon className="w-8 h-8" /></div>

              <div className="col-span-2 row-span-2 bg-[#0f172a] rounded-lg border border-cyan-900 flex flex-col items-center justify-center gap-2 p-2 relative overflow-hidden">
                <div className="bg-blue-950 border border-blue-500 rounded px-3 py-1 text-xs text-blue-200">
                  My Spins: <span className="text-white font-mono font-bold">0</span>
                </div>
                <button className="bg-gradient-to-b from-yellow-400 to-orange-600 hover:from-yellow-300 hover:to-orange-500 border-2 border-yellow-200 rounded-lg w-full py-3 text-white font-black tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.6)] transform transition active:scale-95">
                  SPIN NOW
                </button>
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded"></div>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded"></div>
              </div>

              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><CardIcon className="w-8 h-8" /></div>

              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><BlueprintIcon className="w-8 h-8" /></div>
              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><PlanetIcon type="met" className="w-8 h-8" /></div>

              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><GemIcon className="w-8 h-8" /></div>
              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><BookIcon color="#f472b6" inner="#831843" className="w-8 h-8" /></div>
              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><CouponIcon className="w-8 h-8" /></div>
              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><CardIcon className="w-8 h-8" /></div>
            </div>
            <div className="flex justify-end mt-4 relative z-10">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-gradient-to-b from-blue-500 to-blue-700 border border-blue-300 px-8 py-1.5 rounded text-white font-bold shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:bg-blue-600">
                End
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: SHOP / INVENTORY ==================== */}
      {activeModal === 'shop' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-[780px]" onClick={(e) => e.stopPropagation()}>

          <div className="flex justify-center mb-[-15px] relative z-40">
            <div className="bg-gradient-to-b from-blue-500 to-blue-900 border-2 border-blue-400 px-6 py-1.5 rounded-t-lg shadow-[0_0_20px_rgba(59,130,246,0.8)]">
              <DollarSign size={20} className="text-white drop-shadow-[0_0_5px_#fff]" />
            </div>
          </div>

          <button onClick={() => setActiveModal(null)} className="absolute -top-4 -right-4 w-8 h-8 bg-blue-900 border-2 border-cyan-400 rounded flex items-center justify-center hover:bg-red-600 hover:border-red-400 z-50 shadow-lg transition-colors">
            <X size={16} className="text-white font-bold" />
          </button>

          <div className="bg-[#1a1f2e] border-[3px] border-[#4a5568] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(59,130,246,0.1)] p-1.5">
            <div className="border border-[#2d3748] rounded-lg p-3 bg-gradient-to-b from-[#111827] to-[#0f172a] relative overflow-hidden">

              <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

              {/* TABS */}
              <div className="flex gap-1.5 mb-4 relative z-10">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 text-[13px] font-bold rounded-sm border transition-all ${
                        isActive
                          ? 'border-yellow-500 text-yellow-100 bg-gradient-to-b from-[#4a3520] to-[#2d1f13] shadow-[0_0_10px_rgba(234,179,8,0.4),inset_0_0_10px_rgba(234,179,8,0.3)] transform scale-105 z-10'
                          : 'border-blue-700 text-blue-300 bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] hover:bg-blue-800'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* GRID DE ITEMS */}
              <div className="grid grid-cols-3 gap-3 relative z-10">
                {itemsToDisplay.map((item, i) => {
                  const glowColors: Record<string, string> = {
                    purple: 'from-purple-600/40', red: 'from-red-600/40', yellow: 'from-yellow-600/40',
                    green: 'from-green-600/40', blue: 'from-blue-600/40', cyan: 'from-cyan-600/40', pink: 'from-pink-600/40',
                  };
                  const glow = glowColors[item.color] || glowColors.blue;
                  const Icon = item.icon;

                  return (
                    <div key={i} className="relative group cursor-pointer">
                      <div className={`h-[85px] border ${activeTab === 'Honor' ? 'border-green-600/50' : 'border-gray-600'} rounded-lg bg-gradient-to-b from-[#1e293b] to-[#0f172a] hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex p-2 items-center`}>
                        <div className="w-[60px] h-[60px] bg-black/60 border border-gray-700/80 rounded flex items-center justify-center shadow-inner relative overflow-hidden flex-shrink-0">
                          <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${glow} to-transparent opacity-80`}></div>
                          <Icon className="relative z-10 w-10 h-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                        </div>
                        <div className="ml-3 flex-1 flex flex-col justify-center overflow-hidden">
                          <div className="text-xs text-gray-100 font-bold mb-1 truncate drop-shadow-[0_1px_1px_#000]">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {renderCurrency(item.currency)}
                            <span className="text-sm font-mono text-blue-200">{item.price}</span>
                          </div>
                        </div>
                      </div>
                      {item.label && (
                        <div className="absolute top-1 right-2 z-10 pointer-events-none">
                          <span className={`text-[10px] font-black italic tracking-widest uppercase ${getLabelColor(item.label)} drop-shadow-[0_0_2px_#000]`}>
                            {item.label}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* FOOTER BAR */}
              <div className="mt-4 flex items-center justify-between bg-black/30 p-2 rounded border border-gray-800">
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/80 rounded-full px-3 py-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-400 flex items-center justify-center text-[8px] text-blue-900 font-black shadow-[0_0_5px_#60a5fa]">1</div>
                    <span className="text-xs font-mono text-blue-200">0</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/80 rounded-full px-3 py-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-green-400 flex items-center justify-center shadow-[0_0_5px_#4ade80]">
                      <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                    </div>
                    <span className="text-xs font-mono text-green-200">68</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-blue-500 hover:text-cyan-400 hover:scale-110 transition-transform">
                    <ChevronLeft size={24} className="filter drop-shadow-[0_0_3px_currentColor]" />
                  </button>
                  <span className="text-blue-200 font-mono text-sm bg-blue-950 border border-blue-800/50 px-4 py-0.5 rounded shadow-inner">
                    1/3
                  </span>
                  <button className="text-blue-500 hover:text-cyan-400 hover:scale-110 transition-transform">
                    <ChevronRight size={24} className="filter drop-shadow-[0_0_3px_currentColor]" />
                  </button>
                </div>
                <button className="bg-gradient-to-b from-blue-500 to-blue-800 hover:from-blue-400 hover:to-blue-600 border border-blue-300 rounded-full px-8 py-1.5 text-white font-bold text-sm tracking-wide shadow-[0_0_15px_rgba(59,130,246,0.6)] transform active:scale-95 transition-all">
                  Buy Points
                </button>
              </div>

            </div>
          </div>

          <div className="flex justify-center mt-[-15px] relative z-40">
            <div className="bg-gradient-to-b from-gray-800 to-gray-950 border-2 border-blue-500 w-16 h-8 rounded-b-xl shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center">
              <div className="w-5 h-5 border border-blue-400 rotate-45 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-blue-400 shadow-[0_0_8px_#60a5fa]"></div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================== MODAL 3: QUESTS ==================== */}
      {activeModal === 'quest' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[700px]" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center mb-[-15px] relative z-40">
            <div className="bg-gradient-to-b from-blue-500 to-blue-900 border-2 border-blue-400 w-16 h-8 rounded-t-lg shadow-[0_0_20px_rgba(59,130,246,0.8)] flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white rotate-45 flex items-center justify-center bg-blue-400"></div>
            </div>
          </div>
          <button onClick={() => setActiveModal(null)} className="absolute -top-4 -right-4 w-8 h-8 bg-blue-900 border-2 border-cyan-400 rounded flex items-center justify-center hover:bg-red-600 z-50 shadow-lg transition-colors">
            <X size={16} className="text-white font-bold" />
          </button>
          <div className="bg-[#0f2c59] border-[3px] border-[#38bdf8] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.9)] p-1.5 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1e40af]/20 to-transparent pointer-events-none"></div>
            <div className="flex gap-1 mb-2 relative z-10 px-1">
              {['Development', 'Daily', 'Coming Soon', 'Coming Soon'].map((t, idx) => (
                <button key={idx}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-sm border ${t === 'Development' ? 'bg-gradient-to-b from-orange-500 to-yellow-600 border-yellow-300 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] border-blue-600 text-blue-200'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2 relative z-10 h-[280px]">
              {/* Sidebar */}
              <div className="w-1/3 flex flex-col gap-1">
                <div className="bg-[#1e3a8a] border border-blue-500 text-center py-1 text-white text-xs font-bold shadow-inner">Main Quest</div>
                <button className={`py-1.5 text-xs font-bold border ${currentQuest.type === 'Main Quest' ? 'bg-gradient-to-b from-orange-500 to-yellow-600 border-yellow-300 text-white shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'bg-[#0f172a] border-blue-800 text-blue-300'}`}>
                  {currentQuest.title}
                </button>
                <div className="bg-[#1e3a8a] border border-blue-500 text-center py-1 text-white text-xs font-bold shadow-inner mt-2">Side Quest</div>
                <button className="bg-[#0f172a] border border-blue-800 py-1.5 text-xs font-bold text-green-400 hover:bg-[#1e293b]">Peace Agreement</button>
                <button className="bg-[#0f172a] border border-blue-800 py-1.5 text-xs font-bold text-green-400 hover:bg-[#1e293b] mt-1" style={{ display: currentQuestId === 'tech' ? 'block' : 'none' }}>Construction Speedup</button>
              </div>
              {/* Detail */}
              <div className="w-2/3 bg-[#0a1930] border border-blue-500 rounded p-3 flex flex-col relative">
                <div className="text-center text-white text-sm font-bold mb-2">Quest Description</div>
                <div className="text-blue-200 text-[11px] leading-snug mb-4 h-20 overflow-y-auto pr-2">{currentQuest.desc}</div>
                <div className="mb-2">
                  <span className="text-white text-xs font-bold">Quest Target:</span><br />
                  <span className="text-gray-300 text-[11px]">{currentQuest.target}</span> <span className={`text-[11px] ${currentQuest.statusColor}`}>{currentQuest.statusText}</span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <div className="flex-1 bg-[#0f172a] border border-blue-600 rounded p-2 relative">
                    <span className="absolute -top-2 left-2 bg-[#0a1930] px-1 text-blue-300 text-[10px]">Resource Reward</span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-1 text-[11px] text-gray-200"><Coins size={12} className="text-orange-400" /> {currentQuest.rewards.alloy}</div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-200"><Coins size={12} className="text-yellow-400" /> {currentQuest.rewards.gold}</div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-200"><div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div> {currentQuest.rewards.crystal}</div>
                    </div>
                  </div>
                  <div className="flex-1 bg-[#0f172a] border border-blue-600 rounded p-2 relative flex items-center justify-center">
                    <span className="absolute -top-2 left-2 bg-[#0a1930] px-1 text-blue-300 text-[10px]">Item Reward</span>
                    {currentQuest.rewards.itemIcon ? (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-10 h-10 border border-[#38bdf8] bg-black/50 rounded flex items-center justify-center shadow-[inset_0_0_8px_#38bdf8]">
                          {(() => { const I = currentQuest.rewards.itemIcon!; return <I className="w-7 h-7" />; })()}
                        </div>
                        <span className="text-blue-100 text-xs font-mono">{currentQuest.rewards.itemCount}</span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full border-4 border-[#1e3a8a] mt-2 flex items-center justify-center opacity-50">
                        <div className="w-1 h-10 bg-[#1e3a8a] transform rotate-45 absolute"></div>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={handleQuestCollect}
                  className={`absolute right-4 top-[55%] transform -translate-y-1/2 px-6 py-2 rounded-full font-bold text-xs shadow-lg transition-transform ${currentQuest.buttonType === 'collect' ? 'bg-gradient-to-b from-blue-400 to-blue-700 text-white border border-blue-300 hover:scale-105 shadow-[0_0_10px_#60a5fa]' : 'bg-gradient-to-b from-gray-600 to-gray-800 text-gray-400 border border-gray-500 cursor-not-allowed'}`}>
                  {currentQuest.buttonText}
                </button>
              </div>
            </div>
            <div className="absolute bottom-1 left-10 flex items-center gap-4 text-blue-500 z-10">
              <ChevronLeft size={16} /> <span className="text-white text-xs font-mono">1/1</span> <ChevronRight size={16} />
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 4: CONSTRUCT BUILDINGS ==================== */}
      {activeModal === 'build' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[750px]" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setActiveModal(null)} className="absolute -top-4 -right-4 w-8 h-8 bg-blue-900 border-2 border-cyan-400 rounded flex items-center justify-center hover:bg-red-600 z-50 shadow-lg">
            <X size={16} className="text-white font-bold" />
          </button>
          <div className="bg-[#1a202c] border-[3px] border-[#64748b] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] p-2 relative flex flex-col items-center">
            {/* Tabs */}
            <div className="bg-gradient-to-r from-gray-500 via-gray-300 to-gray-500 p-[2px] rounded-full mb-3 shadow-[0_5px_15px_#000] w-11/12 mt-[-20px] z-10 relative">
              <div className="bg-[#0f172a] rounded-full flex overflow-hidden">
                {['Resources', 'City Services', 'Landscaping', 'Military', 'Defense'].map((t) => (
                  <button key={t} onClick={() => setBuildTab(t)}
                    className={`flex-1 py-1.5 text-[11px] font-bold border-r border-gray-700 last:border-0 ${buildTab === t ? 'bg-gradient-to-b from-orange-400 to-orange-700 text-white shadow-[inset_0_0_10px_#ea580c]' : 'bg-transparent text-blue-300 hover:bg-blue-900/50'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Inner grid */}
            <div className="w-full bg-[#0a1128] border-2 border-[#1e3a8a] rounded-lg p-2 h-[260px] relative shadow-[inset_0_0_20px_#000]">
              <div className="grid grid-cols-3 gap-3">
                {buildingsData.map((b) => (
                  <div key={b.id}
                    onMouseEnter={() => b.info && setHoveredBuilding(b)}
                    onMouseLeave={() => setHoveredBuilding(null)}
                    className="bg-[#0f172a] border border-[#3b82f6] rounded relative h-28 flex flex-col items-center justify-between p-1 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-pointer group overflow-hidden">
                    <div className="w-full text-white text-[10px] font-bold px-1 z-10">{b.name}</div>
                    <div className="flex-1 w-full flex items-center justify-center relative">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a8a] opacity-30 absolute group-hover:bg-cyan-900/40"></div>
                      <div className="w-14 h-14 border border-blue-500/50 rounded-full absolute transform rotate-45"></div>
                      <IsometricBuilding type={b.type} className="w-16 h-16 relative z-10 drop-shadow-xl transform group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="absolute bottom-1 left-1 bg-blue-900/80 text-blue-200 text-[9px] px-1.5 border border-blue-500/50 rounded z-10">{b.limit}</div>
                  </div>
                ))}
              </div>
              {/* Hover tooltip */}
              {hoveredBuilding && hoveredBuilding.info && (
                <div className="absolute top-2 right-[-240px] w-60 bg-black/90 border border-green-500 rounded p-2 z-50 shadow-[0_0_20px_rgba(34,197,94,0.3)] text-white">
                  <div className="flex justify-between items-center border-b border-green-900 pb-1 mb-2">
                    <span className="font-bold text-xs text-green-400">{hoveredBuilding.name}</span>
                    <span className="text-xs text-green-500">Lv: 1</span>
                  </div>
                  <div className="text-[10px] text-gray-300 leading-tight mb-2 whitespace-pre-line">{hoveredBuilding.info.desc}</div>
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-1 text-[10px]"><Coins size={10} className="text-yellow-500" /> {hoveredBuilding.info.cost.gold}</div>
                    <div className="flex items-center gap-1 text-[10px]"><div className="w-2 h-2 bg-blue-500 rotate-45"></div> {hoveredBuilding.info.cost.crystal}</div>
                    <div className="flex items-center gap-1 text-[10px]"><Coins size={10} className="text-orange-400" /> {hoveredBuilding.info.cost.alloy}</div>
                  </div>
                  <div className="flex justify-between items-end border-t border-gray-800 pt-1">
                    <span className="text-[10px] text-gray-400">Time Cost</span>
                    <div className="text-right">
                      <div className="text-green-400 text-[10px] font-mono">{hoveredBuilding.info.time}</div>
                      <div className="text-green-600 text-[9px]">{hoveredBuilding.info.req}</div>
                    </div>
                  </div>
                </div>
              )}
              {/* Pagination */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-[#1e293b] border-t border-l border-r border-[#475569] rounded-t-lg px-4 py-0.5">
                  <ChevronLeft size={14} className="text-gray-500" />
                  <span className="text-blue-400 text-[10px] font-mono font-bold">1/1</span>
                  <ChevronRight size={14} className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
