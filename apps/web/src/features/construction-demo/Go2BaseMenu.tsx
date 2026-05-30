'use client';

import { useEffect, useRef, useState } from 'react';
import { Settings, Zap, Shield, DollarSign } from 'lucide-react';
import { JetIcon, RadarIcon } from './hud/StoreIcons';
import {
  ScienceAtomIcon, PieChartIcon, WarshipToolsIcon, ConstructBuildingIcon,
  HelmetIcon, QuestBoardIcon, MailEnvelopeIcon, CubeItemIcon,
} from './hud/BuildQuestIcons';
import {
  AAAResearchIcon, AAAReactorIcon, AAAShipIcon, AAABaseIcon, AAAAllianceIcon, AAAMainIcon,
} from './hud/AAAMenuIcons';

/**
 * Go2BaseMenu — the single Galaxy Online 2 bottom menu (bubble cluster + metallic pill).
 * ONE source of truth shared by the terrestrial base AND the galaxy (and any screen),
 * so the menu is identical everywhere and buttons are never duplicated.
 *
 * Left cluster = navegación de pantallas. Right pill = acciones/submenús.
 * Base-specific actions (open build/quest/shop/lucky modals) are passed as optional
 * callbacks; when omitted (e.g. on the galaxy) those items navigate to the real screen.
 */

const go = (href: string) => () => { if (typeof window !== 'undefined') window.location.href = href; };

export interface Go2BaseMenuProps {
  /** Resalta el botón de la pantalla actual. */
  active?: 'planet' | 'galaxy' | 'house' | 'buildings';
  // Cluster izquierdo (con defaults de navegación)
  onPlanet?: () => void;     // Base Espacial
  onGalaxy?: () => void;     // Galaxia
  onHouse?: () => void;      // Base Terrestre
  onBuildings?: () => void;  // Construcción de edificios
  // Submenú globo
  onResearch?: () => void;
  onBlueprint?: () => void;
  onWarship?: () => void;
  onConstruct?: () => void;
  // Submenú alianza
  onCommander?: () => void;
  onQuest?: () => void;
  onMail?: () => void;
  onInventory?: () => void;
  // Flyout $
  onLucky?: () => void;
}

export function Go2BaseMenu(props: Go2BaseMenuProps) {
  const {
    active,
    onPlanet = go('/dashboard/station'),
    onGalaxy = go('/dashboard/galaxy'),
    onHouse = go('/demo/construction'),
    onBuildings = go('/demo/construction'),
    onResearch = go('/research'),
    onBlueprint = go('/research'),
    onWarship = go('/shipyard'),
    onConstruct = go('/demo/construction'),
    onCommander = () => {},
    onQuest = go('/missions'),
    onMail = () => {},
    onInventory = () => {},
    onLucky = () => {},
  } = props;

  const [globe, setGlobe] = useState(false);
  const [alliance, setAlliance] = useState(false);
  const [flyout, setFlyout] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const closeAll = () => { setGlobe(false); setAlliance(false); setFlyout(false); };

  // Cerrar submenús al hacer clic fuera del menú (equivalente al closeAllMenus de la base).
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closeAll();
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };

  const ringActive = (k: NonNullable<Go2BaseMenuProps['active']>) =>
    active === k ? ' border-yellow-400 shadow-[0_0_15px_#facc15]' : '';

  return (
    <div ref={rootRef} className="absolute bottom-[110px] left-1/2 -translate-x-1/2 z-20 flex items-end drop-shadow-2xl">

      {/* Bloque Izquierdo: Bases/Navegación */}
      <div className="relative w-44 h-28 mr-2">
        <div className="absolute bottom-1 left-2 w-40 h-20 bg-gradient-to-t from-[#1e293b] via-[#334155] to-[#475569] rounded-[40px] border border-[#64748b] shadow-[0_15px_25px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2)]"></div>

        {/* PLANETA -> BASE ESPACIAL */}
        <button onClick={stop(onPlanet)} title="Base Espacial"
          className={`group absolute top-1 left-[38%] w-12 h-12 rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_12px_rgba(56,189,248,0.6),inset_0_0_10px_#000] z-20${ringActive('planet')}`}>
          <AAAResearchIcon className="w-9 h-9" />
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-cyan-100 bg-black/85 px-1.5 py-0.5 rounded border border-cyan-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Base Espacial</span>
        </button>

        {/* GALAXIA */}
        <button onClick={stop(onGalaxy)} title="Galaxia"
          className={`group absolute top-10 left-1 w-11 h-11 rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_12px_rgba(56,189,248,0.6),inset_0_0_10px_#000] z-10${ringActive('galaxy')}`}>
          <AAAReactorIcon className="w-8 h-8" />
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-cyan-100 bg-black/85 px-1.5 py-0.5 rounded border border-cyan-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Galaxia</span>
        </button>

        {/* CONSTRUCCIÓN DE EDIFICIOS */}
        <button onClick={stop(() => { closeAll(); onBuildings(); })} title="Construir edificios"
          className={`group absolute top-10 right-1 w-11 h-11 rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_12px_rgba(56,189,248,0.6),inset_0_0_10px_#000] z-10${ringActive('buildings')}`}>
          <AAAShipIcon className="w-8 h-8" />
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-cyan-100 bg-black/85 px-1.5 py-0.5 rounded border border-cyan-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Construir</span>
        </button>

        {/* CASITA -> BASE TERRESTRE */}
        <button onClick={stop(() => { closeAll(); onHouse(); })} title="Base Terrestre"
          className={`group absolute bottom-0 left-[35%] w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_15px_rgba(56,189,248,0.8),inset_0_0_10px_#000] z-30${ringActive('house')}`}>
          <AAABaseIcon className="w-9 h-9 drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]" />
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-cyan-100 bg-black/85 px-1.5 py-0.5 rounded border border-cyan-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Base Terrestre</span>
        </button>
      </div>

      {/* Bloque Derecho: Acciones (Píldora alargada Metálica) */}
      <div className="relative h-20 bg-gradient-to-t from-[#1e293b] via-[#334155] to-[#475569] rounded-[40px] border border-[#64748b] shadow-[0_15px_30px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.2)] flex items-center px-3 gap-2">

        {/* BOTÓN 1: GLOBO (Investigación/Construcción) */}
        <div className="relative mb-2">
          {globe && (
            <div className="absolute bottom-[110%] left-1/2 transform -translate-x-1/2 flex flex-col gap-1 items-center bg-gradient-to-b from-[#0a2558] to-[#041029] border-[1.5px] border-[#38bdf8] rounded-md p-1 shadow-[0_0_15px_rgba(56,189,248,0.5)] z-50 w-11">
              <div className="group relative flex items-center justify-center w-full">
                <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Investigación</div>
                <button onClick={stop(() => { closeAll(); onResearch(); })} className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><ScienceAtomIcon className="w-6 h-6" /></button>
              </div>
              <div className="group relative flex items-center justify-center w-full">
                <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Planos</div>
                <button onClick={stop(() => { closeAll(); onBlueprint(); })} className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><PieChartIcon className="w-6 h-6" /></button>
              </div>
              <div className="group relative flex items-center justify-center w-full">
                <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Astillero</div>
                <button onClick={stop(() => { closeAll(); onWarship(); })} className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><WarshipToolsIcon className="w-6 h-6" /></button>
              </div>
              <div className="group relative flex items-center justify-center w-full">
                <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Construir Edificio</div>
                <button onClick={stop(() => { closeAll(); onConstruct(); })} className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><ConstructBuildingIcon className="w-6 h-6" /></button>
              </div>
            </div>
          )}
          <button onClick={stop(() => { setGlobe((v) => !v); setAlliance(false); setFlyout(false); })}
            className={`w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center transition-transform shadow-[0_0_10px_rgba(56,189,248,0.4),inset_0_0_15px_#000] ${globe ? 'scale-110 border-yellow-400 shadow-[0_0_15px_#facc15]' : 'hover:scale-105'}`}>
            <AAAMainIcon className="w-9 h-9" />
          </button>
        </div>

        {/* BOTÓN 2: JET */}
        <button onClick={stop(closeAll)} className="w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_10px_rgba(56,189,248,0.4),inset_0_0_15px_#000] mb-2">
          <JetIcon className="w-8 h-8" />
        </button>

        {/* BOTÓN 3: ALIANZA (Comandante/Quest/Mail/Inventario) */}
        <div className="relative mb-2">
          {alliance && (
            <div className="absolute bottom-[110%] left-1/2 transform -translate-x-1/2 flex flex-col gap-1 items-center bg-gradient-to-b from-[#0a2558] to-[#041029] border-[1.5px] border-[#38bdf8] rounded-md p-1 shadow-[0_0_15px_rgba(56,189,248,0.5)] z-50 w-11">
              <div className="group relative flex items-center justify-center w-full">
                <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Comandante</div>
                <button onClick={stop(() => { closeAll(); onCommander(); })} className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><HelmetIcon className="w-6 h-6" /></button>
              </div>
              <div className="group relative flex items-center justify-center w-full">
                <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Misiones</div>
                <button onClick={stop(() => { closeAll(); onQuest(); })} className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><QuestBoardIcon className="w-6 h-6" /></button>
              </div>
              <div className="group relative flex items-center justify-center w-full">
                <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Mail</div>
                <button onClick={stop(() => { closeAll(); onMail(); })} className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><MailEnvelopeIcon className="w-6 h-6" /></button>
              </div>
              <div className="group relative flex items-center justify-center w-full">
                <div className="absolute right-12 whitespace-nowrap bg-black text-gray-200 text-xs px-2 py-1 border border-gray-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Inventario</div>
                <button onClick={stop(() => { closeAll(); onInventory(); })} className="w-9 h-9 rounded bg-[#1e3a8a]/40 border border-transparent hover:bg-[#2563eb]/80 hover:border-[#60a5fa] flex items-center justify-center transition-all"><CubeItemIcon className="w-6 h-6" /></button>
              </div>
            </div>
          )}
          <button onClick={stop(() => { setAlliance((v) => !v); setGlobe(false); setFlyout(false); })}
            className={`w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center transition-transform shadow-[0_0_10px_rgba(56,189,248,0.4),inset_0_0_15px_#000] ${alliance ? 'scale-110 border-yellow-400 shadow-[0_0_15px_#facc15]' : 'hover:scale-105'}`}>
            <AAAAllianceIcon className="w-9 h-9" />
          </button>
        </div>

        {/* BOTÓN 4: RADAR */}
        <button onClick={stop(closeAll)} className="w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] border-2 border-[#38bdf8] flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_10px_rgba(56,189,248,0.4),inset_0_0_15px_#000] mb-2">
          <RadarIcon className="w-8 h-8" />
        </button>

        {/* BOTÓN 5: $ flyout */}
        <div className="relative mb-2 ml-1">
          {flyout && (
            <div className="absolute bottom-[120%] left-1/2 transform -translate-x-1/2 flex flex-col gap-2 items-center bg-gradient-to-b from-[#1e293b]/90 to-[#0f172a]/95 p-2 rounded-full border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] backdrop-blur-md z-50">
              <button className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-800 border-2 border-blue-300 flex items-center justify-center hover:scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]"><Zap size={16} className="text-white drop-shadow-[0_0_2px_#fff]" /></button>
              <button className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-800 border-2 border-blue-300 flex items-center justify-center hover:scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]"><Shield size={16} className="text-white drop-shadow-[0_0_2px_#fff]" /></button>
              <button className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-800 border-2 border-blue-300 flex items-center justify-center hover:scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]"><Settings size={16} className="text-white drop-shadow-[0_0_2px_#fff]" /></button>
              <button onClick={stop(() => { closeAll(); onLucky(); })} className="w-12 h-12 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 border-2 border-cyan-200 flex items-center justify-center hover:scale-110 shadow-[0_0_15px_rgba(34,211,238,0.8)] mt-1"><DollarSign size={22} className="text-white drop-shadow-[0_0_5px_#fff]" /></button>
            </div>
          )}
          <button onClick={stop(() => { setFlyout((v) => !v); setGlobe(false); setAlliance(false); })}
            className={`w-[3.5rem] h-[3.5rem] rounded-full flex items-center justify-center transition-transform hover:scale-105 z-30 relative ${flyout ? 'scale-110' : ''}`}
            style={{ background: 'radial-gradient(circle at center, #1e3a8a 0%, #0f172a 100%)', boxShadow: '0 0 20px #22d3ee, inset 0 0 15px rgba(0,0,0,0.8)', border: '2px solid #a5f3fc' }}>
            <div className="absolute inset-[-6px] rounded-full bg-cyan-400 opacity-30 blur-sm pointer-events-none animate-pulse"></div>
            <div className="w-[1.6rem] h-[1.6rem] rotate-45 border-[2.5px] border-[#fbbf24] bg-gradient-to-br from-[#1e3a8a] to-black flex items-center justify-center shadow-[0_0_8px_#fbbf24]">
              <span className="-rotate-45 text-[#fcd34d] font-black text-sm drop-shadow-[0_0_3px_#fde047]">$</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
