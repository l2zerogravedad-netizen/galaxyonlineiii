'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Mission {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  durationSeconds: number;
  recommendedPower: number;
  rewardMetal: number;
  rewardPlasma: number;
  rewardXp: number;
  rewardCredits: number;
  playerStatus: string;
  completedRuns: number;
  activeRunId: string | null;
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/missions', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (data.success) setMissions(data.data);
      } catch {
        setError('Error al cargar misiones');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = missions.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'combat') return m.difficulty >= 3;
    if (filter === 'easy') return m.difficulty <= 2;
    if (filter === 'completed') return m.playerStatus === 'COMPLETED';
    return true;
  });

  return (
    <div className="flex min-h-dvh flex-col bg-[#020814] text-white">
      <header className="p-4 border-b border-white/10 bg-[#0a1120]/80">
        <h1 className="text-xl font-bold text-amber-400 tracking-wider">MISIONES PvE</h1>
        <p className="text-sm text-slate-400 mt-1">Completa misiones para ganar recursos y experiencia</p>
        <div className="flex gap-2 mt-3">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'easy', label: 'Faciles' },
            { key: 'combat', label: 'Combate' },
            { key: 'completed', label: 'Completadas' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === f.key ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700' : 'bg-slate-800/60 text-slate-400 border border-slate-700 hover:bg-slate-700/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-4 space-y-3 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-slate-400">Cargando misiones...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-2 px-4 py-1 bg-red-900/40 text-red-300 rounded text-sm hover:bg-red-800/40">
              Reintentar
            </button>
          </div>
        )}

        {filtered.map((m) => (
          <div
            key={m.id}
            className={`bg-[#0a1120] border rounded-lg p-4 transition-all hover:border-cyan-700/40 ${
              m.playerStatus === 'COMPLETED' ? 'border-emerald-700/20 opacity-70' : m.playerStatus === 'IN_PROGRESS' ? 'border-amber-700/30' : 'border-white/10'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-cyan-400">{m.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{m.description}</p>
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < m.difficulty ? 'text-amber-400 text-sm' : 'text-slate-700 text-sm'}>
                      {'★'}
                    </span>
                  ))}
                  <span className="text-xs text-slate-500 ml-2">
                    {Math.floor(m.durationSeconds / 60)} min | Poder recomendado: {m.recommendedPower}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm space-y-0.5 ml-4">
                <div className="text-emerald-400">+{m.rewardMetal.toLocaleString()} Metal</div>
                <div className="text-emerald-400">+{m.rewardPlasma.toLocaleString()} Plasma</div>
                <div className="text-amber-400">+{m.rewardXp.toLocaleString()} XP</div>
                {m.rewardCredits > 0 && <div className="text-cyan-400">+{m.rewardCredits.toLocaleString()} Cred</div>}
              </div>
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
              <span className="text-xs text-slate-500">
                {m.playerStatus === 'COMPLETED' && m.completedRuns > 0 ? `Completada ${m.completedRuns}x` : ''}
              </span>
              <button
                disabled={m.playerStatus === 'IN_PROGRESS'}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                  m.playerStatus === 'IN_PROGRESS'
                    ? 'bg-amber-900/30 text-amber-400 border border-amber-700/50 cursor-not-allowed'
                    : m.playerStatus === 'COMPLETED'
                    ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700/50 hover:bg-emerald-800/30'
                    : 'bg-cyan-900/40 text-cyan-300 border border-cyan-700/50 hover:bg-cyan-800/40'
                }`}
              >
                {m.playerStatus === 'IN_PROGRESS' ? 'En Progreso' : m.playerStatus === 'COMPLETED' ? 'Repetir' : 'Iniciar'}
              </button>
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="text-center text-slate-500 py-16">
            <p className="text-lg">No hay misiones disponibles</p>
            <p className="text-sm mt-1">Las misiones se desbloquean al avanzar en el juego</p>
          </div>
        )}
      </main>

      <nav className="shrink-0 h-14 bg-[#0B1120]/95 border-t border-white/5 backdrop-blur flex items-center justify-around px-2 z-50">
        {[
          { href: '/dashboard', icon: '🏛', label: 'Base' },
          { href: '/dashboard/galaxy', icon: '🌌', label: 'Galaxia' },
          { href: '/dashboard/battle', icon: '⚔', label: 'Batalla' },
          { href: '/dashboard/fleet', icon: '🚀', label: 'Flotas' },
          { href: '/dashboard/missions', icon: '🗺', label: 'Misiones', active: true },
          { href: '/dashboard/market', icon: '💰', label: 'Mercado' },
          { href: '/dashboard/alliances', icon: '🤝', label: 'Alianzas' },
          { href: '/dashboard/leaderboard', icon: '🏆', label: 'Ranking' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors ${
              item.active ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[10px] leading-none hidden sm:block">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
