'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Go2ScreenShell } from '@/components/game/go2/Go2ScreenShell';

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
  costs: { metal: number; plasma: number; time: number };
  effects: { type: string; value: number; description: string };
  researchStatus: { timeRemaining: number; progress: number; endsAt: string } | null;
}

interface Resource { type: string; amount: number; capacity: number }

const categoryNames: Record<string, string> = {
  PRODUCTION: 'Producción',
  CONSTRUCTION: 'Construcción',
  MILITARY: 'Militar',
  LOGISTICS: 'Logística',
  PROPULSION: 'Propulsión',
  NAVIGATION: 'Navegación',
  ECONOMY: 'Economía',
  DEFENSE: 'Defensa',
  GENERAL: 'General',
};

const categoryOrder = ['GENERAL', 'ECONOMY', 'PRODUCTION', 'CONSTRUCTION', 'MILITARY', 'DEFENSE', 'LOGISTICS', 'NAVIGATION', 'PROPULSION'];

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
    if (!token) { router.push('/'); return; }
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
        axios.get('/api/empire', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const techs = (techRes.data.data?.technologies ?? techRes.data.technologies ?? []) as Technology[];
      setTechnologies(techs);
      setResources(resourceRes.data.resources ?? []);
      const active = techs.find((t: Technology) => t.status === 'RESEARCHING');
      setActiveResearch(active || null);
      // default to first category that has techs
      if (techs.length) {
        const cats = categoryOrder.filter((c) => techs.some((t) => t.category === c));
        if (cats.length && !cats.includes(activeCategory)) setActiveCategory(cats[0]);
      }
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
      await axios.post('/api/research/sync', {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch {
      // sync endpoint may not exist; refresh anyway to advance timers
      fetchData();
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

  if (loading) {
    return (
      <Go2ScreenShell title="Investigación" subtitle="Árbol tecnológico del imperio">
        <div className="go2-loading">Cargando árbol tecnológico…</div>
      </Go2ScreenShell>
    );
  }

  const availableCats = categoryOrder.filter((c) => technologies.some((t) => t.category === c));
  const catTechs = technologies.filter((t) => t.category === activeCategory);
  const tiers = buildTiers(catTechs);

  return (
    <Go2ScreenShell title="Investigación" subtitle="Nexo Cognitivo · árbol tecnológico">
      {activeResearch && (
        <div className="go2-panel" style={{ marginBottom: 12 }}>
          <div className="go2-panel-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--go2-gold)' }}>🔬 {activeResearch.name}</div>
              <div className="go2-card-sub">Nivel {activeResearch.currentLevel} → {activeResearch.currentLevel + 1}</div>
            </div>
            <div style={{ minWidth: 140 }}>
              <div className="go2-queue-time" style={{ textAlign: 'right' }}>
                {activeResearch.researchStatus && formatTime(Math.floor(activeResearch.researchStatus.timeRemaining / 1000))}
              </div>
              <div className="go2-progress"><div className="go2-progress-fill" style={{ width: `${activeResearch.researchStatus?.progress || 0}%` }} /></div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="go2-panel" style={{ marginBottom: 12, borderColor: '#b91c1c' }}><div className="go2-panel-body" style={{ color: 'var(--go2-red)' }}>{error}</div></div>}

      <div className="go2-tabs">
        {availableCats.map((cat) => (
          <button key={cat} className={['go2-tab', activeCategory === cat ? 'go2-tab--on' : ''].join(' ')} onClick={() => setActiveCategory(cat)}>
            {categoryNames[cat] ?? cat}
          </button>
        ))}
      </div>

      <div className="go2-panel">
        <div ref={containerRef} className="go2-panel-body" style={{ position: 'relative', minHeight: 360, overflowX: 'auto' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            {lines.map((l, i) => (
              <g key={i}>
                <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#2f6fb0" strokeWidth="2" opacity="0.7" />
                <circle cx={l.x2} cy={l.y2} r="3" fill="#7fd0ff" />
              </g>
            ))}
          </svg>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 56 }}>
            {tiers.map((tier, tierIndex) => (
              <div key={tierIndex} style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
                {tier.map((tech) => {
                  const isResearching = tech.status === 'RESEARCHING';
                  const isLocked = tech.status === 'LOCKED' || !tech.prerequisiteMet;
                  const affordable = canAfford(tech.costs);
                  const border = isResearching ? 'var(--go2-gold)' : isLocked ? 'var(--go2-line-soft)' : tech.isMaxLevel ? 'var(--go2-green)' : affordable ? 'var(--go2-cyan)' : '#7a3030';
                  return (
                    <div
                      key={tech.id}
                      ref={(el) => { if (el) nodeRefs.current.set(tech.id, el); }}
                      style={{ position: 'relative' }}
                      onMouseEnter={(e) => { setTooltipTech(tech); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                      onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTooltipTech(null)}
                    >
                      <button
                        onClick={() => { if (!isLocked && !tech.isMaxLevel && !isResearching && !activeResearch && affordable) startResearch(tech.id); }}
                        disabled={!!(isLocked || tech.isMaxLevel || isResearching || activeResearch || !affordable)}
                        style={{
                          width: 76, height: 76, borderRadius: 12, cursor: isLocked || tech.isMaxLevel || isResearching || activeResearch || !affordable ? 'not-allowed' : 'pointer',
                          border: `2px solid ${border}`, background: 'linear-gradient(180deg, rgba(20,40,70,0.6), rgba(10,22,42,0.6))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                          boxShadow: isResearching ? '0 0 16px rgba(252,211,77,0.5)' : tech.isMaxLevel ? '0 0 12px rgba(74,222,128,0.4)' : 'none',
                          opacity: isLocked ? 0.5 : 1, transition: 'all .15s',
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{isLocked ? '🔒' : isResearching ? '🔬' : tech.isMaxLevel ? '✓' : '⚡'}</span>
                        <span style={{
                          position: 'absolute', bottom: -8, right: -8, fontSize: 10, fontWeight: 900, padding: '1px 6px', borderRadius: 6,
                          background: tech.isMaxLevel ? 'var(--go2-green)' : 'var(--go2-gold)', color: '#04101f',
                        }}>{tech.currentLevel}/{tech.maxLevel}</span>
                      </button>
                      <div style={{ fontSize: 10, textAlign: 'center', marginTop: 10, maxWidth: 90, lineHeight: 1.2, color: isLocked ? 'var(--go2-dim)' : 'var(--go2-txt)' }}>{tech.name}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {tooltipTech && (
        <div
          className="go2-panel"
          style={{ position: 'fixed', zIndex: 80, maxWidth: 280, padding: 0, pointerEvents: 'none',
            left: Math.min(tooltipPos.x + 15, typeof window !== 'undefined' ? window.innerWidth - 300 : 1000),
            top: Math.min(tooltipPos.y + 15, typeof window !== 'undefined' ? window.innerHeight - 200 : 600) }}
        >
          <div className="go2-panel-body">
            <div style={{ fontWeight: 800, color: 'var(--go2-cyan)', marginBottom: 4 }}>{tooltipTech.name}</div>
            <div className="go2-card-sub" style={{ marginBottom: 6 }}>{tooltipTech.description}</div>
            <div style={{ fontSize: 11, color: 'var(--go2-green)', marginBottom: 6 }}>{tooltipTech.effects?.description}</div>
            {!tooltipTech.isMaxLevel && tooltipTech.status !== 'RESEARCHING' && (
              <div style={{ fontSize: 11, color: 'var(--go2-dim)' }}>
                <div>Metal: {tooltipTech.costs.metal.toLocaleString()}</div>
                <div>Plasma: {tooltipTech.costs.plasma.toLocaleString()}</div>
                <div>Tiempo: {formatTime(tooltipTech.costs.time)}</div>
              </div>
            )}
            {tooltipTech.prerequisiteName && !tooltipTech.prerequisiteMet && (
              <div style={{ fontSize: 11, color: 'var(--go2-red)', marginTop: 4 }}>Requiere: {tooltipTech.prerequisiteName}</div>
            )}
          </div>
        </div>
      )}
    </Go2ScreenShell>
  );
}
