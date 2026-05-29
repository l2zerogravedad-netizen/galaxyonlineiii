'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface Technology {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  currentLevel: number;
  maxLevel: number;
  status: string;
  isMaxLevel: boolean;
  prerequisiteMet: boolean;
  prerequisiteName: string | null;
  requiredTechId: string | null;
  costs: {
    metal: number;
    plasma: number;
    time: number;
  };
  effects: {
    type: string;
    value: number;
    description: string;
  };
  researchStatus: {
    timeRemaining: number;
    progress: number;
    endsAt: string;
  } | null;
}

interface Resource {
  type: string;
  amount: number;
  capacity: number;
}

const categoryNames: Record<string, string> = {
  PRODUCTION: 'Producción',
  CONSTRUCTION: 'Construcción',
  MILITARY: 'Militar',
  LOGISTICS: 'Logística',
  PROPULSION: 'Propulsión',
  GENERAL: 'General',
};

const categoryOrder = ['GENERAL', 'PRODUCTION', 'CONSTRUCTION', 'MILITARY', 'LOGISTICS', 'PROPULSION'];

function getTier(tech: Technology, techMap: Map<string, Technology>): number {
  if (!tech.requiredTechId) return 0;
  const parent = techMap.get(tech.requiredTechId);
  if (!parent) return 0;
  return getTier(parent, techMap) + 1;
}

function buildTiers(techs: Technology[]): Technology[][] {
  const map = new Map<string, Technology>();
  techs.forEach((t) => map.set(t.id, t));
  const tierMap = new Map<string, number>();
  techs.forEach((t) => tierMap.set(t.id, getTier(t, map)));
  const maxTier = Math.max(0, ...tierMap.values());
  const tiers: Technology[][] = [];
  for (let i = 0; i <= maxTier; i++) tiers.push(techs.filter((t) => tierMap.get(t.id) === i));
  return tiers;
}

export default function ResearchPage() {
  const router = useRouter();
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [researchingId, setResearchingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [activeResearch, setActiveResearch] = useState<Technology | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('GENERAL');
  const [tooltipTech, setTooltipTech] = useState<Technology | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchData();
    const syncInterval = setInterval(() => syncResearch(), 10000);
    return () => clearInterval(syncInterval);
  }, [router]);

  useEffect(() => {
    const calc = () => {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const newLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      const catTechs = technologies.filter((t) => t.category === activeCategory);
      for (const tech of catTechs) {
        if (!tech.requiredTechId) continue;
        const child = nodeRefs.current.get(tech.id);
        const parent = nodeRefs.current.get(tech.requiredTechId);
        if (!child || !parent) continue;
        const cRect = child.getBoundingClientRect();
        const pRect = parent.getBoundingClientRect();
        newLines.push({
          x1: pRect.left + pRect.width / 2 - containerRect.left,
          y1: pRect.bottom - containerRect.top,
          x2: cRect.left + cRect.width / 2 - containerRect.left,
          y2: cRect.top - containerRect.top,
        });
      }
      setLines(newLines);
    };
    const id = setTimeout(calc, 100);
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [technologies, activeCategory]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const [techRes, resourceRes] = await Promise.all([
        axios.get('/api/research', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/empire/resources', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const techs = techRes.data.technologies;
      setTechnologies(techs);
      setResources(resourceRes.data);
      const active = techs.find((t: Technology) => t.status === 'RESEARCHING');
      setActiveResearch(active || null);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar datos');
      setLoading(false);
    }
  };

  const syncResearch = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.post('/api/research/sync', {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.completedCount > 0) fetchData();
    } catch (err) {
      // silent
    }
  };

  const startResearch = async (technologyId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setResearchingId(technologyId);
    setError('');
    try {
      await axios.post(`/api/research/${technologyId}/start`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar investigación');
      setResearchingId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const canAfford = (costs: { metal: number; plasma: number }) => {
    const metal = resources.find((r) => r.type === 'METAL')?.amount || 0;
    const plasma = resources.find((r) => r.type === 'GAS')?.amount || 0;
    return metal >= costs.metal && plasma >= costs.plasma;
  };

  const getResourceAmount = (type: string) => Math.floor(resources.find((r) => r.type === type)?.amount || 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-cyan-400 text-lg">Cargando árbol tecnológico...</p>
      </div>
    );
  }

  const catTechs = technologies.filter((t) => t.category === activeCategory);
  const tiers = buildTiers(catTechs);

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 text-sm transition">
              ← Volver
            </Link>
            <h1 className="text-xl font-bold text-white">Centro de Investigación</h1>
          </div>
          <button
            onClick={() => { localStorage.removeItem('token'); router.push('/'); }}
            className="px-3 py-2 bg-red-900/60 hover:bg-red-800 rounded-lg border border-red-700 text-sm transition"
          >
            Salir
          </button>
        </div>

        {/* Resources Bar */}
        <div className="flex gap-3 mb-4">
          {[
            { type: 'METAL', label: 'Metal', color: 'text-slate-300', bg: 'bg-slate-800 border-slate-600' },
            { type: 'GAS', label: 'Gas', color: 'text-cyan-400', bg: 'bg-slate-800 border-cyan-900/50' },
            { type: 'CREDITS', label: 'Créditos', color: 'text-yellow-400', bg: 'bg-slate-800 border-yellow-900/50' },
          ].map((res) => (
            <div key={res.type} className={`flex-1 ${res.bg} border rounded-lg px-3 py-2 flex items-center justify-between`}>
              <span className="text-xs text-gray-400">{res.label}</span>
              <span className={`font-mono font-bold ${res.color}`}>{getResourceAmount(res.type).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Active Research */}
        {activeResearch && (
          <div className="bg-yellow-900/20 border border-yellow-600/50 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-yellow-300 text-sm">🔬 {activeResearch.name}</p>
                <p className="text-xs text-gray-400">Nivel {activeResearch.currentLevel} → {activeResearch.currentLevel + 1}</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-mono text-sm">
                  {activeResearch.researchStatus && formatTime(Math.floor(activeResearch.researchStatus.timeRemaining / 1000))}
                </p>
                <div className="w-32 h-1.5 bg-slate-700 rounded-full mt-1">
                  <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${activeResearch.researchStatus?.progress || 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <div className="bg-red-900/40 border border-red-500 text-red-200 p-2 rounded mb-4 text-sm">{error}</div>}

        {/* Category Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {categoryOrder.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition border-b-2 whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-slate-800 text-cyan-400 border-cyan-400'
                  : 'bg-slate-900/50 text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {categoryNames[cat]}
            </button>
          ))}
        </div>

        {/* Tech Tree */}
        <div
          ref={containerRef}
          className="relative bg-slate-950/60 rounded-xl border border-slate-700 p-6 min-h-[400px] overflow-x-auto"
        >
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {lines.map((l, i) => (
              <g key={i}>
                <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#1e40af" strokeWidth="2" opacity="0.7" />
                <circle cx={l.x2} cy={l.y2} r="3" fill="#3b82f6" />
              </g>
            ))}
          </svg>

          {/* Tiers */}
          <div className="relative z-10 flex flex-col gap-16">
            {tiers.map((tier, tierIndex) => (
              <div key={tierIndex} className="flex justify-center gap-8">
                {tier.map((tech) => {
                  const isResearching = tech.status === 'RESEARCHING';
                  const isLocked = tech.status === 'LOCKED' || !tech.prerequisiteMet;
                  const affordable = canAfford(tech.costs);

                  return (
                    <div
                      key={tech.id}
                      ref={(el) => { if (el) nodeRefs.current.set(tech.id, el); }}
                      className="relative"
                      onMouseEnter={(e) => { setTooltipTech(tech); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                      onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTooltipTech(null)}
                    >
                      <button
                        onClick={() => {
                          if (!isLocked && !tech.isMaxLevel && !isResearching && !activeResearch && affordable) {
                            startResearch(tech.id);
                          }
                        }}
                        disabled={!!(isLocked || tech.isMaxLevel || isResearching || activeResearch || !affordable)}
                        className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center relative transition ${
                          isResearching
                            ? 'border-yellow-400 bg-yellow-900/30 shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-pulse'
                            : isLocked
                            ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed'
                            : tech.isMaxLevel
                            ? 'border-green-500 bg-green-900/20 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                            : !affordable
                            ? 'border-red-800 bg-slate-800/70 cursor-not-allowed'
                            : 'border-cyan-600 bg-slate-800 hover:bg-slate-700 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer'
                        }`}
                      >
                        {/* Icon placeholder */}
                        <div className="text-2xl">
                          {isLocked ? '🔒' : isResearching ? '🔬' : tech.isMaxLevel ? '✓' : '⚡'}
                        </div>

                        {/* Level badge */}
                        <div
                          className={`absolute -bottom-2 -right-2 text-[10px] font-black px-1.5 py-0.5 rounded border ${
                            tech.isMaxLevel
                              ? 'bg-green-500 text-black border-green-700'
                              : 'bg-orange-500 text-black border-orange-700'
                          }`}
                        >
                          {tech.currentLevel}/{tech.maxLevel}
                        </div>
                      </button>

                      {/* Name under node */}
                      <p className={`text-[10px] text-center mt-2 font-medium max-w-[90px] leading-tight ${
                        isLocked ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                        {tech.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltipTech && (
        <div
          className="fixed z-50 bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-2xl max-w-xs pointer-events-none"
          style={{
            left: Math.min(tooltipPos.x + 15, typeof window !== 'undefined' ? window.innerWidth - 280 : 1000),
            top: Math.min(tooltipPos.y + 15, typeof window !== 'undefined' ? window.innerHeight - 200 : 600),
          }}
        >
          <p className="font-bold text-cyan-400 text-sm mb-1">{tooltipTech.name}</p>
          <p className="text-xs text-gray-400 mb-2">{tooltipTech.description}</p>
          <p className="text-xs text-green-400 mb-2">{tooltipTech.effects.description}</p>
          {!tooltipTech.isMaxLevel && tooltipTech.status !== 'RESEARCHING' && (
            <div className="text-xs space-y-0.5">
              <p className="text-gray-400">Metal: {tooltipTech.costs.metal.toLocaleString()}</p>
              <p className="text-gray-400">Plasma: {tooltipTech.costs.plasma.toLocaleString()}</p>
              <p className="text-gray-400">Tiempo: {formatTime(tooltipTech.costs.time)}</p>
            </div>
          )}
          {tooltipTech.prerequisiteName && !tooltipTech.prerequisiteMet && (
            <p className="text-xs text-red-400 mt-1">Requiere: {tooltipTech.prerequisiteName}</p>
          )}
        </div>
      )}
    </div>
  );
}
