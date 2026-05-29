'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  X, Search, Star, Coins, User, Box, Music, DollarSign,
  ChevronLeft, ChevronRight, Settings, Zap, Crosshair, Shield,
} from 'lucide-react';
import { storeData, storeTabs, type StoreItem } from './hud/storeData';
import {
  RingPlanetIcon, SolarSystemIcon, FactoryIcon, BaseHomeIcon,
  NetworkGlobeIcon, JetIcon, AllianceIcon, RadarIcon,
  CouponIcon, BookIcon, GemIcon, PlanetIcon, CardIcon, ChipIcon, BlueprintIcon,
} from './hud/StoreIcons';

/**
 * ConstructionDemoPage — GO2-style terrestrial base.
 *
 * The 3D planet (Three.js + GLB) renders in a transparent iframe
 * (/planet-3d/scene.html); this React layer is the full GO2 HUD on top:
 * player panel, resources, bottom action consoles, store + lucky-draw modals,
 * and a build panel wired to the 3D scene via postMessage.
 */

type Resources = { m: number; e: number; c: number };
type CatalogItem = { id: string; name: string; icon: string; cost: { m: number; e: number; c: number }; max: number };
type Catalog = { tab: string; items: CatalogItem[] }[];

export function ConstructionDemoPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Items');
  const [activeModal, setActiveModal] = useState<'shop' | 'lucky' | null>(null);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [showBuild, setShowBuild] = useState(false);

  // Live state mirrored from the 3D scene via postMessage.
  const [res, setRes] = useState<Resources>({ m: 15000, e: 12000, c: 10000 });
  const [catalog, setCatalog] = useState<Catalog>([]);
  const [buildTab, setBuildTab] = useState(0);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      setLoading(false);
      iframe.contentWindow?.postMessage({ type: 'go3:requestCatalog' }, '*');
    };
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const d = ev.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === 'go3:resources' && d.R) setRes(d.R as Resources);
      else if (d.type === 'go3:catalog' && Array.isArray(d.cats)) setCatalog(d.cats as Catalog);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const sendToScene = (msg: Record<string, unknown>) =>
    iframeRef.current?.contentWindow?.postMessage(msg, '*');

  const renderCurrency = (type: string) => {
    if (type === 'cube') return <div className="w-3 h-3 bg-green-400 border border-green-200 shadow-[0_0_5px_#4ade80] flex-shrink-0" />;
    if (type === 'honor') return <Star size={14} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_2px_#fbbf24] flex-shrink-0" />;
    return null;
  };

  const getLabelColor = (label: string) => {
    if (label === 'NEW') return 'text-green-400';
    if (label === 'HOT') return 'text-yellow-400';
    return 'text-transparent';
  };

  const itemsToDisplay: StoreItem[] = storeData[activeTab] || storeData['All Items'];
  const buildItems = catalog[buildTab]?.items || [];

  return (
    <div className="relative w-full h-screen overflow-hidden select-none font-sans bg-[#04070f]">

      {/* ===== 3D PLANET (background iframe) ===== */}
      <iframe
        ref={iframeRef}
        src="/planet-3d/scene.html"
        title="Planeta 3D"
        className="absolute inset-0 w-full h-full border-0 block"
        allow="fullscreen"
      />

      {loading && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#04070f] text-cyan-300"
          style={{ fontFamily: 'Orbitron, system-ui, sans-serif', letterSpacing: 1 }}>
          <div className="w-11 h-11 mb-3 rounded-full border-[3px] border-[#1f4e7a] border-t-cyan-400 animate-spin" />
          CARGANDO PLANETA…
        </div>
      )}

      {/* ==================== TOP LEFT HUD (PLAYER) ==================== */}
      <div className="absolute top-3 left-3 flex items-start gap-2 z-20">
        <div className="w-14 h-16 bg-gray-900 border-2 border-gray-600 rounded flex items-center justify-center opacity-90">
          <User size={36} className="text-gray-400" />
        </div>
        <div className="flex flex-col gap-1 w-48">
          <div className="flex items-center justify-between bg-blue-950/80 border border-blue-500/50 rounded px-2 py-0.5">
            <span className="text-sm font-bold text-blue-200">Comandante</span>
            <Crosshair size={14} className="text-blue-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-300">LV.</span>
            <span className="text-sm font-bold text-blue-100">2</span>
            <div className="flex-1 h-2.5 bg-gray-900 border border-gray-600 rounded relative">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-green-400 rounded-sm w-[37%] shadow-[0_0_5px_#4ade80]" />
            </div>
            <span className="text-[10px] text-green-400">37%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-yellow-500">SP:</span>
            <div className="flex-1 h-1.5 bg-gray-900 border border-gray-600 rounded relative">
              <div className="absolute top-0 left-0 h-full bg-yellow-500 rounded-sm w-[10%] shadow-[0_0_5px_#eab308]" />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SIDE ICONS ==================== */}
      <div className="absolute top-24 left-3 flex flex-col gap-2 z-20">
        <button className="w-8 h-8 bg-gradient-to-b from-blue-700 to-blue-900 border border-blue-400 rounded-full flex items-center justify-center shadow-lg hover:scale-105">
          <Music size={14} className="text-white" />
        </button>
        <button onClick={() => setShowBuild((v) => !v)}
          className="w-8 h-8 bg-gradient-to-b from-blue-700 to-blue-900 border border-blue-400 rounded flex items-center justify-center shadow-lg hover:scale-105" title="Construir">
          <Box size={14} className="text-white" />
        </button>
      </div>

      {/* ==================== TOP RIGHT HUD (RESOURCES) ==================== */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-20">
        <div className="flex gap-1">
          <div className="bg-black/80 border border-gray-700 flex items-center gap-2 px-2 py-0.5 rounded w-32 justify-between">
            <Coins size={12} className="text-yellow-500" />
            <span className="text-xs font-mono text-gray-200">{res.m.toLocaleString()}</span>
          </div>
          <div className="bg-black/80 border border-gray-700 flex items-center gap-2 px-2 py-0.5 rounded w-32 justify-between">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-sm shadow-[0_0_3px_#22c55e]" />
            <span className="text-xs font-mono text-gray-200">{res.e.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-1 mt-0.5">
          <div className="bg-black/80 border border-gray-700 flex items-center gap-2 px-2 py-0.5 rounded w-32 justify-between">
            <div className="w-2.5 h-2.5 bg-blue-500 rotate-45 shadow-[0_0_3px_#3b82f6]" />
            <span className="text-xs font-mono text-gray-200">{res.c.toLocaleString()}</span>
          </div>
          <div className="bg-black/80 border border-gray-700 flex items-center gap-2 px-2 py-0.5 rounded w-32 justify-between">
            <div className="w-2.5 h-2.5 bg-purple-400 rotate-45 shadow-[0_0_3px_#c084fc]" />
            <span className="text-xs font-mono text-gray-200">68</span>
          </div>
        </div>
      </div>

      {/* ==================== BUILD PANEL (toggle via Box icon) ==================== */}
      {showBuild && (
        <div className="absolute top-44 left-3 w-56 z-20 bg-gradient-to-b from-[#0b1830]/95 to-[#08182f]/95 border border-[#1f4e7a] rounded-xl shadow-[0_6px_24px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1f4e7a] bg-gradient-to-r from-[#2f6fb0]/30 to-transparent">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#4fb6ff]" />
            <h3 className="text-[12px] font-bold tracking-widest uppercase text-cyan-200" style={{ fontFamily: 'Orbitron, sans-serif' }}>Construcción</h3>
          </div>
          <div className="flex px-1.5 pt-1.5">
            {catalog.map((c, i) => (
              <button key={c.tab} onClick={() => setBuildTab(i)}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide border-b-2 transition ${buildTab === i ? 'text-cyan-300 border-cyan-400' : 'text-[#7d9ec2] border-transparent hover:text-cyan-200'}`}>
                {c.tab}
              </button>
            ))}
          </div>
          <div className="max-h-72 overflow-y-auto p-2 flex flex-col gap-1.5">
            {buildItems.map((it) => {
              const afford = res.m >= it.cost.m && res.e >= it.cost.e && res.c >= it.cost.c;
              return (
                <button key={it.id} disabled={!afford}
                  onClick={() => sendToScene({ type: 'go3:select', id: it.id })}
                  className={`w-full p-2 rounded-lg border flex items-center gap-2 text-left transition ${afford ? 'border-[#2f6fb0]/40 bg-gradient-to-b from-[#0e2240]/70 to-[#08182f]/70 hover:border-[#2f6fb0] hover:translate-x-0.5' : 'border-gray-700/40 opacity-40 cursor-not-allowed'}`}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-[radial-gradient(circle_at_35%_30%,rgba(47,111,176,0.5),rgba(0,0,0,0.35))] border border-[#2f6fb0]/50">{it.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12px] font-bold text-[#dfeaf6] truncate">{it.name}</span>
                    <span className="block text-[10px] text-[#7d9ec2]">{it.cost.m}M {it.cost.e}E {it.cost.c}C</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="p-2 border-t border-[#1f4e7a]">
            <button onClick={() => sendToScene({ type: 'go3:reset' })}
              className="w-full py-2 rounded-lg border border-red-500/40 text-red-300 text-[11px] font-bold uppercase tracking-wide bg-gradient-to-b from-red-900/40 to-red-950/40 hover:from-red-800/55">Reset</button>
          </div>
        </div>
      )}

      {/* ==================== BOTTOM-RIGHT ACTION CONSOLES ==================== */}
      <div className="absolute bottom-[110px] right-[6%] z-20 flex items-end drop-shadow-2xl">
        {/* Left console: bases / navigation */}
        <div className="relative w-44 h-28 mr-2">
          <div className="absolute bottom-1 left-2 w-40 h-20 bg-gradient-to-t from-[#1e293b] via-[#334155] to-[#475569] rounded-[40px] border border-[#64748b] shadow-[0_15px_25px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2)]" />
          <button className="absolute top-1 left-[38%] w-12 h-12 rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-110 transition shadow-[0_0_12px_rgba(56,189,248,0.6),inset_0_0_10px_#000] z-20">
            <RingPlanetIcon className="w-8 h-8" />
          </button>
          <button className="absolute top-10 left-1 w-11 h-11 rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-110 transition shadow-[0_0_12px_rgba(56,189,248,0.6),inset_0_0_10px_#000] z-10">
            <SolarSystemIcon className="w-7 h-7" />
          </button>
          <button className="absolute top-10 right-1 w-11 h-11 rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-110 transition shadow-[0_0_12px_rgba(56,189,248,0.6),inset_0_0_10px_#000] z-10">
            <FactoryIcon className="w-6 h-6" />
          </button>
          <button className="absolute bottom-0 left-[35%] w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-110 transition shadow-[0_0_15px_rgba(56,189,248,0.8),inset_0_0_10px_#000] z-30">
            <BaseHomeIcon className="w-8 h-8 drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]" />
          </button>
        </div>

        {/* Right console: actions */}
        <div className="relative h-20 bg-gradient-to-t from-[#1e293b] via-[#334155] to-[#475569] rounded-[40px] border border-[#64748b] shadow-[0_15px_30px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.2)] flex items-center px-3 gap-2">
          {[12, 31, 50, 69].map((l) => (
            <div key={l} className="absolute bottom-1.5 w-3 h-1 bg-[#ef4444] rounded shadow-[0_0_6px_#ef4444,inset_0_1px_1px_#fff]" style={{ left: `${l}%` }} />
          ))}
          <button className="w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-105 transition shadow-[0_0_10px_rgba(56,189,248,0.4),inset_0_0_15px_#000] mb-2">
            <NetworkGlobeIcon className="w-8 h-8" />
          </button>
          <button className="w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-105 transition shadow-[0_0_10px_rgba(56,189,248,0.4),inset_0_0_15px_#000] mb-2">
            <JetIcon className="w-8 h-8" />
          </button>
          <button className="w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-105 transition shadow-[0_0_10px_rgba(56,189,248,0.4),inset_0_0_15px_#000] mb-2">
            <AllianceIcon className="w-8 h-8" />
          </button>
          <button className="w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-105 transition shadow-[0_0_10px_rgba(56,189,248,0.4),inset_0_0_15px_#000] mb-2">
            <RadarIcon className="w-8 h-8" />
          </button>

          {/* Mall / flyout toggle */}
          <div className="relative mb-2 ml-1">
            {isFlyoutOpen && (
              <div className="absolute bottom-[120%] left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center bg-gradient-to-b from-[#1e293b]/90 to-[#0f172a]/95 p-2 rounded-full border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] backdrop-blur-md animate-fade-in-up z-50">
                <button onClick={() => setActiveModal('shop')} className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-800 border-2 border-blue-300 flex items-center justify-center hover:scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]" title="Tienda">
                  <DollarSign size={16} className="text-white drop-shadow-[0_0_2px_#fff]" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-800 border-2 border-blue-300 flex items-center justify-center hover:scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  <Shield size={16} className="text-white drop-shadow-[0_0_2px_#fff]" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-800 border-2 border-blue-300 flex items-center justify-center hover:scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  <Settings size={16} className="text-white drop-shadow-[0_0_2px_#fff]" />
                </button>
                <button onClick={() => { setActiveModal('lucky'); setIsFlyoutOpen(false); }}
                  className="w-12 h-12 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 border-2 border-cyan-200 flex items-center justify-center hover:scale-110 shadow-[0_0_15px_rgba(34,211,238,0.8)] mt-1">
                  <DollarSign size={22} className="text-white drop-shadow-[0_0_5px_#fff]" />
                </button>
              </div>
            )}
            <button onClick={() => setIsFlyoutOpen(!isFlyoutOpen)}
              className={`w-[3.5rem] h-[3.5rem] rounded-full flex items-center justify-center transition hover:scale-105 z-30 relative ${isFlyoutOpen ? 'scale-110' : ''}`}
              style={{ background: 'radial-gradient(circle at center, #1e3a8a 0%, #0f172a 100%)', boxShadow: '0 0 20px #22d3ee, inset 0 0 15px rgba(0,0,0,0.8)', border: '2px solid #a5f3fc' }}>
              <div className="absolute inset-[-6px] rounded-full bg-cyan-400 opacity-30 blur-sm pointer-events-none animate-pulse" />
              <div className="w-[1.6rem] h-[1.6rem] rotate-45 border-[2.5px] border-[#fbbf24] bg-gradient-to-br from-[#1e3a8a] to-black flex items-center justify-center shadow-[0_0_8px_#fbbf24]">
                <span className="-rotate-45 text-[#fcd34d] font-black text-sm drop-shadow-[0_0_3px_#fde047]">$</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== CHAT BOX ==================== */}
      <div className="absolute bottom-2 left-2 w-72 z-20 flex flex-col">
        <div className="flex gap-1">
          <button className="bg-blue-800 text-blue-100 text-[10px] px-3 py-1 rounded-t border border-blue-500 font-bold">Chat</button>
        </div>
        <div className="bg-black/70 border border-gray-600 rounded-b rounded-tr p-2 h-32 flex flex-col backdrop-blur-sm">
          <div className="flex-1 overflow-y-auto text-[10px] font-mono space-y-1">
            <div><span className="text-gray-300">[Sistema]:</span> Bienvenido, Comandante.</div>
            <div><span className="text-gray-300">[Vega]:</span> bienvenido a la galaxia!</div>
            <div><span className="text-gray-300">[Nyx]:</span> hola</div>
          </div>
          <div className="mt-1 flex items-center bg-black/50 border border-gray-600 rounded px-2 py-0.5">
            <span className="text-[10px] text-blue-300 mr-2">Mundo</span>
            <input type="text" className="bg-transparent border-none outline-none text-[10px] flex-1 text-white" />
          </div>
        </div>
      </div>

      {/* ==================== MODAL OVERLAY ==================== */}
      {activeModal && (
        <div className="absolute inset-0 bg-black/60 z-30 backdrop-blur-[2px]" onClick={() => setActiveModal(null)} />
      )}

      {/* ==================== MODAL: LUCKY DRAW ==================== */}
      {activeModal === 'lucky' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[450px]" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-b from-blue-900 to-[#0a1128] border-[3px] border-cyan-500 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.4)] p-4 relative overflow-hidden">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-950 border border-cyan-500 px-6 py-1 rounded text-cyan-300 font-bold tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.5)]">LUCKY DRAW</div>
            </div>
            <div className="grid grid-cols-4 grid-rows-4 gap-2 relative z-10 bg-black/40 p-3 rounded-lg border border-blue-800">
              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><PlanetIcon type="gas" className="w-8 h-8" /></div>
              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><BookIcon className="w-8 h-8" /></div>
              <div className="bg-blue-900/50 border-2 border-cyan-400 rounded flex items-center justify-center aspect-square shadow-[0_0_15px_rgba(34,211,238,0.5)]"><GemIcon color="#3b82f6" highlight="#93c5fd" className="w-10 h-10 drop-shadow-[0_0_5px_#fff]" /></div>
              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><PlanetIcon type="lux" className="w-8 h-8" /></div>
              <div className="bg-[#1e293b] border border-gray-600 rounded flex items-center justify-center aspect-square"><ChipIcon className="w-8 h-8" /></div>
              <div className="col-span-2 row-span-2 bg-[#0f172a] rounded-lg border border-cyan-900 flex flex-col items-center justify-center gap-2 p-2 relative overflow-hidden">
                <div className="bg-blue-950 border border-blue-500 rounded px-3 py-1 text-xs text-blue-200">Giros: <span className="text-white font-mono font-bold">0</span></div>
                <button className="bg-gradient-to-b from-yellow-400 to-orange-600 hover:from-yellow-300 hover:to-orange-500 border-2 border-yellow-200 rounded-lg w-full py-3 text-white font-black tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.6)] active:scale-95 transition">GIRAR</button>
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded" />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded" />
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
              <button onClick={() => setActiveModal(null)} className="bg-gradient-to-b from-blue-500 to-blue-700 border border-blue-300 px-8 py-1.5 rounded text-white font-bold shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:bg-blue-600">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: SHOP ==================== */}
      {activeModal === 'shop' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[780px]" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center mb-[-15px] relative z-50">
            <div className="bg-gradient-to-b from-blue-500 to-blue-900 border-2 border-blue-400 px-6 py-1.5 rounded-t-lg shadow-[0_0_20px_rgba(59,130,246,0.8)]">
              <DollarSign size={20} className="text-white drop-shadow-[0_0_5px_#fff]" />
            </div>
          </div>
          <button onClick={() => setActiveModal(null)} className="absolute -top-4 -right-4 w-8 h-8 bg-blue-900 border-2 border-cyan-400 rounded flex items-center justify-center hover:bg-red-600 hover:border-red-400 z-50 shadow-lg transition-colors">
            <X size={16} className="text-white" />
          </button>
          <div className="bg-[#1a1f2e] border-[3px] border-[#4a5568] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(59,130,246,0.1)] p-1.5">
            <div className="border border-[#2d3748] rounded-lg p-3 bg-gradient-to-b from-[#111827] to-[#0f172a] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <div className="flex gap-1.5 mb-4 relative z-10">
                {storeTabs.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 text-[13px] font-bold rounded-sm border transition-all ${isActive ? 'border-yellow-500 text-yellow-100 bg-gradient-to-b from-[#4a3520] to-[#2d1f13] shadow-[0_0_10px_rgba(234,179,8,0.4),inset_0_0_10px_rgba(234,179,8,0.3)] scale-105 z-10' : 'border-blue-700 text-blue-300 bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] hover:bg-blue-800'}`}>
                      {tab}
                    </button>
                  );
                })}
              </div>
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
                          <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${glow} to-transparent opacity-80`} />
                          <Icon className="relative z-10 w-10 h-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                        </div>
                        <div className="ml-3 flex-1 flex flex-col justify-center overflow-hidden">
                          <div className="text-xs text-gray-100 font-bold mb-1 truncate drop-shadow-[0_1px_1px_#000]">{item.name}</div>
                          <div className="flex items-center gap-1.5">
                            {renderCurrency(item.currency)}
                            <span className="text-sm font-mono text-blue-200">{item.price}</span>
                          </div>
                        </div>
                      </div>
                      {item.label && (
                        <div className="absolute top-1 right-2 z-10 pointer-events-none">
                          <span className={`text-[10px] font-black italic tracking-widest uppercase ${getLabelColor(item.label)} drop-shadow-[0_0_2px_#000]`}>{item.label}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between bg-black/30 p-2 rounded border border-gray-800">
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/80 rounded-full px-3 py-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-400 flex items-center justify-center text-[8px] text-blue-900 font-black shadow-[0_0_5px_#60a5fa]">1</div>
                    <span className="text-xs font-mono text-blue-200">0</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/80 rounded-full px-3 py-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-green-400 flex items-center justify-center shadow-[0_0_5px_#4ade80]"><div className="w-1.5 h-1.5 bg-white rounded-sm" /></div>
                    <span className="text-xs font-mono text-green-200">68</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-blue-500 hover:text-cyan-400 hover:scale-110 transition"><ChevronLeft size={24} /></button>
                  <span className="text-blue-200 font-mono text-sm bg-blue-950 border border-blue-800/50 px-4 py-0.5 rounded shadow-inner">1/3</span>
                  <button className="text-blue-500 hover:text-cyan-400 hover:scale-110 transition"><ChevronRight size={24} /></button>
                </div>
                <button className="bg-gradient-to-b from-blue-500 to-blue-800 hover:from-blue-400 hover:to-blue-600 border border-blue-300 rounded-full px-8 py-1.5 text-white font-bold text-sm tracking-wide shadow-[0_0_15px_rgba(59,130,246,0.6)] active:scale-95 transition-all">Comprar Puntos</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
